/**
 * 爬虫接入测试脚本
 * 验证大众点评、小红书等数据源能否返回真实数据（非 fallback）
 *
 * 用法：
 *   node test-crawlers.js              # 测试默认爬虫
 *   node test-crawlers.js dianping     # 只测大众点评
 *   node test-crawlers.js xiaohongshu  # 只测小红书
 *   node test-crawlers.js all          # 显式测全部默认项
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dianpingCrawler from './crawlers/dianping_dining.js';
import * as xiaohongshuCrawler from './crawlers/xiaohongshu_shopping.js';
import { loadCookies, cookiePath } from './crawlers/antibot/cookieStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEST_PARAMS = {
  lat: 30.918,
  lng: 121.474,
  distance: 15,
};

const TEST_SCENES = [
  { scene: 'coffee', keyword: '咖啡', crawler: 'dianping' },
  { scene: 'stay', keyword: '民宿', crawler: 'xiaohongshu' },
  { scene: 'dining', keyword: '餐厅', crawler: 'dianping' },
];

const CRAWLER_MAP = {
  dianping: { module: dianpingCrawler, label: '大众点评', defaultScene: TEST_SCENES[0] },
  xiaohongshu: { module: xiaohongshuCrawler, label: '小红书', defaultScene: TEST_SCENES[1] },
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(level, msg) {
  const prefix = {
    info: `${colors.cyan}[INFO]${colors.reset}`,
    ok: `${colors.green}[OK]${colors.reset}`,
    warn: `${colors.yellow}[WARN]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
    title: `${colors.bold}${colors.cyan}`,
  };
  if (level === 'title') {
    console.log(`${prefix.title}${msg}${colors.reset}`);
    return;
  }
  console.log(`${prefix[level] || ''} ${msg}`);
}

function isFallbackRow(row) {
  if (row.dataMode === 'fallback') return true;
  if (row.dataMode === 'real') return false;
  const src = String(row.source || row.platform || '').toLowerCase();
  if (src.includes('mock')) return true;
  if (row.sourceUrl?.includes('.example.com')) return true;
  return false;
}

function buildCtx(scene) {
  return {
    scenes: [scene.scene],
    filters: {
      town: 'all',
      headcount: 2,
      sourcePref: 'all',
      mapCenter: { lat: TEST_PARAMS.lat, lng: TEST_PARAMS.lng, name: '奉贤南桥' },
      keyword: scene.keyword,
    },
  };
}

function normalizeRow(row) {
  return {
    title: row.title || row.merchantName,
    address: row.address,
    discountPrice: row.discountPrice ?? row.price ?? row.perCapita,
    originalPrice: row.originalPrice ?? row.orig,
    discountText: row.discountText || row.promoText,
    influencerName: row.influencerName || row.bloggers?.[0]?.nickname,
    likes: row.likes ?? row.bloggers?.[0]?.likes,
    dataMode: row.dataMode,
    platform: row.platform || row.source,
  };
}

async function testCrawler(key, entry, scene) {
  const { module, label } = entry;
  log('title', `\n━━━ 测试 ${label} · ${scene.keyword} (${scene.scene}) ━━━`);

  const startTime = Date.now();

  try {
    const results = await module.crawl(buildCtx(scene));
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!results?.length) {
      log('warn', `未获取到结果 (耗时 ${elapsed}s)`);
      return { name: label, key, scene: scene.scene, success: false, count: 0, realCount: 0, elapsed, isMock: true };
    }

    const fallbackCount = results.filter(isFallbackRow).length;
    const realCount = results.length - fallbackCount;

    if (realCount > 0) {
      log('ok', `获取到 ${results.length} 条，真实数据 ${realCount} 条，回退 ${fallbackCount} 条 (耗时 ${elapsed}s)`);
      const realResult = results.find((r) => !isFallbackRow(r));
      if (realResult) {
        const n = normalizeRow(realResult);
        console.log(`  标题: ${n.title}`);
        console.log(`  地址: ${n.address || '无'}`);
        console.log(`  价格: ${n.discountPrice ?? n.originalPrice ?? '无'}`);
        console.log(`  优惠: ${n.discountText || '无'}`);
        console.log(`  模式: ${n.dataMode || 'unknown'}`);
        if (n.influencerName) {
          console.log(`  博主: ${n.influencerName}`);
          console.log(`  互动: ${n.likes || 0} 赞`);
        }
      }
      return {
        name: label,
        key,
        scene: scene.scene,
        success: true,
        count: results.length,
        realCount,
        mockCount: fallbackCount,
        elapsed,
        isMock: fallbackCount === results.length,
      };
    }

    log('warn', `获取到 ${results.length} 条，全部为回退/Mock 数据 (耗时 ${elapsed}s)`);
    log('warn', '请配置 Cookie：npm run login -- ' + key);
    const sample = normalizeRow(results[0]);
    console.log(`  示例: ${sample.title} [${sample.dataMode}]`);
    return {
      name: label,
      key,
      scene: scene.scene,
      success: false,
      count: results.length,
      realCount: 0,
      mockCount: results.length,
      elapsed,
      isMock: true,
    };
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log('error', `爬取失败 (耗时 ${elapsed}s): ${error.message}`);
    return {
      name: label,
      key,
      scene: scene.scene,
      success: false,
      count: 0,
      realCount: 0,
      elapsed,
      isMock: true,
      error: error.message,
    };
  }
}

function checkEnv() {
  log('info', '检查环境配置...');

  const dpFile = cookiePath('dianping');
  const xhsFile = cookiePath('xiaohongshu');
  const dpPack = loadCookies('dianping');
  const xhsPack = loadCookies('xiaohongshu');

  if (process.env.DP_COOKIE) {
    log('ok', '环境变量 DP_COOKIE 已设置');
  } else if (dpPack?.cookies?.length) {
    log('ok', `大众点评 Cookie 文件: ${dpFile}${dpPack.stale ? ' (建议更新)' : ''}`);
  } else {
    log('warn', '大众点评 Cookie 未配置 → npm run login -- dianping');
  }

  if (process.env.XHS_COOKIE) {
    log('ok', '环境变量 XHS_COOKIE 已设置');
  } else if (xhsPack?.cookies?.length) {
    log('ok', `小红书 Cookie 文件: ${xhsFile}${xhsPack.stale ? ' (建议更新)' : ''}`);
  } else {
    log('warn', '小红书 Cookie 未配置 → npm run login -- xiaohongshu');
  }

  if (process.env.DEMO_FALLBACK === '0') {
    log('ok', 'DEMO_FALLBACK=0（禁用回退，仅真实爬取）');
  } else {
    log('warn', 'DEMO_FALLBACK 未关闭，无 Cookie 时会自动回退数据');
  }

  if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
    log('ok', `代理: ${process.env.HTTP_PROXY || process.env.HTTPS_PROXY}`);
  } else {
    log('warn', '未配置 HTTP_PROXY / HTTPS_PROXY，直连可能触发反爬');
  }

  if (!fs.existsSync(path.join(__dirname, 'data/cookies'))) {
    log('info', '提示: 首次使用请 mkdir data/cookies 或通过 npm run login 自动创建');
  }
}

async function main() {
  const target = (process.argv[2] || 'default').toLowerCase();

  log('title', '\n╔══════════════════════════════════╗');
  log('title', '║   🦆 介嘎算 爬虫接入测试         ║');
  log('title', '╚══════════════════════════════════╝\n');

  checkEnv();

  const keys =
    target === 'default' || target === 'all'
      ? ['dianping', 'xiaohongshu']
      : [target];

  const testTasks = [];
  for (const key of keys) {
    const entry = CRAWLER_MAP[key];
    if (!entry) {
      log('error', `未知目标: ${key}（可用: dianping | xiaohongshu | all）`);
      process.exit(1);
    }
    const scene =
      TEST_SCENES.find((s) => s.crawler === key) || entry.defaultScene;
    testTasks.push({ key, entry, scene });
  }

  const results = [];
  for (let i = 0; i < testTasks.length; i++) {
    const { key, entry, scene } = testTasks[i];
    results.push(await testCrawler(key, entry, scene));
    if (i < testTasks.length - 1) {
      log('info', '等待 3 秒后继续（避免并发触发反爬）…');
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  log('title', '\n━━━ 测试报告 ━━━');
  const totalTests = results.length;
  const successTests = results.filter((r) => r.success).length;
  const realDataTests = results.filter((r) => r.realCount > 0).length;
  const mockOnlyTests = results.filter((r) => r.isMock).length;

  console.log(`  测试项数: ${totalTests}`);
  console.log(`  成功获取: ${successTests}`);
  console.log(`  含真实数据: ${realDataTests}`);
  console.log(`  仅回退数据: ${mockOnlyTests}`);

  if (realDataTests === 0) {
    log('warn', '\n⚠️  未检测到真实爬取数据（均为 fallback 或为空）');
    log('info', '排查步骤：');
    log('info', '1. npm run login -- dianping / xiaohongshu');
    log('info', '2. 配置 PROXY_LIST 或 HTTP_PROXY');
    log('info', '3. 手动访问目标站确认网络可达');
    log('info', '4. 真实通过后设 DEMO_FALLBACK=0 并见 docs/DATA-SOURCE-TEST.md');
  } else if (realDataTests < totalTests) {
    log('warn', '\n⚠️  部分数据源仍为回退，请检查对应 Cookie');
  } else {
    log('ok', '\n✅ 测试通过：已获取真实数据');
  }

  log('title', '\n下一步：');
  if (realDataTests > 0) {
    log('info', '→ 可选：DEMO_FALLBACK=0 关闭回退（见 docs/DATA-SOURCE-TEST.md）');
    log('info', '→ npm start');
    log('info', '→ cd frontend && npm run dev');
  } else {
    log('info', '→ 配置 Cookie 后重新 npm test');
    log('info', '→ 或继续用回退模式验证前端 UI');
  }

  log('title', '\n测试完成。🦆\n');
  process.exit(realDataTests > 0 ? 0 : 1);
}

main().catch((err) => {
  log('error', `测试异常: ${err.message}`);
  process.exit(1);
});
