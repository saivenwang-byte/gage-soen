// frontend/src/utils/geo.js

/**
 * Haversine 公式计算两点直线距离（公里）
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * 距离格式化
 */
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km}km`;
}

/** 计算两点直线距离（公里） */
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return calculateDistance(lat1, lng1, lat2, lng2);
}

/** 直线距离（非步行/驾车导航距离） */
export function formatDistanceKm(km, { straightLine = true } = {}) {
  if (km == null || Number.isNaN(km)) return '距离未知';
  const prefix = straightLine ? '直线 ' : '';
  if (km < 1) return `${prefix}约 ${Math.round(km * 1000)} 米`;
  return `${prefix}约 ${km.toFixed(1)} 公里`;
}

/** OpenStreetMap 静态小地图（对比/卡片用） */
export function staticMapUrl(lat, lng, { width = 320, height = 160, zoom = 14 } = {}) {
  if (lat == null || lng == null) return null;
  const markers = `${lng},${lat},red-pushpin`;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=${markers}`;
}

/** 方位角（度，0=北，顺时针） */
export function bearingDegrees(lat1, lng1, lat2, lng2) {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** 八方位文字（东南西北等） */
export function compassDirection8(deg) {
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  const idx = Math.round(deg / 45) % 8;
  return dirs[idx];
}

/** 高德地图导航（手机端常用） */
export function amapNavUrl(lat, lng, name = '') {
  const n = encodeURIComponent(name);
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${n}&src=jiegasuan&coordinate=gaode&callnative=1`;
}

/** 高德驾车导航（带路线，会调起 App） */
export function amapRouteUrl(lat, lng, name = '') {
  const n = encodeURIComponent(name);
  return `https://uri.amap.com/navigation?to=${lng},${lat},${n}&mode=car&callnative=1&src=jiegasuan`;
}
