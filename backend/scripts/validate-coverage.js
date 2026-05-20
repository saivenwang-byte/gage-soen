/**
 * 校验每个场景子分类在精选池里至少有一条可匹配数据（15km 内南桥中心）
 * 用法：node scripts/validate-coverage.js
 */
import { SCENE_TAXONOMY } from '../data/sceneTaxonomy.js';
import { queryCuratedDeals, reloadSeed } from '../services/dealsStore.js';

const CENTER = { lat: 30.918, lng: 121.474, name: '南桥' };
const MAX_KM = 15;

reloadSeed();

const gaps = [];

for (const [sceneKey, scene] of Object.entries(SCENE_TAXONOMY)) {
  if (sceneKey === 'all') continue;
  for (const sub of scene.subcategories) {
    if (sub.key === 'all') continue;
    const rows = queryCuratedDeals({
      scenes: [sceneKey],
      subCategory: sub.key,
      maxDistanceKm: MAX_KM,
      center: CENTER,
    });
    if (!rows.length) {
      gaps.push(`${sceneKey}/${sub.key}（${sub.label}）`);
    }
  }
}

if (gaps.length) {
  console.error('以下子分类在 15km 内无精选数据：');
  gaps.forEach((g) => console.error('  -', g));
  process.exit(1);
}

console.log('✓ 全部场景子分类均有可展示数据');
