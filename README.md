# 🦆 介嘎算 (ga-ge-soen)

> 上海郊区的好生活，样样介嘎算。
>
> *"ga-ge-soen" — a Shanghainese phrase meaning "what a steal!"*

---

## 一、项目简介

**介嘎算**是一个面向上海郊区的多场景生活消费实时优惠聚合与比价应用（H5 / 小程序形态）。它不是冷冰冰的比价计算器，而是一个有温度的本地生活价值发现平台。

### 核心功能

| 功能 | 说明 |
|------|------|
| **奥扫** ⚡ | 精准搜索 + 筛选 + 比价，用最快速度找到最划算的选择 |
| **暇兜兜** 🍾 | 漂流瓶随机捞取附近优惠，带签文解读 |
| **周边嘎算** 📍 | 地图模式查看优惠分布，支持场景筛选 |
| **我的** 👤 | 收藏夹、挂机关注、历史记录、偏好设置 |

### 覆盖场景

🏠 住宿 · 🍽️ 餐饮 · ☕ 咖啡 · 🎯 休闲娱乐 · ⏳ 临期特惠 · 👗 折扣甩货 · 🔄 二手捡漏 · 🏭 工厂直出 · 🐱 宠物服务 · 💇 美发沙龙 · 💅 美甲美睫 · 更多…

### 价值维度

- 💰 **比便宜**：折扣最大，省钱为王
- ⚖️ **比性价比**：综合价格 + 口碑 + 热度，最优选择
- ✨ **比质价比**：情绪标签 + 博主推荐 + 独特体验，品味之选

---

## 二、技术栈

### 前端

| 技术 | 说明 |
|------|------|
| React 18 | UI 框架 |
| Vite | 构建工具 |
| Leaflet | 地图（`MapPicker` 组件） |
| CSS Variables | 品牌主题色系统（`theme.css`） |

### 后端

| 技术 | 说明 |
|------|------|
| Node.js 18+ | 运行时（ESM） |
| Express | Web 框架 |
| Playwright + stealth | 无头浏览器（反爬） |
| WebSocket (`ws`) | 搜索任务进度推送 |
| 多平台爬虫编排 | `searchOrchestrator` 并行调度 |

> 文档中的 Axios / JSDOM / Cheerio / `BaseCrawler` 类为规格演进方向；当前实现以 **Playwright 爬虫池** + **`liveGenerator` 回退** 为主，详见 `backend/crawlers/`。

---

## 三、项目结构

仓库根目录即产品根（克隆时目录名可为 `gage-soen` 或当前文件夹名）：

```
.
├── frontend/                    # React + Vite 前端
│   ├── public/
│   ├── src/
│   │   ├── assets/styles/
│   │   │   └── theme.css        # 品牌色 CSS 变量
│   │   ├── components/
│   │   │   ├── BottomNav.jsx    # 底部四 Tab 导航
│   │   │   ├── ValueCard.jsx    # 价值卡片
│   │   │   ├── MapPicker.jsx    # 地图选点/标记
│   │   │   ├── DateCalendar.jsx # 日期筛选（住宿/通用）
│   │   │   ├── HeadcountPicker.jsx
│   │   │   └── …                # SearchBox / FilterBar / Bottle 等待补全
│   │   ├── pages/
│   │   │   ├── AoSoPage.jsx     # 奥扫
│   │   │   ├── XiaDouDouPage.jsx# 暇兜兜
│   │   │   ├── GageMapPage.jsx  # 周边嘎算（地图 Tab）
│   │   │   └── ProfilePage.jsx  # 我的
│   │   ├── context/
│   │   │   └── AppContext.jsx   # 全局状态 + API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js           # 开发代理 /api → :3001
├── backend/                     # Node.js + Express 后端
│   ├── crawlers/                # 各平台爬虫 + antibot + liveGenerator
│   ├── parsers/                 # 优惠/博主解析
│   ├── routes/
│   │   └── bottle.js            # /api/bottle 漂流瓶
│   ├── services/
│   │   └── searchOrchestrator.js# 奥扫并行搜索
│   ├── utils/
│   │   ├── fortune.js           # 签文生成
│   │   └── geo.js               # 距离 / 海湾中心点
│   ├── server.js                # Express 入口
│   ├── .env.example
│   └── package.json
├── docs/                        # 部署与可行性说明
├── legacy-miniprogram/          # 早期微信小程序（参考）
├── start-dev.ps1                # Windows 一键双端启动
└── README.md
```

---

## 四、快速开始

### 4.1 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0（或 yarn >= 1.22）
- **Git**（可选）

### 4.2 获取代码

```bash
git clone https://github.com/your-org/gage-soen.git
cd gage-soen
```

### 4.3 安装依赖

**后端**

```bash
cd backend
npm install
npm run playwright:install
```

`playwright` 安装后需下载 Chromium 内核（上一条 `playwright:install` 已包含）。

**前端**

```bash
cd frontend
npm install
```

### 4.4 配置环境变量

**后端**（复制 `backend/.env.example` → `backend/.env`）

```env
PORT=3001
BRAND=介嘎算

# 启用的爬虫（逗号分隔）
ENABLED_SOURCES=meituan,dianping,xiaohongshu,douyin,hema

# 代理（如需通过代理访问目标站）
PROXY_LIST=http://127.0.0.1:7890
# PROXY_POOL_URL=

PLAYWRIGHT_HEADLESS=1

# Cookie：推荐用 npm run login 写入 data/cookies/*.json，勿提交 Git
# 也可在部分爬虫中读取环境变量（见各 crawler 实现）
```

**前端**（可选；开发默认走 Vite 代理，一般不用改）

```env
# frontend/.env
# VITE_API_BASE=http://localhost:3001/api
```

开发时 `vite.config.js` 已将 `/api` 代理到 `http://localhost:3001`，`AppContext` 默认使用 `/api`。

### 4.5 启动开发服务器

**方式 A：一键启动（Windows 推荐）**

```powershell
.\start-dev.ps1
```

**方式 B：两个终端**

终端 1 — 后端：

```bash
cd backend
npm start
```

成功示例：

```text
介嘎算 API http://localhost:3001 — 奉贤生活，样样介嘎算。
WebSocket ws://localhost:3001/ws?jobId=<id>
```

终端 2 — 前端：

```bash
cd frontend
npm run dev
```

浏览器打开 **http://localhost:5173**，底部 Tab 切换：奥扫 / 暇兜兜 / 周边嘎算 / 我的。

> 未配置 Cookie 时，爬虫会自动使用 **动态回退数据**（`dataMode: fallback`），便于家庭本地联调。配置 Cookie 后优先真实爬取。

### 4.6 真实数据源接入测试（第 5 步）

```bash
cd backend
npm test                  # 大众点评 + 小红书
npm run test:dianping     # 仅大众点评
npm run test:xiaohongshu  # 仅小红书
```

- 脚本：`backend/test-crawlers.js`（识别 `dataMode: real` vs `fallback`）
- 详细说明、关闭回退、E2E 清单：[docs/DATA-SOURCE-TEST.md](docs/DATA-SOURCE-TEST.md)
- 至少一条真实数据时退出码为 `0`；全为回退时为 `1`（需先 `npm run login`）

**风险与合规**（部署前必读）：[docs/RISKS.md](docs/RISKS.md)

---

## 五、API 接口说明

### 5.1 健康检查

```http
GET /health
```

响应示例：

```json
{
  "ok": true,
  "brand": "介嘎算",
  "slogan": "奉贤生活，样样介嘎算。",
  "region": "奉贤区"
}
```

元数据：`GET /api/meta/scenes`、`/api/meta/map-center`、`/api/meta/sources`、`/api/meta/towns`。

### 5.2 奥扫搜索（当前：异步任务）

**步骤 1 — 创建任务**

```http
POST /api/search
Content-Type: application/json
```

请求体（与前端 `AppContext` 对齐，字段可扩展）：

```json
{
  "scenes": ["coffee"],
  "headcount": 2,
  "budgetPerCapita": 80,
  "sortBy": "value",
  "sourcePref": "all",
  "mapCenter": { "lat": 30.918, "lng": 121.474, "name": "当前位置" },
  "dateFrom": "2026-05-20",
  "dateTo": "2026-05-21"
}
```

响应：

```json
{
  "jobId": "uuid-xxxx",
  "wsUrl": "/ws?jobId=uuid-xxxx"
}
```

**步骤 2 — 轮询结果**（或使用 WebSocket 收进度）

```http
GET /api/search/:jobId
```

响应示例（完成时）：

```json
{
  "id": "uuid-xxxx",
  "status": "done",
  "progress": 100,
  "count": 9,
  "results": [
    {
      "id": "meituan-xxx",
      "source": "meituan",
      "merchantName": "XX咖啡馆·奉浦店",
      "scene": "coffee",
      "address": "奉贤区奉浦街道韩村路88号",
      "perCapita": 45,
      "promoText": "下午茶套餐原价98，现价58",
      "distanceText": "2.8km",
      "valueScore": 82,
      "dataMode": "fallback"
    }
  ],
  "mapCenter": { "lat": 30.8419, "lng": 121.5234, "name": "奉贤海湾旅游度假区" },
  "elapsedMs": 12000
}
```

#### 规格中的同步接口（规划中）

产品规格亦定义了 **单次 POST 直接返回 `{ success, data }`** 的形态（`keyword` / `scene` / `mode` / `lat` / `lng` 等）。后续可在 `routes/search.js` 封装 orchestrator，或在前端保留现有轮询适配层。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 搜索关键词 |
| scene | string | 否 | `all` / `stay` / `dining` / `coffee` / … |
| people | number | 否 | 人数，默认 2 |
| budget | string | 否 | 预算上限（元） |
| distance | number | 否 | 半径 km：5 / 10 / 15 / 30 |
| mode | string | 否 | `cheap` / `value` / `experience` |
| lat, lng | number | 是 | 用户坐标 |

统一结果字段（目标形态）：

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxxx",
      "source": "dianping",
      "title": "XX咖啡馆·奉浦店",
      "address": "奉贤区奉浦街道韩村路88号",
      "distance": 2.8,
      "originalPrice": 60,
      "discountPrice": 45,
      "savedAmount": 15,
      "discountRate": 0.25,
      "discountText": "下午茶套餐原价98，现价58",
      "emotionTags": ["江景", "安静", "好出片"],
      "influencerQuote": "这杯咖啡60块，买的是一整个下午的江景。",
      "influencerName": "@奉贤探店日记",
      "influencerScore": 72,
      "rating": 4.7,
      "scene": "coffee",
      "sceneIcon": "☕"
    }
  ]
}
```

### 5.3 漂流瓶数量

```http
GET /api/bottle/count?lat=30.918&lng=121.474&distance=15
```

响应示例：

```json
{ "count": 12 }
```

### 5.4 随机捞取漂流瓶

```http
GET /api/bottle/random?lat=30.918&lng=121.474&distance=15&mode=value
```

正常响应：

```json
{
  "empty": false,
  "data": {
    "id": "xxx",
    "title": "海湾镇XX海景民宿",
    "discountText": "6人免1人，人均仅¥420",
    "emotionTags": ["一线海景", "看日出", "宠物友好"],
    "influencerQuote": "为了这个阳台，我们哪儿都没去。",
    "fortune": {
      "sign": "上签",
      "text": "今朝出门必捡漏，奉贤好价跟你跑"
    }
  },
  "fortuneText": "今朝出门必捡漏，奉贤好价跟你跑"
}
```

空瓶响应：

```json
{
  "empty": true,
  "fortuneText": "今朝运道一般，但省下来的铜钿还在口袋里！"
}
```

### 5.5 家人提交优惠（UGC）

```http
POST /api/ugc/report
Content-Type: application/json

{
  "merchantName": "某某店",
  "promoText": "满100减30",
  "scene": "dining",
  "submitter": "外婆"
}
```

---

## 六、爬虫配置指南

### 6.1 推荐方式：交互式保存 Cookie

```powershell
cd backend
npm run login -- dianping
npm run login -- meituan
npm run login -- xiaohongshu
```

Cookie 保存在 `backend/data/cookies/`，**勿提交 Git**。

### 6.2 大众点评 Cookie（手动）

1. 浏览器访问 https://www.dianping.com 并登录  
2. F12 → Application → Cookies，复制为字符串  
3. 写入对应 cookie 文件或按爬虫文档配置  

### 6.3 小红书 Cookie（手动）

1. 访问 https://www.xiaohongshu.com 扫码登录  
2. F12 → Application → Cookies，复制  
3. 同上保存  

### 6.4 代理配置

```env
PROXY_LIST=http://127.0.0.1:7890
# 或 PROXY_POOL_URL=...
```

### 6.5 爬虫降级说明

当反爬、网络或 Cookie 失效时，会降级为 **`liveGenerator` 动态回退数据**（开发/家庭联调用）。生产或强真实场景建议：

- 配置有效 Cookie（`npm run login`）  
- 使用住宅代理 IP  
- 控制并发与间隔（见 `backend/crawlers/antibot/`）  
- 按需关闭回退：`DEMO_FALLBACK=0`（见 `playwrightCrawler.js`）  

反爬模块说明：`.cursor/skills/jiegasuan-antibot/SKILL.md`。

---

## 七、开发脚本

### 前端

```bash
cd frontend
npm run dev       # 开发服务器 :5173
npm run build     # 生产构建 → dist/
npm run preview   # 预览构建结果
```

### 后端

```bash
cd backend
npm start         # 启动 API :3001
npm run dev       # --watch 热重载
npm run login -- <platform>   # 保存 Cookie
```

### 单独验证搜索 API

```powershell
# 创建任务
Invoke-RestMethod -Method POST -Uri http://localhost:3001/api/search `
  -ContentType application/json `
  -Body '{"scenes":["dining"],"headcount":2,"mapCenter":{"lat":30.918,"lng":121.474}}'

# 将返回的 jobId 代入
Invoke-RestMethod http://localhost:3001/api/search/<jobId>
```

---

## 八、部署建议

### 8.1 前端（Vercel / Netlify / 静态托管）

```bash
cd frontend
npm run build
```

上传 `frontend/dist/`，环境变量：

- `VITE_API_BASE` = 你的后端 API 根路径（如 `https://api.example.com/api`）

家庭 H5 部署详见 [docs/DEPLOY-FAMILY.md](docs/DEPLOY-FAMILY.md)。

### 8.2 后端（Docker 示例）

```dockerfile
FROM node:18-slim
RUN apt-get update && apt-get install -y chromium
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app
COPY backend/package*.json ./
RUN npm install && npx playwright install chromium
COPY backend/ .
EXPOSE 3001
CMD ["node", "server.js"]
```

```bash
docker build -t gage-soen-backend .
docker run -p 3001:3001 --env-file backend/.env gage-soen-backend
```

### 8.3 注意事项

- Playwright 依赖 Chromium，Docker 镜像需安装浏览器内核  
- `routes/bottle.js` 中 `dealPool` 为内存缓存（30 分钟 TTL），多实例部署建议换 **Redis**  
- 搜索进度已支持 **WebSocket**（`/ws?jobId=`），与规格中的 socket.io 等价能力可继续扩展  

---

## 九、常见问题

**Q: 启动后端报错 `playwright: cannot find chromium`**

A: 在 `backend` 目录执行 `npm run playwright:install`。

**Q: 大众点评一直无真实数据**

A: 反爬较强。配置登录 Cookie、代理 IP，并增大 `antibot` 中的请求间隔。

**Q: 前端能打开但奥扫无结果**

A: 检查：

1. 后端是否运行：访问 http://localhost:3001/health  
2. 浏览器控制台是否有网络错误  
3. 是否拿到 `jobId` 且轮询到 `status: done`  
4. 未配 Cookie 时结果应带 `dataMode: fallback`，若完全为空请看后端日志  

**Q: `localhost:5173` 连接被拒绝**

A: 在 `frontend` 目录执行 `npm run dev`，或使用 `.\start-dev.ps1`。

**Q: 如何添加新数据源？**

A: 在 `backend/crawlers/` 新增平台模块，在 `crawlers/index.js` 注册，由 `searchOrchestrator` 调度；返回字段尽量对齐 `normalizeDeal` / 规格中的统一结构。

**Q: 与规格文档的差异？**

A: 当前仓库为 **可运行的家庭版**：四 Tab 前端已接通，搜索为 **异步任务 + WebSocket/轮询**；同步 `POST /api/search → { success, data }` 与 `SearchBox` / `FilterBar` / `Bottle` 等组件按规格逐步补全。

---

## 十、贡献指南

欢迎提交 Issue 和 Pull Request。

| 分支 | 说明 |
|------|------|
| `main` | 稳定版本 |
| `dev` | 开发分支 |

提交规范：`feat:` / `fix:` / `docs:` / `refactor:` / `chore:`

---

## 十一、许可证

本项目仅供**家庭成员学习研究**使用。爬虫模块请遵守目标网站的 robots.txt 及用户协议，不得对外提供商业数据服务。

---

## 十二、联系方式

- 项目地址：https://github.com/your-org/gage-soen（请替换为实际仓库）  
- 品牌读音：**ga-ge-soen**（上海话「介嘎算」）  

<p align="center"><b>🦆 奉贤生活，样样介嘎算。</b></p>
