/**
 * 性价比评分 + 博主热度
 */
export function bloggerHeat(bloggers = [], minLikes = 0) {
  if (!bloggers.length) return 0;
  const filtered = bloggers.filter((b) => (b.likes || 0) >= minLikes);
  if (!filtered.length) return 0;
  return filtered.reduce((s, b) => {
    const fans = Math.log10((b.followers || 1000) + 1) * 10;
    const engage = Math.log10((b.likes || 0) + (b.collects || 0) + 1) * 20;
    return s + fans + engage;
  }, 0);
}

export function valueScore(item, scene) {
  const savingPct = item.savingPercent || 0;
  const rating = (item.rating || 4) / 5;
  const heat = Math.min(bloggerHeat(item.bloggers), 100) / 100;
  const multiSource = (item.sourceCount || 1) > 1 ? 0.08 : 0;
  const adPenalty = item.suspectedAd ? -0.15 : 0;

  const weights = {
    stay: { save: 0.45, rating: 0.25, heat: 0.2, multi: 0.1 },
    dining: { save: 0.4, rating: 0.3, heat: 0.2, multi: 0.1 },
    coffee: { save: 0.42, rating: 0.28, heat: 0.2, multi: 0.1 },
    entertainment: { save: 0.4, rating: 0.25, heat: 0.25, multi: 0.1 },
    life: { save: 0.42, rating: 0.28, heat: 0.2, multi: 0.1 },
    shopping: { save: 0.5, rating: 0.15, heat: 0.25, multi: 0.1 },
    service: { save: 0.35, rating: 0.35, heat: 0.2, multi: 0.1 },
  };
  const w = weights[scene] || weights.dining;
  const raw =
    (savingPct / 100) * w.save +
    rating * w.rating +
    heat * w.heat +
    multiSource * (w.multi || 0.1) +
    adPenalty;
  return Math.round(Math.max(0, Math.min(100, raw * 100)));
}

export function sortItems(items, sortBy) {
  const copy = [...items];
  switch (sortBy) {
    case 'price_asc':
      return copy.sort((a, b) => (a.perCapita ?? a.dealPrice) - (b.perCapita ?? b.dealPrice));
    case 'saving':
      return copy.sort((a, b) => (b.savingPercent || 0) - (a.savingPercent || 0));
    case 'blogger':
      return copy.sort((a, b) => bloggerHeat(b.bloggers) - bloggerHeat(a.bloggers));
    case 'newest':
      return copy.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
    default:
      return copy.sort((a, b) => (b.valueScore || 0) - (a.valueScore || 0));
  }
}
