/**
 * 可选：连接本机 Express 后端（需先 npm start）
 * 失败时自动回退本地 data/deals.js
 */
const dealsUtil = require('./deals.js');

function request(path, data, method = 'GET') {
  const app = getApp();
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBase}${path}`,
      data,
      method,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data);
        else reject(new Error(res.data?.message || '请求失败'));
      },
      fail: reject,
    });
  });
}

function getDeals(params) {
  return request('/api/deals', {
    scene: params.scene === 'all' ? undefined : params.scene,
    keyword: params.keyword,
    distance: params.distance || 15,
    lat: 30.918,
    lng: 121.474,
  })
    .then((res) => (res.data || []).map(normalizeRemote))
    .catch(() => dealsUtil.queryDeals(params));
}

function normalizeRemote(item) {
  return {
    ...item,
    title: item.title || item.merchantName,
    discountPrice: item.discountPrice ?? item.price,
    discountText: item.discountText || item.promoText,
    quote: item.influencerQuote || item.bloggers?.[0]?.summary || '',
    source: item.bloggers?.[0]?.nickname || item.platformLabel || '精选',
    emotionTags: item.emotionTags || item.tags || [],
  };
}

function getBottleRandom() {
  return request('/api/bottle/random', { lat: 30.918, lng: 121.474, distance: 15 }).catch(() => null);
}

module.exports = { getDeals, getBottleRandom, queryLocal: dealsUtil.queryDeals };
