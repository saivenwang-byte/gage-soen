/**
 * 地理工具：以奉贤海湾旅游度假区为中心计算距离
 * 中心点：碧海金沙-海湾旅游区一带（WGS84）
 */
export const BAY_RESORT_CENTER = {
  name: '奉贤海湾旅游度假区',
  lat: 30.8419,
  lng: 121.5234,
};

/** Haversine 距离（公里） */
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function attachDistance(items, center = BAY_RESORT_CENTER) {
  return items.map((item) => {
    if (item.lat == null || item.lng == null) {
      return { ...item, distanceKm: null, distanceText: '距离未知' };
    }
    const km = distanceKm(center.lat, center.lng, item.lat, item.lng);
    return {
      ...item,
      distanceKm: Math.round(km * 100) / 100,
      distanceText: km < 1 ? `${Math.round(km * 1000)}米` : `${km.toFixed(1)}公里`,
      centerName: center.name,
    };
  });
}

export function sortByDistance(items, order = 'asc') {
  const copy = [...items];
  copy.sort((a, b) => {
    const da = a.distanceKm ?? 9999;
    const db = b.distanceKm ?? 9999;
    return order === 'desc' ? db - da : da - db;
  });
  return copy;
}
