/**
 * 从优惠文案中提取有效期，并与用户筛选区间求交
 */

const WEEKEND = /仅限周末|周六日|双休日/;
const RANGE = /(\d{1,2})[.\-/月](\d{1,2})[.\-/日]?[-~至到]+(\d{1,2})[.\-/月]?(\d{1,2})?/;

export function parseValidityFromText(text, baseYear = new Date().getFullYear()) {
  if (!text) return { validFrom: null, validTo: null, weekendOnly: false, raw: '' };
  const weekendOnly = WEEKEND.test(text);
  const m = text.match(RANGE);
  if (m) {
    const y = baseYear;
    const from = new Date(y, Number(m[1]) - 1, Number(m[2]));
    const toMonth = m[4] ? Number(m[3]) - 1 : Number(m[1]) - 1;
    const toDay = m[4] ? Number(m[4]) : Number(m[3]);
    const to = new Date(y, toMonth, toDay, 23, 59, 59);
    return { validFrom: from, validTo: to, weekendOnly, raw: m[0] };
  }
  return { validFrom: null, validTo: null, weekendOnly, raw: '' };
}

export function intersectsUserRange(validFrom, validTo, userFrom, userTo) {
  if (!userFrom && !userTo) return true;
  const now = new Date();
  const vf = validFrom || now;
  const vt = validTo || new Date(now.getTime() + 90 * 86400000);
  const uf = userFrom || now;
  const ut = userTo || new Date(now.getTime() + 365 * 86400000);
  return vf <= ut && vt >= uf;
}

export function matchTimePreset(preset) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (preset === 'today') {
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { from: start, to: end };
  }
  if (preset === 'week') {
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { from: start, to: end };
  }
  return { from: null, to: null };
}
