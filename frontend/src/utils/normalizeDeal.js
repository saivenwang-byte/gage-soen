import { formatDistanceKm } from './geo.js';

/** 统一奥扫/收藏/历史条目的字段，兼容后端多种命名 */
export function normalizeDeal(item) {
  if (!item) return {};
  return {
    ...item,
    id: item.id || `${item.source || 'deal'}-${item.title || item.merchantName || Date.now()}`,
    title: item.title || item.merchantName || '未知商家',
    merchantName: item.merchantName || item.title,
    discountPrice: item.discountPrice ?? item.perCapita ?? item.price ?? 0,
    originalPrice: item.originalPrice ?? item.price ?? item.discountPrice ?? 0,
    discountText: item.discountText || item.promoText || '',
    sceneIcon: item.sceneIcon || sceneIcon(item.scene),
    emotionTags: item.emotionTags || item.tags || [],
    influencerName: item.influencerName || item.bloggers?.[0]?.nickname,
    influencerQuote: item.influencerQuote || item.bloggers?.[0]?.summary,
    valueScore: item.valueScore ?? item.score ?? 0,
    experienceScore: item.experienceScore ?? item.influencerScore ?? 0,
    discountRate:
      item.discountRate ??
      (item.originalPrice && item.discountPrice
        ? 1 - item.discountPrice / item.originalPrice
        : (item.savingPercent || 0) / 100),
    savedAmount:
      item.savedAmount ??
      (item.originalPrice && item.discountPrice
        ? Math.max(0, item.originalPrice - item.discountPrice)
        : 0),
    distance: item.distance ?? null,
    distanceText:
      item.distanceText ||
      (item.distanceKm != null
        ? formatDistanceKm(item.distanceKm)
        : item.distance != null
          ? formatDistanceKm(item.distance)
          : ''),
    dataMode: item.dataMode,
    platform: item.platform || item.source,
    platformLabel: item.platformLabel || item.platform || item.source,
    fetchedAt: item.fetchedAt,
    perCapita: item.perCapita ?? item.discountPrice,
    imageUrl: item.imageUrl || item.coverImage || item.image,
    lat: item.lat ?? null,
    lng: item.lng ?? null,
    address: item.address,
    distanceKm: item.distanceKm ?? item.distance ?? null,
    merchantIntro: item.merchantIntro || buildMerchantIntro(item),
    services: item.services?.length ? item.services : buildMerchantServices(item),
    bloggers: item.bloggers || [],
    fortune: item.fortune || null,
  };
}

/** 店家自我介绍（无专用字段时从收录信息拼出） */
export function buildMerchantIntro(item) {
  if (!item) return '';
  if (item.merchantIntro) return item.merchantIntro;
  const parts = [];
  const promo = item.promoText || item.discountText;
  if (promo) parts.push(promo);
  if (item.town) parts.push(`在${item.town}，奉贤周边好逛的一家。`);
  const quote = item.influencerQuote || item.bloggers?.[0]?.summary;
  if (quote) parts.push(`街坊说：「${quote}」`);
  if (item.platformLabel) parts.push(`（${item.platformLabel}收录）`);
  return (
    parts.join(' ') ||
    '暂无长文介绍，建议看下面价格与特色标签；需要更多图可点「去平台看详情」。'
  );
}

/** 能提供什么服务 / 卖点列表 */
export function buildMerchantServices(item) {
  if (!item) return [];
  if (Array.isArray(item.services) && item.services.length) return item.services;
  const list = [];
  const promo = item.discountText || item.promoText;
  if (promo) list.push(`当前优惠：${promo}`);
  const price = item.discountPrice ?? item.price;
  if (price != null && price > 0) {
    list.push(`参考到手价：人均约 ¥${price}`);
  }
  const tags = [...(item.emotionTags || []), ...(item.tags || [])].filter(Boolean);
  const uniq = [...new Set(tags)];
  if (uniq.length) list.push(`环境/特色：${uniq.slice(0, 6).join(' · ')}`);
  if (item.address) list.push(`地址：${item.address}`);
  return list;
}

/** 卡片底部元信息：来源 + 抓取时间 */
export function formatDealMeta(item) {
  const n = normalizeDeal(item);
  const source = n.platformLabel || n.platform || '未知来源';
  const mode =
    n.dataMode === 'fallback'
      ? '演示数据'
      : n.dataMode === 'curated'
        ? '精选实地'
        : n.dataMode === 'ugc'
          ? '家人上传'
          : n.dataMode === 'real'
            ? '页面抓取'
            : '聚合';
  let time = '';
  if (n.fetchedAt) {
    try {
      time = new Date(n.fetchedAt).toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      time = '';
    }
  }
  return { source, mode, time, line: [source, mode, time].filter(Boolean).join(' · ') };
}

function sceneIcon(scene) {
  const map = {
    stay: '🏠',
    dining: '🍽️',
    coffee: '☕',
    leisure: '🎣',
    entertainment: '🎯',
    life: '🏸',
    expiring: '⏳',
    clothing: '👗',
    secondhand: '🔄',
    factory: '🏭',
    pet: '🐱',
    hair: '💇',
    shopping: '🛒',
  };
  return map[scene] || '📍';
}
