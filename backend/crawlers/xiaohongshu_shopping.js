/**
 * 小红书 — 奉贤探店笔记
 * 仅供学习研究，请遵守平台 robots.txt 及用户协议
 */
import { runRealCrawl } from './base/playwrightCrawler.js';

export const name = 'xiaohongshu';
export const label = '小红书';
export const types = ['social'];
export const scenes = ['*'];

export async function crawl(ctx) {
  const items = await runRealCrawl({ platform: name, label, scenes: ctx.scenes, filters: ctx.filters });
  return items.map((x) => ({
    ...x,
    bloggers: x.bloggers?.length
      ? x.bloggers
      : [{ platform: 'xiaohongshu', nickname: '笔记作者', summary: x.promoText || x.merchantName, likes: 0 }],
  }));
}
