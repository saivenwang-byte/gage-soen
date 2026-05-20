const API = import.meta.env.VITE_API_BASE || '';

export async function getScenes() {
  const r = await fetch(`${API}/api/meta/scenes`);
  return r.json();
}

export async function getTowns() {
  const r = await fetch(`${API}/api/meta/towns`);
  return r.json();
}

export async function getMapCenter() {
  const r = await fetch(`${API}/api/meta/map-center`);
  return r.json();
}

export async function getSources() {
  const r = await fetch(`${API}/api/meta/sources`);
  return r.json();
}

export function startSearch(body) {
  return fetch(`${API}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

export function getSearchResult(jobId) {
  return fetch(`${API}/api/search/${jobId}`).then((r) => r.json());
}

export function connectProgress(jobId, onMessage) {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const host = import.meta.env.VITE_WS_HOST || location.host;
  const ws = new WebSocket(`${proto}://${host}/ws?jobId=${jobId}`);
  ws.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data));
    } catch (_) {}
  };
  return ws;
}
