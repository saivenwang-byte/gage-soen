import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatDistanceKm } from '../utils/geo';

const PIN_COLORS = ['#E8A84C', '#3D5A3C', '#F08060'];

/**
 * 对比用迷你地图：我的位置 + 各目的地 + 直线距离（非驾车路线）
 */
export default function CompareRouteMap({ userLocation, items, height = 200 }) {
  const mapRef = useRef(null);
  const layerRef = useRef({ map: null, layers: [] });

  useEffect(() => {
    if (!mapRef.current || !userLocation?.lat) return;

    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const bounds = L.latLngBounds([]);
    const layers = [];

    const userIcon = L.divIcon({
      className: 'compare-user-pin',
      html: '<div style="width:14px;height:14px;background:#2196F3;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('📍 我的位置');
    layers.push(userMarker);
    bounds.extend([userLocation.lat, userLocation.lng]);

    items.forEach((it, idx) => {
      if (it.lat == null || it.lng == null) return;
      const color = PIN_COLORS[idx % PIN_COLORS.length];
      const icon = L.divIcon({
        className: 'compare-dest-pin',
        html: `<div style="width:22px;height:22px;background:${color};color:#fff;border-radius:50%;border:2px solid #fff;font-size:11px;font-weight:bold;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.25)">${idx + 1}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const m = L.marker([it.lat, it.lng], { icon }).addTo(map);
      const dist = it.distanceKm ?? it.distance;
      m.bindPopup(`<b>${it.title}</b><br/>距你 ${formatDistanceKm(dist)}`);
      layers.push(m);
      bounds.extend([it.lat, it.lng]);

      const line = L.polyline(
        [
          [userLocation.lat, userLocation.lng],
          [it.lat, it.lng],
        ],
        { color, weight: 2, dashArray: '6 6', opacity: 0.75 }
      ).addTo(map);
      layers.push(line);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
    } else {
      map.setView([userLocation.lat, userLocation.lng], 12);
    }

    layerRef.current = { map, layers };
    return () => {
      map.remove();
      layerRef.current = { map: null, layers: [] };
    };
  }, [userLocation, items]);

  if (!userLocation?.lat) {
    return (
      <p style={{ fontSize: '12px', color: '#888', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
        未获取定位，无法显示路线距离。请在浏览器中允许位置权限后重试。
      </p>
    );
  }

  const withCoords = items.filter((i) => i.lat != null);
  if (!withCoords.length) {
    return (
      <p style={{ fontSize: '12px', color: '#888', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
        所选商家暂无坐标，无法画地图。精选内容一般会带定位。
      </p>
    );
  }

  return (
    <div className="compare-route-wrap">
      <div ref={mapRef} className="compare-route-map" style={{ height }} aria-label="对比地图" />
      <p className="compare-route-hint">虚线为直线距离，实际车程可能更远 · 点标记可导航</p>
    </div>
  );
}
