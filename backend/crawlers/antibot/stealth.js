/**
 * Playwright 反检测注入脚本
 * 仅供学习研究，请遵守平台 robots.txt 及用户协议
 */
export const STEALTH_INIT_SCRIPT = () => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  window.chrome = { runtime: {} };
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
  Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] });
};

export const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 414, height: 896 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
];

export function randomViewport() {
  return VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
}
