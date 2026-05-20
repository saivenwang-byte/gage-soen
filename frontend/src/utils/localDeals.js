/**
 * 本地精选池：后端未启动时仍能浏览（与 backend/data/deals.seed.json 同步）
 */
import seed from '../data/dealsSeed.json';
import { itemMatchesSubcategory } from '../data/sceneTaxonomy.js';
import { distanceKm, formatDistanceKm } from './geo.js';
import { loadLocalUgc } from './localUgc.js';

const SCENE_ALIASES = {
  coffee: ['coffee', 'dining'],
  dining: ['dining', 'coffee'],
};

function matchScene(itemScene, requested) {
  if (!requested || requested === 'all') return true;
  const aliases = SCENE_ALIASES[requested];
  if (aliases) return aliases.includes(itemScene);
  return itemScene === requested;
}

/** @returns {object[]} */
export function queryLocalDeals({ scene = 'all', subCategory = 'all', keyword = '', distance = 15, center }) {
  const c = center || { lat: 30.918, lng: 121.474 };
  const maxKm = Number(distance) || 15;
  const q = (keyword || '').trim().toLowerCase();
  const taxonomyScene = scene === 'all' ? 'all' : scene;

  const pool = [...seed, ...loadLocalUgc()];

  let list = pool.filter((item) => {
    if (scene !== 'all' && !matchScene(item.scene, scene)) return false;
    if (q) {
      const hay = [item.merchantName, item.promoText, item.address, ...(item.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return itemMatchesSubcategory(item, taxonomyScene, subCategory);
  });

  if (!list.length && subCategory !== 'all') {
    list = pool.filter((item) => {
      if (!matchScene(item.scene, scene)) return false;
      if (q) {
        const hay = [item.merchantName, item.promoText, item.address, ...(item.tags || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).map((item) => ({ ...item, relaxedSubcategory: true }));
  }

  return list
    .map((item) => {
      const km =
        item.lat != null && item.lng != null ? distanceKm(c.lat, c.lng, item.lat, item.lng) : null;
      return {
        ...item,
        distanceKm: km,
        distance: km,
        distanceText: formatDistanceKm(km),
        title: item.merchantName,
        discountPrice: item.price,
        discountText: item.promoText,
        emotionTags: item.tags || [],
        influencerName: item.bloggers?.[0]?.nickname,
        influencerQuote: item.bloggers?.[0]?.summary,
        dataMode: 'curated',
        platformLabel: item.platformLabel || '精选实地',
      };
    })
    .filter((item) => item.distanceKm == null || item.distanceKm <= maxKm);
}
