/** 场景多选 */
export default function SceneSelector({ scenes, selected, onChange }) {
  const toggle = (id) => {
    if (id === 'all') {
      onChange(['all']);
      return;
    }
    let next = selected.filter((s) => s !== 'all');
    if (next.includes(id)) next = next.filter((s) => s !== id);
    else next = [...next, id];
    if (!next.length) next = ['all'];
    onChange(next);
  };

  return (
    <div className="chip-row">
      <button type="button" className={`chip ${selected.includes('all') ? 'active' : ''}`} onClick={() => toggle('all')}>
        全部
      </button>
      {scenes.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`chip ${selected.includes(s.id) ? 'active' : ''} ${s.disabled ? 'disabled' : ''}`}
          onClick={() => !s.disabled && toggle(s.id)}
        >
          {s.icon} {s.name}
        </button>
      ))}
    </div>
  );
}
