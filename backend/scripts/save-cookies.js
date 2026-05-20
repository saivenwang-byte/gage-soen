/**
 * 手动登录并保存 Cookie：npm run login -- dianping
 */
import readline from 'readline';
import { chromium } from 'playwright';
import { saveCookies } from '../crawlers/antibot/cookieStore.js';

const platform = process.argv[2] || 'dianping';
const urls = {
  dianping: 'https://www.dianping.com',
  meituan: 'https://www.meituan.com',
  xiaohongshu: 'https://www.xiaohongshu.com',
  douyin: 'https://www.douyin.com',
  bilibili: 'https://www.bilibili.com',
  hema: 'https://www.freshippo.com',
  ctrip: 'https://www.ctrip.com',
};

const url = urls[platform] || urls.dianping;
console.log(`【介嘎算】请在打开的浏览器中登录 ${platform}，完成后回到终端按回车…`);

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ locale: 'zh-CN' });
const page = await context.newPage();
await page.goto(url);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
await new Promise((r) => rl.question('登录完成后按回车保存 Cookie…', r));
rl.close();

const cookies = await context.cookies();
saveCookies(platform, cookies);
console.log(`已保存至 data/cookies/${platform}.json`);
await browser.close();
