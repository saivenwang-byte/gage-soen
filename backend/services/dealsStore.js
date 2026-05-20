/**
 * MVP 精选优惠池：人工录入 + UGC，无爬虫
 * 数据文件：data/deals.seed.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { attachDistance, distanceKm } from '../utils/geo.js';
import { listUgc } from './ugcStore.js';
import { itemMatchesSubcategory } from '../data/sceneTaxonomy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, '../data/deals.seed.json');

let seedCache = null;

function loadSeed() {
  if (seedCache) return seedCache;
  if (!fs.existsSync(SEED_PATH)) {
    seedCache = [];
    return seedCache;
  }
  seedCache = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  return seedCache;
}

const SCENE_ALIASES = {
  dining: ['dining', 'coffee'],
  coffee: ['coffee', 'dining'],
  all: null,
};

function matchScene(itemScene, requested) {
  if (!requested || requested === 'all') return true;
  const aliases = SCENE_ALIASES[requested];
  if (aliases) return aliases.includes(itemScene);
  return itemScene === requested;
}

/**
 * @param {object} opts
 * @param {string[]} [opts.scenes]
 * @param {string} [opts.keyword] 已废弃，请用 subCategory
 * @param {string} [opts.subCategory]
 * @param {number} [opts.maxDistanceKm]
 * @param {{lat:number,lng:number,name?:string}} [opts.center]
 */
export function queryCuratedDeals(opts = {}) {
  const scenes = opts.scenes?.length ? opts.scenes : ['all'];
  const keyword = (opts.keyword || '').trim().toLowerCase();
  const subCategory = opts.subCategory || 'all';
  const sceneForSub = scenes.includes('all') ? 'all' : scenes[0];
  const maxKm = Number(opts.maxDistanceKm) || 30;
  const center = opts.center || { lat: 30.918, lng: 121.474, name: '当前位置' };

  const pool = [
    ...loadSeed().map((row) => ({
      ...row,
      platform: row.platform || 'curated',
      platformLabel: row.platformLabel || '精选实地',
      dataMode: 'curated',
      fetchedAt: row.fetchedAt || row.updatedAt || new Date().toISOString(),
    })),
    ...listUgc().map((row) => ({
      ...row,
      platformLabel: '家人上传',
      dataMode: 'ugc',
      imageUrl: row.imageUrl || row.coverImage,
    })),
  ];

  let filtered = pool.filter((item) => {
    const sceneOk =
      scenes.includes('all') || scenes.some((s) => matchScene(item.scene, s));
    if (!sceneOk) return false;
    if (keyword) {
      const hay = [item.merchantName, item.title, item.promoText, item.address, ...(item.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(keyword)) return false;
    }
    const taxonomyScene = scenes.includes('all') ? 'all' : sceneForSub;
    return itemMatchesSubcategory(item, taxonomyScene, subCategory);
  });

  let relaxedSubcategory = false;
  if (filtered.length === 0 && subCategory !== 'all' && !scenes.includes('all')) {
    relaxedSubcategory = true;
    filtered = pool.filter((item) => {
      const sceneOk =
        scenes.includes('all') || scenes.some((s) => matchScene(item.scene, s));
      if (!sceneOk) return false;
      if (keyword) {
        const hay = [item.merchantName, item.title, item.promoText, item.address, ...(item.tags || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      return true;
    });
  }

  filtered = attachDistance(filtered, center).map((item) => ({
    ...item,
    distance: item.distanceKm,
    title: item.title || item.merchantName,
    discountPrice: item.discountPrice ?? item.price ?? item.perCapita,
    discountText: item.discountText || item.promoText,
    emotionTags: item.emotionTags || item.tags || [],
    influencerName: item.influencerName || item.bloggers?.[0]?.nickname,
    influencerQuote: item.influencerQuote || item.bloggers?.[0]?.summary,
    ...(relaxedSubcategory ? { relaxedSubcategory: true } : {}),
  }));

  if (center.lat != null && center.lng != null) {
    filtered = filtered.filter((item) => {
      if (item.distanceKm == null) return true;
      return item.distanceKm <= maxKm;
    });
  }

  return filtered;
}

export function getCuratedById(id) {
  return queryCuratedDeals({ maxDistanceKm: 999 }).find((d) => d.id === id);
}

export function listAllForBottle(center, maxKm = 15, { scene = 'all', subCategory = 'all' } = {}) {
  const scenes = !scene || scene === 'all' ? ['all'] : [scene];
  return queryCuratedDeals({
    scenes,
    subCategory,
    maxDistanceKm: maxKm,
    center,
  });
}

export function reloadSeed() {
  seedCache = null;
  return loadSeed().length;
}
