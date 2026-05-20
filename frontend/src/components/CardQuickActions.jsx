/**
 * 卡片图上的快捷操作：收藏 ♥、比价 ⚖（类似小红书角标）
 */
export default function CardQuickActions({ isFavorited, isCompared, onFavorite, onCompare }) {
  return (
    <div className="card-quick-actions" onClick={(e) => e.stopPropagation()}>
      {onFavorite && (
        <button
          type="button"
          className={`card-action-btn card-action-fav${isFavorited ? ' is-active' : ''}`}
          onClick={onFavorite}
          aria-label={isFavorited ? '取消收藏' : '收藏'}
          title={isFavorited ? '已收藏' : '收藏'}
        >
          {isFavorited ? '♥' : '♡'}
        </button>
      )}
      {onCompare && (
        <button
          type="button"
          className={`card-action-btn card-action-compare${isCompared ? ' is-active' : ''}`}
          onClick={onCompare}
          aria-label={isCompared ? '取消对比' : '加入对比'}
          title={isCompared ? '已加入对比' : '加入对比（最多3家）'}
        >
          ⚖
        </button>
      )}
    </div>
  );
}
