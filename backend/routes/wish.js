import { Router } from 'express';
import { addWish, listWishes, supportWish } from '../services/wishStore.js';

const router = Router();

/** GET /api/wish — 最近许愿列表 */
router.get('/', (_, res) => {
  res.json({ success: true, data: listWishes() });
});

/** POST /api/wish — 提交许愿 */
router.post('/', (req, res) => {
  try {
    const row = addWish(req.body);
    res.json({ success: true, message: '许愿已投进海里，有嘎算情报会优先收录', item: row });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

/** POST /api/wish/:id/support — 助力 */
router.post('/:id/support', (req, res) => {
  const row = supportWish(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: '许愿不存在' });
  res.json({ success: true, item: row });
});

export default router;
