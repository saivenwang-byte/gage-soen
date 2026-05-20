import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import ValueCard from '../components/ValueCard';
import CompareModal from '../components/CompareModal';
import DealDetailSheet from '../components/DealDetailSheet';
import DateCalendar from '../components/DateCalendar';
import HeadcountPicker from '../components/HeadcountPicker';
import SceneSubPicker from '../components/SceneSubPicker';
import DistanceSlider from '../components/DistanceSlider';
import LocationStatusBar from '../components/LocationStatusBar';
import SearchCriteriaSummary from '../components/SearchCriteriaSummary';
import DataMaturityBanner from '../components/DataMaturityBanner';
import AiBoundaryHint from '../components/AiBoundaryHint';
import { normalizeDeal } from '../utils/normalizeDeal';
import { getSubcategoryConfig, SCENE_TAXONOMY } from '../data/sceneTaxonomy';
import { todayYMD, addDays } from '../utils/dateUtils';

function formatSearchTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function AoSoPage() {
  const {
    searchResults,
    searchLoading,
    searchDeals,
    preferences,
    setPreferences,
    compareList,
    compareMessage,
    setCompareMessage,
    toggleCompare,
    toggleFavorite,
    isFavorite,
    searchError,
    clearCompare,
    removeFromCompare,
    lastSearchAt,
    usingLocalData,
    searchMode,
    searchWarnings,
    searchDealsLive,
    userLocation,
    locationLoading,
    refreshUserLocation,
    aosoSearchRequest,
  } = useApp();

  const [scene, setScene] = useState('all');
  const [subCategory, setSubCategory] = useState('all');
  const [mode, setMode] = useState(preferences.defaultMode);
  const [showFilters, setShowFilters] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [headcount, setHeadcount] = useState(preferences.defaultPeople);
  const [dateFrom, setDateFrom] = useState(todayYMD());
  const [dateTo, setDateTo] = useState(todayYMD());
  const [nights, setNights] = useState(1);
  const [searchDistance, setSearchDistance] = useState(preferences.defaultDistance);
  const [keyword, setKeyword] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [stayUseDates, setStayUseDates] = useState(false);
  const [showStayOptional, setShowStayOptional] = useState(false);
  const resultsRef = useRef(null);

  const isStay = scene === 'stay';
  const showHeadcount = scene === 'all' || (isStay && stayUseDates);
  const showDateFilters = !isStay && showFilters;
  const stayDiscoveryMode = isStay && !stayUseDates;

  const runCuratedSearch = useCallback(() => {
    if (!userLocation?.lat) return;
    setHasSearched(true);
    searchDeals({
      scene,
      subCategory,
      keyword,
      mode,
      people: headcount,
      nights: isStay && stayUseDates ? nights : undefined,
      distance: searchDistance,
      dateFrom: isStay && !stayUseDates ? undefined : dateFrom || undefined,
      dateTo: isStay && !stayUseDates ? undefined : isStay ? dateTo : dateFrom,
    });
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, [
    userLocation,
    scene,
    subCategory,
    keyword,
    mode,
    headcount,
    nights,
    isStay,
    searchDistance,
    dateFrom,
    dateTo,
    stayUseDates,
    searchDeals,
  ]);

  const runLiveSearch = useCallback(() => {
    if (!userLocation?.lat) return;
    setHasSearched(true);
    searchDealsLive({
      scene,
      subCategory,
      keyword,
      mode,
      people: headcount,
      nights: isStay && stayUseDates ? nights : undefined,
      distance: searchDistance,
      dateFrom: isStay && !stayUseDates ? undefined : dateFrom || undefined,
      dateTo: isStay && !stayUseDates ? undefined : isStay ? dateTo : dateFrom,
    });
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, [
    userLocation,
    scene,
    subCategory,
    keyword,
    mode,
    headcount,
    nights,
    isStay,
    searchDistance,
    dateFrom,
    dateTo,
    stayUseDates,
    searchDealsLive,
  ]);

  useEffect(() => {
    if (!aosoSearchRequest || locationLoading || !userLocation) return;
    if (aosoSearchRequest.keyword != null) setKeyword(aosoSearchRequest.keyword);
    if (aosoSearchRequest.distance) setSearchDistance(aosoSearchRequest.distance);
    if (aosoSearchRequest.mode) setMode(aosoSearchRequest.mode);
    if (aosoSearchRequest.scene) {
      setScene(aosoSearchRequest.scene);
      setSubCategory('all');
    }
    setHasSearched(true);
    searchDeals({
      scene: aosoSearchRequest.scene || scene,
      subCategory: 'all',
      keyword: aosoSearchRequest.keyword || '',
      distance: aosoSearchRequest.distance ?? searchDistance,
    });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 400);
  }, [aosoSearchRequest]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubChange = (key) => {
    clearCompare();
    setSubCategory(key);
    setHasSearched(false);
  };

  const openDetail = (item) => {
    setDetailItem(item);
  };

  const handleSceneChange = (key) => {
    clearCompare();
    setScene(key);
    setSubCategory('all');
    setHasSearched(false);
    if (key === 'stay') {
      setStayUseDates(false);
      setShowStayOptional(false);
    } else {
      setStayUseDates(false);
      setShowStayOptional(false);
    }
  };

  const subConfig = getSubcategoryConfig(scene, subCategory);
  const subLabel = subConfig.label;
  const subDesc = subConfig.desc || '';
  const sceneLabel = SCENE_TAXONOMY[scene]?.label || '全部';

  const onDateChange = (payload) => {
    if (payload.dateFrom) setDateFrom(payload.dateFrom);
    if (payload.dateTo) setDateTo(payload.dateTo);
    if (payload.nights != null) setNights(payload.nights);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: '100px' }}>
      <header className="header-mosaic">
        <h1 style={{ margin: 0, fontSize: '22px', fontFamily: 'var(--font-title)', color: 'var(--color-text)' }}>
          ⚡ 奥扫
        </h1>
        <p className="header-sub" style={{ margin: '6px 0 14px' }}>
          {isStay
            ? '先种草：看环境、距离、优惠，再决定要不要查档期（不是携程式先选日期）'
            : `奥扫！帮侬寻附近 ${searchDistance} 公里顶嘎算的优惠。`}
        </p>

        <LocationStatusBar
          userLocation={userLocation}
          loading={locationLoading}
          onRefresh={() => refreshUserLocation(() => runCuratedSearch())}
        />

        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runCuratedSearch()}
          placeholder="搜民宿、火锅、咖啡…可留空"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 14px',
            marginBottom: '10px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '14px',
          }}
        />

        {isStay && (
          <p className="aoso-stay-discovery-banner">
            <strong>种草模式：</strong>先挑喜欢的店（类型、距离、环境、实拍），喜欢再考虑哪天住。日期是可选筛选，不是第一步。
          </p>
        )}

        <p className="aoso-steps-hint">
          {isStay
            ? '① 选民宿类型 → ② 距离与排序 → ③ 开始搜索浏览 → ④ 可选：再查某几天能不能住'
            : '① 选分类 → ② 可选日期人数 → ③ 排序 → ④ 点「开始搜索」'}
        </p>

        <SceneSubPicker
          scene={scene}
          subCategory={subCategory}
          onSceneChange={handleSceneChange}
          onSubChange={handleSubChange}
          hint={
            isStay
              ? '① 先选类型：看这类民宿有什么店（不会立刻搜）'
              : '先选分类（不会立刻出结果）；选好后继续往下'
          }
          extraActions={
            !isStay ? (
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                style={{
                  marginLeft: 'auto',
                  padding: '6px 12px',
                  borderRadius: '14px',
                  border: '1px solid rgba(0,0,0,0.2)',
                  background: showFilters ? '#fff' : 'transparent',
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {showFilters ? '收起日期人数 ▲' : '日期·人数 ▼'}
              </button>
            ) : null
          }
        />

        {showDateFilters && (
          <div className="aoso-filter-panel">
            <p className="aoso-filter-step-label">② 出行日期与人数（可选）</p>
            <DateCalendar
              mode="single"
              dateFrom={dateFrom}
              dateTo={dateFrom}
              onChange={onDateChange}
              label="出行日期"
            />
            <HeadcountPicker value={headcount} onChange={setHeadcount} label="人数" />
          </div>
        )}

        <DistanceSlider
          label={isStay ? '② 附近多远' : '搜索范围'}
          value={searchDistance}
          onChange={(km) => {
            setSearchDistance(km);
            setPreferences((prev) => ({ ...prev, defaultDistance: km }));
          }}
        />

        <div className="aoso-filter-panel aoso-mode-row">
          <p className="aoso-filter-step-label">{isStay ? '② 怎么排序看' : '③ 排序方式'}</p>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            aria-label="排序方式"
            className="aoso-mode-select"
          >
            <option value="cheap">💰 比便宜</option>
            <option value="value">⚖️ 比性价比</option>
            <option value="experience">✨ 比质价比</option>
          </select>
        </div>

        {isStay && (
          <p className="stay-group-hint-inline">
            找「结伴礼遇」：民宿里点 <strong>结伴礼遇</strong>；点开详情后按人数看人均礼遇价（不必先选日期）。
          </p>
        )}

        <SearchCriteriaSummary
          scene={scene}
          subLabel={subLabel}
          mode={mode}
          headcount={headcount}
          dateFrom={dateFrom}
          dateTo={dateTo}
          isStay={isStay}
          searchDistance={searchDistance}
          hasSearched={hasSearched}
          stayDiscoveryMode={stayDiscoveryMode}
          showStayDates={stayUseDates}
        />

        <p className="aoso-search-mode-hint">
          以你手机定位为中心，在 {searchDistance} 公里内找店（奉贤字样仅测试用，上线跟您走）。
        </p>
        <div className="aoso-search-actions">
          <button
            type="button"
            onClick={runCuratedSearch}
            disabled={searchLoading || !userLocation?.lat}
            className="btn btn-mosaic aoso-search-btn"
          >
            {searchLoading && searchMode === 'curated'
              ? '加载中…'
              : hasSearched && searchMode === 'curated'
                ? '重新逛收录'
                : isStay
                  ? '③ 逛街坊收录'
                  : '④ 逛街坊收录'}
          </button>
          <button
            type="button"
            onClick={runLiveSearch}
            disabled={searchLoading || !userLocation?.lat}
            className="btn btn-secondary aoso-search-btn-live"
            title="汇总网上已公开优惠，可能较慢"
          >
            {searchLoading && searchMode === 'live' ? '公开源搜罗中…' : '搜周边公开源'}
          </button>
        </div>

        {isStay && (
          <>
            <button
              type="button"
              className="aoso-optional-toggle"
              onClick={() => setShowStayOptional((v) => !v)}
            >
              {showStayOptional ? '▲ 收起' : '▼'} ④ 可选：只想查某几天能不能住？（订房才用，种草可跳过）
            </button>
            {showStayOptional && (
              <div className="aoso-filter-panel aoso-optional-panel">
                <p className="aoso-filter-step-label">档期筛选（可选）</p>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                  勾选后按入住离店筛店；不勾选则列出该类民宿，方便先看环境、距离再决定。
                </p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={stayUseDates}
                    onChange={(e) => {
                      setStayUseDates(e.target.checked);
                      setHasSearched(false);
                    }}
                  />
                  按下面日期筛选（类似携程；不勾=纯种草浏览）
                </label>
                {stayUseDates && (
                  <>
                    <DateCalendar
                      mode="range"
                      dateFrom={dateFrom}
                      dateTo={dateTo}
                      onChange={onDateChange}
                      label="入住 / 离店"
                    />
                    <HeadcountPicker
                      value={headcount}
                      onChange={setHeadcount}
                      label="入住人数（礼遇价测算）"
                    />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </header>

      <div ref={resultsRef} style={{ padding: '16px' }}>
        {compareMessage && (
          <p className="compare-hint-bar" role="alert">
            {compareMessage}
            <button
              type="button"
              onClick={() => setCompareMessage('')}
              style={{
                marginLeft: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              知道了
            </button>
          </p>
        )}
        {import.meta.env.DEV && usingLocalData && !searchLoading && searchResults.length > 0 && (
          <p className="dev-data-hint" role="status">
            开发提示：当前列表来自本地精选包（后端未连上时也会先展示这些店，不影响浏览详情）。
          </p>
        )}
        {searchLoading && (
          <p style={{ textAlign: 'center', color: '#888' }}>帮侬搜罗中…稍等一歇歇 ☕</p>
        )}
        {hasSearched && !searchLoading && (
          <>
            <DataMaturityBanner
              searchMode={searchMode}
              usingLocalData={usingLocalData}
              searchWarnings={searchWarnings}
              locationLabel={userLocation?.label || userLocation?.name}
            />
            <AiBoundaryHint style={{ margin: '0 0 12px' }} />
          </>
        )}
        {hasSearched && searchResults.length > 0 && !searchLoading && (
          <p className="hint-bar-warm">
            {isStay
              ? '👆 种草：点卡片看实拍、环境标签、直线距离、结伴礼遇；喜欢再查档期或导航'
              : '👆 点下面白色卡片 → 看店名、距离、地址、实景图、导航'}
          </p>
        )}

        {hasSearched && searchError && !searchLoading && searchResults.length === 0 && (
          <div className="empty-sub-hint">
            <p style={{ textAlign: 'center', color: 'var(--color-danger)', fontSize: '14px', margin: '0 0 12px' }}>
              {searchError}
            </p>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', margin: 0 }}>
              试试同场景下的其他标签：
            </p>
            <div className="subcategory-row" style={{ marginTop: 10, justifyContent: 'center' }}>
              {(SCENE_TAXONOMY[scene]?.subcategories || [])
                .filter((s) => s.key !== subCategory)
                .slice(0, 4)
                .map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      handleSubChange(s.key);
                      setHasSearched(false);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: '1px solid var(--color-primary)',
                      background: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
            </div>
          </div>
        )}
        {hasSearched && !searchLoading && searchResults.length > 0 && (
          <>
            <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--color-text)', fontWeight: 600 }}>
              {isStay
                ? `「${subLabel}」种草 ${searchResults.length} 家 · 先挑喜欢的，再点开详情`
                : `「${subLabel}」筛出 ${searchResults.length} 家 · 点卡片看详情`}
            </p>
            {searchResults.some((d) => d.relaxedSubcategory) && (
              <p
                style={{
                  margin: '0 0 10px',
                  padding: '8px 12px',
                  fontSize: '12px',
                    color: 'var(--brand-green)',
                    background: 'var(--brand-green-light)',
                  borderRadius: '8px',
                }}
              >
                同场景相近好店一并展示，方便多挑几家对比
              </p>
            )}
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#888' }}>
              {sceneLabel} · {subLabel} · 共 {searchResults.length} 条
              {lastSearchAt ? ` · ${formatSearchTime(lastSearchAt)}` : ''}
            </p>
          </>
        )}
        {!searchLoading && !searchError && searchResults.length === 0 && !hasSearched && (
          <p className="aoso-empty-prompt">
            {isStay ? (
              <>
                请先选民宿类型、距离和排序，再点 <strong>「逛街坊收录」</strong>。不用先选日期——那是订房时才需要的可选步骤。
              </>
            ) : (
              <>
                请先在上方选分类、距离和排序，再点 <strong>「逛街坊收录」</strong>或<strong>「搜周边公开源」</strong>，店铺会出现在这里。
              </>
            )}
          </p>
        )}
        {!searchLoading && !searchError && searchResults.length === 0 && hasSearched && (
          <p style={{ textAlign: 'center', color: '#aaa', padding: '24px 0' }}>
            没有匹配的店，试试放宽距离或换分类
          </p>
        )}
        {hasSearched &&
          searchResults.map((raw) => {
          const item = normalizeDeal(raw);
          return (
            <ValueCard
              key={item.id}
              data={item}
              mode={mode}
              headcount={headcount}
              nights={isStay ? nights : 1}
              isCompared={compareList.some((i) => i.id === item.id)}
              onToggleCompare={toggleCompare}
              isFavorited={isFavorite(item)}
              onToggleFavorite={toggleFavorite}
              onOpen={openDetail}
            />
          );
        })}
        {compareList.length > 0 && (
          <div
            style={{
              position: 'fixed',
              bottom: '72px',
              left: '16px',
              right: '16px',
              background: 'var(--brand-stone)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px',
              zIndex: 90,
            }}
          >
            <span>已选 {compareList.length}/3</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowCompare(true)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                查看对比
              </button>
              <button
                type="button"
                onClick={clearCompare}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                清空
              </button>
            </div>
          </div>
        )}
      </div>

      {showCompare && (
        <CompareModal
          items={compareList}
          userLocation={userLocation}
          onClose={() => setShowCompare(false)}
          onOpenDetail={openDetail}
          onRemove={removeFromCompare}
        />
      )}

      {detailItem && (
        <DealDetailSheet
          item={detailItem}
          userLocation={userLocation}
          headcount={headcount}
          nights={isStay ? nights : 1}
          onClose={() => setDetailItem(null)}
          isFavorited={isFavorite(detailItem)}
          onToggleFavorite={toggleFavorite}
          isCompared={compareList.some((i) => i.id === detailItem.id)}
          onToggleCompare={toggleCompare}
        />
      )}
    </div>
  );
}
