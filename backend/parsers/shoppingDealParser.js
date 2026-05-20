/** 购物：折扣率、满赠券、临期 */
import { parseCommonRules, applyRules, normalizeCn } from './baseParser.js';

export function parseShoppingDeal(text, ctx) {
  const t = normalizeCn(text || '');
  const base = parseCommonRules(text);
  const rules = [...base.rules];

  if ((m = t.match(/(\d+(?:\.\d+)?)\s*折起?/))) {
    let rate = +m[1];
    if (rate > 10) rate /= 10;
    if (rate > 1) rate /= 10;
    rules.push({ type: 'discount', rate, raw: m[0] });
  }
  if ((m = t.match(/满\s*(\d+).*?送\s*(\d+)\s*元券/))) {
    rules.push({ type: 'full_gift', threshold: +m[1], gift: +m[2], raw: m[0] });
  }
  if (/临期|清仓/.test(t) && (m = t.match(/(\d+)\s*折/))) {
    let rate = +m[1];
    if (rate > 10) rate /= 10;
    rules.push({ type: 'discount', rate: rate > 1 ? rate / 10 : rate, raw: '临期' + m[0] });
  }

  const price = ctx.price;
  const result = applyRules({
    price,
    headcount: 1,
    isPerPerson: false,
    rules,
  });

  const discountRate = ctx.originalPrice
    ? Math.round((result.dealPrice / ctx.originalPrice) * 100) / 10
    : null;

  return { ...base, ...result, discountRate, scene: 'shopping' };
}
