/**
 * Fix Render build (npm install only) + deploy + wait for health
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'deploy.config.json'), 'utf8'));
const SERVICE_ID = 'srv-d86nfrjbc2fs73b64fn0';
const healthUrl = `${cfg.productionUrl.replace(/\/$/, '')}/api/health`;

const key = (() => {
  if (process.env.RENDER_API_KEY) return process.env.RENDER_API_KEY;
  const yaml = fs.readFileSync(path.join(process.env.USERPROFILE, '.render', 'cli.yaml'), 'utf8');
  return yaml.match(/key:\s*(rnd_\S+)/)[1];
})();

async function api(pathname, opts = {}) {
  const res = await fetch(`https://api.render.com/v1${pathname}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${pathname}\n${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

console.log('1) Patch service build -> npm install only');
await api(`/services/${SERVICE_ID}`, {
  method: 'PATCH',
  body: {
    rootDir: 'backend',
    serviceDetails: {
      healthCheckPath: '/api/health',
      envSpecificDetails: {
        buildCommand: 'PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install',
        startCommand: 'npm start',
      },
    },
  },
});

console.log('2) Trigger deploy');
const dep = await api(`/services/${SERVICE_ID}/deploys`, {
  method: 'POST',
  body: { clearCache: 'clear' },
});
console.log('   deploy id:', dep.id);

console.log('3) Wait for health (up to 10 min)...');
const deadline = Date.now() + 10 * 60 * 1000;
while (Date.now() < deadline) {
  const list = await api(`/services/${SERVICE_ID}/deploys?limit=1`);
  const st = (list[0]?.deploy || list[0])?.status;
  process.stdout.write(`   deploy=${st} `);
  try {
    const r = await fetch(healthUrl, { signal: AbortSignal.timeout(45000) });
    const j = await r.json();
    if (r.ok && j.ok) {
      console.log('\nSUCCESS');
      console.log('URL:', cfg.productionUrl);
      console.log('HEALTH:', healthUrl);
      process.exit(0);
    }
  } catch {
    process.stdout.write('health=wait ');
  }
  console.log('');
  if (st === 'build_failed' || st === 'update_failed') {
    console.error('Deploy failed on Render. Open Logs in dashboard.');
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 20000));
}
console.error('Timeout waiting for health');
process.exit(1);
