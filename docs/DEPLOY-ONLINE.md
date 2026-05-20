# 介嘎算 — 免费线上部署（Vercel + Render）

## 一、本地预览（已配置好）

```powershell
# 方式 A：双击或运行
.\start-dev.ps1

# 方式 B：手动
cd backend
npm install
node server.js

cd ..\frontend
npm install
npm run dev
```

| 服务 | 地址 |
|------|------|
| 前端（Vite + HTTPS） | **https://localhost:5173** |
| 同 WiFi 手机 | **https://你的电脑IP:5173**（终端里 Network 一行） |
| 后端 API | **http://localhost:3001** |
| 健康检查 | http://localhost:3001/api/health |

前端 `vite.config.js` 已把 `/api` 代理到 `localhost:3001`，本地无需设置 `VITE_API_BASE`。

---

## 二、推送到 GitHub（部署前必做）

仓库目前可能还没有首次 commit / remote，请先：

```powershell
cd "d:\【私人】\【外婆闺蜜比价】"
git add .
git commit -m "介嘎算 MVP：前后端可部署"
# 在 GitHub 新建空仓库后：
git remote add origin https://github.com/你的用户名/jiegasuan.git
git push -u origin master
```

---

## 三、后端 → Render（免费）

1. 打开 https://render.com 注册/登录  
2. **New → Blueprint**（若仓库根目录有 `render.yaml`）或 **New → Web Service**  
3. 连接 GitHub 仓库，**Root Directory** 填：`backend`  
4. **Build Command**：`npm install`  
5. **Start Command**：`npm start`  
6. **Environment**：`PORT` = `3001`（Render 也会注入 `PORT`，`config.js` 已读取）  
7. 部署完成后得到地址，例如：`https://jiegasuan-api.onrender.com`  
8. 验证：浏览器打开 `https://你的服务.onrender.com/api/health` 应返回 `{"ok":true,...}`

---

## 四、前端 → Vercel（免费）

在 **backend 地址确定后** 再部署前端。

```powershell
cd frontend
npm install -g vercel
# 或不用全局：npx vercel login
npx vercel --prod
```

首次会要求登录 Vercel 账号（浏览器授权）。

**环境变量**（Vercel 项目 Settings → Environment Variables）：

| 名称 | 值（示例） |
|------|------------|
| `VITE_API_BASE` | `https://jiegasuan-api.onrender.com/api` |

注意：必须以 `/api` 结尾，且 **不要** 末尾斜杠。

改完环境变量后，在 Vercel 控制台 **Redeploy** 一次（Vite 在构建时注入变量）。

也可在 Vercel 网页导入 GitHub 仓库，**Root Directory** = `frontend`，Framework = Vite。

---

## 五、前后端联通检查

1. 打开 `https://你的前端.vercel.app`  
2. F12 → Network，奥扫搜索或暇兜兜捞瓶，应有请求到 `https://你的后端.onrender.com/api/...`  
3. 直接访问 `https://你的后端.onrender.com/api/health` → `ok: true`

若 CORS 报错，后端已使用 `cors()` 全开放，一般无需改。

---

## 六、免费方案限制

- Render 免费实例冷启动约 30–60 秒，久未访问会慢  
- Vercel 前端静态托管，爬虫/Playwright 仍在后端，线上默认 `DATA_SOURCE=curated` 种子数据  
- 无需买域名，用平台提供的 `*.vercel.app` / `*.onrender.com` 即可
