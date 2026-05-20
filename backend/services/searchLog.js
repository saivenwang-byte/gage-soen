/**
 * MVP 搜索埋点：追加写入 data/search.log.jsonl
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const LOG_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/search.log.jsonl');

/**
 * @param {object} params
 */
export function logSearch(params = {}) {
  const entry = {
    keyword: params.keyword || '',
    scene: params.scene || params.scenes?.[0] || 'all',
    subCategory: params.subCategory || '',
    distance: params.distance ?? 15,
    people: params.people ?? params.headcount ?? 2,
    budget: params.budget || '',
    mode: params.mode || 'value',
    device_id: params.device_id || 'unknown',
    lat: params.lat ?? params.mapCenter?.lat ?? null,
    lng: params.lng ?? params.mapCenter?.lng ?? null,
    timestamp: new Date().toISOString(),
    result_count: params.result_count ?? 0,
    source: params.source || 'local',
  };

  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, `${JSON.stringify(entry)}\n`, 'utf8');
  } catch (e) {
    console.warn('[searchLog]', e.message);
  }

  return entry;
}
