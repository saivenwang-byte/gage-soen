/**
 * 验证码处理：截图保存 + 预留打码平台
 * CAPTCHA_API_URL / CAPTCHA_API_KEY
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CAPTCHA_DIR = path.join(__dirname, '../../data/captchas');

export async function detectAndHandle(page, platform) {
  const selectors = [
    '[class*="captcha"]',
    '[id*="captcha"]',
    'text=滑动验证',
    'text=请完成验证',
    '.geetest_panel',
  ];
  for (const sel of selectors) {
    const el = await page.$(sel).catch(() => null);
    if (!el) continue;
    fs.mkdirSync(CAPTCHA_DIR, { recursive: true });
    const file = path.join(CAPTCHA_DIR, `${platform}-${Date.now()}.png`);
    await page.screenshot({ path: file, fullPage: true });
    if (config.captchaApiUrl) {
      return await callThirdPartyCaptcha(file);
    }
    return {
      needsHuman: true,
      screenshot: file,
      message: `检测到验证码，已截图：${file}，请人工处理后更新 Cookie`,
    };
  }
  return null;
}

async function callThirdPartyCaptcha(imagePath) {
  // 预留：上传图片到打码平台
  const buf = fs.readFileSync(imagePath);
  const body = new FormData();
  body.append('image', new Blob([buf]), 'captcha.png');
  const res = await fetch(config.captchaApiUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.captchaApiKey}` },
    body,
  });
  if (!res.ok) throw new Error('打码平台请求失败');
  return res.json();
}
