/** 人数选择：餐饮/聚餐场景用步进器 + 快捷人数 */
export default function HeadcountPicker({ value, onChange, min = 1, max = 30, label = '用餐人数' }) {
  const presets = [2, 4, 6, 8, 10, 12];

  const set = (n) => onChange(Math.min(max, Math.max(min, n)));

  return (
    <section className="headcount-card">
      <label className="calendar-title">{label}</label>
      <p className="field-hint">人数影响「满几人免几」「人均实付」计算</p>
      <div className="headcount-stepper">
        <button type="button" className="step-btn" onClick={() => set(value - 1)} disabled={value <= min}>
          −
        </button>
        <span className="step-value">
          <strong>{value}</strong> 人
        </span>
        <button type="button" className="step-btn" onClick={() => set(value + 1)} disabled={value >= max}>
          +
        </button>
      </div>
      <div className="chip-row">
        {presets.map((n) => (
          <button
            key={n}
            type="button"
            className={`chip ${value === n ? 'active' : ''}`}
            onClick={() => set(n)}
          >
            {n}人
          </button>
        ))}
      </div>
    </section>
  );
}
