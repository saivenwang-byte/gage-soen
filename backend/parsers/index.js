import { parseCoffeeDeal } from './coffeeDealParser.js';
import { parseDiningDeal } from './diningDealParser.js';
import { parseStayDeal } from './stayDealParser.js';
import { parseShoppingDeal } from './shoppingDealParser.js';
import { parseEntertainmentDeal } from './entertainmentDealParser.js';

const MAP = {
  stay: parseStayDeal,
  dining: parseDiningDeal,
  coffee: parseCoffeeDeal,
  entertainment: parseEntertainmentDeal,
  life: parseEntertainmentDeal,
  shopping: parseShoppingDeal,
};

/** 按场景路由解析器 */
export function parseDeal(scene, promoText, ctx = {}) {
  const fn = MAP[scene] || parseDiningDeal;
  return fn(promoText, ctx);
}
