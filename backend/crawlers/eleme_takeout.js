/** 饿了么 — 到店自取 仅供学习研究，请遵守平台 robots.txt 及用户协议 */
import { runRealCrawl } from './base/playwrightCrawler.js';
export const name = 'eleme';
export const label = '饿了么';
export const types = ['platform'];
export const scenes = ['dining', 'coffee', 'all'];
export async function crawl(ctx) {
  return runRealCrawl({ platform: 'eleme', label, scenes: ctx.scenes, filters: ctx.filters });
}
