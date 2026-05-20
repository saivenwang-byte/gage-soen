import { distanceKm, formatDistanceKm } from './geo';
import { normalizeDeal } from './normalizeDeal';

function haystack(item) {
  const n = normalizeDeal(item);
  return [
    n.scene,
    n.subCategory,
    n.merchantName,
    n.title,
    n.promoText,
    n.platformLabel,
    ...(n.tags || []),
    ...(n.emotionTags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** 工厂店 / 二手仓 / Outlet 类收藏，适合一日游串联 */
export function isWarehouseVisit(item) {
  if (!item) return false;
  const scene = (item.scene || '').toLowerCase();
  if (scene === 'factory' || scene === 'secondhand') return true;
  const h = haystack(item);
  if (item.subCategory === 'factory' || item.subCategory === 'secondhand') return true;
  return /工厂|二手|outlet|仓储|直出|warehouse|factory|secondhand|捡漏仓|特卖会/.test(h);
}

export function itemsWithCoords(items) {
  return items
    .map((raw) => normalizeDeal(raw))
    .filter((it) => it.lat != null && it.lng != null);
}

/**
 * 从当前位置出发，按「先近后远」贪心排访问顺序（直线距离，非驾车里程）
 */
export function orderVisitStops(userLocation, stops) {
  if (!stops?.length) return [];
  const remaining = [...stops];
  const ordered = [];
  let cur = userLocation?.lat != null ? userLocation : remaining[0];

  while (remaining.length) {
    let bestIdx = 0;
    let bestD = Infinity;
    remaining.forEach((s, i) => {
      const d = distanceKm(cur.lat, cur.lng, s.lat, s.lng);
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
      }
    });
    const next = remaining.splice(bestIdx, 1)[0];
    const prev = ordered.length ? ordered[ordered.length - 1] : null;
    const legKm = prev
      ? distanceKm(prev.lat, prev.lng, next.lat, next.lng)
      : userLocation?.lat != null
        ? distanceKm(userLocation.lat, userLocation.lng, next.lat, next.lng)
        : null;
    ordered.push({ ...next, _legKm: legKm });
    cur = { lat: next.lat, lng: next.lng };
  }
  return ordered;
}

export function totalStraightKm(userLocation, orderedStops) {
  if (!orderedStops.length) return 0;
  let sum = 0;
  let cur = userLocation;
  for (const s of orderedStops) {
    if (cur?.lat != null) sum += distanceKm(cur.lat, cur.lng, s.lat, s.lng);
    cur = s;
  }
  return sum;
}

/** 高德驾车：支持途经点（最后一家为终点，前面为 via） */
export function amapMultiStopRouteUrl(userLocation, orderedStops) {
  if (!orderedStops?.length) return null;
  const last = orderedStops[orderedStops.length - 1];
  const lastName = encodeURIComponent(last.merchantName || last.title || '终点');
  const params = new URLSearchParams();
  params.set('mode', 'car');
  params.set('callnative', '1');
  params.set('src', 'jiegasuan');
  if (userLocation?.lat != null) {
    params.set('from', `${userLocation.lng},${userLocation.lat},${encodeURIComponent('我的位置')}`);
  }
  if (orderedStops.length === 1) {
    params.set('to', `${last.lng},${last.lat},${lastName}`);
  } else {
    const vias = orderedStops.slice(0, -1);
    params.set(
      'via',
      vias.map((s) => `${s.lng},${s.lat},${encodeURIComponent(s.merchantName || s.title || '途经')}`).join('|')
    );
    params.set('to', `${last.lng},${last.lat},${lastName}`);
  }
  return `https://uri.amap.com/navigation?${params.toString()}`;
}

export function formatLegKm(km) {
  if (km == null) return '—';
  return formatDistanceKm(km, { straightLine: true });
}
