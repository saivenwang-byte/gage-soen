const SCENE_ICON = {
  stay: '🏨',
  dining: '🍜',
  coffee: '☕',
  entertainment: '🎯',
  life: '🏸',
  shopping: '🛒',
};

export default function DealCard({ item, selected, onToggle, onOpen }) {
  return (
    <article className="card deal-card" onClick={() => onOpen(item)}>
      <header className="deal-head">
        <span className="scene-icon">{SCENE_ICON[item.scene] || '📍'}</span>
        <h3>{item.merchantName}</h3>
        {item.hasBlogger && <span className="badge-blogger">博主推荐</span>}
      </header>
      {item.suspectedAd && <p className="warn-ad">疑似同质推广文案，请自行判断</p>}
      <p className="addr">{item.address}</p>
      {item.distanceText && <p className="dist">距{item.centerName} {item.distanceText}</p>}
      {item.promoText && <p className="promo">{item.promoText}</p>}
      <p className="price-row">
        <strong>人均 ¥{item.perCapita}</strong>
        {item.savingPercent > 0 && <span className="save">省{item.savingPercent}%</span>}
        <span className="score">划算 {item.valueScore}</span>
      </p>
      {item.bloggerCount > 1 && <p className="meta">{item.bloggerCount} 位博主推荐</p>}
      <label className="compare-check" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={() => onToggle(item)} /> 加入对比
      </label>
    </article>
  );
}
