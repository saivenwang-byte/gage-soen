/**
 * 代理池轮换 HTTP/HTTPS/SOCKS5
 * PROXY_LIST=http://user:pass@host:port,socks5://host:port
 * PROXY_POOL_URL= 可返回 JSON [{ server, username?, password? }]
 */
import { config } from '../../config.js';

let index = 0;

function parseList() {
  const list = [];
  if (config.proxyList?.length) list.push(...config.proxyList);
  return list;
}

export async function getNextProxy() {
  const staticList = parseList();
  if (staticList.length) {
    const p = staticList[index % staticList.length];
    index++;
    return p;
  }
  if (!config.proxyPoolUrl) return null;
  try {
    const res = await fetch(config.proxyPoolUrl);
    const data = await res.json();
    const arr = Array.isArray(data) ? data : data.proxies || [];
    if (!arr.length) return null;
    const item = arr[index % arr.length];
    index++;
    return item.server || item;
  } catch {
    return null;
  }
}

export function proxyForPlaywright(proxyUrl) {
  if (!proxyUrl) return undefined;
  try {
    const u = new URL(proxyUrl);
    return {
      server: `${u.protocol}//${u.host}`,
      username: u.username || undefined,
      password: u.password || undefined,
    };
  } catch {
    return { server: proxyUrl };
  }
}
