/** 住宿：人均/晚、人数优惠、含餐 */
import { parseCommonRules, applyRules } from './baseParser.js';

export function parseStayDeal(text, ctx) {
  const base = parseCommonRules(text);
  const nights = ctx.nights || 1;
  const headcount = ctx.headcount || 2;
  const price = ctx.price;
  const isPerPerson = ctx.isPerPerson ?? false;

  const result = applyRules({ price, headcount, isPerPerson, rules: base.rules });
  const perNightPerPerson = result.perCapita / nights;

  return {
    ...base,
    ...result,
    perCapita: Math.round(perNightPerPerson * 100) / 100,
    perNightPerPerson: Math.round(perNightPerPerson * 100) / 100,
    includesMeal: /含早|含餐|双早/.test(text || ''),
    petFriendly: /宠物|可带猫|可带狗/.test(text || ''),
    scene: 'stay',
  };
}
