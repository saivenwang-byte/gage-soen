/**
 * 本地精选数据筛选（无后端也能浏览）
 */
const SEED = require('../data/deals.js');

const SCENES = [
  { key: 'all', label: '全部', icon: '✨' },
  { key: 'coffee', label: '咖啡', icon: '☕' },
  { key: 'pet', label: '宠物', icon: '🐱' },
  { key: 'expiring', label: '临期', icon: '⏳' },
  { key: 'stay', label: '民宿', icon: '🏠' },
  { key: 'entertainment', label: '娱乐', icon: '🎯' },
];

function haystack(item) {
  return [
    item.merchantName,
    item.promoText,
    item.address,
    ...(item.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function matchScene(item, scene) {
  if (!scene || scene === 'all') return true;
  if (scene === 'coffee') return item.scene === 'coffee' || item.scene === 'dining';
  return item.scene === scene;
}

function queryDeals({ scene = 'all', keyword = '', maxKm = 15 }) {
  let list = SEED.filter((item) => matchScene(item, scene));
  const q = (keyword || '').trim().toLowerCase();
  if (q) {
    list = list.filter((item) => haystack(item).includes(q));
  }
  return list.map((item) => ({
    ...item,
    title: item.merchantName,
    discountPrice: item.price,
    discountText: item.promoText,
    quote: item.bloggers?.[0]?.summary || '',
    source: item.bloggers?.[0]?.nickname || item.platformLabel || '精选实地',
    emotionTags: item.tags || [],
  }));
}

function pickRandom(scene) {
  let pool = SEED.filter((item) => matchScene(item, scene || 'all'));
  if (!pool.length) pool = SEED;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return {
    ...pick,
    title: pick.merchantName,
    discountText: pick.promoText,
    quote: pick.bloggers?.[0]?.summary || '跟牢买勿会错',
    source: pick.bloggers?.[0]?.nickname || pick.platformLabel,
  };
}

module.exports = { SCENES, queryDeals, pickRandom, SEED };
