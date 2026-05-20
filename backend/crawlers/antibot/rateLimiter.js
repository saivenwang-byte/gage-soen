/** 域名级并发 ≤2，请求间隔 2~8 秒 */
const domainQueues = new Map();
const domainLast = new Map();

export async function throttle(domain, { minMs = 2000, maxMs = 8000 } = {}) {
  const wait = minMs + Math.random() * (maxMs - minMs);
  const last = domainLast.get(domain) || 0;
  const now = Date.now();
  const gap = last + wait - now;
  if (gap > 0) await new Promise((r) => setTimeout(r, gap));
  domainLast.set(domain, Date.now());
}

export async function withDomainLock(domain, fn) {
  if (!domainQueues.has(domain)) domainQueues.set(domain, { running: 0, queue: [] });
  const state = domainQueues.get(domain);
  return new Promise((resolve, reject) => {
    const run = async () => {
      state.running++;
      try {
        await throttle(domain);
        resolve(await fn());
      } catch (e) {
        reject(e);
      } finally {
        state.running--;
        const next = state.queue.shift();
        if (next) next();
      }
    };
    if (state.running < 2) run();
    else state.queue.push(run);
  });
}
