/**
 * 美团 — 到店团购 / 酒店民宿
 * 仅供学习研究，请遵守平台 robots.txt 及用户协议
 */
import { runRealCrawl } from './base/playwrightCrawler.js';

export const name = 'meituan';
export const label = '美团';
export const types = ['platform'];
export const scenes = ['dining', 'coffee', 'entertainment', 'life', 'stay', 'all'];

export async function crawl(ctx) {
  return runRealCrawl({ platform: name, label, scenes: ctx.scenes, filters: ctx.filters });
}
