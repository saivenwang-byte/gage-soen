import { Router } from 'express';
import { generateFortune, pickEmptyBottleLine } from '../utils/fortune.js';
import { listAllForBottle } from '../services/dealsStore.js';

const router = Router();
const EMPTY_BOTTLE_RATE = 0.1;

router.get('/count', (req, res) => {
  const lat = Number(req.query.lat) || 30.918;
  const lng = Number(req.query.lng) || 121.474;
  const distance = Number(req.query.distance) || 15;
  const scene = req.query.scene || 'all';
  const subCategory = req.query.subCategory || 'all';
  const items = listAllForBottle({ lat, lng, name: '当前位置' }, distance, { scene, subCategory });
  res.json({ count: items.length });
});

router.get('/random', (req, res) => {
  const lat = Number(req.query.lat) || 30.918;
  const lng = Number(req.query.lng) || 121.474;
  const distance = Number(req.query.distance) || 15;
  const scene = req.query.scene || 'all';
  const subCategory = req.query.subCategory || 'all';
  const items = listAllForBottle({ lat, lng, name: '当前位置' }, distance, { scene, subCategory });

  if (!items.length) {
    return res.json({
      empty: true,
      noStock: true,
      fortuneText: '这类瓶子里暂呒没货，换一类或扩大范围再捞～',
    });
  }

  if (Math.random() < EMPTY_BOTTLE_RATE) {
    const fortune = generateFortune();
    return res.json({
      empty: true,
      fortuneText: pickEmptyBottleLine(),
      fortune: { sign: fortune.sign, text: fortune.text },
    });
  }

  const pick = items[Math.floor(Math.random() * items.length)];
  const fortune = generateFortune();
  const humanText =
    pick.influencerQuote ||
    pick.bloggers?.[0]?.summary ||
    `「${pick.merchantName}」${pick.promoText || ''}，值得顺路看看。`;

  res.json({
    empty: false,
    data: {
      ...pick,
      title: pick.title || pick.merchantName,
      discountText: pick.discountText || pick.promoText,
      fortune: {
        sign: fortune.sign,
        text: `${fortune.text} ${humanText}`,
      },
    },
    fortuneText: fortune.text,
  });
});

export default router;
