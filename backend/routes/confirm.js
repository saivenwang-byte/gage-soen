import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIRM_LOG = path.join(__dirname, '../data/confirm.log.jsonl');

const router = Router();

/** POST /api/confirm — MVP 免费，仅记录核实请求 */
router.post('/', (req, res) => {
  const { deal_id, device_id, timestamp } = req.body;
  const row = {
    deal_id,
    device_id,
    timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
    type: 'confirm_request',
  };
  try {
    fs.mkdirSync(path.dirname(CONFIRM_LOG), { recursive: true });
    fs.appendFileSync(CONFIRM_LOG, `${JSON.stringify(row)}\n`, 'utf8');
    res.json({ success: true, status: 'pending' });
  } catch (err) {
    console.error('[Confirm] log failed:', err);
    res.status(500).json({ success: false, status: 'pending' });
  }
});

export default router;
