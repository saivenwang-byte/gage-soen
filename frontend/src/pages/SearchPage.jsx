import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMapCenter, startSearch, connectProgress, getSearchResult } from '../api/client';
import DynamicFilters from '../components/DynamicFilters';
import MapPicker from '../components/MapPicker';
import { config } from '../brand';

const defaultFilters = {
  town: 'all',
  headcount: 4,
  nights: 1,
  dateFrom: '',
  dateTo: '',
  lockDate: false,
  budgetPerCapita: '',
  sourcePref: 'all',
  bloggerOnly: false,
  minLikes: '',
  sortBy: 'distance',
  cuisine: '',
  mallName: '',
};

export default function SearchPage() {
  const { state } = useLocation();
  const nav = useNavigate();
  const scenes = state?.scenes || ['all'];
  const [filters, setFilters] = useState(defaultFilters);
  const [mapCenter, setMapCenter] = useState(null);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    getMapCenter().then(setMapCenter).catch(() =>
      setMapCenter({ name: '奉贤海湾旅游度假区', lat: 30.8419, lng: 121.5234 })
    );
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const waitForJob = (jobId) =>
    new Promise((resolve, reject) => {
      const check = async () => {
        try {
          const data = await getSearchResult(jobId);
          if (data.progress) setProgress(data.progress);
          if (data.message) setMsg(data.message);
          if (data.status === 'done' || data.status === 'failed') {
            clearInterval(pollRef.current);
            resolve(data);
          }
        } catch (e) {
          clearInterval(pollRef.current);
          reject(e);
        }
      };
      check();
      pollRef.current = setInterval(check, 800);
    });

  const onSearch = async () => {
    setLoading(true);
    setProgress(0);
    setMsg(config.dialect.loading);
    try {
      const body = {
        scenes,
        ...filters,
        budgetPerCapita: filters.budgetPerCapita ? Number(filters.budgetPerCapita) : undefined,
        minLikes: filters.minLikes ? Number(filters.minLikes) : 0,
        sortBy: filters.sortBy,
        mapCenter,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      };
      const { jobId } = await startSearch(body);

      try {
        connectProgress(jobId, (ev) => {
          if (ev.progress != null) setProgress(ev.progress);
          if (ev.message) setMsg(ev.message);
        });
      } catch (_) {
        /* WebSocket 不可用时仅靠轮询 */
      }

      await waitForJob(jobId);
      setLoading(false);
      nav(`/results/${jobId}`, { state: { mapCenter } });
    } catch (e) {
      setMsg('搜索失败：' + (e.message || String(e)));
      setLoading(false);
    }
  };

  if (!mapCenter) return <p className="page">加载地图中心…</p>;

  return (
    <>
      <header className="app-header">
        <p className="brand-mark">介嘎算</p>
        <h1>筛选条件</h1>
        <p>场景：{scenes.join('、')}</p>
      </header>
      <main className="page">
        <section className="card">
          <h3 style={{ marginBottom: 8 }}>地图中心（点击地图可改）</h3>
          <MapPicker center={mapCenter} onCenterChange={setMapCenter} />
        </section>
        <DynamicFilters scenes={scenes} filters={filters} onChange={setFilters} mapCenter={mapCenter} />
        {loading && (
          <>
            <p className="progress-label">{msg}</p>
            <div className="progress-bar">
              <span style={{ width: `${progress}%` }} />
            </div>
          </>
        )}
        <button type="button" className="btn" disabled={loading} onClick={onSearch}>
          {loading ? '搜刮优惠中…' : '开始搜 — 介嘎算一把算清'}
        </button>
      </main>
    </>
  );
}
