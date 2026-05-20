/**
 * 平台爬虫工厂：统一接口，便于接入美团/盒马/携程等
 * 仅供家庭成员学习研究使用，请遵守各平台协议与 robots.txt
 */
import { fetchWithPolicy } from '../utils/httpClient.js';
import { generateLiveItems } from './liveGenerator.js';

export function createPlatformCrawler({ name, label, scenes, sceneMap = null }) {
  return {
    name,
    label,
    enabled: process.env[`CRAWL_${name.toUpperCase()}`] !== '0',
    types: ['platform'],
    scenes,
    async crawl(ctx) {
      const targetScenes = ctx.scenes.includes('all')
        ? scenes.filter((s) => s !== 'all')
        : ctx.scenes.filter((s) => scenes.includes(s) || scenes.includes('all'));
      const all = [];
      for (const scene of targetScenes) {
        const mapped = sceneMap?.[scene] || scene;
        const rows = await fetchWithPolicy(name, async () =>
          generateLiveItems({
            platform: name,
            scene: mapped,
            filters: ctx.filters,
            count: 3,
          })
        );
        all.push(...rows);
      }
      return all;
    },
  };
}
