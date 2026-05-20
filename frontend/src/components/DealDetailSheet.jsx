/**
 * 点开店铺详情（旧版「嘎算榜单」卡片点开的体验）
 */
import { useState } from 'react';
import { normalizeDeal, formatDealMeta } from '../utils/normalizeDeal';
import { calculateDistance, formatDistance, formatDistanceKm } from '../utils/geo';
import { getDealExternalLinks } from '../utils/dealLinks';
import { getDeviceId } from '../utils/deviceId';
import { apiUrl } from '../config/api';
import DealImage from './DealImage';
import NavRouteModal from './NavRouteModal';
import CardQuickActions from './CardQuickActions';
import GroupPromoBlock from './GroupPromoBlock';

export default function DealDetailSheet({
  item: raw,
  onClose,
  userLocation,
  isFavorited,
  onToggleFavorite,
  isCompared,
  onToggleCompare,
  headcount = 2,
  nights = 1,
  fromBottle = false,
  fortune = null,
}) {
  const [showNav, setShowNav] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);

  if (!raw) return null;

  const item = normalizeDeal(raw);
  const meta = formatDealMeta(raw);
  const km = item.distanceKm ?? item.distance;
  const distText = item.distanceText || formatDistanceKm(km);
  const isAuntie =
    item.influencerName?.includes('阿姨') || item.platformLabel?.includes('居民');
  const links = getDealExternalLinks(item);
  const officialHref = item.officialUrl || links.officialUrl;
  const ctripHref = item.ctripUrl || links.ctripUrl;
  const dianpingHref = item.dianpingUrl || links.dianpingUrl;
  const hasPlatformLinks = !!(officialHref || ctripHref || dianpingHref);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const res = await fetch(apiUrl('/confirm'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: item.id,
          device_id: getDeviceId(),
          timestamp: Date.now(),
        }),
      });
      const data = await res.json();
      setConfirmResult(data.status || 'pending');
    } catch {
      setConfirmResult('pending');
    }
    setIsConfirming(false);
  };

  const handleNavigate = async (deal) => {
    fetch(apiUrl('/navigate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deal_id: deal.id,
        merchant_name: deal.merchantName || deal.title,
        device_id: getDeviceId(),
        from_lat: userLocation?.lat,
        from_lng: userLocation?.lng,
        to_lat: deal.lat,
        to_lng: deal.lng,
        timestamp: Date.now(),
      }),
    }).catch(() => {});

    const navUrl = `https://uri.amap.com/navigation?to=${deal.lng},${deal.lat},${encodeURIComponent(deal.title || deal.merchantName)}`;
    window.open(navUrl, '_blank');
  };

  const handleShare = async (deal) => {
    const shareData = {
      title: `${deal.merchantName || deal.title} - 介嘎算发现一个嘎算好价`,
      text: deal.promoText || deal.discountText || '',
    };
    if (navigator.share) {
      try {
        await navigator.share({ ...shareData, url: window.location.href });
      } catch {
        /* user cancelled */
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('链接已复制，可粘贴分享给朋友');
    }
  };

  return (
    <>
      <section
        className="modal-overlay deal-detail-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <article className="modal-panel deal-detail-sheet" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="deal-detail-close" onClick={onClose} aria-label="关闭">
            ✕
          </button>

          {fromBottle && (fortune?.text || item.fortune?.text) && (
            <div className="deal-detail-fortune">
              <span className="deal-detail-fortune-sign">
                {fortune?.sign || item.fortune?.sign || '签文'}
              </span>
              <p>{fortune?.text || item.fortune?.text}</p>
            </div>
          )}

          {item.imageUrl && (
            <div className="deal-detail-hero-wrap">
              <div className="deal-detail-hero-static">
                <DealImage
                  src={item.imageUrl}
                  images={item.images}
                  alt=""
                  className="deal-detail-hero"
                  enablePreview
                />
                <span className="deal-detail-hero-hint">点击放大 · 下滑看环境、价格、服务</span>
              </div>
              {(onToggleFavorite || onToggleCompare) && (
                <CardQuickActions
                  isFavorited={!!isFavorited}
                  isCompared={!!isCompared}
                  onFavorite={onToggleFavorite ? () => onToggleFavorite(item) : undefined}
                  onCompare={onToggleCompare ? () => onToggleCompare(item) : undefined}
                />
              )}
            </div>
          )}

          <div className="deal-detail-body">
            <div className="deal-head">
              <span className="scene-icon">{item.sceneIcon}</span>
              <h2>{item.merchantName || item.title}</h2>
            </div>

            {distText && distText !== '距离未知' && (
              <p className="deal-detail-distance">
                📍 距您 <strong>{distText}</strong>
                <span className="field-hint" style={{ display: 'block', fontWeight: 400, marginTop: 4 }}>
                  直线距离 · 价格来自精选收录，到店前请与商家确认
                </span>
              </p>
            )}

            {item.address && <p className="deal-detail-address">{item.address}</p>}

            {item.address && (
              <div
                style={{
                  padding: '16px',
                  background: '#FFFDF5',
                  borderRadius: '12px',
                  margin: '12px 0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>📍</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#2D2D2D' }}>{item.address}</p>
                    {userLocation && item.lat != null && item.lng != null && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#888' }}>
                        📏 距你{' '}
                        {formatDistance(
                          calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            item.lat,
                            item.lng
                          )
                        )}
                        （直线距离）
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(item)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#E8A84C',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '22px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    🧭 打开导航
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(item.address);
                      alert('地址已复制');
                    }}
                    style={{
                      padding: '12px 20px',
                      background: '#f5f5f5',
                      color: '#2D2D2D',
                      border: 'none',
                      borderRadius: '22px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    📋 复制地址
                  </button>
                </div>
              </div>
            )}

            <div className="deal-detail-price-block">
              <span className="deal-detail-price-label">人均/到手</span>
              <span className="deal-detail-price-main">¥{item.discountPrice}</span>
              {item.originalPrice > item.discountPrice && (
                <span className="compare-price-orig">原价 ¥{item.originalPrice}</span>
              )}
            </div>

            {item.discountText && <p className="promo deal-detail-promo">{item.discountText}</p>}
            <GroupPromoBlock deal={item} headcount={headcount} nights={nights} />

            {(item.emotionTags || []).length > 0 && (
              <div className="deal-detail-tags">
                {item.emotionTags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <section className="deal-detail-intro-block">
              <h3 className="deal-detail-section-title">店家介绍</h3>
              <p className="deal-detail-intro-text">{item.merchantIntro}</p>
              {item.services?.length > 0 && (
                <ul className="deal-detail-services">
                  {item.services.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </section>

            {item.influencerQuote && (
              <blockquote className="deal-detail-quote">
                <p className="deal-detail-quote-label">
                  {isAuntie ? '南桥张阿姨讲' : '博主侪讲好，跟牢买勿会错'}
                </p>
                <p>
                  {item.influencerName && <strong>@{item.influencerName} </strong>}
                  「{item.influencerQuote}」
                </p>
              </blockquote>
            )}

            {item.bloggers?.length > 1 && (
              <section className="deal-detail-bloggers">
                <h3 className="deal-detail-section-title">更多人说</h3>
                {item.bloggers.slice(0, 3).map((b) => (
                  <div key={b.nickname || b.summary} className="deal-detail-blogger-row">
                    <strong>@{b.nickname}</strong>
                    <p>{b.summary}</p>
                  </div>
                ))}
              </section>
            )}

            <p className="compare-meta">📡 {meta.line}</p>

            {hasPlatformLinks && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#f9f9f5',
                  borderRadius: '8px',
                }}
              >
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
                  📎 在以下平台查看详情与预订
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {officialHref && (
                    <a
                      href={officialHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 14px',
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '16px',
                        fontSize: '12px',
                        color: '#2D2D2D',
                        textDecoration: 'none',
                      }}
                    >
                      🏠 官网
                    </a>
                  )}
                  {ctripHref && (
                    <a
                      href={ctripHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 14px',
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '16px',
                        fontSize: '12px',
                        color: '#2D2D2D',
                        textDecoration: 'none',
                      }}
                    >
                      ✈️ 携程
                    </a>
                  )}
                  {dianpingHref && (
                    <a
                      href={dianpingHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 14px',
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '16px',
                        fontSize: '12px',
                        color: '#2D2D2D',
                        textDecoration: 'none',
                      }}
                    >
                      📝 大众点评
                    </a>
                  )}
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: '#aaa' }}>
                  点击链接将打开新页面，关掉标签页即可回到介嘎算
                </p>
              </div>
            )}

            <div className="deal-detail-actions">
              <p className="deal-detail-actions-hint">
                {fromBottle
                  ? '先看清环境、价格、服务；要去店里再点下面导航'
                  : '看清介绍后再决定是否导航'}
              </p>

              <div className="deal-detail-action-row" style={{ flexWrap: 'wrap', gap: 8 }}>
                {onToggleFavorite && (
                  <button type="button" className="btn-secondary btn" onClick={() => onToggleFavorite(item)}>
                    {isFavorited ? '已收藏' : '收藏'}
                  </button>
                )}
                {onToggleCompare && (
                  <button type="button" className="btn-secondary btn" onClick={() => onToggleCompare(item)}>
                    {isCompared ? '已加入对比' : '加入对比'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleShare(item)}
                  style={{
                    padding: '8px 16px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  📤 分享
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: '10px',
                    background: isConfirming ? '#f5f5f5' : '#FFF3E0',
                    color: isConfirming ? '#999' : '#E65100',
                    border: '1px solid #FFE0B2',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: isConfirming ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isConfirming ? '⏳ 确认中...' : '✅ 帮我确认'}
                </button>
              </div>

              {confirmResult && (
                <div
                  style={{
                    padding: '8px 12px',
                    background: '#E8F5E9',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#2E7D32',
                    marginTop: '8px',
                  }}
                >
                  ✅ 确认请求已收到，我们正在核实此优惠是否此刻可用
                </div>
              )}

              {item.lat != null && (
                <>
                  <button
                    type="button"
                    className="btn-secondary btn"
                    style={{ marginTop: 8 }}
                    onClick={() => setShowNav(true)}
                  >
                    📍 地图 / 导航（可选）
                  </button>
                  <p className="deal-detail-nav-hint">不导航也能直接关详情；地图页有返回键</p>
                </>
              )}
            </div>
          </div>
        </article>
      </section>

      {showNav && (
        <NavRouteModal
          item={item}
          userLocation={userLocation}
          onClose={() => setShowNav(false)}
          onCloseAll={() => {
            setShowNav(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
