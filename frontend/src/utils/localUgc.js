/**
 * 家人上传优惠：后端不可用时写入本机，并并入本地奥扫/暇兜兜池
 */
const UGC_KEY = 'jiegasuan_local_ugc';

export function loadLocalUgc() {
  try {
    const raw = localStorage.getItem(UGC_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalUgc(entry) {
  const price = Number(entry.price) || 0;
  const row = {
    id: `local-ugc-${Date.now()}`,
    scene: entry.scene || 'dining',
    merchantName: entry.merchantName?.trim() || '未命名商家',
    title: entry.merchantName?.trim() || '未命名商家',
    address: entry.address?.trim() || '上海市奉贤区',
    promoText: entry.promoText?.trim() || '',
    discountText: entry.promoText?.trim() || '',
    price,
    discountPrice: price,
    originalPrice: price,
    platform: 'ugc',
    platformLabel: '家人上传',
    dataMode: 'ugc',
    influencerName: entry.submitter?.trim() || '家人',
    influencerQuote: entry.promoText?.trim() || '',
    tags: entry.promoText ? [entry.promoText.slice(0, 12)] : [],
    submittedAt: new Date().toISOString(),
  };
  const list = loadLocalUgc();
  list.push(row);
  localStorage.setItem(UGC_KEY, JSON.stringify(list));
  return row;
}
