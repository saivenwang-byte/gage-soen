import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { config } from '../brand';
import { getSearchResult } from '../api/client';
import DealCard from '../components/DealCard';
import CompareModal from '../components/CompareModal';
import MapPicker from '../components/MapPicker';

export default function ResultsPage() {
  const { jobId } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [compare, setCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [mapCenter, setMapCenter] = useState(state?.mapCenter);

  useEffect(() => {
    const load = () =>
      getSearchResult(jobId).then((d) => {
        setData(d);
        if (d.mapCenter) setMapCenter(d.mapCenter);
      });
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [jobId]);

  const toggle = (item) => {
    setCompare((prev) =>
      prev.find((x) => x.id === item.id) ? prev.filter((x) => x.id !== item.id) : [...prev, item]
    );
  };

  if (!data) return <p className="page">加载结果…</p>;

  return (
    <>
      <header className="app-header">
        <p className="brand-mark">介嘎算</p>
        <h1>嘎算榜单 ({data.count})</h1>
        <p>{data.warnings?.join(' · ')}</p>
      </header>
      <main className="page">
        {mapCenter && (
          <section className="card">
            <MapPicker center={mapCenter} items={data.results} height={220} />
          </section>
        )}
        {data.results?.map((item) => (
          <DealCard
            key={item.id + item.platform}
            item={item}
            selected={!!compare.find((x) => x.id === item.id)}
            onToggle={toggle}
            onOpen={(it) => nav('/detail', { state: { item: it } })}
          />
        ))}
        {!data.results?.length && <p>{config.dialect.empty}</p>}
        {data.count > 0 && (
          <Link to={`/map/${jobId}`} className="btn btn-secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8, textDecoration: 'none' }}>
            地图看全部
          </Link>
        )}
      </main>
      {compare.length > 0 && (
        <footer className="compare-bar">
          <button type="button" className="btn" onClick={() => setShowCompare(true)}>
            对比已选 ({compare.length})
          </button>
        </footer>
      )}
      {showCompare && <CompareModal items={compare} onClose={() => setShowCompare(false)} />}
    </>
  );
}
