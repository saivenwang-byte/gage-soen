import { useMemo, useState } from 'react';
import {
  getMonthGrid,
  parseYMD,
  toYMD,
  todayYMD,
  formatDisplay,
  daysBetween,
  weekendRange,
  addDays,
} from '../utils/dateUtils';

const WEEK_HEADERS = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 日历选日
 * mode: single 选一天 | range 入住-离店（住宿）
 */
export default function DateCalendar({
  mode = 'single',
  dateFrom,
  dateTo,
  onChange,
  maxDaysAhead = 90,
  label = '出行日期',
}) {
  const today = todayYMD();
  const initial = parseYMD(dateFrom || today) || new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [pickStart, setPickStart] = useState(null);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + maxDaysAhead);
    return toYMD(d);
  }, [maxDaysAhead]);

  const cells = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const inRange = (ymd) => {
    if (!dateFrom || !dateTo || mode !== 'range') return false;
    return ymd >= dateFrom && ymd <= dateTo;
  };

  const isDisabled = (ymd) => !ymd || ymd < today || ymd > maxDate;

  const applyRange = (from, to) => {
    const a = from <= to ? from : to;
    const b = from <= to ? to : from;
    onChange({ dateFrom: a, dateTo: b, nights: daysBetween(a, b) });
  };

  const onDayClick = (ymd) => {
    if (isDisabled(ymd)) return;
    if (mode === 'single') {
      onChange({ dateFrom: ymd, dateTo: ymd, lockDate: true });
      setPickStart(null);
      return;
    }
    if (!pickStart) {
      setPickStart(ymd);
      onChange({ dateFrom: ymd, dateTo: ymd, nights: 1 });
      return;
    }
    applyRange(pickStart, ymd);
    setPickStart(null);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const presets = [
    { key: 'today', label: '今天', fn: () => ({ from: today, to: today }) },
    { key: 'tomorrow', label: '明天', fn: () => ({ from: addDays(today, 1), to: addDays(today, 1) }) },
    { key: 'weekend', label: '本周末', fn: weekendRange },
    {
      key: 'week',
      label: '未来7天',
      fn: () => ({ from: today, to: addDays(today, 6) }),
    },
    { key: 'any', label: '不限日期', fn: () => ({ from: '', to: '' }) },
  ];

  const applyPreset = (p) => {
    const { from, to } = p.fn();
    if (!from) {
      onChange({ dateFrom: '', dateTo: '', lockDate: false, nights: 1 });
      return;
    }
    if (mode === 'range' && from !== to) {
      applyRange(from, to);
    } else {
      onChange({
        dateFrom: from,
        dateTo: to || from,
        lockDate: from === to,
        nights: daysBetween(from, to || from),
      });
    }
    setPickStart(null);
    const d = parseYMD(from);
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  };

  const summary =
    dateFrom && dateTo
      ? mode === 'range' && dateFrom !== dateTo
        ? `${formatDisplay(dateFrom)} → ${formatDisplay(dateTo)}（${daysBetween(dateFrom, dateTo)}晚）`
        : `已选：${formatDisplay(dateFrom)}`
      : '请选择日期';

  return (
    <section className="calendar-card">
      <div className="calendar-head">
        <label className="calendar-title">{label}</label>
        <p className="calendar-summary">{summary}</p>
      </div>

      <div className="chip-row calendar-presets">
        {presets.map((p) => (
          <button key={p.key} type="button" className="chip" onClick={() => applyPreset(p)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="calendar-nav">
        <button type="button" className="cal-nav-btn" onClick={prevMonth} aria-label="上个月">
          ‹
        </button>
        <span className="cal-month-label">
          {viewYear}年{viewMonth + 1}月
        </span>
        <button type="button" className="cal-nav-btn" onClick={nextMonth} aria-label="下个月">
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {WEEK_HEADERS.map((w) => (
          <span key={w} className="cal-weekday">
            {w}
          </span>
        ))}
        {cells.map((ymd, i) => {
          if (!ymd) return <span key={`e-${i}`} className="cal-day empty" />;
          const selected = ymd === dateFrom || ymd === dateTo;
          const ranged = inRange(ymd);
          const disabled = isDisabled(ymd);
          const isToday = ymd === today;
          return (
            <button
              key={ymd}
              type="button"
              disabled={disabled}
              className={[
                'cal-day',
                selected && 'selected',
                ranged && !selected && 'in-range',
                isToday && 'today',
                disabled && 'disabled',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onDayClick(ymd)}
            >
              {parseYMD(ymd).getDate()}
            </button>
          );
        })}
      </div>

      {mode === 'range' && (
        <p className="cal-hint">先点入住日，再点离店日；也可点上方「本周末」等快捷项</p>
      )}
      {mode === 'single' && dateFrom && (
        <button
          type="button"
          className="chip lock-date-btn"
          onClick={() => onChange({ dateFrom: '', dateTo: '', lockDate: false })}
        >
          已锁定 {formatDisplay(dateFrom)} · 点击清除
        </button>
      )}
    </section>
  );
}
