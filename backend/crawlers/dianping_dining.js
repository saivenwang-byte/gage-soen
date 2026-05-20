/**
 * 大众点评 — 奉贤全板块真实爬取
 * 仅供学习研究，请遵守平台 robots.txt 及用户协议
 */
import { runRealCrawl } from './base/playwrightCrawler.js';

export const name = 'dianping';
export const label = '大众点评';
export const types = ['platform'];
export const scenes = ['dining', 'coffee', 'entertainment', 'life', 'all'];

export async function crawl(ctx) {
  return runRealCrawl({
    platform: name,
    label,
    scenes: ctx.scenes,
    filters: ctx.filters,
  });
}
