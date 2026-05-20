/**
 * 奥扫距离滑块（PRD：场景 Tab + 距离滑块）
 */
const MARKS = [3, 5, 10, 15, 20, 30];

export default function DistanceSlider({ value, onChange, label = '搜索范围' }) {
  let idx = MARKS.findIndex((m) => m >= value);
  if (idx === -1) idx = MARKS.length - 1;
  const display = MARKS[idx] ?? value;

  return (
    <div style={{ marginTop: '10px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}
      >
        <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.55)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text)' }}>{display} 公里</span>
      </div>
      <input
        type="range"
        min={0}
        max={MARKS.length - 1}
        step={1}
        value={idx}
        onChange={(e) => onChange(MARKS[Number(e.target.value)])}
        style={{ width: '100%', accentColor: 'var(--color-primary)' }}
        aria-label={label}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#aaa',
          marginTop: '2px',
        }}
      >
        <span>近</span>
        <span>远</span>
      </div>
    </div>
  );
}
