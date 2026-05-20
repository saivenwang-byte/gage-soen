import { useApp } from '../context/AppContext';
import MapPicker from '../components/MapPicker';

const DEFAULT_CENTER = { lat: 30.8419, lng: 121.5234, name: '奉贤海湾' };

export default function GageMapPage() {
  const { searchResults, userLocation } = useApp();

  const center = userLocation
    ? { ...DEFAULT_CENTER, lat: userLocation.lat, lng: userLocation.lng, name: '当前位置' }
    : DEFAULT_CENTER;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: '80px' }}>
      <header style={{ padding: '16px', background: 'var(--color-primary)' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-title)' }}>🗺️ 周边嘎算</h1>
        <p style={{ margin: '6px 0 0', fontSize: '12px', opacity: 0.8 }}>
          {searchResults.length > 0
            ? `共 ${searchResults.length} 个点位（来自最近一次奥扫）`
            : '请先在「奥扫」搜索，结果会显示在地图上'}
        </p>
      </header>
      <div style={{ padding: '12px' }}>
        {searchResults.length > 0 ? (
          <MapPicker center={center} items={searchResults} height={Math.min(520, window.innerHeight - 200)} />
        ) : (
          <p style={{ textAlign: 'center', color: '#aaa', padding: '48px 16px' }}>暂无地图数据</p>
        )}
      </div>
    </div>
  );
}
