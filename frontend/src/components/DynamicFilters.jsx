/** 根据场景动态展示筛选条件 */
import DateCalendar from './DateCalendar';
import HeadcountPicker from './HeadcountPicker';

export default function DynamicFilters({ scenes, filters, onChange, mapCenter }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const has = (s) => scenes.includes('all') || scenes.includes(s);

  const needsPeople =
    has('dining') ||
    has('coffee') ||
    has('stay') ||
    has('entertainment') ||
    has('life') ||
    scenes.includes('all');
  const isStayOnly =
    (has('stay') && !has('dining') && !has('coffee') && !has('entertainment') && !has('life')) ||
    (scenes.includes('all') && has('stay'));
  const isDining = has('dining') || has('coffee');
  const onlyShopping =
    scenes.includes('shopping') &&
    !has('dining') &&
    !has('coffee') &&
    !has('stay') &&
    !has('entertainment') &&
    !has('life') &&
    !scenes.includes('all');

  const calendarMode =
    has('stay') && (scenes.includes('stay') || scenes.includes('all')) ? 'range' : 'single';
  const calendarLabel = has('stay') && calendarMode === 'range'
    ? '入住 / 离店日期'
    : isDining
      ? '用餐日期（点选一天即锁定）'
      : '出行日期（可选）';

  return (
    <div className="card filters-stack">
      <DateCalendar
        mode={calendarMode}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        label={calendarLabel}
        onChange={(patch) => set(patch)}
      />

      {needsPeople && !onlyShopping && (
        <HeadcountPicker
          value={filters.headcount}
          onChange={(headcount) => set({ headcount })}
          label={has('stay') ? '入住人数' : isDining ? '用餐 / 聚餐人数' : '游玩人数'}
        />
      )}

      {onlyShopping && (
        <p className="field-hint card-inset">购物可不选日期和人数，直接搜优惠即可</p>
      )}

      <h3 className="filter-section-title">其他条件</h3>

      <div className="field">
        <label>区域</label>
        <select value={filters.town} onChange={(e) => set({ town: e.target.value })}>
          <option value="all">奉贤全区</option>
          <option value="海湾镇">海湾镇</option>
          <option value="南桥镇">南桥镇</option>
          <option value="奉城镇">奉城镇</option>
          <option value="庄行镇">庄行镇</option>
        </select>
      </div>

      <div className="field">
        <label>人均预算上限（元）</label>
        <input
          type="number"
          placeholder="不限"
          value={filters.budgetPerCapita || ''}
          onChange={(e) => set({ budgetPerCapita: e.target.value })}
        />
      </div>

      <div className="field">
        <label>排序方式</label>
        <select value={filters.sortBy} onChange={(e) => set({ sortBy: e.target.value })}>
          <option value="value">性价比优先</option>
          <option value="distance">距地图中心最近</option>
          <option value="saving">优惠力度最大</option>
          <option value="price_asc">价格最低</option>
          <option value="blogger">博主最热</option>
        </select>
      </div>

      <div className="field hint">
        地图中心：{mapCenter?.name || '奉贤海湾旅游度假区'}
        <br />
        <small>可在地图上点击重新选点</small>
      </div>

      <div className="field">
        <label>信息来源</label>
        <select value={filters.sourcePref} onChange={(e) => set({ sourcePref: e.target.value })}>
          <option value="all">全部（平台+博主）</option>
          <option value="platform">传统平台</option>
          <option value="social">社交媒体/UP主</option>
        </select>
      </div>

      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={filters.bloggerOnly}
            onChange={(e) => set({ bloggerOnly: e.target.checked })}
          />
          {' '}只看有博主推荐
        </label>
      </div>

      <div className="field">
        <label>博主最低点赞</label>
        <input
          type="number"
          placeholder="0"
          value={filters.minLikes || ''}
          onChange={(e) => set({ minLikes: e.target.value })}
        />
      </div>

      {has('stay') && filters.dateFrom && filters.dateTo && filters.dateFrom !== filters.dateTo && (
        <div className="field">
          <label>入住晚数（随日历自动算，可改）</label>
          <input
            type="number"
            min={1}
            value={filters.nights}
            onChange={(e) => set({ nights: +e.target.value })}
          />
        </div>
      )}

      {(has('dining') || has('coffee')) && (
        <>
          <h3 className="filter-section-title">餐饮 / 咖啡</h3>
          <div className="field">
            <label>菜系 / 品类</label>
            <input
              placeholder="本帮菜、烧烤、咖啡…"
              value={filters.cuisine || ''}
              onChange={(e) => set({ cuisine: e.target.value })}
            />
          </div>
        </>
      )}

      {has('shopping') && (
        <>
          <h3 className="filter-section-title">购物</h3>
          <div className="field">
            <label>商场 / 平台</label>
            <input
              placeholder="宝龙、百联、盒马…"
              value={filters.mallName || ''}
              onChange={(e) => set({ mallName: e.target.value })}
            />
          </div>
        </>
      )}
    </div>
  );
}
