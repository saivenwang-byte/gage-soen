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

try {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
} catch (e) {
  console.error('Node 复制失败，请手动: Copy-Item frontend\\dist backend\\public -Recurse');
  process.exit(1);
}
console.log('已复制 frontend/dist -> backend/public');
