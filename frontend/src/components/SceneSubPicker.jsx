import { SCENE_KEYS, SCENE_TAXONOMY } from '../data/sceneTaxonomy';

const SCENE_TAB_STYLE = (active) => ({
  padding: '6px 12px',
  borderRadius: '14px',
  border: active ? '2px solid var(--brand-honey)' : '1px solid rgba(74, 69, 64, 0.15)',
  background: active ? '#fff' : 'transparent',
  fontSize: '12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

const SUB_STYLE = (active) => ({
  padding: '8px 14px',
  borderRadius: '20px',
  border: active ? '2px solid var(--color-primary)' : '1px solid #ddd',
  background: active ? 'var(--color-highlight-bg)' : '#fff',
  fontSize: '13px',
  cursor: 'pointer',
  flexShrink: 0,
});

/**
 * 场景 Tab + 子类标签（取代关键词输入框）
 */
export default function SceneSubPicker({
  scene,
  subCategory,
  onSceneChange,
  onSubChange,
  extraActions,
  hint = '点标签筛选 · 下方出现店铺卡片后，点卡片看详情（不是点这里出详情）',
}) {
  const config = SCENE_TAXONOMY[scene] || SCENE_TAXONOMY.all;

  return (
    <div className="scene-sub-picker">
      <div className="scene-tabs" role="tablist">
        {SCENE_KEYS.map((key) => {
          const s = SCENE_TAXONOMY[key];
          const active = scene === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSceneChange(key)}
              style={SCENE_TAB_STYLE(active)}
            >
              {s.icon} {s.label}
            </button>
          );
        })}
        {extraActions}
      </div>

      <p className="scene-sub-hint">{hint}</p>

      <div className="subcategory-row" role="group" aria-label={`${config.label}分类`}>
        {config.subcategories.map((sub) => (
          <button
            key={sub.key}
            type="button"
            style={SUB_STYLE(subCategory === sub.key)}
            onClick={() => onSubChange(sub.key)}
          >
            {sub.label}
          </button>
        ))}
      </div>
    </div>
  );
}
