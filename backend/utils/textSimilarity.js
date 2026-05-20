/** 文案相似度 — 疑似商单（>80%） */
export function similarity(a = '', b = '') {
  if (!a || !b) return 0;
  const sa = new Set(a.replace(/\s/g, ''));
  const sb = new Set(b.replace(/\s/g, ''));
  let inter = 0;
  for (const c of sa) if (sb.has(c)) inter++;
  return inter / Math.max(sa.size, sb.size);
}

export function markSuspectedAds(items, threshold = 0.8) {
  const summaries = items.map((i) => i.bloggerSummary || i.promoText || '');
  return items.map((item, idx) => {
    let maxSim = 0;
    for (let j = 0; j < summaries.length; j++) {
      if (j === idx) continue;
      maxSim = Math.max(maxSim, similarity(summaries[idx], summaries[j]));
    }
    return {
      ...item,
      suspectedAd: maxSim >= threshold,
      copySimilarity: Math.round(maxSim * 100),
    };
  });
}
