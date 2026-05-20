import { useEffect, useRef } from 'react';
import L from 'leaflet';

/** 地图选点：默认海湾旅游度假区，点击设新中心 */
export default function MapPicker({ center, items = [], onCenterChange, height = 280 }) {
  const mapRef = useRef(null);
  const layerRef = useRef({ map: null, markers: [], centerMarker: null });

  useEffect(() => {
    if (!mapRef.current || layerRef.current.map) return;
    const map = L.map(mapRef.current).setView([center.lat, center.lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);
    const cm = L.marker([center.lat, center.lng], { title: center.name })
      .addTo(map)
      .bindPopup(center.name);
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      cm.setLatLng([lat, lng]);
      onCenterChange?.({ name: '自定义选点', lat, lng });
    });
    layerRef.current = { map, centerMarker: cm, markers: [] };
    return () => {
      map.remove();
      layerRef.current.map = null;
    };
  }, []);

  useEffect(() => {
    const { map, markers, centerMarker } = layerRef.current;
    if (!map) return;
    markers.forEach((m) => m.remove());
    layerRef.current.markers = [];
    centerMarker.setLatLng([center.lat, center.lng]);
    map.setView([center.lat, center.lng], map.getZoom());
    items.forEach((it) => {
      if (it.lat == null) return;
      const m = L.marker([it.lat, it.lng]).addTo(map);
      m.bindPopup(`<b>${it.merchantName}</b><br/>${it.distanceText || ''}<br/>人均¥${it.perCapita}`);
      layerRef.current.markers.push(m);
    });
  }, [center, items]);

  return <section ref={mapRef} className="map-wrap" style={{ height }} aria-label="地图" />;
}
