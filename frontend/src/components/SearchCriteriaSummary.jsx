import { SCENE_TAXONOMY } from '../data/sceneTaxonomy';
import { formatDisplay } from '../utils/dateUtils';

const MODE_LABEL = {
  cheap: '比便宜',
  value: '比性价比',
  experience: '比质价比',
};

/**
 * 已选条件一览（搜之前也能看见自己选了啥）
 */
export default function SearchCriteriaSummary({
  scene,
  subLabel,
  mode,
  headcount,
  dateFrom,
  dateTo,
  isStay,
  searchDistance,
  hasSearched,
  stayDiscoveryMode = false,
  showStayDates = false,
}) {
  const sceneLabel = SCENE_TAXONOMY[scene]?.label || '全部';
  const dateText =
    showStayDates || !isStay
      ? isStay
        ? `${formatDisplay(dateFrom)} → ${formatDisplay(dateTo)}`
        : formatDisplay(dateFrom)
      : null;

  const pendingHint = isStay
    ? stayDiscoveryMode
      ? '已选条件（点「开始搜索」浏览店铺，不是订房）'
      : '已选条件（含档期筛选）'
    : '已选条件（点下方「开始搜索」才出店铺列表）';

  return (
    <section className="search-criteria-summary" aria-label="已选搜索条件">
      <p className="search-criteria-title">{hasSearched ? '当前浏览条件' : pendingHint}</p>
      <div className="search-criteria-chips">
        <span className="criteria-chip">{sceneLabel}</span>
        {subLabel && subLabel !== '全部' && scene !== 'all' && (
          <span className="criteria-chip criteria-chip-accent">{subLabel}</span>
        )}
        <span className="criteria-chip">{MODE_LABEL[mode] || mode}</span>
        <span className="criteria-chip">{searchDistance} 公里内</span>
        {stayDiscoveryMode && (
          <span className="criteria-chip criteria-chip-muted">先种草 · 不限日期</span>
        )}
        {(showStayDates || (!isStay && scene === 'all')) && headcount > 0 && (
          <span className="criteria-chip">{headcount} 人</span>
        )}
        {dateText && <span className="criteria-chip">{dateText}</span>}
      </div>
    </section>
  );
}
