/**
 * 混合爬虫：有 Cookie → Playwright 真实抓取；否则/失败 → 动态回退数据（保证可跑通）
 * 仅供学习研究，请遵守平台 robots.txt 及用户协议
 */
import { loadCookies } from '../antibot/cookieStore.js';
import { crawlWithBrowser } from '../antibot/browserPool.js';
import { generateLiveItems } from '../liveGenerator.js';
import { randomDelay } from '../../utils/httpClient.js';

const SCENE_KEYWORDS = {
  stay: '酒店民宿',
  dining: '美食',
  coffee: '咖啡',
  entertainment: '休闲娱乐',
  life: '运动场馆',
  shopping: '购物',
};

/** 默认开启回退；设 DEMO_FALLBACK=0 强制仅真实爬取 */
const allowFallback = () => process.env.DEMO_FALLBACK !== '0';

export function buildSearchUrl(platform, keyword, region = '奉贤') {
  const q = encodeURIComponent(`${region}${keyword}`);
  const urls = {
    dianping: `https://www.dianping.com/search/keyword/1/0_${q}`,
    meituan: `https://www.meituan.com/s/${q}`,
    xiaohongshu: `https://www.xiaohongshu.com/search_result?keyword=${q}`,
    douyin: `https://www.douyin.com/search/${q}`,
    bilibili: `https://search.bilibili.com/all?keyword=${q}`,
    weibo: `https://s.weibo.com/weibo?q=${q}`,
    hema: `https://www.freshippo.com/`,
    ctrip: `https://hotels.ctrip.com/hotels/list?city=2&keyword=${q}`,
    lvmama: `https://www.lvmama.com/list/${q}.html`,
    tujia: `https://www.tujia.com/su/${q}/`,
    missfresh: `https://www.missfresh.cn/`,
    eleme: `https://www.ele.me/search?keyword=${q}`,
  };
  return urls[platform] || urls.meituan;
}

export function parseListFromHtml(html, platform, scene) {
  const items = [];
  const titleRe = /<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]{4,80})</gi;
  let m;
  const titles = [];
  while ((m = titleRe.exec(html)) !== null && titles.length < 15) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (t.length > 3) titles.push(t);
  }
  const prices = [...html.matchAll(/(?:¥|￥)\s*(\d+(?:\.\d+)?)/g)].map((x) => +x[1]);

  titles.forEach((title, i) => {
    items.push({
      merchantName: title.slice(0, 60),
      promoText: '',
      price: prices[i] || prices[0] || 0,
      originalPrice: null,
      scene,
      platform,
      address: '上海市奉贤区',
      isPerPerson: false,
      rating: null,
      bloggers: [],
      dataMode: 'real',
    });
  });
  return items;
}

function fallbackFor(platform, scenes, filters) {
  const targetScenes = scenes.includes('all')
    ? Object.keys(SCENE_KEYWORDS)
    : scenes.filter((s) => SCENE_KEYWORDS[s]);
  const all = [];
  for (const scene of targetScenes) {
    all.push(...generateLiveItems({ platform, scene, filters, count: 3 }));
  }
  return all;
}

export async function runRealCrawl({ platform, label, scenes, filters, parseExtra }) {
  const targetScenes = scenes.includes('all')
    ? Object.keys(SCENE_KEYWORDS)
    : scenes.filter((s) => SCENE_KEYWORDS[s]);

  const cookiePack = loadCookies(platform);
  const hasCookie = cookiePack?.cookies?.length > 0;

  if (!hasCookie) {
    if (!allowFallback()) {
      throw new Error(`【介嘎算】${platform} 未配置 Cookie。请运行: npm run login -- ${platform}`);
    }
    console.warn(`[${label}] 无 Cookie，使用回退数据（配置 Cookie 后可爬真实页面）`);
    await randomDelay();
    return fallbackFor(platform, scenes, filters);
  }

  const all = [];
  try {
    for (const scene of targetScenes) {
      const kw = filters.keyword?.trim() || SCENE_KEYWORDS[scene] || '优惠';
      const url = buildSearchUrl(platform, kw);
      const rows = await crawlWithBrowser(platform, url, {
        cookies: cookiePack.cookies,
        parse: async ({ html, page }) => {
          let items = parseListFromHtml(html, platform, scene);
          if (parseExtra) items = await parseExtra({ html, page, items, scene, filters });
          if (!items.length && allowFallback()) {
            return generateLiveItems({ platform, scene, filters, count: 2 });
          }
          return items;
        },
      });
      all.push(...rows);
    }
  } catch (e) {
    console.warn(`[${label}] 真实爬取失败: ${e.message}`);
    if (allowFallback()) return fallbackFor(platform, scenes, filters);
    throw e;
  }

  if (!all.length && allowFallback()) {
    return fallbackFor(platform, scenes, filters);
  }
  return all;
}
