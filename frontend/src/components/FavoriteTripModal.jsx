import { useMemo } from 'react';
import TripRouteMap from './TripRouteMap';
import {
  orderVisitStops,
  totalStraightKm,
  amapMultiStopRouteUrl,
  formatLegKm,
} from '../utils/visitRoute';
import { formatDistanceKm } from '../utils/geo';
import { useHistoryBackClose } from '../hooks/useHistoryBackClose';

/**
 * 收藏串联一日游：建议访问顺序 + 地图折线 + 一键高德驾车
 */
export default function FavoriteTripModal({ items, userLocation, title, onClose }) {
  const { requestClose } = useHistoryBackClose(!!items?.length, onClose, 'jgsFavoriteTrip');

  const ordered = useMemo(
    () => orderVisitStops(userLocation, items),
    [items, userLocation]
  );

  const totalKm = useMemo(
    () => totalStraightKm(userLocation, ordered),
    [userLocation, ordered]
  );

  const amapUrl = useMemo(
    () => amapMultiStopRouteUrl(userLocation, ordered),
    [userLocation, ordered]
  );

  if (!items?.length) return null;

  const openAmap = () => {
    if (amapUrl) window.open(amapUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="modal-overlay nav-route-overlay" role="dialog" aria-modal="true" aria-label="收藏一日游">
      <article className="modal-panel nav-route-panel">
        <div className="nav-route-sticky-top">
          <button type="button" className="nav-route-back-btn" onClick={requestClose}>
            ← 返回
          </button>
          <h3 className="nav-route-title">{title || '收藏一日游'}</h3>
          <button type="button" className="nav-route-close-x" onClick={requestClose} aria-label="关闭">
            ✕
          </button>
        </div>

        <div className="nav-route-scroll">
          <p className="trip-route-intro">
            按<strong>先近后远</strong>排了建议顺序（直线距离示意）。实际开车转弯以高德为准；不去了随时点返回。
          </p>
          {totalKm > 0 && (
            <p className="trip-route-total">
              全程直线约 <strong>{formatDistanceKm(totalKm, { straightLine: false })}</strong>（{ordered.length} 站）
            </p>
          )}

          <TripRouteMap userLocation={userLocation} orderedStops={ordered} height={260} />

          <ol className="trip-stop-list">
            {ordered.map((it, idx) => (
              <li key={it.id || idx} className="trip-stop-item">
                <span className="trip-stop-num">{idx + 1}</span>
                <div className="trip-stop-body">
                  <strong>{it.merchantName || it.title}</strong>
                  {it.address && <span className="trip-stop-addr">{it.address}</span>}
                  {idx === 0 && userLocation?.lat != null && (
                    <span className="trip-stop-leg">从你这 → 约 {formatLegKm(it._legKm)}</span>
                  )}
                  {idx > 0 && (
                    <span className="trip-stop-leg">上一站 → 约 {formatLegKm(it._legKm)}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {amapUrl && (
            <button type="button" className="btn nav-route-external" onClick={openAmap}>
              用高德规划这趟驾车路线
            </button>
          )}
        </div>

        <div className="nav-route-footer-fixed">
          <button type="button" className="btn nav-route-footer-primary" onClick={requestClose}>
            ← 返回收藏列表
          </button>
        </div>
      </article>
    </section>
  );
}
