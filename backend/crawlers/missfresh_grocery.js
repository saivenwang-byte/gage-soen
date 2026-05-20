/** 每日优鲜 仅供学习研究，请遵守平台 robots.txt 及用户协议 */
import { runRealCrawl } from './base/playwrightCrawler.js';
export const name = 'missfresh';
export const label = '每日优鲜';
export const types = ['platform'];
export const scenes = ['shopping', 'all'];
export async function crawl(ctx) {
  return runRealCrawl({ platform: name, label, scenes: ctx.scenes, filters: ctx.filters });
}
