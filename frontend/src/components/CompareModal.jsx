import { useMemo } from 'react';
import { normalizeDeal } from '../utils/normalizeDeal';
import { distanceKm, formatDistanceKm } from '../utils/geo';
import CompareRouteMap from './CompareRouteMap';
import { compareGroupLabel, compareTableCells } from '../utils/compareRules';

function resolveDistance(item, userLocation) {
  if (item.distanceKm != null) return Number(item.distanceKm);
  if (item.distance != null) return Number(item.distance);
  if (userLocation?.lat != null && item.lat != null && item.lng != null) {
    return distanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
  }
  return null;
}

const DIM_ROWS = [
  { key: 'scene', label: '场景', best: null },
  { key: 'price', label: '人均价格', best: 'minPrice' },
  { key: 'saved', label: '节省金额', best: 'maxSaved' },
  { key: 'promo', label: '优惠规则', best: null },
  { key: 'tags', label: '情绪标签', best: null },
  { key: 'heat', label: '博主热度', best: 'maxHeat' },
  { key: 'distance', label: '距离', best: 'minDist' },
];

function pickBestIds(rows, cells) {
  const ids = { minPrice: null, maxSaved: null, maxHeat: null, minDist: null };
  if (rows.length < 2) return ids;

  let minP = Infinity;
  let maxS = -1;
  let maxH = -1;
  let minD = Infinity;

  rows.forEach((r, i) => {
    const c = cells[i];
    if (c.priceNum < minP) {
      minP = c.priceNum;
      ids.minPrice = r.id;
    }
    if (c.savedNum > maxS) {
      maxS = c.savedNum;
      ids.maxSaved = r.id;
    }
    if (c.heatNum > maxH) {
      maxH = c.heatNum;
      ids.maxHeat = r.id;
    }
    if (c.distanceNum < minD) {
      minD = c.distanceNum;
      ids.minDist = r.id;
    }
  });
  return ids;
}

export default function CompareModal({ items, userLocation, onClose, onOpenDetail, onRemove }) {
  if (!items?.length) return null;

  const { rows, cells, bestIds, groupLabel } = useMemo(() => {
    const normalized = items.map((raw) => {
      const it = normalizeDeal(raw);
      const km = resolveDistance(it, userLocation);
      return { ...it, _distanceKm: km };
    });
    const sorted = [...normalized].sort((a, b) => (a._distanceKm ?? 999) - (b._distanceKm ?? 999));
    const cellData = sorted.map((it) => compareTableCells(it, it._distanceKm));
    return {
      rows: sorted,
      cells: cellData,
      bestIds: pickBestIds(sorted, cellData),
      groupLabel: sorted[0] ? compareGroupLabel(sorted[0]) : '',
    };
  }, [items, userLocation]);

  const isBest = (dimKey, rowId) => {
    const map = {
      price: 'minPrice',
      saved: 'maxSaved',
      heat: 'maxHeat',
      distance: 'minDist',
    };
    const k = map[dimKey];
    return k && bestIds[k] === rowId;
  };

  return (
    <section className="modal-overlay compare-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <article className="modal-panel compare-panel-full" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--font-title)', fontSize: '18px' }}>
          ⚖️ 嘎算对比 ({rows.length}/3)
        </h2>
        <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#888' }}>
          同类才比 · 同场景同子类最多 3 家
          {groupLabel ? ` · 当前：${groupLabel}` : ''}
        </p>

        <div className="compare-table-scroll">
        <table className="compare-dim-table">
          <thead>
            <tr>
              <th>维度</th>
              {rows.map((it, idx) => (
                <th key={it.id}>
                  <div className="compare-col-head">
                    <span>
                      {idx + 1}. {it.merchantName || it.title}
                    </span>
                    {onRemove && (
                      <button
                        type="button"
                        className="compare-col-remove"
                        onClick={() => onRemove(it.id)}
                      >
                        移除
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIM_ROWS.map(({ key, label, best }) => (
              <tr key={key}>
                <th>{label}</th>
                {rows.map((it, colIdx) => {
                  const cell = cells[colIdx][key];
                  const highlight = best && isBest(key, it.id);
                  return (
                    <td key={it.id} className={highlight ? 'compare-cell-best' : undefined}>
                      {cell}
                      {highlight ? ' ✓' : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <CompareRouteMap userLocation={userLocation} items={rows} height={200} />

        <div className="compare-strip" role="list">
          {rows.map((it, idx) => {
            const distText = it.distanceText || formatDistanceKm(it._distanceKm);
            const isNearest = bestIds.minDist === it.id && rows.length > 1;
            return (
              <div
                key={it.id}
                className="compare-strip-item compare-clickable"
                role="button"
                tabIndex={0}
                onClick={() => onOpenDetail?.(it)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenDetail?.(it)}
              >
                <div className="compare-strip-photo">
                  {it.imageUrl ? (
                    <img src={it.imageUrl} alt="" loading="lazy" />
                  ) : (
                    <span className="compare-strip-no-img">{it.sceneIcon || '📍'}</span>
                  )}
                  <span className="compare-strip-num">{idx + 1}</span>
                </div>
                <p className="compare-strip-dist">
                  📍 {distText}
                  {isNearest && <span className="compare-nearest-badge">最近</span>}
                </p>
                <p className="compare-strip-price">¥{it.discountPrice}</p>
                <p className="compare-tap-hint">点开详情</p>
              </div>
            );
          })}
        </div>

        <div className="compare-cards">
          {rows.map((it, idx) => {
            const distText = it.distanceText || formatDistanceKm(it._distanceKm);
            const isNearest = bestIds.minDist === it.id && rows.length > 1;
            const hasLocation = it.lat != null && it.lng != null;

            return (
              <div
                key={it.id}
                className="compare-card compare-clickable"
                role="button"
                tabIndex={0}
                onClick={() => onOpenDetail?.(it)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenDetail?.(it)}
              >
                <div className="compare-card-photo">
                  {it.imageUrl ? (
                    <img src={it.imageUrl} alt={it.title} loading="lazy" />
                  ) : (
                    <div className="compare-photo-placeholder">
                      <span style={{ fontSize: 32 }}>{it.sceneIcon || '🏪'}</span>
                      <span>暂无实景图</span>
                    </div>
                  )}
                  <span className="compare-card-num">{idx + 1}</span>
                </div>
                <div className="compare-card-body">
                  <div className="compare-card-head">
                    <h3>{it.title}</h3>
                    <span className="compare-scene-tag">{cells[idx].scene}</span>
                  </div>
                  <p className="compare-distance">
                    📍 距你 <strong>{distText}</strong>
                    {isNearest && <span className="compare-nearest-badge">最近</span>}
                  </p>
                  <p className="compare-price">
                    <strong>¥{it.discountPrice}</strong>
                    {it.originalPrice > it.discountPrice && (
                      <span className="compare-price-orig">¥{it.originalPrice}</span>
                    )}
                    {it.valueScore > 0 && <span className="compare-score">划算 {it.valueScore}</span>}
                  </p>
                  {it.discountText && <p className="compare-promo">{it.discountText}</p>}
                  {it.influencerQuote && <p className="compare-quote">「{it.influencerQuote}」</p>}
                  {it.address && <p className="compare-address">{it.address}</p>}
                  {hasLocation && (
                    <button
                      type="button"
                      className="btn-secondary btn compare-location-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetail?.(it);
                      }}
                    >
                      📍 查看位置
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-secondary btn compare-detail-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail?.(it);
                    }}
                  >
                    查看店铺详情
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" className="btn" style={{ marginTop: 16 }} onClick={onClose}>
          关闭
        </button>
      </article>
    </section>
  );
}
