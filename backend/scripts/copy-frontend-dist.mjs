import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '../../frontend/dist');
const dest = path.resolve(__dirname, '../public');

if (!fs.existsSync(path.join(src, 'index.html'))) {
  console.error('缺少 frontend/dist，请先: cd frontend && npm run build');
  process.exit(1);
}

function copyNode() {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
}

function copyPowerShell() {
  const ps = [
    `$src='${src.replace(/'/g, "''")}'`,
    `$dst='${dest.replace(/'/g, "''")}'`,
    'if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }',
    'Copy-Item -Path (Join-Path $src "*") -Destination $dst -Recurse -Force',
  ].join('; ');
  const r = spawnSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
}

try {
  copyNode();
} catch {
  console.warn('Node fs.cp 失败，改用 PowerShell 复制…');
  copyPowerShell();
}

if (!fs.existsSync(path.join(dest, 'index.html'))) {
  console.error('复制后仍缺少 backend/public/index.html');
  process.exit(1);
}
console.log('已复制 frontend/dist -> backend/public');
