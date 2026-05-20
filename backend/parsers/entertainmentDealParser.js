/** 休闲娱乐：通票、人数要求、含餐 */
import { parseCommonRules, applyRules } from './baseParser.js';

export function parseEntertainmentDeal(text, ctx) {
  const base = parseCommonRules(text);
  const result = applyRules({
    price: ctx.price,
    headcount: ctx.headcount || 4,
    isPerPerson: ctx.isPerPerson ?? true,
    rules: base.rules,
  });
  return {
    ...base,
    ...result,
    includesMeal: /含餐|烧烤套餐/.test(text || ''),
    tags: extractTags(text),
    scene: 'entertainment',
  };
}

function extractTags(text = '') {
  const all = [
    '麻将', 'K歌', '桌游', '剧本杀', '密室', '射箭', '团建', '轰趴',
    '羽毛球', '篮球', '台球', '斯诺克', '健身', '游泳',
  ];
  return all.filter((t) => text.includes(t));
}
