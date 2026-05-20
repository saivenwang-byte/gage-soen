import { formatLocationAccuracy, isRealGpsSource, isSecureLocationContext } from '../utils/location';

/**
 * 说明当前「我的位置」来源与精度，避免用户误以为军事级或步行距离
 */
export default function LocationStatusBar({ userLocation, loading, onRefresh }) {
  if (loading) {
    return (
      <p className="location-status location-status-loading">
        正在获取手机当前位置…（请允许定位权限）
      </p>
    );
  }
  if (!userLocation) return null;

  const accText = formatLocationAccuracy(userLocation.accuracyM);
  const isGps = isRealGpsSource(userLocation.source);
  const insecure = !isSecureLocationContext();

  return (
    <div className={`location-status ${isGps ? 'location-status-gps' : 'location-status-fallback'}`}>
      <p className="location-status-main">
        <span aria-hidden>{isGps ? '📍' : '⚠️'}</span>{' '}
        <strong>{userLocation.label || '当前位置'}</strong>
        {isGps && userLocation.accuracyM != null && (
          <span className="location-status-acc"> · ±{userLocation.accuracyM}m</span>
        )}
      </p>
      {accText && <p className="location-status-sub">{accText}</p>}
      {insecure && (
        <p className="location-status-sub">
          当前不是安全连接（需 https），浏览器不会给出真实 GPS。请用「打开介嘎算界面.bat」或 https 访问。
        </p>
      )}
      {!isGps && !insecure && (
        <p className="location-status-sub">
          未拿到本机 GPS，距离按南桥参考点估算。请在手机浏览器/微信里点「允许」使用位置信息，再点「重新定位」。
        </p>
      )}
      {userLocation.source === 'gps_cached' && (
        <p className="location-status-sub">本次暂用上次打开 App 时保存的位置；点「重新定位」可刷新为当前位置。</p>
      )}
      <p className="location-status-sub">
        卡片上的距离是<strong>直线距离</strong>（地图两点连线），不是步行或开车导航里程；店铺坐标来自人工/地图标注，可能有偏差。
      </p>
      {onRefresh && (
        <button type="button" className="location-refresh-btn" onClick={onRefresh}>
          重新定位
        </button>
      )}
    </div>
  );
}
