/**
 * 从优惠文案解析「几人免几 / 满减 / 折扣」，并按人数算人均实付（与 backend/parsers/baseParser.js 对齐）
 */

const CN = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };

export function normalizeCn(text) {
  return [...(text || '')].map((c) => (CN[c] !== undefined ? String(CN[c]) : c)).join('');
}

export function parseCommonRules(text) {
  const t = normalizeCn(text || '');
  const rules = [];
  let m;

  if ((m = t.match(/(\d+)\s*人\s*免\s*(\d+)\s*人/))) {
    rules.push({ type: 'free_person', minPeople: +m[1], freeCount: +m[2], raw: m[0] });
  } else if ((m = t.match(/(\d+)\s*人\s*同行.*?免\s*(\d+)\s*人/))) {
    rules.push({ type: 'free_person', minPeople: +m[1], freeCount: +m[2], raw: m[0] });
  } else if ((m = t.match(/(\d+)\s*人\s*同行.*?(\d+)\s*人\s*免/))) {
    rules.push({ type: 'free_person', minPeople: +m[1], freeCount: +m[2], raw: m[0] });
  } else if ((m = t.match(/(\d+)\s*人.*?免\s*(\d+)\s*人/))) {
    rules.push({ type: 'free_person', minPeople: +m[1], freeCount: +m[2], raw: m[0] });
  }

  if ((m = t.match(/满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)/))) {
    rules.push({ type: 'full_reduction', threshold: +m[1], reduction: +m[2], raw: m[0] });
  }
  if ((m = t.match(/(\d+(?:\.\d+)?)\s*折/))) {
    let rate = +m[1];
    if (rate > 10) rate /= 10;
    if (rate > 1) rate /= 10;
    rules.push({ type: 'discount', rate, raw: m[0] });
  }
  if ((m = t.match(/买\s*(\d+)\s*送\s*(\d+)/))) {
    rules.push({ type: 'buy_get', buy: +m[1], get: +m[2], raw: m[0] });
  }

  return { rules };
}

export function applyRules({ price, headcount, isPerPerson, rules }) {
  let total = isPerPerson ? price * headcount : price;
  let paid = total;
  const notes = [];

  for (const r of rules) {
    if (r.type === 'free_person' && headcount >= r.minPeople) {
      const payHeads = Math.max(1, headcount - r.freeCount);
      paid = isPerPerson ? price * payHeads : price * (payHeads / headcount);
      notes.push(`${r.minPeople}人起免${r.freeCount}人`);
    } else if (r.type === 'free_person') {
      notes.push(`满${r.minPeople}人免${r.freeCount}人（当前${headcount}人未达标）`);
    } else if (r.type === 'full_reduction' && total >= r.threshold) {
      paid = total - r.reduction;
      notes.push(r.raw);
    } else if (r.type === 'discount') {
      paid = total * r.rate;
      notes.push(r.raw);
    }
  }

  const perCapita = paid / Math.max(1, headcount);
  const basePer = total / Math.max(1, headcount);
  const savingPer = Math.max(0, basePer - perCapita);
  return {
    perCapita: Math.round(perCapita * 100) / 100,
    dealPrice: Math.round(paid * 100) / 100,
    savingPer: Math.round(savingPer * 100) / 100,
    promoNote: notes.join('；') || null,
    freePersonRule: rules.find((r) => r.type === 'free_person') || null,
  };
}

/** 解析并计算（民宿整单标价 / 按晚） */
export function computeDealPricing(deal, { headcount = 2, nights = 1, isPerPerson = false } = {}) {
  const text = [deal.promoText, deal.discountText, deal.title, deal.merchantName].filter(Boolean).join(' ');
  const { rules } = parseCommonRules(text);
  const price = deal.discountPrice ?? deal.price ?? 0;
  const result = applyRules({ price, headcount, isPerPerson, rules });
  const perNight = result.perCapita / Math.max(1, nights);
  return {
    ...result,
    perNightPerPerson: Math.round(perNight * 100) / 100,
    headcount,
    nights,
  };
}

export function formatGroupPromoLabel(rule) {
  if (!rule || rule.type !== 'free_person') return null;
  return `${rule.minPeople}人免${rule.freeCount}人`;
}
