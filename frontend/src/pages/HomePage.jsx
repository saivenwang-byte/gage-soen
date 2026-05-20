import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScenes } from '../api/client';
import SceneSelector from '../components/SceneSelector';
import BrandHeader from '../components/BrandHeader';
import { config } from '../brand';

export default function HomePage() {
  const nav = useNavigate();
  const [scenes, setScenes] = useState([]);
  const [selected, setSelected] = useState(['all']);

  useEffect(() => {
    getScenes().then(setScenes).catch(() =>
      setScenes([
        { id: 'stay', name: '住宿', icon: '🏨' },
        { id: 'dining', name: '餐饮', icon: '🍜' },
        { id: 'coffee', name: '咖啡', icon: '☕' },
        { id: 'entertainment', name: '娱乐', icon: '🎯' },
        { id: 'life', name: '生活', icon: '🏸' },
        { id: 'shopping', name: '购物', icon: '🛒' },
      ])
    );
  }, []);

  return (
    <>
      <BrandHeader title={config.tagline} subtitle="仅家人使用 · 全渠道实时挖优惠" />
      <main className="page">
        <section className="card">
          <h2 style={{ fontSize: '1rem', marginBottom: 12 }}>第一步：选场景（可多选）</h2>
          <SceneSelector scenes={scenes} selected={selected} onChange={setSelected} />
        </section>
        <button
          type="button"
          className="btn"
          onClick={() => nav('/search', { state: { scenes: selected } })}
        >
          {config.dialect.search} →
        </button>
      </main>
    </>
  );
}
