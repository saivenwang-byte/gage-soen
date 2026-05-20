# 家庭自用部署指南（不对外发布）

本工具仅供家庭成员比价决策，**不作为商业产品运营**。因此可以走「轻量、私密」路线，无需急于申请微信小程序正式类目与域名。

## 推荐方案：云服务器 + H5（优先）

| 项目 | 建议 |
|------|------|
| 形态 | React H5（`frontend/`），手机浏览器收藏或主屏幕添加 |
| 服务器 | 1核2G 即可（阿里云/腾讯云轻量，上海地域延迟更低） |
| 域名 | 可选；用 IP + 端口 + **访问口令** 也行 |
| HTTPS | 建议用 Caddy / Nginx + Let's Encrypt，或 Cloudflare Tunnel |
| 隐私 | Nginx `auth_basic` 或环境变量 `FAMILY_ACCESS_TOKEN` |

### 部署步骤概要

```bash
# 服务器上
git clone <你的私有仓库>
cd 外婆闺蜜比价/backend && npm install && cp .env.example .env
# 编辑 .env：填入各平台 Cookie、ENABLED_SOURCES

cd ../frontend && npm install && npm run build

# PM2 常驻 API
cd ../backend && npm install -g pm2
pm2 start server.js --name fengxian-api

# Nginx 示例：静态前端 + 反代 API
# root -> frontend/dist
# /api -> http://127.0.0.1:3001
```

## 微信小程序（可选，体验版即可）

- 无需上架应用商店：开发者工具 → **体验版** → 只添加家人为体验成员
- 正式 request 域名未定时：开发阶段勾选「不校验合法域名」
- 后期若有域名：在公众平台配置 `request` / `socket` 合法域名指向你的 API

`legacy-miniprogram/` 为早期微信原生壳，可改为 `web-view` 打开 H5，减少双端维护。

## 接真实数据源（家人自用也要注意）

1. 复制 `backend/.env.example` → `.env`，**不要提交 Git**
2. 浏览器登录各平台后，导出 Cookie 填入对应变量
3. `ENABLED_SOURCES=meituan,dianping,hema,xiaohongshu,douyin` 控制启用源
4. 各爬虫文件内将 `generateLiveItems` 替换为 Playwright 解析（见文件头注释）
5. 控制频率：已有随机延迟；家庭使用建议单次搜索间隔 ≥ 1 分钟

### 已预留数据源

**平台**：大众点评、美团、携程、途家、驴妈妈、盒马、每日优鲜、商场活动  
**社交**：小红书、抖音、B站、微博  
**扩展**：本地社群 `community_stub.js`

## 地图与距离

- 默认中心：**奉贤海湾旅游度假区**（`backend/utils/geo.js`）
- 搜索页点击地图可改中心，结果按 **距中心最近** 排序（`sortBy=distance`）

## 合规提醒（家庭使用同样适用）

- 仅抓取公开页面、低频、注明来源链接
- 不转售数据、不对外提供查询服务
- Cookie 仅保存在自家服务器 `.env`
