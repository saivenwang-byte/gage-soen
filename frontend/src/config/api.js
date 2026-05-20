/**
 * 统一 API 根路径（本地 /api 走 Vite 代理；线上 VITE_API_BASE=https://xxx.onrender.com/api）
 */
export const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');

/** @param {string} path 如 /deals、/confirm、/meta/scenes（不要重复写 /api 前缀） */
export function apiUrl(path) {
  if (!path) return API_BASE;
  let p = path.startsWith('/') ? path : `/${path}`;
  if (p.startsWith('/api/')) p = p.slice(4);
  else if (p === '/api') p = '';
  return `${API_BASE}${p}`;
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || json.error || `API ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export function wsUrl(jobId) {
  const base = import.meta.env.VITE_API_BASE;
  if (base) {
    const u = new URL(base.endsWith('/api') ? base.replace(/\/api$/, '') : base);
    const proto = u.protocol === 'https:' ? 'wss' : 'ws';
    return `${proto}://${u.host}/ws?jobId=${encodeURIComponent(jobId)}`;
  }
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/ws?jobId=${encodeURIComponent(jobId)}`;
}
