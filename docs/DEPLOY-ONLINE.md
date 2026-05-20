# 介嘎算 — 线上部署（推荐：Render 单服务）

前后端已合并为 **一个 Render 服务**：同域访问 `/`（H5）与 `/api/*`，**不需要 Vercel**。

仓库：https://github.com/saivenwang-byte/gage-soen

---

## 一、本地预览

```powershell
.\start-dev.ps1
```

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:5173 |
| 后端 | http://localhost:3001 |
| 健康检查 | http://localhost:3001/api/health |

---

## 二、推送代码到 GitHub

Cursor 环境若 `git push` 失败，用 API 推送（已内置凭据）：

```powershell
node scripts/github-api-push.mjs
```

或双击 `推送并部署.bat`（推送 + 打开 Render Blueprint）。

---

## 三、Render 单服务（免费）

1. https://dashboard.render.com → **New → Blueprint**
2. 连接仓库 `gage-soen`，使用根目录 `render.yaml`
3. 服务名 `jiegasuan`，构建完成后访问：
   - H5：`https://jiegasuan.onrender.com/`
   - API：`https://jiegasuan.onrender.com/api/health`

`render.yaml` 会在构建时编译前端到 `backend/public`，并设置 `SERVE_FRONTEND=1`。

---

## 四、本地打包验证（与 Render 相同）

```powershell
cd backend
npm run build:deploy
$env:SERVE_FRONTEND="1"
node server.js
```

浏览器打开 http://127.0.0.1:3001/

---

## 五、验证清单

1. `/api/health` → `"ok":true`
2. 首页奥扫 / 暇兜兜 / 我的可切换
3. Network 里 API 为同域 `/api/...`（非 Vercel 域名）

---

## 六、限制

- Render 免费实例冷启动约 30–60 秒
- 爬虫（Playwright）线上默认 `DATA_SOURCE=curated` 精选数据
