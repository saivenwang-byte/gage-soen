/**
 * 许愿瓶：用户未满足需求 + 他人助力（MVP JSON 内存，重启清空；可换文件持久化）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WISH_PATH = path.join(__dirname, '../data/wishes.json');

let cache = null;

function load() {
  if (cache) return cache;
  if (!fs.existsSync(WISH_PATH)) {
    cache = [];
    return cache;
  }
  try {
    cache = JSON.parse(fs.readFileSync(WISH_PATH, 'utf8'));
  } catch {
    cache = [];
  }
  return cache;
}

function save(list) {
  cache = list;
  fs.mkdirSync(path.dirname(WISH_PATH), { recursive: true });
  fs.writeFileSync(WISH_PATH, JSON.stringify(list, null, 2), 'utf8');
}

export function addWish(entry) {
  const list = load();
  const row = {
    id: `wish-${Date.now()}`,
    text: (entry.text || '').trim(),
    scene: entry.scene || 'all',
    nickname: entry.nickname || '匿名街坊',
    supports: 0,
    createdAt: new Date().toISOString(),
  };
  if (!row.text) throw new Error('请写清楚你想找啥');
  list.unshift(row);
  save(list.slice(0, 200));
  return row;
}

export function listWishes(limit = 50) {
  return load().slice(0, limit);
}

export function supportWish(id) {
  const list = load();
  const row = list.find((w) => w.id === id);
  if (!row) return null;
  row.supports += 1;
  save(list);
  return row;
}
