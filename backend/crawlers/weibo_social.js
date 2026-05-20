/** 微博 仅供学习研究，请遵守平台 robots.txt 及用户协议 */
import { runRealCrawl } from './base/playwrightCrawler.js';
export const name = 'weibo';
export const label = '微博';
export const types = ['social'];
export const scenes = ['*'];
export async function crawl(ctx) {
  return runRealCrawl({ platform: name, label, scenes: ctx.scenes, filters: ctx.filters });
}
