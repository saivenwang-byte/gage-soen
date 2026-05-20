/** 家人提交的「嘎算」优惠（内存；可换 SQLite） */
const items = [];

export function addUgc(entry) {
  const row = {
    id: `ugc-${Date.now()}`,
    platform: 'ugc',
    scene: entry.scene || 'dining',
    merchantName: entry.merchantName || '未命名商家',
    address: entry.address || '上海市奉贤区',
    price: Number(entry.price) || 0,
    promoText: entry.promoText || entry.ocrText || entry.note || '',
    discountText: entry.promoText || entry.ocrText || entry.note || '',
    bloggers: [
      {
        platform: 'ugc',
        nickname: entry.submitter || '家人',
        summary: entry.promoText || entry.note || '',
      },
    ],
    discountPrice: Number(entry.price) || 0,
    originalPrice: Number(entry.price) || 0,
    submittedAt: new Date().toISOString(),
    screenshotPath: entry.screenshotPath,
  };
  items.push(row);
  return row;
}

export function listUgc() {
  return [...items];
}
