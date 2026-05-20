/**
 * HTTP 请求工具：随机 UA、延迟、预留代理
 * 仅供学习研究，请遵守 robots.txt 与各平台用户协议
 */
import { config } from '../config.js';

export function randomUA() {
  const list = config.userAgents;
  return list[Math.floor(Math.random() * list.length)];
}

export function randomDelay() {
  const { min, max } = config.crawlerDelayMs;
  const ms = min + Math.random() * (max - min);
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 模拟实时网络请求（演示用）
 * 生产环境：替换为 fetch/Playwright 访问真实 URL
 */
export async function fetchWithPolicy(label, fn, { timeoutMs = 15000 } = {}) {
  await randomDelay();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fn({ signal: controller.signal, headers: { 'User-Agent': randomUA() } });
  } catch (e) {
    e.source = label;
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
