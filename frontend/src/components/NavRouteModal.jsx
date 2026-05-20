import { useMemo, useState, useEffect } from 'react';
import CompareRouteMap from './CompareRouteMap';
import { normalizeDeal } from '../utils/normalizeDeal';
import { formatDistanceKm, bearingDegrees, compassDirection8, amapRouteUrl } from '../utils/geo';
import { useHistoryBackClose } from '../hooks/useHistoryBackClose';

/**
 * 应用内路线预览：顶栏/底栏固定「返回」，支持手机系统返回键。
 */
export default function NavRouteModal({ item: raw, userLocation, onClose, onCloseAll }) {
  const [amapHint, setAmapHint] = useState(false);
  const { requestClose } = useHistoryBackClose(!!raw, onClose, 'jgsNavRoute');

  useEffect(() => {
    if (!raw) return undefined;
    const onVis = () => {
      if (document.visibilityState === 'visible') setAmapHint(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [raw]);

  if (!raw) return null;
  const item = normalizeDeal(raw);
  const dest = item.lat != null && item.lng != null ? { lat: item.lat, lng: item.lng } : null;

  const routeInfo = useMemo(() => {
    if (!userLocation?.lat || !dest) return null;
    const km = item.distanceKm ?? item.distance;
    const bearing = bearingDegrees(userLocation.lat, userLocation.lng, dest.lat, dest.lng);
    const dir = compassDirection8(bearing);
    return {
      distText: item.distanceText || formatDistanceKm(km),
      dir,
      bearing: Math.round(bearing),
    };
  }, [userLocation, dest, item]);

  const externalNav = dest ? amapRouteUrl(dest.lat, dest.lng, item.merchantName || item.title) : null;

  const handleCloseAll = () => {
    requestClose();
    onCloseAll?.();
  };

  const openAmap = () => {
    if (!externalNav) return;
    window.open(externalNav, '_blank', 'noopener,noreferrer');
    setAmapHint(true);
  };

  return (
    <section className="modal-overlay nav-route-overlay" role="dialog" aria-modal="true" aria-label="路线导航">
      <article className="modal-panel nav-route-panel">
        <div className="nav-route-sticky-top">
          <button type="button" className="nav-route-back-btn" onClick={requestClose}>
            ← 返回
          </button>
          <h3 className="nav-route-title">去 {item.merchantName || item.title}</h3>
          <button type="button" className="nav-route-close-x" onClick={requestClose} aria-label="关闭">
            ✕
          </button>
        </div>

        {amapHint && (
          <div className="nav-route-amap-hint" role="status">
            <span>从高德回来了？不去了就点下面「返回」回到店铺。</span>
            <button type="button" onClick={() => setAmapHint(false)} aria-label="知道了">
              知道了
            </button>
          </div>
        )}

        <div className="nav-route-scroll">
          {routeInfo && (
            <div className="nav-route-compass">
              <span className="nav-route-compass-icon">🧭</span>
              <div>
                <strong>向{routeInfo.dir}方向</strong>
                <span className="nav-route-bearing">（约 {routeInfo.bearing}°）</span>
                <p>直线距离 {routeInfo.distText} · 蓝点是你，红点是店</p>
              </div>
            </div>
          )}

          <CompareRouteMap userLocation={userLocation} items={[item]} height={240} />

          {item.address && <p className="nav-route-address">📍 {item.address}</p>}

          {externalNav && (
            <button type="button" className="btn nav-route-external" onClick={openAmap}>
              打开高德驾车导航（新窗口）
            </button>
          )}
          <p className="nav-route-tip">
            只是看看路、暂时不去：点顶部或底部<strong>「返回」</strong>即可；不必先开高德。
          </p>
        </div>

        <div className="nav-route-footer-fixed">
          <button type="button" className="btn nav-route-footer-primary" onClick={requestClose}>
            ← 返回上一页（店铺详情）
          </button>
          <button type="button" className="btn-secondary btn nav-route-footer-secondary" onClick={handleCloseAll}>
            关闭地图，回到列表
          </button>
        </div>
      </article>
    </section>
  );
}
