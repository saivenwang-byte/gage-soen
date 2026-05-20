import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '../../frontend/dist');
const dest = path.resolve(__dirname, '../public');

if (!fs.existsSync(src)) {
  console.error('缺少 frontend/dist，请先在前端目录执行 npm run build');
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log('已复制 frontend/dist -> backend/public');
