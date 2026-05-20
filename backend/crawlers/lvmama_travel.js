/** 驴妈妈 仅供学习研究，请遵守平台 robots.txt 及用户协议 */
import { runRealCrawl } from './base/playwrightCrawler.js';
export const name = 'lvmama';
export const label = '驴妈妈';
export const types = ['platform'];
export const scenes = ['entertainment', 'stay', 'all'];
export async function crawl(ctx) {
  return runRealCrawl({ platform: name, label, scenes: ctx.scenes, filters: ctx.filters });
}
