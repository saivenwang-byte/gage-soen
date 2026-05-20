/**
 * 请求层：完整浏览器请求头 + 随机 UA
 * 仅供学习研究，请遵守平台 robots.txt 及用户协议
 */
import { config } from '../../config.js';
import { throttle, withDomainLock } from './rateLimiter.js';
import { getNextProxy } from './proxyRotator.js';

export function pickUA(mobile = false) {
  const list = mobile ? config.userAgentsMobile : config.userAgentsDesktop;
  return list[Math.floor(Math.random() * list.length)];
}

export function buildHeaders({ mobile, referer, cookie } = {}) {
  const ua = pickUA(mobile);
  return {
    'User-Agent': ua,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    Referer: referer || 'https://www.google.com/',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Ch-Ua-Mobile': mobile ? '?1' : '?0',
    ...(cookie ? { Cookie: cookie } : {}),
  };
}

export async function fetchPage(url, opts = {}) {
  const domain = new URL(url).hostname;
  return withDomainLock(domain, async () => {
    const proxy = await getNextProxy();
    const headers = buildHeaders(opts);
    const cookieStr = opts.cookies
      ?.map((c) => `${c.name}=${c.value}`)
      .join('; ');
    if (cookieStr) headers.Cookie = cookieStr;

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(opts.timeoutMs || 20000),
      // Node fetch 代理需 undici ProxyAgent；Playwright 场景用 browserPool
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
    return res.text();
  });
}
