import { Router } from 'express';
import { addUgc } from '../services/ugcStore.js';

const router = Router();

/** POST /api/ugc — 家人上传嘎算优惠（PRD 约定路径） */
router.post('/', (req, res) => {
  const row = addUgc(req.body);
  res.json({
    success: true,
    message: '收录成功，下次奥扫会并入选精选池',
    item: row,
  });
});

export default router;
