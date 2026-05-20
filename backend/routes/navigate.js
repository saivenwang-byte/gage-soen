// backend/routes/navigate.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NAV_LOG = path.join(__dirname, '..', 'data', 'navigate.log.jsonl');

router.post('/', (req, res) => {
  const { deal_id, merchant_name, device_id, from_lat, from_lng, to_lat, to_lng, timestamp } =
    req.body;
  const entry = JSON.stringify({
    deal_id,
    merchant_name,
    device_id,
    from: { lat: from_lat, lng: from_lng },
    to: { lat: to_lat, lng: to_lng },
    timestamp: new Date(timestamp).toISOString(),
  });
  try {
    fs.mkdirSync(path.dirname(NAV_LOG), { recursive: true });
    fs.appendFileSync(NAV_LOG, `${entry}\n`);
    res.json({ success: true });
  } catch (err) {
    console.error('[Navigate] 记录失败:', err);
    res.status(500).json({ success: false });
  }
});

export default router;
