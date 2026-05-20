import { Router } from 'express';
import { queryCuratedDeals } from '../services/dealsStore.js';
import { logSearch } from '../services/searchLog.js';

const router = Router();

/** MVP: GET /api/deals?scene=&keyword=&distance=&lat=&lng= */
router.get('/', (req, res) => {
  try {
    const lat = Number(req.query.lat) || 30.918;
    const lng = Number(req.query.lng) || 121.474;
    const distance = Number(req.query.distance) || 15;
    const scene = req.query.scene || 'all';
    const keyword = req.query.keyword || '';
    const subCategory = req.query.subCategory || req.query.sub || 'all';
    const scenes = scene === 'all' ? ['all'] : [scene];

    const data = queryCuratedDeals({
      scenes,
      subCategory,
      keyword,
      maxDistanceKm: distance,
      center: { lat, lng, name: '当前位置' },
    });

    logSearch({
      keyword: subCategory !== 'all' ? subCategory : keyword,
      subCategory,
      scene,
      distance,
      lat,
      lng,
      people: Number(req.query.people) || 2,
      mode: req.query.mode || 'value',
      budget: req.query.budget || '',
      device_id: req.query.device_id || req.headers['x-device-id'] || 'unknown',
      result_count: data.length,
      source: 'api/deals',
    });

    res.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error('[GET /api/deals]', e);
    res.status(500).json({ success: false, message: e.message || '查询失败' });
  }
});

export default router;
