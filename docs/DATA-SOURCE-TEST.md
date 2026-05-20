# 第 5 步：真实数据源接入测试

## 5.1 测试脚本

`backend/test-crawlers.js` 已适配当前 **ESM + `crawl(ctx)`** 架构（`dianping_dining.js`、`xiaohongshu_shopping.js`），通过 `dataMode` 区分真实数据与回退数据：

| dataMode | 含义 |
|----------|------|
| `real` | Playwright 解析页面得到 |
| `fallback` | `liveGenerator` 动态回退（无 Cookie 或解析失败） |

```bash
cd backend

npm test                  # 测大众点评 + 小红书
npm run test:dianping     # 只测大众点评
npm run test:xiaohongshu  # 只测小红书
```

退出码：`0` = 至少一条真实数据；`1` = 全部为回退或失败。

## 5.2 环境准备

1. 安装依赖与 Chromium：`npm install && npm run playwright:install`
2. 保存 Cookie（推荐）：

```bash
npm run login -- dianping
npm run login -- xiaohongshu
```

3. 可选代理（`backend/.env` 或系统环境变量）：

```env
PROXY_LIST=http://127.0.0.1:7890
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

4. 强制仅真实爬取（无 Cookie 则报错，不回退）：

```env
DEMO_FALLBACK=0
```

## 5.3 关闭 Mock / 回退（真实数据稳定后）

当前回退逻辑在 **`backend/crawlers/base/playwrightCrawler.js`**，而非单独的 `dianping.js` / `xiaohongshu.js`。

### 方式 A：环境变量（推荐）

```env
DEMO_FALLBACK=0
```

### 方式 B：修改代码

在 `playwrightCrawler.js` 中：

- 删除或注释 `fallbackFor(...)` 的调用
- `parseListFromHtml` 内 `generateLiveItems` 的空结果回退
- 将 `allowFallback()` 默认改为 `false`

规格中的 `getMockResults` 若后续新增独立爬虫文件，同样在 `catch` 中改为 `return []`。

## 5.4 端到端验证

```bash
# 1. 爬虫测试
cd backend
npm test

# 2. 启动 API
npm start
```

另开终端：

```bash
# 健康检查
curl http://localhost:3001/api/health

# 创建搜索任务（异步）
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d "{\"scenes\":[\"coffee\"],\"headcount\":2,\"mapCenter\":{\"lat\":30.918,\"lng\":121.474}}"

# 用返回的 jobId 轮询
curl http://localhost:3001/api/search/<jobId>

# 漂流瓶
curl "http://localhost:3001/api/bottle/count?lat=30.918&lng=121.474&distance=15"
curl "http://localhost:3001/api/bottle/random?lat=30.918&lng=121.474&distance=15&mode=value"
```

```bash
# 3. 前端
cd frontend
npm run dev
# http://localhost:5173
```

Windows PowerShell 示例：

```powershell
Invoke-RestMethod http://localhost:3001/api/health
$body = '{"scenes":["coffee"],"headcount":2,"mapCenter":{"lat":30.918,"lng":121.474}}'
$r = Invoke-RestMethod -Method POST -Uri http://localhost:3001/api/search -ContentType application/json -Body $body
Invoke-RestMethod "http://localhost:3001/api/search/$($r.jobId)"
```

## 5.5 接入验证清单

| 检查项 | 预期结果 | 状态 |
|--------|----------|------|
| `npm test` 爬虫测试 | 至少一个数据源 `dataMode: real` | ☐ |
| `GET /api/health` | `status: ok` | ☐ |
| `POST /api/search` + 轮询 | `status: done` 且 `results` 非空 | ☐ |
| `GET /api/bottle/count` | `count > 0` | ☐ |
| `GET /api/bottle/random` | `empty: false` 且含 `fortune` | ☐ |
| 前端奥扫 | 搜索后显示 ValueCard | ☐ |
| 前端暇兜兜 | 捞瓶显示签文 | ☐ |
| 前端周边嘎算 | 地图有标记 | ☐ |
| 前端我的 | 收藏 / 挂机 / 历史 | ☐ |
| 手机浏览器 | 四 Tab 布局正常 | ☐ |

## 五步总览

| 序号 | 任务 | 状态 |
|------|------|------|
| 1 | 全局状态 + API（AppContext） | ✅ |
| 2 | 爬虫调度（searchOrchestrator） | ✅ |
| 3 | 个人中心 ProfilePage | ✅ |
| 4 | README + 部署文档 | ✅ |
| 5 | 真实数据源接入测试 | ✅ 脚本与文档 |
