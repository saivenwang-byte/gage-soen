/**
 * 跨平台商家对齐：名称模糊匹配 + 地址关键词
 */
export function normalizeName(name = '') {
  return name
    .replace(/[（(].*?[）)]/g, '')
    .replace(/\s+/g, '')
    .replace(/店|餐厅|咖啡|民宿|酒店|度假村/g, '')
    .toLowerCase();
}

export function addressKey(addr = '') {
  const towns = ['南桥', '海湾', '奉城', '庄行', '四团', '柘林', '金汇'];
  for (const t of towns) {
    if (addr.includes(t)) return t;
  }
  return '奉贤';
}

export function similarity(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const setA = new Set(na.split(''));
  const setB = new Set(nb.split(''));
  let inter = 0;
  for (const c of setA) if (setB.has(c)) inter++;
  return inter / Math.max(setA.size, setB.size);
}

export function alignMerchants(items, threshold = 0.72) {
  const groups = [];
  for (const item of items) {
    let placed = false;
    for (const g of groups) {
      const ref = g[0];
      if (
        similarity(item.merchantName, ref.merchantName) >= threshold &&
        addressKey(item.address) === addressKey(ref.address)
      ) {
        g.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([item]);
  }
  return groups.map((g, i) => {
    const primary = g[0];
    const bloggers = g.flatMap((x) => x.bloggers || []);
    const sources = [...new Set(g.map((x) => x.platform))];
    const dupText = detectDuplicateCopy(g);
    return {
      ...primary,
      alignGroupId: `g${i}`,
      sourceCount: sources.length,
      sources,
      bloggers: mergeBloggers(bloggers),
      bloggerCount: mergeBloggers(bloggers).length,
      suspectedAd: dupText,
      alsoFrom: g.length > 1 ? sources.filter((s) => s !== primary.platform) : [],
    };
  });
}

function mergeBloggers(list) {
  const map = new Map();
  for (const b of list) {
    const k = `${b.platform}:${b.id || b.nickname}`;
    if (!map.has(k)) map.set(k, b);
    else {
      const ex = map.get(k);
      ex.likes = Math.max(ex.likes || 0, b.likes || 0);
      ex.collects = Math.max(ex.collects || 0, b.collects || 0);
    }
  }
  return [...map.values()];
}

function detectDuplicateCopy(group) {
  const texts = group.map((g) => (g.bloggerSummary || g.promoText || '').slice(0, 80));
  if (texts.length < 2) return false;
  return texts.every((t) => t && t === texts[0]);
}
