import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSearchResult } from '../api/client';
import MapPicker from '../components/MapPicker';

export default function MapPage() {
  const { jobId } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    getSearchResult(jobId).then(setData);
  }, [jobId]);

  if (!data) return <p className="page">加载地图…</p>;

  return (
    <>
      <header className="app-header">
        <p className="brand-mark">介嘎算</p>
        <h1>嘎算地图</h1>
      </header>
      <main className="page">
        <MapPicker center={data.mapCenter} items={data.results} height={420} />
        <button type="button" className="btn" style={{ marginTop: 12 }} onClick={() => nav(-1)}>
          返回列表
        </button>
      </main>
    </>
  );
}
