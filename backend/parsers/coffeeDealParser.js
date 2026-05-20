/** 咖啡/饮品场景：第二杯半价、买一送一、自带杯、下午茶套餐 */
import { parseCommonRules, applyRules, normalizeCn } from './baseParser.js';

export function parseCoffeeDeal(text, ctx) {
  const t = normalizeCn(text || '');
  const rules = [...parseCommonRules(text).rules];

  if (/第二杯半价|第2杯半价/.test(t)) {
    rules.push({ type: 'second_half', raw: '第二杯半价' });
  }
  if (/买一送一|买1送1/.test(t)) {
    rules.push({ type: 'buy_get', buy: 1, get: 1, raw: '买一送一' });
  }
  let m;
  if ((m = t.match(/自带杯.*?减\s*(\d+)/))) {
    rules.push({ type: 'bring_cup', off: +m[1], raw: m[0] });
  }
  if ((m = t.match(/原价\s*(\d+).*?现价\s*(\d+)/))) {
    rules.push({ type: 'fixed_deal', original: +m[1], deal: +m[2], raw: m[0] });
  }

  let price = ctx.price;
  let isPerPerson = ctx.isPerPerson ?? true;
  if (rules.some((r) => r.type === 'fixed_deal')) {
    const fd = rules.find((r) => r.type === 'fixed_deal');
    price = fd.deal;
    ctx.originalPrice = fd.original;
  }

  let result = applyRules({ price, headcount: ctx.headcount || 2, isPerPerson, rules });

  if (rules.some((r) => r.type === 'second_half') && (ctx.headcount || 2) >= 2) {
    const per = (price + price / 2) / 2;
    result = {
      perCapita: Math.round(per * 100) / 100,
      dealPrice: Math.round(per * (ctx.headcount || 2) * 100) / 100,
      savingPercent: Math.round(((price - per) / price) * 100),
      promoNote: '第二杯半价',
    };
  }

  return { rules, ...parseCommonRules(text).validity, ...result, scene: 'coffee' };
}
