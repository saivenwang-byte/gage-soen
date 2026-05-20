/**
 * 优惠解析基类：人数/满减/折扣/赠送 + 有效期
 */
import { parseValidityFromText } from '../utils/timeWindow.js';

const CN = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };

export function normalizeCn(text) {
  return [...text].map((c) => (CN[c] !== undefined ? String(CN[c]) : c)).join('');
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

  const validity = parseValidityFromText(text);
  return { rules, validity };
}

export function applyRules({ price, headcount, isPerPerson, rules }) {
  let total = isPerPerson ? price * headcount : price;
  let paid = total;
  const notes = [];

  for (const r of rules) {
    if (r.type === 'free_person' && headcount >= r.minPeople) {
      const payHeads = Math.max(1, headcount - r.freeCount);
      paid = isPerPerson ? price * payHeads : price * (payHeads / headcount);
      notes.push(r.raw);
    } else if (r.type === 'full_reduction' && total >= r.threshold) {
      paid = total - r.reduction;
      notes.push(r.raw);
    } else if (r.type === 'discount') {
      paid = total * r.rate;
      notes.push(r.raw);
    } else if (r.type === 'buy_get') {
      const sets = Math.floor(headcount / (r.buy + r.get));
      const rem = headcount % (r.buy + r.get);
      const payUnits = sets * r.buy + Math.min(rem, r.buy);
      paid = isPerPerson ? price * payUnits : price * (payUnits / headcount);
      notes.push(r.raw);
    }
  }

  const perCapita = paid / Math.max(1, headcount);
  const basePer = total / Math.max(1, headcount);
  const savingPercent = basePer > 0 ? Math.round(((basePer - perCapita) / basePer) * 100) : 0;
  return {
    perCapita: Math.round(perCapita * 100) / 100,
    dealPrice: Math.round(paid * 100) / 100,
    savingPercent,
    promoNote: notes.join('；') || '按标价',
  };
}
