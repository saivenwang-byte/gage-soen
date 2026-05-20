/**
 * 搜索编排：并行爬虫 → 解析 → 对齐 → 评分 → 排序
 */
import { config } from '../config.js';
import { selectCrawlers } from '../crawlers/index.js';
import { parseDeal } from '../parsers/index.js';
import { alignMerchants } from '../utils/merchantMatcher.js';
import { markSuspectedAds } from '../utils/textSimilarity.js';
import { parseFuzzyPromo } from '../parsers/fuzzyPromoParser.js';
import { shutdownBrowser } from '../crawlers/antibot/browserPool.js';
import { listUgc } from './ugcStore.js';
import { valueScore, sortItems, bloggerHeat } from '../utils/scoring.js';
import { intersectsUserRange, matchTimePreset } from '../utils/timeWindow.js';
import { attachDistance, sortByDistance, BAY_RESORT_CENTER } from '../utils/geo.js';
import * as jobStore from './jobStore.js';
import { queryCuratedDeals } from './dealsStore.js';
import { itemMatchesSubcategory } from '../data/sceneTaxonomy.js';

export async function runSearch(jobId, body, broadcast) {
  const job = jobStore.getJob(jobId);
  if (!job) return;

  const filters = normalizeFilters(body);
  const scenes = body.scenes?.length ? body.scenes : ['all'];
  const center = resolveMapCenter(body);
  const maxKm = Number(body.distance ?? body.maxDistanceKm) || 15;
  const useCrawlers = config.dataSource === 'crawl' || process.env.USE_CRAWLERS === '1';

  const raw = [];
  const errors = [];

  if (!useCrawlers) {
    jobStore.updateJob(jobId, { status: 'running', message: '正在检索精选优惠…' });
    broadcast?.({ jobId, progress: 30, message: '加载精选实地数据' });
    raw.push(
      ...queryCuratedDeals({
        scenes,
        subCategory: filters.subCategory,
        keyword: filters.keyword,
        maxDistanceKm: maxKm,
        center,
      })
    );
  } else {
    const crawlers = selectCrawlers(scenes, filters.sourcePref || 'all');
    jobStore.updateJob(jobId, { status: 'running', message: '正在实时爬取…' });
    broadcast?.({ jobId, progress: 5, message: `已选择 ${crawlers.length} 个数据源` });

    const timeout = config.searchTimeoutMs;
    const deadline = Date.now() + timeout;
    let done = 0;
    const total = crawlers.length;

    await Promise.allSettled(
      crawlers.map(async (c) => {
        if (Date.now() > deadline) {
          errors.push({ source: c.label, error: '总超时，已跳过' });
          return;
        }
        try {
          const ctx = {
            scenes: scenes.includes('all')
              ? ['stay', 'dining', 'coffee', 'entertainment', 'shopping', 'pet', 'expiring']
              : scenes,
            filters,
          };
          const rows = await c.crawl(ctx);
          raw.push(...rows.map((r) => ({ ...r, platformLabel: c.label })));
          broadcast?.({ jobId, progress: 10 + Math.floor((++done / total) * 60), message: `${c.label} 完成` });
        } catch (e) {
          errors.push({ source: c.label, error: e.message || String(e) });
          broadcast?.({ jobId, message: `${c.label} 失败: ${e.message}` });
        }
      })
    );
    raw.push(...listUgc());
    raw.push(
      ...queryCuratedDeals({
        scenes,
        subCategory: filters.subCategory,
        keyword: filters.keyword,
        maxDistanceKm: maxKm,
        center,
      })
    );
  }

  broadcast?.({ jobId, progress: 75, message: '解析优惠规则…' });

  const parsed = raw
    .map((row) => enrichRow(row, filters, scenes))
    .filter(Boolean);

  const aligned = markSuspectedAds(alignMerchants(parsed), 0.8);
  const scored = attachDistance(
    aligned.map((item) => ({
      ...item,
      valueScore: valueScore(item, item.scene),
      bloggerHeat: Math.round(bloggerHeat(item.bloggers, filters.minLikes || 0)),
    })),
    center
  );

  let sorted;
  const sortBy = body.sortBy || 'value';
  if (sortBy === 'distance') {
    sorted = sortByDistance(scored, 'asc');
  } else {
    sorted = sortItems(scored, sortBy);
  }
  sorted = filterByKeyword(sorted, filters.keyword);
  if (filters.subCategory && filters.subCategory !== 'all' && !sorted.some((i) => i.relaxedSubcategory)) {
    sorted = filterBySubCategory(sorted, scenes, filters.subCategory);
  }
  const warnings = errors.length ? [`部分数据源未完成：${errors.map((e) => e.source).join('、')}`] : [];

  jobStore.updateJob(jobId, {
    status: sorted.length === 0 && errors.length > 0 ? 'failed' : 'done',
    progress: 100,
    message: '完成',
    results: sorted,
    errors,
    warnings,
    finishedAt: Date.now(),
    mapCenter: center,
  });

  broadcast?.({ jobId, progress: 100, message: '搜索完成', status: 'done' });
  setImmediate(() => shutdownBrowser().catch(() => {}));
}

function resolveMapCenter(body) {
  if (body.mapCenter?.lat != null && body.mapCenter?.lng != null) {
    return {
      name: body.mapCenter.name || '自定义中心',
      lat: Number(body.mapCenter.lat),
      lng: Number(body.mapCenter.lng),
    };
  }
  return BAY_RESORT_CENTER;
}

function normalizeFilters(body) {
  const preset = matchTimePreset(body.timePreset);
  return {
    town: body.town || 'all',
    headcount: Number(body.headcount) || 4,
    nights: Number(body.nights) || 1,
    budgetTotal: body.budgetTotal ? Number(body.budgetTotal) : null,
    budgetPerCapita: body.budgetPerCapita ? Number(body.budgetPerCapita) : null,
    dateFrom: body.dateFrom || preset.from?.toISOString?.() || null,
    dateTo: body.dateTo || preset.to?.toISOString?.() || null,
    sourcePref: body.sourcePref || 'all',
    bloggerOnly: !!body.bloggerOnly,
    minLikes: Number(body.minLikes) || 0,
    mallName: body.mallName || '',
    cuisine: body.cuisine || '',
    discountBelow: body.discountBelow ? Number(body.discountBelow) : null,
    stayFilters: body.stayFilters || {},
    diningFilters: body.diningFilters || {},
    keyword: (body.keyword || '').trim(),
    subCategory: body.subCategory || 'all',
  };
}

function filterBySubCategory(items, scenes, subCategory) {
  if (!subCategory || subCategory === 'all') return items;
  const matchScene = scenes.includes('all') ? 'all' : scenes[0];
  return items.filter((item) => itemMatchesSubcategory(item, matchScene, subCategory));
}

function filterByKeyword(items, keyword) {
  if (!keyword) return items;
  const q = keyword.toLowerCase();
  return items.filter((item) => {
    const hay = [item.merchantName, item.promoText, item.address, item.bloggerSummary]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

function enrichRow(row, filters, scenes) {
  const scene = row.scene || 'dining';
  if (!scenes.includes('all') && !scenes.includes(scene)) return null;

  if (filters.town !== 'all' && row.town && !row.address.includes(filters.town.replace('镇', '').replace('街道', ''))) {
    // 宽松匹配
  }

  const textForParse = [row.promoText, row.bloggerSummary, ...(row.bloggers || []).map((b) => b.summary)].filter(Boolean).join(' ');
  let parsed = parseDeal(scene, row.promoText, {
    price: row.price,
    originalPrice: row.originalPrice,
    headcount: filters.headcount,
    nights: filters.nights,
    isPerPerson: row.isPerPerson,
  });
  const fuzzy = parseFuzzyPromo(textForParse, {
    price: row.price,
    headcount: filters.headcount,
    isPerPerson: row.isPerPerson,
  });
  if (fuzzy?.fuzzySource && fuzzy.perCapita < parsed.perCapita) {
    parsed = { ...parsed, ...fuzzy };
  }

  const userFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const userTo = filters.dateTo ? new Date(filters.dateTo) : null;
  if (!intersectsUserRange(parsed.validFrom, parsed.validTo, userFrom, userTo)) {
    if (parsed.weekendOnly && filters.dateFrom) {
      // 简化：周末限制仅提示不过滤
    }
  }

  if (filters.budgetPerCapita && parsed.perCapita > filters.budgetPerCapita) return null;
  if (filters.bloggerOnly && !(row.bloggers?.length)) return null;
  if (filters.minLikes > 0 && !row.bloggers?.some((b) => (b.likes || 0) >= filters.minLikes)) return null;

  const savingPercent = parsed.savingPercent ?? 0;
  if (filters.discountBelow && scene === 'shopping') {
    const rate = parsed.discountRate || (row.originalPrice ? (row.price / row.originalPrice) * 10 : 10);
    if (rate > filters.discountBelow) return null;
  }

  return {
    ...row,
    ...parsed,
    originalPrice: row.originalPrice || row.price,
    dealPrice: parsed.dealPrice ?? row.price,
    perCapita: parsed.perCapita,
    savingPercent,
    hasBlogger: (row.bloggers?.length || 0) > 0,
    hasVideo: row.bloggers?.some((b) => b.platform === 'douyin'),
    fetchedAt: row.fetchedAt || new Date().toISOString(),
    imageUrl: row.imageUrl || row.coverImage,
    lat: row.lat,
    lng: row.lng,
  };
}
