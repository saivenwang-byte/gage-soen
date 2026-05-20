import { normalizeDeal } from './normalizeDeal';
import { SCENE_TAXONOMY } from '../data/sceneTaxonomy';

/** 仅同类可比：同 scene + 同 subCategory */
export function canCompare(a, b) {
  const x = normalizeDeal(a);
  const y = normalizeDeal(b);
  return x.scene === y.scene && (x.subCategory || 'all') === (y.subCategory || 'all');
}

export function sameCompareGroup(a, b) {
  return canCompare(a, b);
}

export function compareGroupLabel(item) {
  const n = normalizeDeal(item);
  const sceneLabel = SCENE_TAXONOMY[n.scene]?.label || n.scene || '全部';
  const subs = SCENE_TAXONOMY[n.scene]?.subcategories || [];
  const sub = subs.find((s) => s.key === n.subCategory);
  const subLabel = sub?.label || (n.subCategory === 'all' ? '全部' : '');
  return subLabel && subLabel !== '全部' ? `${sceneLabel} · ${subLabel}` : sceneLabel;
}

export function compareRejectMessage(existing, incoming) {
  return `只能和「${compareGroupLabel(existing)}」放一起比（环境·价格·距离）。当前是「${compareGroupLabel(incoming)}」，吃的和玩的不能混比。`;
}

export function bloggerHeat(item) {
  const n = normalizeDeal(item);
  return (n.bloggers || []).reduce((sum, b) => sum + (Number(b.likes) || 0), 0);
}

/** 对比表各列展示文案 */
export function compareTableCells(item, distanceKm) {
  const n = normalizeDeal(item);
  const saved = Math.max(0, (n.originalPrice || 0) - (n.discountPrice || 0));
  const sceneLabel = SCENE_TAXONOMY[n.scene]?.label || n.scene || '—';
  return {
    scene: sceneLabel,
    price: n.discountPrice != null ? `¥${n.discountPrice}` : '—',
    priceNum: Number(n.discountPrice) || Infinity,
    saved: saved > 0 ? `省¥${Math.round(saved)}` : '—',
    savedNum: saved,
    promo: n.discountText || n.promoText || '—',
    tags: (n.emotionTags || n.tags || []).slice(0, 4).join('、') || '—',
    heat: bloggerHeat(n) > 0 ? `${bloggerHeat(n)} 赞` : '—',
    heatNum: bloggerHeat(n),
    distance:
      n.distanceText ||
      (distanceKm != null ? `${Number(distanceKm).toFixed(1)}km` : '—'),
    distanceNum: distanceKm ?? Infinity,
  };
}

/** @deprecated 使用 compareTableCells */
export function compareDimensionRows(item, distanceKm) {
  const c = compareTableCells(item, distanceKm);
  return { env: c.tags, price: c.price, distance: c.distance };
}
