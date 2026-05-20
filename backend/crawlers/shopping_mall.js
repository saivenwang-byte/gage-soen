/**
 * 商场活动页
 * 仅供学习研究，请遵守平台 robots.txt 及用户协议
 */
import { loadCookies } from './antibot/cookieStore.js';
import { crawlWithBrowser } from './antibot/browserPool.js';
import { generateLiveItems } from './liveGenerator.js';

export const name = 'mall';
export const label = '商场活动';
export const types = ['platform'];
export const scenes = ['shopping', 'all'];

const MALL_URLS = {
  宝龙: process.env.MALL_BAOLONG_URL || '',
  百联: process.env.MALL_BAILIAN_URL || '',
};

export async function crawl(ctx) {
  const hasUrl = Object.values(MALL_URLS).some(Boolean);
  if (!hasUrl) {
    return generateLiveItems({ platform: 'mall', scene: 'shopping', filters: ctx.filters, count: 3 });
  }

  const cookiePack = loadCookies('mall') || loadCookies('dianping');
  const cookies = cookiePack?.cookies;
  if (!cookies?.length) {
    return generateLiveItems({ platform: 'mall', scene: 'shopping', filters: ctx.filters, count: 3 });
  }

  const all = [];
  for (const [mall, url] of Object.entries(MALL_URLS)) {
    if (!url) continue;
    if (ctx.filters.mallName && !mall.includes(ctx.filters.mallName)) continue;
    try {
      const rows = await crawlWithBrowser('mall', url, {
        cookies,
        parse: async ({ html }) => {
          const prices = [...html.matchAll(/(?:¥|￥)\s*(\d+(?:\.\d+)?)/g)].map((m) => +m[1]);
          if (!prices.length) return [];
          return [
            {
              merchantName: `奉贤${mall}广场活动`,
              platform: 'mall',
              scene: 'shopping',
              price: prices[0],
              promoText: html.slice(0, 300).replace(/<[^>]+>/g, ' ').trim(),
              address: '上海市奉贤区',
              bloggers: [],
              dataMode: 'real',
            },
          ];
        },
      });
      all.push(...rows);
    } catch {
      all.push(...generateLiveItems({ platform: 'mall', scene: 'shopping', filters: ctx.filters, count: 1 }));
    }
  }
  return all.length ? all : generateLiveItems({ platform: 'mall', scene: 'shopping', filters: ctx.filters, count: 3 });
}
