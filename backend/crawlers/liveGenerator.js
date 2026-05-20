/**
 * 动态演示数据：无 Cookie 或真实爬取失败时回退，保证介嘎算可跑通
 * 配置 Cookie 后优先使用 Playwright 真实数据
 */
import { BAY_RESORT_CENTER } from '../utils/geo.js';

const TOWNS = ['南桥镇', '海湾镇', '奉城镇', '庄行镇', '四团镇', '柘林镇'];

const POOLS = {
  stay: [
    { name: '碧海金沙海景度假村', promo: '六人免一人 含双早 仅限周末', price: 1280, orig: 1680, rating: 4.5 },
    { name: '海湾森林公园民宿小院', promo: '四人同行一人免单', price: 598, orig: 798, rating: 4.6 },
    { name: '申隆生态园酒店', promo: '十人免两人 可带宠物', price: 388, orig: 488, rating: 4.2, perPerson: true },
  ],
  dining: [
    { name: '渔人码头海鲜坊', promo: '满2000减300 2人餐188', price: 1888, orig: 2288, rating: 4.5 },
    { name: '南桥老八样本帮菜', promo: '午市6.8折 四人同行一人免单', price: 468, orig: 598, rating: 4.4 },
    { name: '奉贤海湾渔村酒家', promo: '六人免一人', price: 888, orig: 1088, rating: 4.3 },
  ],
  coffee: [
    { name: '海湾露营风咖啡', promo: '第二杯半价 自带杯减5元', price: 32, orig: 38, rating: 4.7, perPerson: true },
    { name: '庄行田野咖啡', promo: '买一送一 下午茶套餐原价98现价58', price: 58, orig: 98, rating: 4.8 },
  ],
  entertainment: [
    { name: '南桥老友棋牌麻将馆', promo: '白天4小时畅打 茶水免费', price: 48, orig: 68, rating: 4.4, perPerson: true },
    { name: '百联南桥量贩K歌', promo: '欢唱3小时 周末下午档8折', price: 58, orig: 98, rating: 4.5, perPerson: true },
    { name: '海湾大学城桌游吧', promo: '学生4人同行1人免单', price: 39, orig: 59, rating: 4.6, perPerson: true },
  ],
  life: [
    { name: '南桥羽动羽毛球馆', promo: '工作日白天场地8折', price: 35, orig: 50, rating: 4.5, perPerson: true },
    { name: '奉贤体育中心篮球馆', promo: '半场2小时 学生再减20', price: 80, orig: 120, rating: 4.4, perPerson: true },
    { name: '南桥星牌台球俱乐部', promo: '黑八畅打2小时', price: 28, orig: 40, rating: 4.3, perPerson: true },
  ],
  shopping: [
    { name: '奉贤宝龙广场', promo: '全场5折起 满300送50元券', price: 299, orig: 598, rating: 4.2, mall: true },
    { name: '百联南桥店', promo: '临期食品3折 满500减80', price: 50, orig: 168, rating: 4.0, mall: true },
    { name: '盒马奉贤店', promo: '晚间清仓8折起', price: 39, orig: 59, rating: 4.5, mall: true },
  ],
};

const BLOGGERS = [
  { platform: 'xiaohongshu', nickname: '奉贤小鹿', followers: 82000, likes: 3200, collects: 1100 },
  { platform: 'douyin', nickname: '南桥吃货阿杰', followers: 156000, likes: 12000, collects: 0 },
  { platform: 'bilibili', nickname: '魔都郊野游', followers: 45000, likes: 890, collects: 420 },
];

function pickTown(filters) {
  if (filters?.town && filters.town !== 'all') return filters.town;
  return TOWNS[Math.floor(Math.random() * TOWNS.length)];
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function generateLiveItems({ platform, scene, filters = {}, count = 4 }) {
  const pool = POOLS[scene] || POOLS.dining;
  const seed = hashSeed(JSON.stringify({ platform, scene, filters, t: Date.now() }));
  const items = [];
  const town = pickTown(filters);

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const p = pool[(seed + i) % pool.length];
    const withBlogger = filters.sourcePref !== 'platform' && (seed + i) % 2 === 0;
    const blogger = withBlogger ? BLOGGERS[(seed + i) % BLOGGERS.length] : null;

    if (filters.bloggerOnly && !blogger) continue;
    if (blogger && (blogger.likes || 0) < (filters.minLikes || 0)) continue;

    const lat = BAY_RESORT_CENTER.lat + ((seed % 100) - 50) / 2500;
    const lng = BAY_RESORT_CENTER.lng + (((seed + i) % 80) - 40) / 2500;

    items.push({
      id: `${platform}-${scene}-${seed}-${i}`,
      platform,
      scene,
      merchantName: p.name,
      address: `上海市奉贤区${town}${p.name.slice(0, 2)}路${(seed % 200) + 1}号`,
      town,
      phone: '021-3750' + String(1000 + ((seed + i) % 9000)),
      hours: '10:00-22:00',
      originalPrice: p.orig || p.price,
      price: p.price || 299,
      isPerPerson: !!p.perPerson,
      promoText: p.promo,
      rating: p.rating,
      tags: p.mall ? ['商场', '购物'] : [],
      lat,
      lng,
      publishedAt: new Date(Date.now() - (seed % 20) * 86400000).toISOString(),
      sourceUrl: `https://${platform}.example.com/deal/${seed}${i}`,
      dataMode: 'fallback',
      bloggers: blogger
        ? [
            {
              ...blogger,
              id: blogger.nickname,
              summary: `探店${p.name}：${p.promo}`,
              contentUrl: `https://${blogger.platform}.example.com/u/${blogger.nickname}`,
              promoCode: (seed + i) % 3 === 0 ? `FX${seed % 1000}` : '',
            },
          ]
        : [],
      bloggerSummary: blogger?.summary,
      fetchedAt: new Date().toISOString(),
    });
  }
  return items;
}
