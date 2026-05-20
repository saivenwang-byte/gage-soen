/**
 * 介嘎算 — 全局配置
 */
/** curated=精选种子数据（MVP默认）| crawl=启用爬虫 */
export const config = {
  brand: '介嘎算',
  slogan: '奉贤生活，样样介嘎算。',
  dataSource: process.env.DATA_SOURCE || 'curated',
  port: Number(process.env.PORT) || 3001,
  searchTimeoutMs: 45_000,
  crawlerDelayMs: { min: 2000, max: 8000 },
  socialMaxAgeDays: 30,
  proxyPoolUrl: process.env.PROXY_POOL_URL || '',
  proxyList: (process.env.PROXY_LIST || '').split(',').filter(Boolean),
  captchaApiUrl: process.env.CAPTCHA_API_URL || '',
  captchaApiKey: process.env.CAPTCHA_API_KEY || '',
  redisUrl: process.env.REDIS_URL || '',
  userAgentsDesktop: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  ],
  userAgentsMobile: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
  ],
  userAgents: [],
};

config.userAgents = [...config.userAgentsDesktop, ...config.userAgentsMobile];
