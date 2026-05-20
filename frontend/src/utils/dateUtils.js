const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function toYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseYMD(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(ymd, n) {
  const d = parseYMD(ymd);
  d.setDate(d.getDate() + n);
  return toYMD(d);
}

export function daysBetween(from, to) {
  if (!from || !to) return 0;
  const a = parseYMD(from);
  const b = parseYMD(to);
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

export function formatDisplay(ymd) {
  if (!ymd) return '';
  const d = parseYMD(ymd);
  return `${d.getMonth() + 1}月${d.getDate()}日 周${WEEKDAYS[d.getDay()]}`;
}

export function getMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toYMD(new Date(year, month, d)));
  }
  return cells;
}

export function todayYMD() {
  return toYMD(new Date());
}

export function weekendRange() {
  const now = new Date();
  const day = now.getDay();
  if (day === 6) return { from: toYMD(now), to: toYMD(new Date(now.getTime() + 86400000)) };
  if (day === 0) return { from: toYMD(now), to: toYMD(now) };
  const sat = new Date(now);
  sat.setDate(now.getDate() + (6 - day));
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  return { from: toYMD(sat), to: toYMD(sun) };
}
