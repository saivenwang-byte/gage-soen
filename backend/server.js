/**
 * 介嘎算 — 奉贤生活优惠实时比价 API
 * 奉贤生活，样样介嘎算。
 */
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config.js';
import { BAY_RESORT_CENTER } from './utils/geo.js';
import { listSources } from './crawlers/index.js';
import * as jobStore from './services/jobStore.js';
import { runSearch } from './services/searchOrchestrator.js';
import * as ugcStore from './services/ugcStore.js';
import bottleRouter from './routes/bottle.js';
import dealsRouter from './routes/deals.js';
import ugcRouter from './routes/ugc.js';
import wishRouter from './routes/wish.js';
import confirmRouter from './routes/confirm.js';
import navigateRouter from './routes/navigate.js';
import { logSearch } from './services/searchLog.js';
import { reloadSeed } from './services/dealsStore.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

reloadSeed();

const __dirnameServer = path.dirname(fileURLToPath(import.meta.url));
function readAppVersion() {
  try {
    return fs.readFileSync(path.join(__dirnameServer, '../VERSION'), 'utf8').trim();
  } catch {
    return '0.3.0';
  }
}
const APP_VERSION = readAppVersion();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

const wsClients = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const jobId = url.searchParams.get('jobId');
  if (jobId) {
    if (!wsClients.has(jobId)) wsClients.set(jobId, new Set());
    wsClients.get(jobId).add(ws);
  }
  ws.on('close', () => {
    if (jobId && wsClients.has(jobId)) wsClients.get(jobId).delete(ws);
  });
});

function broadcast(jobId, data) {
  const set = wsClients.get(jobId);
  if (!set) return;
  const msg = JSON.stringify(data);
  for (const ws of set) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

const healthPayload = () => ({
  ok: true,
  status: 'ok',
  name: '介嘎算 ga-ge-soen',
  version: APP_VERSION,
  brand: config.brand,
  slogan: config.slogan,
  region: '奉贤区',
});

app.get('/health', (_, res) => res.json(healthPayload()));
app.get('/api/health', (_, res) => res.json(healthPayload()));

app.get('/api/meta/scenes', (_, res) => {
  res.json([
    { id: 'coffee', name: '餐饮咖啡', icon: '☕' },
    { id: 'pet', name: '宠物服务', icon: '🐱' },
    { id: 'expiring', name: '临期折扣', icon: '⏳' },
    { id: 'stay', name: '民宿住宿', icon: '🏠' },
    { id: 'entertainment', name: '社交娱乐', icon: '🎯' },
    { id: 'life', name: '运动生活', icon: '🏸' },
  ]);
});

app.get('/api/meta/map-center', (_, res) => {
  res.json(BAY_RESORT_CENTER);
});

app.get('/api/meta/sources', (_, res) => {
  res.json({ sources: listSources(), note: '家庭自用，请配置 ENABLED_SOURCES 与 Cookie' });
});

app.get('/api/meta/towns', (_, res) => {
  res.json([
    { id: 'all', name: '奉贤全区' },
    { id: '南桥镇', name: '南桥镇' },
    { id: '海湾镇', name: '海湾镇' },
    { id: '奉城镇', name: '奉城镇' },
    { id: '庄行镇', name: '庄行镇' },
    { id: '四团镇', name: '四团镇' },
    { id: '柘林镇', name: '柘林镇' },
  ]);
});

app.use('/api/deals', dealsRouter);
app.use('/api/bottle', bottleRouter);
app.use('/api/ugc', ugcRouter);
app.use('/api/wish', wishRouter);
app.use('/api/confirm', confirmRouter);
app.use('/api/navigate', navigateRouter);

/** 发起搜索（默认精选数据；DATA_SOURCE=crawl 时走爬虫） */
app.post('/api/search', (req, res) => {
  const jobId = uuidv4();
  jobStore.createJob(jobId, req.body);
  logSearch({
    keyword: req.body.keyword,
    subCategory: req.body.subCategory,
    scene: req.body.scenes?.[0],
    distance: req.body.distance,
    lat: req.body.mapCenter?.lat,
    lng: req.body.mapCenter?.lng,
    headcount: req.body.headcount,
    source: 'api/search',
  });
  res.json({ jobId, wsUrl: `/ws?jobId=${jobId}` });

  runSearch(jobId, req.body, (ev) => broadcast(jobId, ev)).catch((e) => {
    jobStore.updateJob(jobId, { status: 'failed', message: e.message });
    broadcast(jobId, { jobId, status: 'failed', message: e.message });
  });
});

/** 轮询任务状态与结果 */
app.get('/api/search/:jobId', (req, res) => {
  const job = jobStore.getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: '任务不存在' });
  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    message: job.message,
    warnings: job.warnings,
    errors: job.errors,
    count: job.results.length,
    results: job.results,
    mapCenter: job.mapCenter || BAY_RESORT_CENTER,
    elapsedMs: (job.finishedAt || Date.now()) - job.startedAt,
  });
});

/** 订阅提醒 - 预留 */
app.post('/api/subscribe', (req, res) => {
  res.json({ ok: true, message: '订阅功能预留', payload: req.body });
});

/** 兼容旧路径 */
app.post('/api/ugc/report', (req, res) => {
  const row = ugcStore.addUgc(req.body);
  res.json({ ok: true, success: true, message: '已收录，下次搜索会并入结果', item: row });
});

httpServer.listen(config.port, '0.0.0.0', () => {
  console.log(`介嘎算 API http://0.0.0.0:${config.port} — ${config.slogan}`);
  console.log(`WebSocket ws://localhost:${config.port}/ws?jobId=<id>`);
});
