import { apiFetch, apiUrl, wsUrl } from '../config/api';

export async function getScenes() {
  return apiFetch('/meta/scenes');
}

export async function getTowns() {
  return apiFetch('/meta/towns');
}

export async function getMapCenter() {
  return apiFetch('/meta/map-center');
}

export async function getSources() {
  return apiFetch('/meta/sources');
}

export function startSearch(body) {
  return apiFetch('/search', { method: 'POST', body: JSON.stringify(body) });
}

export function getSearchResult(jobId) {
  return apiFetch(`/search/${jobId}`);
}

export function connectProgress(jobId, onMessage) {
  const ws = new WebSocket(wsUrl(jobId));
  ws.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data));
    } catch (_) {}
  };
  return ws;
}
