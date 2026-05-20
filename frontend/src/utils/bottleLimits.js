// frontend/src/utils/bottleLimits.js
// 暇兜兜：海面瓶子库存、自动恢复、手动刷新、每日首捞保底

export const BOTTLE_CONFIG = {
  BATCH_MIN: 8,
  BATCH_MAX: 12,
  RECOVER_INTERVAL: 3 * 60 * 1000,
  MAX_STOCK: 15,
  REFRESH_COOLDOWN: 30 * 60 * 1000,
  REFRESH_FILL: 12,
  EMPTY_RATE: 0.10,
  DAILY_FIRST_GUARANTEED: true,
};

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function hasPickedFirstToday() {
  const today = getTodayKey();
  const stored = localStorage.getItem('jiegasuan_first_pick_date');
  return stored === today;
}

export function markFirstPickDone() {
  const today = getTodayKey();
  localStorage.setItem('jiegasuan_first_pick_date', today);
}
