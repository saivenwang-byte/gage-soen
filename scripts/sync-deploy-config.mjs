/**
 * 从 deploy.config.json 同步到小程序 share.config、转发说明等
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'deploy.config.json'), 'utf8'));
const url = (cfg.productionUrl || '').replace(/\/$/, '');
if (!url.startsWith('https://')) {
  console.error('deploy.config.json productionUrl must be https://...');
  process.exit(1);
}

const shareJs = `/** Auto-synced from deploy.config.json — do not hand-edit */\nmodule.exports = { h5Url: '${url}' };\n`;
fs.writeFileSync(path.join(root, 'legacy-miniprogram', 'share.config.js'), shareJs);

fs.writeFileSync(
  path.join(root, 'PUBLIC-SHARE-URL.txt'),
  `${url}/\n`,
  'utf8'
);

fs.writeFileSync(
  path.join(root, 'ONLINE-URL.txt'),
  [
    '# 介嘎算 — 线上正式地址（Render，无需本机隧道）',
    '',
    `${url}/`,
    '',
    `健康检查: ${url}/api/health`,
    '',
    '小程序 web-view 与微信分享请用此域名（须在公众平台配置业务域名）。',
  ].join('\n'),
  'utf8'
);

console.log('Synced production URL:', url);
