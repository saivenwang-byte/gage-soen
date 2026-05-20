/**
 * Playwright + stealth（失败时降级普通 Chromium）
 * 仅供学习研究，请遵守平台 robots.txt 及用户协议
 */
import { chromium as vanillaChromium } from 'playwright';
import { randomViewport, STEALTH_INIT_SCRIPT } from './stealth.js';
import { getNextProxy, proxyForPlaywright } from './proxyRotator.js';
import { detectAndHandle } from './captchaHandler.js';
import { withDomainLock } from './rateLimiter.js';

let browserInstance = null;
let useStealth = true;

async function launchBrowser() {
  const proxy = await getNextProxy();
  const opts = {
    headless: process.env.PLAYWRIGHT_HEADLESS !== '0',
    proxy: proxyForPlaywright(proxy),
  };
  if (useStealth) {
    try {
      const { chromium } = await import('playwright-extra');
      const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
      chromium.use(StealthPlugin());
      return chromium.launch(opts);
    } catch (e) {
      console.warn('[browser] stealth 启动失败，使用普通 Chromium:', e.message);
      useStealth = false;
    }
  }
  return vanillaChromium.launch(opts);
}

export async function getBrowser() {
  if (!browserInstance) browserInstance = await launchBrowser();
  return browserInstance;
}

export async function newStealthPage(platform, cookies = []) {
  const browser = await getBrowser();
  const viewport = randomViewport();
  const context = await browser.newContext({
    viewport,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  });
  if (cookies?.length) await context.addCookies(cookies);
  const page = await context.newPage();
  await page.addInitScript(STEALTH_INIT_SCRIPT);
  await page.waitForTimeout(200);
  return {
    page,
    context,
    async close() {
      await context.close();
    },
  };
}

export async function crawlWithBrowser(platform, url, { cookies, parse }) {
  const domain = new URL(url).hostname;
  return withDomainLock(domain, async () => {
    const { page, close } = await newStealthPage(platform, cookies);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      const captcha = await detectAndHandle(page, platform);
      if (captcha?.needsHuman) throw new Error(captcha.message);
      await page.waitForTimeout(800);
      const html = await page.content();
      return parse({ page, html });
    } finally {
      await close();
    }
  });
}

export async function shutdownBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
