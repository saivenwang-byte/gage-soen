/** 餐饮：套餐价、午市折扣、人数免单 */
import { parseCommonRules, applyRules, normalizeCn } from './baseParser.js';

export function parseDiningDeal(text, ctx) {
  const t = normalizeCn(text || '');
  const base = parseCommonRules(text);
  const rules = [...base.rules];

  let m;
  if ((m = t.match(/(\d+)\s*人餐\s*(\d+)/))) {
    rules.push({ type: 'set_meal', people: +m[1], price: +m[2], raw: m[0] });
  }
  if (/午市|晚市/.test(t) && (m = t.match(/(\d+(?:\.\d+)?)\s*折/))) {
    let rate = +m[1];
    if (rate > 10) rate /= 10;
    if (rate > 1) rate /= 10;
    rules.push({ type: 'discount', rate, raw: `市别${m[0]}` });
  }

  let price = ctx.price;
  let isPerPerson = false;
  const setMeal = rules.find((r) => r.type === 'set_meal');
  if (setMeal) {
    price = setMeal.price;
    ctx.headcount = setMeal.people;
  }

  const result = applyRules({
    price,
    headcount: ctx.headcount || 4,
    isPerPerson,
    rules,
  });

  return { rules, ...base.validity, ...result, scene: 'dining' };
}
