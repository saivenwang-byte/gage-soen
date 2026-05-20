import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatDistanceKm } from '../utils/geo';

const STOP_COLORS = ['#E8A84C', '#3D5A3C', '#F08060', '#5B7FA5', '#9B59B6', '#C0392B'];

/**
 * 一日游串联：按访问顺序 1→2→3 画折线（直线示意，非驾车路线）
 */
export default function TripRouteMap({ userLocation, orderedStops, height = 260 }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !orderedStops?.length) return undefined;

    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const bounds = L.latLngBounds([]);
    const path = [];

    if (userLocation?.lat != null) {
      const userIcon = L.divIcon({
        className: 'trip-user-pin',
        html: '<div style="width:14px;height:14px;background:#2196F3;border:2px solid #fff;border-radius:50%"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('📍 我的位置');
      path.push([userLocation.lat, userLocation.lng]);
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    orderedStops.forEach((it, idx) => {
      if (it.lat == null) return;
      const color = STOP_COLORS[idx % STOP_COLORS.length];
      const icon = L.divIcon({
        className: 'trip-stop-pin',
        html: `<div style="width:26px;height:26px;background:${color};color:#fff;border-radius:50%;border:2px solid #fff;font-size:12px;font-weight:bold;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.25)">${idx + 1}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      const leg = it._legKm != null ? formatDistanceKm(it._legKm, { straightLine: true }) : '';
      L.marker([it.lat, it.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${idx + 1}. ${it.merchantName || it.title}</b>${leg ? `<br/>上一站→这里 ${leg}` : ''}`);
      path.push([it.lat, it.lng]);
      bounds.extend([it.lat, it.lng]);
    });

    if (path.length >= 2) {
      L.polyline(path, { color: '#E8A84C', weight: 3, opacity: 0.85, dashArray: '8 6' }).addTo(map);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
    }

    return () => map.remove();
  }, [userLocation, orderedStops]);

  if (!orderedStops?.length) {
    return (
      <p style={{ fontSize: 12, color: '#888', padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
        所选店铺暂无坐标，无法画串联路线。
      </p>
    );
  }

  return (
    <div className="trip-route-wrap">
      <div ref={mapRef} className="compare-route-map" style={{ height }} aria-label="一日游路线地图" />
      <p className="compare-route-hint">橙线是按「先近后远」建议顺序（直线示意）；实际开车请用下方高德</p>
    </div>
  );
}
