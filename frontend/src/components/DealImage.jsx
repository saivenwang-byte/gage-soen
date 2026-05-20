import { useState, useMemo } from 'react';

const FALLBACK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect fill="#f0ebe0" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8a6d00" font-size="14" font-family="sans-serif">暂无图片</text></svg>'
  );

/**
 * 店铺图：加载失败时显示占位；enablePreview 时点击放大预览，不跳转外链
 */
export default function DealImage({
  src,
  images,
  alt = '',
  className,
  style,
  enablePreview = false,
}) {
  const gallery = useMemo(() => {
    const list = Array.isArray(images) ? images.filter(Boolean) : [];
    if (list.length) return list;
    return src ? [src] : [];
  }, [src, images]);

  const [failed, setFailed] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const currentSrc = gallery[previewOpen ? previewIndex : 0] || src;
  const url = !currentSrc || failed ? FALLBACK : currentSrc;

  const handleClick = (e) => {
    if (!enablePreview || !gallery.length) return;
    e.stopPropagation();
    setPreviewIndex(0);
    setPreviewOpen(true);
  };

  const goPrev = (e) => {
    e.stopPropagation();
    if (gallery.length < 2) return;
    setPreviewIndex((i) => (i - 1 + gallery.length) % gallery.length);
    setFailed(false);
  };

  const goNext = (e) => {
    e.stopPropagation();
    if (gallery.length < 2) return;
    setPreviewIndex((i) => (i + 1) % gallery.length);
    setFailed(false);
  };

  return (
    <>
      <img
        src={url}
        alt={alt}
        className={className}
        style={{
          ...style,
          cursor: enablePreview && gallery.length ? 'zoom-in' : style?.cursor,
        }}
        loading="lazy"
        onError={() => setFailed(true)}
        onClick={handleClick}
      />
      {previewOpen && enablePreview && (
        <div
          className="deal-image-preview-overlay"
          role="presentation"
          onClick={() => setPreviewOpen(false)}
        >
          {gallery.length > 1 && (
            <button type="button" className="deal-image-preview-nav deal-image-preview-prev" onClick={goPrev}>
              ‹
            </button>
          )}
          <img
            src={url}
            alt={alt}
            className="deal-image-preview-img"
            onClick={(e) => e.stopPropagation()}
          />
          {gallery.length > 1 && (
            <button type="button" className="deal-image-preview-nav deal-image-preview-next" onClick={goNext}>
              ›
            </button>
          )}
          {gallery.length > 1 && (
            <span className="deal-image-preview-counter">
              {previewIndex + 1} / {gallery.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
