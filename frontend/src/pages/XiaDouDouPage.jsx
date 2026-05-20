import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import ValueCard from '../components/ValueCard';
import DealDetailSheet from '../components/DealDetailSheet';
import SceneSubPicker from '../components/SceneSubPicker';
import DistanceSlider from '../components/DistanceSlider';
import { normalizeDeal } from '../utils/normalizeDeal';
import { queryLocalDeals } from '../utils/localDeals';
import { SCENE_TAXONOMY, getSubcategoryConfig } from '../data/sceneTaxonomy';
import { playBottlePlop } from '../utils/bottleSound';
import {
  BOTTLE_CONFIG,
  hasPickedFirstToday,
  markFirstPickDone,
} from '../utils/bottleLimits';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const SCENE_RING_CLASS = {
  all: 'bottle-ring-all',
  coffee: 'bottle-ring-coffee',
  pet: 'bottle-ring-pet',
  expiring: 'bottle-ring-expiring',
  stay: 'bottle-ring-stay',
  entertainment: 'bottle-ring-entertainment',
  life: 'bottle-ring-life',
};

const EMPTY_TEXTS = [
  '今朝运道一般，但省下来的铜钿还在口袋里！',
  '这只瓶子是空的，但寻宝的心情勿会空，再捞一只？',
  '海风把瓶子吹远了，再试试看～',
  '空瓶也是瓶，至少你捞过了。',
  '瓶子说：我这会儿不想被人打开。',
];

export default function XiaDouDouPage() {
  const {
    appendBottleCollected,
    preferences,
    setPreferences,
    userLocation,
    locationLoading,
    toggleFavorite,
    isFavorite,
    toggleCompare,
    compareList,
  } = useApp();

  const [scene, setScene] = useState('all');
  const [subCategory, setSubCategory] = useState('all');
  const [pickDistance, setPickDistance] = useState(preferences.defaultDistance);

  // 海面瓶子库存（冷却恢复制）
  const [currentStock, setCurrentStock] = useState(0);
  const [lastRecoveryTime, setLastRecoveryTime] = useState(Date.now());
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [todayFirstGuaranteed, setTodayFirstGuaranteed] = useState(!hasPickedFirstToday());
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentFortune, setCurrentFortune] = useState(null);
  const [collected, setCollected] = useState([]);

  const [detailItem, setDetailItem] = useState(null);
  const [ringAnim, setRingAnim] = useState('');

  const sceneLabel = SCENE_TAXONOMY[scene]?.label || '全部';
  const subConfig = getSubcategoryConfig(scene, subCategory);
  const bottleTypeLabel =
    subCategory === 'all' ? sceneLabel : `${sceneLabel} · ${subConfig.label}`;

  // 从本地恢复海面库存
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('jiegasuan_bottle_state') || '{}');
    if (saved.currentStock !== undefined && saved.lastRecoveryTime) {
      setCurrentStock(saved.currentStock);
      setLastRecoveryTime(saved.lastRecoveryTime);
    } else {
      const initialStock =
        BOTTLE_CONFIG.BATCH_MIN +
        Math.floor(Math.random() * (BOTTLE_CONFIG.BATCH_MAX - BOTTLE_CONFIG.BATCH_MIN + 1));
      setCurrentStock(initialStock);
      setLastRecoveryTime(Date.now());
    }
  }, []);

  // 每 3 分钟自动恢复 1 只（上限 15）
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStock((prev) => {
        if (prev < BOTTLE_CONFIG.MAX_STOCK) return prev + 1;
        return prev;
      });
      setLastRecoveryTime(Date.now());
    }, BOTTLE_CONFIG.RECOVER_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // 持久化海面状态
  useEffect(() => {
    localStorage.setItem(
      'jiegasuan_bottle_state',
      JSON.stringify({
        currentStock,
        lastRecoveryTime,
      })
    );
  }, [currentStock, lastRecoveryTime]);

  const openDetail = (item) => {
    if (!item || item.empty) return;
    setDetailItem(normalizeDeal(item));
  };

  const handleThrowBack = () => {
    setRingAnim('bottle-throw-anim');
    playBottlePlop('throw');
    setTimeout(() => {
      setCurrentFortune(null);
      setDetailItem(null);
      setRingAnim('bottle-splash-anim');
      setTimeout(() => setRingAnim(''), 500);
    }, 700);
  };

  /** 后端不可用时，从本地精选池捞一只 */
  const pickLocalBottle = useCallback(() => {
    const center = userLocation || { lat: 30.918, lng: 121.474 };
    const local = queryLocalDeals({
      scene,
      subCategory,
      distance: pickDistance,
      center,
    });
    if (!local.length) {
      return {
        empty: true,
        noStock: true,
        fortuneText: '这类瓶子里暂呒没货，换一类或扩大范围再捞～',
      };
    }
    const pick = local[Math.floor(Math.random() * local.length)];
    const normalized = normalizeDeal(pick);
    return {
      empty: false,
      data: normalized,
      fortuneText: `捞到宝啦：${normalized.merchantName}`,
    };
  }, [userLocation, scene, subCategory, pickDistance]);

  const handlePickBottle = async () => {
    if (currentStock <= 0 || isRevealing || locationLoading) return;
    setCurrentStock((prev) => prev - 1);
    setIsRevealing(true);
    setCurrentFortune(null);
    setRingAnim('bottle-throw-anim');
    playBottlePlop('throw');

    let isEmpty = Math.random() < BOTTLE_CONFIG.EMPTY_RATE;
    let isFirstToday = false;
    if (todayFirstGuaranteed && BOTTLE_CONFIG.DAILY_FIRST_GUARANTEED) {
      isEmpty = false;
      isFirstToday = true;
      setTodayFirstGuaranteed(false);
      markFirstPickDone();
    }

    if (isEmpty) {
      setCurrentFortune({
        empty: true,
        fortuneText: EMPTY_TEXTS[Math.floor(Math.random() * EMPTY_TEXTS.length)],
      });
    } else {
      try {
        const lat = userLocation?.lat ?? 30.918;
        const lng = userLocation?.lng ?? 121.474;
        const q = new URLSearchParams({
          lat: String(lat),
          lng: String(lng),
          distance: String(pickDistance),
          scene,
          subCategory,
        });
        const res = await fetch(`${API_BASE}/bottle/random?${q}`);
        let data = await res.json();

        if (!data.empty && data.data) {
          data = {
            ...data,
            data: normalizeDeal(data.data),
          };
        }

        if (isFirstToday) {
          if (data.fortune) {
            data.fortune = { ...data.fortune, isTodaySign: true };
          } else {
            data.isTodaySign = true;
          }
        }

        setCurrentFortune(data);
        if (data && !data.empty && data.data) {
          const record = {
            ...data.data,
            scene,
            subCategory,
            pickedAt: new Date().toISOString(),
          };
          setCollected((prev) => [...prev, data]);
          appendBottleCollected(record);
        }
      } catch {
        const data = pickLocalBottle();
        if (isFirstToday && !data.empty) {
          data.isTodaySign = true;
        }
        setCurrentFortune(data);
        if (data && !data.empty && data.data) {
          const record = {
            ...data.data,
            scene,
            subCategory,
            pickedAt: new Date().toISOString(),
          };
          setCollected((prev) => [...prev, data]);
          appendBottleCollected(record);
        }
      }
    }

    setIsRevealing(false);
    setRingAnim('bottle-splash-anim');
    playBottlePlop('pick');
    setTimeout(() => setRingAnim(''), 500);
  };

  /** 手动刷新海面：30 分钟冷却，补满至 12 只 */
  const handleRefresh = () => {
    if (refreshCooldown > 0) return;
    setCurrentStock(BOTTLE_CONFIG.REFRESH_FILL);
    setLastRecoveryTime(Date.now());
    setRefreshCooldown(BOTTLE_CONFIG.REFRESH_COOLDOWN / 1000);
    const timer = setInterval(() => {
      setRefreshCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSceneChange = (key) => {
    setScene(key);
    setSubCategory('all');
    setCurrentFortune(null);
  };

  const handleSubChange = (key) => {
    setSubCategory(key);
    setCurrentFortune(null);
  };

  const canPick = currentStock > 0 && !isRevealing && !locationLoading;
  const lastPick = currentFortune;
  const showTodaySign =
    lastPick?.fortune?.isTodaySign || lastPick?.isTodaySign || lastPick?.data?.fortune?.isTodaySign;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: '80px' }}>
      <header
        className="header-mosaic header-mosaic-sea"
        style={{ textAlign: 'center', padding: '24px 16px 20px' }}
      >
        <h1 style={{ margin: 0, fontSize: '22px', fontFamily: 'var(--font-title)' }}>🍾 暇兜兜</h1>
        <p style={{ margin: '8px 0 0', fontSize: '13px', opacity: 0.85 }}>
          海面还有 <strong>{currentStock}</strong> 只瓶（最多攒 {BOTTLE_CONFIG.MAX_STOCK} 只）
          {collected.length > 0 && (
            <>
              {' '}
              · 本轮已捞 <strong>{collected.length}</strong> 只
            </>
          )}
        </p>
      </header>

      <section style={{ padding: '0 16px 12px' }}>
        <SceneSubPicker
          scene={scene}
          subCategory={subCategory}
          onSceneChange={handleSceneChange}
          onSubChange={handleSubChange}
          hint="① 选瓶子类型 ② 捞一只 ③ 点「走进这家店」看环境·价格·服务（不是直接导航）"
        />
        <DistanceSlider
          value={pickDistance}
          onChange={(km) => {
            setPickDistance(km);
            setPreferences((prev) => ({ ...prev, defaultDistance: km }));
          }}
        />
        <p className="bottle-type-summary">
          当前：<strong>{bottleTypeLabel}</strong>
          {subConfig.desc ? ` — ${subConfig.desc}` : ''}
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleRefresh}
          disabled={refreshCooldown > 0}
          style={{ marginTop: '8px', width: '100%', fontSize: '13px' }}
        >
          {refreshCooldown > 0
            ? `🌊 海面刷新（${refreshCooldown}s）`
            : `🌊 手动刷新海面（补满 ${BOTTLE_CONFIG.REFRESH_FILL} 只）`}
        </button>
      </section>

      <div style={{ padding: '8px 16px 24px', textAlign: 'center' }}>
        <button
          type="button"
          className={`bottle-pick-ring ${SCENE_RING_CLASS[scene] || ''} ${ringAnim}`}
          onClick={handlePickBottle}
          disabled={!canPick}
          style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            fontSize: '17px',
            fontWeight: 'bold',
            whiteSpace: 'pre-line',
            lineHeight: 1.35,
            cursor: canPick ? 'pointer' : 'not-allowed',
            opacity: canPick ? 1 : 0.65,
          }}
        >
          {isRevealing
            ? '捞取中…'
            : currentStock <= 0
              ? '海面暂呒没瓶\n等一歇或点刷新'
              : `捞一只\n${bottleTypeLabel}`}
        </button>

        {lastPick && (
          <div style={{ marginTop: '24px', textAlign: 'left' }}>
            <button type="button" className="bottle-throw-back-btn" onClick={handleThrowBack}>
              🌊 扔回海里（扑通一声，再捞一只）
            </button>
            {lastPick.empty ? (
              <div className="bottle-empty-card">
                <p
                  style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: 'var(--color-secondary)',
                  }}
                >
                  {lastPick.noStock ? '📭 这类暂呒没瓶' : '🫙 空瓶一只'}
                </p>
                <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>
                  {lastPick.fortuneText}
                </p>
                {lastPick.fortune?.sign && (
                  <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                    {lastPick.fortune.sign}：{lastPick.fortune.text}
                  </p>
                )}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '8px 0 0 0',
                    fontSize: '10px',
                    color: '#bbb',
                    borderTop: '1px dashed #eee',
                    marginTop: '12px',
                  }}
                >
                  AI生成内容仅供参考，具体以商家实际情况为准
                </div>
              </div>
            ) : (
              <>
                <div className="bottle-result-banner">
                  <span>✨ 捞到啦</span>
                  {showTodaySign && (
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '11px',
                        color: '#E65100',
                        fontWeight: 'bold',
                      }}
                    >
                      今日签文
                    </span>
                  )}
                  {lastPick.fortuneText && (
                    <p className="bottle-fortune-snippet">{lastPick.fortuneText}</p>
                  )}
                  {lastPick.fortune?.source?.label && (
                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#999' }}>
                      📌 来源：{lastPick.fortune.source.label}
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn btn-mosaic bottle-detail-cta"
                    onClick={() => openDetail(lastPick.data)}
                  >
                    走进这家店看看 →
                  </button>
                  <p className="bottle-detail-cta-hint">
                    环境 · 价格 · 服务 · 店家介绍（导航在详情最下面）
                  </p>
                </div>
                <ValueCard
                  data={lastPick.data}
                  mode={preferences.defaultMode}
                  isCompared={compareList.some((i) => i.id === lastPick.data?.id)}
                  onToggleCompare={toggleCompare}
                  isFavorited={isFavorite(lastPick.data)}
                  onToggleFavorite={toggleFavorite}
                  onOpen={openDetail}
                />
                {lastPick.data?.fortune?.text && (
                  <p
                    style={{
                      margin: '10px 0 0',
                      fontSize: '12px',
                      fontStyle: 'italic',
                      color: '#888',
                      padding: '0 4px',
                    }}
                  >
                    {lastPick.data.fortune.sign}：{lastPick.data.fortune.text}
                  </p>
                )}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '8px 0 0 0',
                    fontSize: '10px',
                    color: '#bbb',
                    borderTop: '1px dashed #eee',
                    marginTop: '12px',
                  }}
                >
                  AI生成内容仅供参考，具体以商家实际情况为准
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {detailItem && (
        <DealDetailSheet
          item={detailItem}
          userLocation={userLocation}
          onClose={() => setDetailItem(null)}
          isFavorited={isFavorite(detailItem)}
          onToggleFavorite={toggleFavorite}
          isCompared={compareList.some((i) => i.id === detailItem.id)}
          onToggleCompare={toggleCompare}
          fromBottle
          fortune={lastPick?.data?.fortune || lastPick?.fortune}
        />
      )}
    </div>
  );
}
