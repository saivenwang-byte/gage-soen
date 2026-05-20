/** 未授权定位时的奉贤南桥参考点（仅兜底，非用户真实位置） */
export const FALLBACK_CENTER = {
  lat: 30.918,
  lng: 121.474,
  name: '南桥城区参考点',
};

const LAST_GPS_KEY = 'jiegasuan_last_gps';
const LAST_GPS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 天内可暂用上次真实定位

/** 打开 App 时：优先高精度 GPS，其次手机缓存定位，再 watch 暖机 */
const GEO_HIGH = {
  enableHighAccuracy: true,
  timeout: 25000,
  maximumAge: 0,
};

const GEO_CACHED = {
  enableHighAccuracy: true,
  timeout: 12000,
  maximumAge: 5 * 60 * 1000, // 5 分钟内手机已有定位可直接用
};

const GEO_LOW = {
  enableHighAccuracy: false,
  timeout: 15000,
  maximumAge: 10 * 60 * 1000,
};

export function isSecureLocationContext() {
  if (typeof window === 'undefined') return true;
  return window.isSecureContext === true;
}

export function buildUserLocationFromPosition(pos) {
  const accuracyM = pos.coords.accuracy;
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracyM: accuracyM != null ? Math.round(accuracyM) : null,
    source: 'gps',
    updatedAt: Date.now(),
    label: '本机实时定位',
  };
}

export function buildFallbackLocation(reason = 'unavailable') {
  return {
    ...FALLBACK_CENTER,
    accuracyM: null,
    source: reason === 'denied' ? 'denied' : 'fallback',
    updatedAt: Date.now(),
    label: reason === 'denied' ? '未授权定位 · 用南桥参考点' : '定位不可用 · 用南桥参考点',
  };
}

export function saveLastGps(loc) {
  if (loc?.source !== 'gps' || loc.lat == null) return;
  try {
    localStorage.setItem(
      LAST_GPS_KEY,
      JSON.stringify({
        lat: loc.lat,
        lng: loc.lng,
        accuracyM: loc.accuracyM,
        savedAt: Date.now(),
      })
    );
  } catch {
    /* ignore quota */
  }
}

export function loadLastGps() {
  try {
    const raw = localStorage.getItem(LAST_GPS_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o?.lat || Date.now() - (o.savedAt || 0) > LAST_GPS_MAX_AGE_MS) return null;
    return {
      lat: o.lat,
      lng: o.lng,
      accuracyM: o.accuracyM ?? null,
      source: 'gps_cached',
      updatedAt: o.savedAt,
      label: '本机定位（沿用上回打开时的位置）',
    };
  } catch {
    return null;
  }
}

function getPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/** 部分手机 GPS 冷启动慢：短时 watch 直到拿到第一个点 */
function watchUntilFix(options, maxWaitMs = 22000) {
  return new Promise((resolve, reject) => {
    let watchId = null;
    let settled = false;

    const finish = (fn, arg) => {
      if (settled) return;
      settled = true;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      clearTimeout(timer);
      fn(arg);
    };

    const timer = setTimeout(() => {
      finish(reject, { code: 3, message: 'watch timeout' });
    }, maxWaitMs);

    watchId = navigator.geolocation.watchPosition(
      (pos) => finish(resolve, pos),
      (err) => finish(reject, err),
      options
    );
  });
}

/**
 * 请求手机当前真实地理位置（打开 App 时调用）
 * @returns {Promise<object>} userLocation 对象
 */
export async function requestDeviceLocation() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    const err = new Error('浏览器不支持定位');
    err.code = 'unsupported';
    throw err;
  }

  if (!isSecureLocationContext()) {
    const err = new Error('定位需要 HTTPS 或 localhost');
    err.code = 'insecure';
    throw err;
  }

  const attempts = [
    () => getPosition(GEO_HIGH),
    () => getPosition(GEO_CACHED),
    () => getPosition(GEO_LOW),
    () => watchUntilFix(GEO_HIGH),
  ];

  let lastErr;
  for (const run of attempts) {
    try {
      const pos = await run();
      const loc = buildUserLocationFromPosition(pos);
      saveLastGps(loc);
      return loc;
    } catch (e) {
      lastErr = e;
      if (e?.code === 1) throw e; // 用户拒绝，不再重试
    }
  }

  throw lastErr || new Error('定位失败');
}

export function formatLocationAccuracy(accuracyM) {
  if (accuracyM == null) return null;
  if (accuracyM <= 20) return `定位精度约 ±${accuracyM} 米（较好）`;
  if (accuracyM <= 80) return `定位精度约 ±${accuracyM} 米（一般，室内可能偏差更大）`;
  return `定位精度约 ±${accuracyM} 米（较差，距离仅供参考）`;
}

/** @deprecated 使用 requestDeviceLocation */
export const GEO_OPTIONS = GEO_HIGH;

export function isRealGpsSource(source) {
  return source === 'gps' || source === 'gps_cached';
}
