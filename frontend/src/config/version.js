/** 构建时由 vite 注入，版本号来自项目根目录 VERSION 文件 */
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
export const BUILD_DATE = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '';

export function formatVersionLabel() {
  const v = APP_VERSION.startsWith('v') ? APP_VERSION : `v${APP_VERSION}`;
  return BUILD_DATE ? `${v} · ${BUILD_DATE}` : v;
}
