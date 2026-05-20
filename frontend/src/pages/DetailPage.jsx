import { useLocation, useNavigate } from 'react-router-dom';

export default function DetailPage() {
  const { state } = useLocation();
  const nav = useNavigate();
  const item = state?.item;
  if (!item) return <p className="page">无数据</p>;

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    alert('已复制');
  };

  return (
    <>
      <header className="app-header">
        <h1>{item.merchantName}</h1>
        <p>{item.address}</p>
      </header>
      <main className="page">
        <section className="card">
          <p>人均 <strong>¥{item.perCapita}</strong> · {item.distanceText}</p>
          <p>优惠：{item.promoText}</p>
          <p>说明：{item.promoNote}</p>
          <p>来源：{item.platformLabel || item.platform}</p>
          {item.sourceUrl && (
            <button type="button" className="btn-secondary btn" onClick={() => window.open(item.sourceUrl, '_blank')}>
              打开原链接
            </button>
          )}
        </section>
        {item.bloggers?.map((b) => (
          <section key={b.nickname} className="card">
            <h3>{b.platform} · {b.nickname}</h3>
            <p>赞 {b.likes} · 粉 {b.followers}</p>
            <p>{b.summary}</p>
            {b.promoCode && (
              <button type="button" className="btn-secondary btn" onClick={() => copy(b.promoCode)}>
                复制暗号 {b.promoCode}
              </button>
            )}
          </section>
        ))}
        <button type="button" className="btn" onClick={() => nav(-1)}>返回</button>
      </main>
    </>
  );
}
