/** 途家 仅供学习研究，请遵守平台 robots.txt 及用户协议 */
import { runRealCrawl } from './base/playwrightCrawler.js';
export const name = 'tujia';
export const label = '途家';
export const types = ['platform'];
export const scenes = ['stay', 'all'];
export async function crawl(ctx) {
  return runRealCrawl({ platform: name, label, scenes: ctx.scenes, filters: ctx.filters });
}
