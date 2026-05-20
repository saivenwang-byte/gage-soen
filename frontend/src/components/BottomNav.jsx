/** PRD §6：三 Tab — 奥扫 / 暇兜兜 / 我的 */
const TABS = [
  { key: 'aoso', label: '奥扫', icon: '⚡' },
  { key: 'xiadoudou', label: '暇兜兜', icon: '🍾' },
  { key: 'profile', label: '我的', icon: '👤' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav-brand" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom, 0)', zIndex: 200 }}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={isActive ? 'bottom-nav-tab-active' : ''}
            style={{
              flex: 1,
              padding: '10px 4px 8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: isActive ? undefined : '#999',
              fontWeight: isActive ? undefined : 'normal',
              fontSize: '11px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
