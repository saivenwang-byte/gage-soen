/**
 * 盒马 — 奉贤门店折扣
 * 仅供学习研究，请遵守平台 robots.txt 及用户协议
 */
import { runRealCrawl } from './base/playwrightCrawler.js';

export const name = 'hema';
export const label = '盒马';
export const types = ['platform'];
export const scenes = ['shopping', 'all'];

export async function crawl(ctx) {
  return runRealCrawl({ platform: name, label, scenes: ctx.scenes, filters: ctx.filters });
}
