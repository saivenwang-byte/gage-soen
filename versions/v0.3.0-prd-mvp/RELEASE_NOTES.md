# v0.3.0 · PRD 终极执行版对齐

- **版次**：0.3.0  
- **代号**：prd-mvp  
- **日期**：2026-05-19  
- **开发主线路径**：`d:\【私人】\【外婆闺蜜比价】`  
- **本说明路径**：`d:\【私人】\【外婆闺蜜比价】\versions\v0.3.0-prd-mvp\RELEASE_NOTES.md`

## 本版 PRD 对齐项

- 底部 **3 Tab**：⚡奥扫 / 🍾暇兜兜 / 👤我的（已移除「周边嘎算」）
- **五大场景**：咖啡、宠物、临期、民宿、娱乐（`sceneTaxonomy.js` + `deals.seed.json`）
- **暇兜兜**：每日 3 次免费；约 10% 空瓶幽默文案
- **我的**：收藏、捞瓶记录、许愿瓶、UGC 上传
- **API**：`GET /api/deals`、`GET /api/bottle/random`、`POST /api/ugc`、`POST /api/wish`
- **搜索埋点**：`backend/data/search.log.jsonl`（含 scene / subCategory / distance / 时间戳）

## 关键文件路径（相对仓库根）

### 前端 React H5（当前产品）

| 模块 | 路径 |
|------|------|
| 入口 | `frontend\src\main.jsx` |
| 三 Tab 壳 | `frontend\src\App.jsx` |
| 底部导航 | `frontend\src\components\BottomNav.jsx` |
| 奥扫页 | `frontend\src\pages\AoSoPage.jsx` |
| 暇兜兜 | `frontend\src\pages\XiaDouDouPage.jsx` |
| 我的 | `frontend\src\pages\ProfilePage.jsx` |
| 全局状态 | `frontend\src\context\AppContext.jsx` |
| 分类体系 | `frontend\src\data\sceneTaxonomy.js` |
| 距离滑块 | `frontend\src\components\DistanceSlider.jsx` |
| 品牌主题 | `frontend\src\assets\styles\theme.css` |
| 构建产物 | `frontend\dist\` |

### 后端 Express

| 模块 | 路径 |
|------|------|
| 服务入口 | `backend\server.js` |
| 精选数据 | `backend\data\deals.seed.json` |
| 分类匹配 | `backend\data\sceneTaxonomy.js` |
| 查询服务 | `backend\services\dealsStore.js` |
| 搜索编排 | `backend\services\searchOrchestrator.js` |
| 搜索日志 | `backend\services\searchLog.js` → `backend\data\search.log.jsonl` |
| 许愿瓶 | `backend\services\wishStore.js`、`backend\routes\wish.js` |
| UGC | `backend\routes\ugc.js`、`backend\services\ugcStore.js` |
| 漂流瓶 | `backend\routes\bottle.js` |
| 子类覆盖校验 | `backend\scripts\validate-coverage.js` |

### 文档与启动

| 模块 | 路径 |
|------|------|
| 总 README | `README.md` |
| 数据源测试 | `docs\DATA-SOURCE-TEST.md` |
| 家庭部署 | `docs\DEPLOY-FAMILY.md` |
| 一键启动 | `start-dev.ps1` |
| 旧版小程序（归档） | `legacy-miniprogram\` |

## 本地运行

```powershell
d:\【私人】\【外婆闺蜜比价】\start-dev.ps1
# 前端 http://localhost:5173
# 后端 http://localhost:3001
```

## 打完整代码快照

在仓库根执行 `.\scripts\snapshot-version.ps1`，将把当前主线复制到本目录旁的新文件夹（若尚未执行，本目录可能仅有 RELEASE_NOTES）。
