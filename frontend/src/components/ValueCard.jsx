import { normalizeDeal, formatDealMeta } from '../utils/normalizeDeal';
import { formatDistanceKm } from '../utils/geo';
import DealImage from './DealImage';
import CardQuickActions from './CardQuickActions';
import GroupPromoBlock from './GroupPromoBlock';

/** 列表卡片：图上角标 ♥ ⚖ 可收藏/比价 */
export default function ValueCard({
  data,
  mode = 'value',
  isCompared,
  onToggleCompare,
  showRemove,
  onRemove,
  isFavorited,
  onToggleFavorite,
  onOpen,
  headcount = 2,
  nights = 1,
}) {
  const item = normalizeDeal(data);
  const meta = formatDealMeta(data);
  const saved = item.savedAmount || Math.max(0, (item.originalPrice || 0) - (item.discountPrice || 0));
  const km = item.distanceKm ?? item.distance;
  const distText = item.distanceText || formatDistanceKm(km);
  const showQuickActions = onToggleFavorite || onToggleCompare;

  const handleOpen = () => {
    if (onOpen) onOpen(item);
  };

  return (
    <article
      className="card deal-card value-card"
      style={{ border: isCompared ? '2px solid var(--color-primary)' : undefined }}
      onClick={handleOpen}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(e) => onOpen && (e.key === 'Enter' || e.key === ' ') && handleOpen()}
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="value-card-media">
          {item.imageUrl ? (
            <DealImage
              src={item.imageUrl}
              alt=""
              style={{ width: 96, height: 96, borderRadius: 10, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div className="value-card-media-placeholder">{item.sceneIcon || '📍'}</div>
          )}
          {showQuickActions && (
            <CardQuickActions
              isFavorited={!!isFavorited}
              isCompared={!!isCompared}
              onFavorite={onToggleFavorite ? () => onToggleFavorite(item) : undefined}
              onCompare={onToggleCompare ? () => onToggleCompare(item) : undefined}
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="deal-head">
            <span className="scene-icon">{item.sceneIcon}</span>
            <h3 style={{ margin: 0, fontSize: '16px' }}>{item.merchantName || item.title}</h3>
          </div>
          {distText && distText !== '距离未知' && (
            <p className="dist" style={{ margin: '6px 0 0', fontSize: '13px', fontWeight: 600 }}>
              📍 距您 {distText}
            </p>
          )}
          {item.address && (
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#888', lineHeight: 1.4 }}>{item.address}</p>
          )}
          {item.discountText && <p className="promo" style={{ margin: '8px 0 0' }}>{item.discountText}</p>}
          <GroupPromoBlock deal={item} headcount={headcount} nights={nights} compact />
          <p className="price-row" style={{ marginTop: 8 }}>
            <strong className="price-highlight" style={{ fontSize: '20px' }}>人均 ¥{item.discountPrice}</strong>
            {item.originalPrice > item.discountPrice && (
              <span style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>¥{item.originalPrice}</span>
            )}
            {saved > 0 && <span className="save">省¥{Math.round(saved)}</span>}
            {mode === 'value' && item.valueScore > 0 && <span className="score">划算 {item.valueScore}</span>}
          </p>
          {(item.emotionTags || []).length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {item.emotionTags.slice(0, 4).map((t) => (
                <span key={t} className="tag-brand" style={{ fontSize: '11px', padding: '2px 10px', borderRadius: 12 }}>
                  {t}
                </span>
              ))}
            </div>
          )}
          {item.influencerQuote && (
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
              {item.influencerName ? `@${item.influencerName}：` : ''}「{item.influencerQuote}」
            </p>
          )}
          {meta.line && <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#aaa' }}>📡 {meta.line}</p>}
          <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#aaa' }}>
            {onOpen ? '点卡片看店家介绍·环境·价格' : ''}
            {(onToggleFavorite || onToggleCompare) && ' · 点图上 ♥ ⚖ 收藏比价'}
          </p>
        </div>
      </div>
      {showRemove && onRemove && (
        <div
          className="value-card-footer"
          onClick={(e) => e.stopPropagation()}
          style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f0f0', textAlign: 'right' }}
        >
          <button
            type="button"
            onClick={() => onRemove(item)}
            style={{ fontSize: 12, color: '#d94f4f', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            从收藏移除
          </button>
        </div>
      )}
    </article>
  );
}
