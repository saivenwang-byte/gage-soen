import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const cred = execSync('git credential fill', {
  input: 'protocol=https\nhost=github.com\n\n',
  encoding: 'utf8',
});
const token = cred.match(/^password=(.+)$/m)?.[1]?.trim();
if (!token) throw new Error('no github token');

const owner = 'saivenwang-byte';
const repo = 'gage-soen';
const base = `https://api.github.com/repos/${owner}/${repo}`;
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'jiegasuan-deploy',
  'Content-Type': 'application/json',
};

async function gh(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { ...headers, ...opts.headers } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${url}\n${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

const remoteSha = (await gh(`${base}/git/ref/heads/main`)).object.sha;
const localSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
if (remoteSha === localSha) {
  console.log('already synced');
  process.exit(0);
}

console.log(`push ${remoteSha.slice(0, 7)} -> ${localSha.slice(0, 7)}`);
const baseCommit = await gh(`${base}/git/commits/${remoteSha}`);
const changed = execSync(`git diff --name-only ${remoteSha} HEAD`, { encoding: 'utf8' })
  .trim()
  .split(/\r?\n/)
  .filter(Boolean);

const tree = [];
for (const rel of changed) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full).toString('base64');
  const blob = await gh(`${base}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({ content, encoding: 'base64' }),
  });
  tree.push({ path: rel.replace(/\\/g, '/'), mode: '100644', type: 'blob', sha: blob.sha });
  console.log('blob', rel);
}

const newTree = await gh(`${base}/git/trees`, {
  method: 'POST',
  body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree }),
});
const message = execSync(`git log -1 --format=%B ${localSha}`, { encoding: 'utf8' }).trim();
const newCommit = await gh(`${base}/git/commits`, {
  method: 'POST',
  body: JSON.stringify({ message, tree: newTree.sha, parents: [remoteSha] }),
});
await gh(`${base}/git/refs/heads/main`, {
  method: 'PATCH',
  body: JSON.stringify({ sha: newCommit.sha, force: false }),
});
console.log('done', newCommit.sha);
