/**
 * Cookie 本地持久化：data/cookies/<platform>.json
 * 首次运行 scripts/save-cookies.js 手动登录保存
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const COOKIE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../data/cookies');

export function cookiePath(platform) {
  return path.join(COOKIE_DIR, `${platform}.json`);
}

export function loadCookies(platform) {
  const file = cookiePath(platform);
  if (!fs.existsSync(file)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const savedAt = data.savedAt ? new Date(data.savedAt) : null;
    const ageDays = savedAt ? (Date.now() - savedAt.getTime()) / 86400000 : 999;
    return { cookies: data.cookies || data, savedAt, ageDays, stale: ageDays > 7 };
  } catch {
    return null;
  }
}

export function saveCookies(platform, cookies) {
  fs.mkdirSync(COOKIE_DIR, { recursive: true });
  fs.writeFileSync(
    cookiePath(platform),
    JSON.stringify({ savedAt: new Date().toISOString(), cookies }, null, 2)
  );
}

export function requireCookies(platform) {
  const pack = loadCookies(platform);
  if (!pack?.cookies?.length) {
    throw new Error(
      `【介嘎算】${platform} 未配置 Cookie。请运行: npm run login -- ${platform}`
    );
  }
  if (pack.stale) {
    console.warn(`[${platform}] Cookie 已超过 7 天，建议重新登录`);
  }
  return pack.cookies;
}
