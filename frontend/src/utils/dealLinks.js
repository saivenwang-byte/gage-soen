/**
 * 店铺外链：官网比价 + 平台收录页（新窗口打开，关掉即回到介嘎算）
 */
export function getDealExternalLinks(item) {
  if (!item) return { officialUrl: null, bookingUrl: null, officialLabel: '官网', bookingLabel: '平台比价' };

  const name = encodeURIComponent(item.merchantName || item.title || '');
  const officialUrl =
    item.officialUrl ||
    item.websiteUrl ||
    item.homepage ||
    null;
  const bookingUrl =
    item.sourceUrl ||
    item.bookingUrl ||
    item.dealUrl ||
    item.platformUrl ||
    null;

  const platform = (item.platform || item.platformLabel || '').toLowerCase();

  let guessBooking = bookingUrl;
  if (!guessBooking && name) {
    if (platform.includes('携程') || platform.includes('ctrip')) {
      guessBooking = `https://hotels.ctrip.com/hotels/list?keyword=${name}`;
    } else if (platform.includes('美团') || platform.includes('meituan')) {
      guessBooking = `https://www.meituan.com/s/${name}`;
    } else if (platform.includes('点评') || platform.includes('dianping')) {
      guessBooking = `https://www.dianping.com/search/keyword/1/0_${name}`;
    } else if (item.scene === 'stay') {
      guessBooking = `https://hotels.ctrip.com/hotels/list?keyword=${name}`;
    } else {
      guessBooking = `https://www.dianping.com/search/keyword/1/0_${name}`;
    }
  }

  let guessOfficial = officialUrl;
  if (!guessOfficial && name) {
    guessOfficial = `https://www.baidu.com/s?wd=${name}%20官网`;
  }

  let ctripUrl = item.ctripUrl || null;
  let dianpingUrl = item.dianpingUrl || null;
  if (!ctripUrl && guessBooking?.includes('ctrip.com')) ctripUrl = guessBooking;
  if (!dianpingUrl && guessBooking?.includes('dianping.com')) dianpingUrl = guessBooking;

  return {
    officialUrl: guessOfficial,
    bookingUrl: guessBooking,
    ctripUrl,
    dianpingUrl,
    officialLabel: officialUrl ? '官方网站' : '搜官网/比价',
    bookingLabel: bookingUrl ? '收录优惠页' : '平台搜这家店',
  };
}

export function openExternalLink(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}
