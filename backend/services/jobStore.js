/** 内存任务队列（演示）；生产可换 Bull + Redis */
const jobs = new Map();

export function createJob(id, payload) {
  const job = {
    id,
    status: 'pending',
    progress: 0,
    message: '排队中',
    payload,
    results: [],
    errors: [],
    warnings: [],
    mapCenter: null,
    startedAt: Date.now(),
    finishedAt: null,
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id) {
  return jobs.get(id);
}

export function updateJob(id, patch) {
  const j = jobs.get(id);
  if (!j) return null;
  Object.assign(j, patch);
  return j;
}
