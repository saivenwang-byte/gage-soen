import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { normalizeDeal } from '../utils/normalizeDeal';
import { queryLocalDeals } from '../utils/localDeals';
import {
  buildFallbackLocation,
  FALLBACK_CENTER,
  loadLastGps,
  requestDeviceLocationWithTimeout,
  saveLastGps,
} from '../utils/location';
import { sameCompareGroup, compareRejectMessage } from '../utils/compareRules';
import { saveLocalUgc } from '../utils/localUgc';
import { apiFetch } from '../config/api';
import { startSearch, getSearchResult } from '../api/client';

const AppContext = createContext(null);

const EMPTY_BOTTLE_RATE = 0.1;
const FAV_KEY = 'jiegasuan_favorites';
const WATCH_KEY = 'jiegasuan_watch';
const BOTTLE_HISTORY_KEY = 'jiegasuan_bottle_history';
const PROFILE_KEY = 'jiegasuan_profile';

function modeToSortBy(mode) {
  if (mode === 'cheap') return 'saving';
  if (mode === 'experience') return 'blogger';
  return 'value';
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }) {
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  const [preferences, setPreferences] = useState(() =>
    loadJson('jiegasuan_preferences', {
      defaultMode: 'value',
      defaultDistance: 15,
      defaultPeople: 2,
    })
  );

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [lastSearchAt, setLastSearchAt] = useState(null);
  const [usingLocalData, setUsingLocalData] = useState(false);
  const [searchMode, setSearchMode] = useState('curated');
  const [searchWarnings, setSearchWarnings] = useState([]);

  const [bottleCount, setBottleCount] = useState(0);
  const [bottleCollected, setBottleCollected] = useState(() => loadJson(BOTTLE_HISTORY_KEY, []));

  const [compareList, setCompareList] = useState([]);
  const [compareMessage, setCompareMessage] = useState('');
  const [favorites, setFavorites] = useState(() => loadJson(FAV_KEY, []));
  const [watchList, setWatchList] = useState(() => loadJson(WATCH_KEY, []));
  const [mainTab, setMainTab] = useState('aoso');
  const [aosoSearchRequest, setAosoSearchRequest] = useState(null);
  const [profile, setProfile] = useState(() =>
    loadJson(PROFILE_KEY, { nickname: '嘎算达人', avatarUrl: null })
  );

  useEffect(() => {
    localStorage.setItem('jiegasuan_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      /* 头像过大等导致 QuotaExceeded — 由上传处压缩；仍失败则仅内存展示 */
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(WATCH_KEY, JSON.stringify(watchList));
  }, [watchList]);

  useEffect(() => {
    localStorage.setItem(BOTTLE_HISTORY_KEY, JSON.stringify(bottleCollected));
  }, [bottleCollected]);

  const applyGeolocation = useCallback(async (onDone) => {
    setLocationLoading(true);
    try {
      const loc = await requestDeviceLocationWithTimeout(8000);
      setUserLocation(loc);
      saveLastGps(loc);
    } catch (err) {
      const denied = err?.code === 1;
      const cached = !denied ? loadLastGps() : null;
      if (cached) {
        setUserLocation(cached);
      } else if (err?.code === 'insecure') {
        setUserLocation({
          ...buildFallbackLocation('unavailable'),
          label: '当前链接无法精确定位 · 已用南桥参考点，距离仅供参考',
        });
      } else if (denied) {
        setUserLocation(buildFallbackLocation('denied'));
      } else {
        setUserLocation(buildFallbackLocation('unavailable'));
      }
    } finally {
      setLocationLoading(false);
      onDone?.();
    }
  }, []);

  useEffect(() => {
    // 先给南桥参考点，避免定位挂起时「开始搜索」一直灰掉
    setUserLocation((prev) => prev ?? buildFallbackLocation('unavailable'));
    applyGeolocation();
  }, [applyGeolocation]);

  const refreshUserLocation = useCallback(
    (onDone) => {
      applyGeolocation(onDone);
    },
    [applyGeolocation]
  );

  /** 奥扫：优先同步 GET /api/deals；失败则用内置精选数据 */
  const searchDeals = useCallback(
    async (params) => {
      const scene = params.scene || 'all';
      const subCategory = params.subCategory || 'all';
      const distance = params.distance ?? preferences.defaultDistance;
      const keyword = params.keyword?.trim() || '';
      const center = userLocation
        ? { lat: userLocation.lat, lng: userLocation.lng }
        : { lat: FALLBACK_CENTER.lat, lng: FALLBACK_CENTER.lng };

      const emptyMsg =
        subCategory && subCategory !== 'all'
          ? '这个分类下暂无收录，试试上面其他标签或切到「全部」'
          : '迭个区域还呒没找到，要勿要放宽到全区看看？';

      const applyList = (list, local) => {
        setSearchResults(list);
        setUsingLocalData(local);
        if (list.length) {
          setLastSearchAt(new Date().toISOString());
          setSearchError(null);
        } else {
          setSearchError(emptyMsg);
        }
      };

      // 先立刻展示本地精选，保证列表可点开（不等 API）
      const localInstant = queryLocalDeals({ scene, subCategory, keyword, distance, center });
      if (localInstant.length) {
        setSearchResults(localInstant);
        setSearchError(null);
      }

      setSearchMode('curated');
      setSearchWarnings([]);
      setSearchLoading(true);

      try {
        const qs = new URLSearchParams({
          scene,
          subCategory,
          distance: String(distance),
          lat: String(center.lat),
          lng: String(center.lng),
        });
        if (keyword) qs.set('keyword', keyword);

        const res = await apiFetch(`/deals?${qs.toString()}`);
        applyList(res.data?.length ? res.data : localInstant, false);
      } catch (e) {
        console.warn('API 不可用，使用本地精选', e);
        const local = localInstant.length
          ? localInstant
          : queryLocalDeals({ scene, subCategory, keyword, distance, center });
        applyList(local, true);
        if (!local.length) {
          setSearchError(emptyMsg);
        }
      } finally {
        setSearchLoading(false);
      }
    },
    [userLocation, preferences]
  );

  /** 以手机定位为圆心的「公开源归类」搜索（POST /api/search，可触发爬虫+精选合并） */
  const searchDealsLive = useCallback(
    async (params) => {
      if (!userLocation?.lat) return;

      const scene = params.scene || 'all';
      const subCategory = params.subCategory || 'all';
      const distance = params.distance ?? preferences.defaultDistance;
      const keyword = params.keyword?.trim() || '';
      const center = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        name: userLocation.label || userLocation.name || '当前位置',
      };

      const emptyMsg =
        subCategory && subCategory !== 'all'
          ? '这个分类下暂无收录，试试其他标签或先「逛街坊收录」'
          : '周边公开源暂未捞到，要勿要改用「逛街坊收录」或扔漂流瓶分享？';

      setSearchMode('live');
      setSearchWarnings([]);
      setSearchLoading(true);
      setSearchError(null);

      const localInstant = queryLocalDeals({ scene, subCategory, keyword, distance, center });
      if (localInstant.length) {
        setSearchResults(localInstant.map((d) => normalizeDeal(d)));
      }

      try {
        const scenes = scene === 'all' ? ['all'] : [scene];
        const { jobId } = await startSearch({
          scenes,
          subCategory,
          keyword,
          distance,
          maxDistanceKm: distance,
          headcount: params.people ?? preferences.defaultPeople,
          nights: params.nights,
          sortBy: modeToSortBy(params.mode || preferences.defaultMode),
          mapCenter: center,
          useLiveSources: true,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        });

        const deadline = Date.now() + 48_000;
        let last;
        while (Date.now() < deadline) {
          last = await getSearchResult(jobId);
          if (last.status === 'done' || last.status === 'failed') break;
          await new Promise((r) => setTimeout(r, 800));
        }

        const warnings = last?.warnings || [];
        setSearchWarnings(warnings);

        if (last?.results?.length) {
          setSearchResults(last.results.map((d) => normalizeDeal(d)));
          setUsingLocalData(false);
          setLastSearchAt(new Date().toISOString());
          setSearchError(null);
        } else if (localInstant.length) {
          setSearchResults(localInstant.map((d) => normalizeDeal(d)));
          setUsingLocalData(true);
          setSearchError(
            warnings.length
              ? `${emptyMsg}（${warnings.join('；')}）`
              : emptyMsg
          );
        } else {
          setSearchResults([]);
          setSearchError(last?.message || emptyMsg);
        }
      } catch (e) {
        console.warn('公开源搜索失败', e);
        if (localInstant.length) {
          setSearchResults(localInstant.map((d) => normalizeDeal(d)));
          setUsingLocalData(true);
          setSearchError('后台未响应，已显示本机精选；连上后再试「搜周边公开源」。');
        } else {
          setSearchError(emptyMsg);
        }
      } finally {
        setSearchLoading(false);
      }
    },
    [userLocation, preferences]
  );

  const fetchBottleCount = useCallback(
    async ({ scene = 'all', subCategory = 'all' } = {}) => {
      if (!userLocation) return 0;
      try {
        const q = new URLSearchParams({
          lat: String(userLocation.lat),
          lng: String(userLocation.lng),
          distance: String(preferences.defaultDistance),
          scene,
          subCategory,
        });
        const data = await apiFetch(`/bottle/count?${q}`);
        const n = data.count ?? 0;
        setBottleCount(n);
        return n;
      } catch {
        const local = queryLocalDeals({
          scene,
          subCategory,
          distance: preferences.defaultDistance,
          center: userLocation,
        });
        const n = local.length;
        setBottleCount(n);
        return n;
      }
    },
    [userLocation, preferences.defaultDistance]
  );

  const appendBottleCollected = useCallback((record) => {
    setBottleCollected((prev) => [...prev, record]);
  }, []);

  const pickBottle = useCallback(
    async ({ scene = 'all', subCategory = 'all', mode } = {}) => {
      if (!userLocation) {
        return { empty: true, fortuneText: '请先允许定位，再捞瓶子～' };
      }
      const sortMode = mode || preferences.defaultMode;
      const bottleMeta = { scene, subCategory, pickedAt: new Date().toISOString() };

      try {
        const q = new URLSearchParams({
          lat: String(userLocation.lat),
          lng: String(userLocation.lng),
          distance: String(preferences.defaultDistance),
          mode: sortMode,
          scene,
          subCategory,
        });
        const data = await apiFetch(`/bottle/random?${q}`);
        if (data.empty && data.noStock) {
          return data;
        }
        const record = data.empty
          ? { empty: true, fortuneText: data.fortuneText, fortune: data.fortune, ...bottleMeta }
          : { ...normalizeDeal(data.data), ...bottleMeta };
        setBottleCollected((prev) => [...prev, record]);
        return data.empty ? data : { ...data, data: normalizeDeal(data.data) };
      } catch (e) {
        console.warn('bottle API 不可用，使用本地精选', e);
        const center = userLocation || FALLBACK_CENTER;
        const local = queryLocalDeals({
          scene,
          subCategory,
          distance: preferences.defaultDistance,
          center,
        });
        if (!local.length) {
          return {
            empty: true,
            fortuneText: '这类瓶子里暂呒没货，换一类或扩大范围再捞～',
            noStock: true,
          };
        }
        if (Math.random() < EMPTY_BOTTLE_RATE) {
          const empty = {
            empty: true,
            fortuneText: '今朝捡到空瓶一只，明朝再来碰碰运气～',
            ...bottleMeta,
          };
          setBottleCollected((prev) => [...prev, empty]);
          return empty;
        }
        const pick = local[Math.floor(Math.random() * local.length)];
        const normalized = normalizeDeal(pick);
        const record = { ...normalized, ...bottleMeta };
        setBottleCollected((prev) => [...prev, record]);
        return {
          empty: false,
          data: normalized,
          fortuneText: `捞到宝啦：${normalized.merchantName}`,
        };
      }
    },
    [userLocation, preferences]
  );

  const requestAosoSearch = useCallback((opts = {}) => {
    setAosoSearchRequest({
      keyword: opts.keyword ?? '',
      distance: opts.distance ?? preferences.defaultDistance,
      mode: opts.mode ?? preferences.defaultMode,
      scene: opts.scene ?? 'all',
      at: Date.now(),
    });
    setMainTab('aoso');
  }, [preferences]);

  const toggleCompare = useCallback((item) => {
    const normalized = normalizeDeal(item);
    setCompareList((prev) => {
      if (prev.find((i) => i.id === normalized.id)) {
        setCompareMessage('');
        return prev.filter((i) => i.id !== normalized.id);
      }
      if (prev.length > 0 && !sameCompareGroup(prev[0], normalized)) {
        setCompareMessage('只能对比同类型的优惠');
        return prev;
      }
      if (prev.length >= 3) {
        setCompareMessage('最多对比3家');
        return prev;
      }
      setCompareMessage('');
      return [...prev, normalized];
    });
  }, []);

  const updateProfile = useCallback((patch) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    setCompareMessage('');
  }, []);

  const removeFromCompare = useCallback((id) => {
    setCompareList((prev) => prev.filter((i) => i.id !== id));
    setCompareMessage('');
  }, []);

  const toggleFavorite = useCallback((item) => {
    const normalized = normalizeDeal(item);
    setFavorites((prev) => {
      if (prev.find((i) => i.id === normalized.id)) {
        return prev.filter((i) => i.id !== normalized.id);
      }
      return [...prev, { ...normalized, favoritedAt: new Date().toISOString() }];
    });
  }, []);

  const isFavorite = useCallback(
    (item) => favorites.some((i) => i.id === normalizeDeal(item).id),
    [favorites]
  );

  const addWatch = useCallback((watch) => {
    setWatchList((prev) => [...prev, { ...watch, id: Date.now(), createdAt: new Date().toISOString() }]);
  }, []);

  const removeWatch = useCallback((id) => {
    setWatchList((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const submitUgc = useCallback(async (payload) => {
    const body = JSON.stringify(payload);
    try {
      return await apiFetch('/ugc', { method: 'POST', body });
    } catch (e) {
      const offline =
        e.status === 404 ||
        e.message?.includes('404') ||
        e.message?.includes('Failed to fetch') ||
        e.message?.includes('NetworkError');
      if (offline) {
        const row = saveLocalUgc(payload);
        return {
          success: true,
          localOnly: true,
          message:
            '已扔进本机海面（预览或未开后台时正常）。暇兜兜能捞、奥扫能搜；连上后台后街坊上传会进社区漂流瓶池。',
          item: row,
        };
      }
      throw e;
    }
  }, []);

  const fetchWishes = useCallback(async () => {
    const res = await apiFetch('/wish');
    return res.data || [];
  }, []);

  const submitWish = useCallback(async (payload) => {
    return apiFetch('/wish', { method: 'POST', body: JSON.stringify(payload) });
  }, []);

  const supportWish = useCallback(async (id) => {
    return apiFetch(`/wish/${id}/support`, { method: 'POST', body: '{}' });
  }, []);

  useEffect(() => {
    if (userLocation) fetchBottleCount();
  }, [userLocation, fetchBottleCount]);

  const value = {
    userLocation,
    locationLoading,
    refreshUserLocation,
    preferences,
    setPreferences,
    searchResults,
    searchLoading,
    searchError,
    lastSearchAt,
    usingLocalData,
    searchMode,
    searchWarnings,
    searchDeals,
    searchDealsLive,
    bottleCount,
    bottleCollected,
    appendBottleCollected,
    pickBottle,
    fetchBottleCount,
    compareList,
    compareMessage,
    setCompareMessage,
    toggleCompare,
    clearCompare,
    removeFromCompare,
    favorites,
    toggleFavorite,
    isFavorite,
    watchList,
    addWatch,
    removeWatch,
    submitUgc,
    fetchWishes,
    submitWish,
    supportWish,
    mainTab,
    setMainTab,
    aosoSearchRequest,
    requestAosoSearch,
    profile,
    updateProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
