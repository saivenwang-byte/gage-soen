/**
 * 从博主口播/模糊文案提取优惠
 * 例：「八个人去老板给打七折」「人均算下来才两百多」
 */
import { parseCommonRules, applyRules } from './baseParser.js';

const PER_CAPITA_RE = /人均(?:算下来?|只要|才)?\s*(\d+(?:\.\d+)?)\s*元?/;
const DISCOUNT_WORD_RE = /打\s*([一二三四五六七八九十\d]+(?:\.\d+)?)\s*折|([0-9.]+)\s*折/;
const PEOPLE_DISCOUNT_RE = /(\d+)\s*个人?去.*?打\s*([0-9.]+)\s*折/;

const CN_NUM = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };

function cnToNum(s) {
  if (/^\d/.test(s)) return Number(s);
  return CN_NUM[s] ?? Number(s);
}

export function parseFuzzyPromo(text, ctx = {}) {
  if (!text) return null;
  const base = parseCommonRules(text);
  const rules = [...base.rules];
  let inferredPerCapita = null;

  let m = text.match(PER_CAPITA_RE);
  if (m) inferredPerCapita = +m[1];

  m = text.match(PEOPLE_DISCOUNT_RE);
  if (m) {
    const people = +m[1];
    let rate = +m[2];
    if (rate > 10) rate /= 10;
    if (rate > 1) rate /= 10;
    rules.push({ type: 'discount', rate, raw: m[0] });
    ctx.headcount = people;
  }

  m = text.match(DISCOUNT_WORD_RE);
  if (m && !rules.some((r) => r.type === 'discount')) {
    let raw = m[1] || m[2];
    let rate = cnToNum(raw);
    if (rate > 10) rate /= 10;
    if (rate > 1) rate /= 10;
    rules.push({ type: 'discount', rate, raw: m[0] });
  }

  const price = ctx.price || (inferredPerCapita ? inferredPerCapita * (ctx.headcount || 1) : 0);
  const result = applyRules({
    price,
    headcount: ctx.headcount || 4,
    isPerPerson: !!ctx.isPerPerson,
    rules,
  });

  if (inferredPerCapita) {
    result.perCapita = inferredPerCapita;
    result.promoNote = (result.promoNote || '') + '；博主口述人均';
    result.fuzzySource = true;
  }

  return { ...base, ...result, rules };
}
