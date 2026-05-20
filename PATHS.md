# 介嘎算 · 完整路径索引（当前版 0.3.0）

> 版次查询：`VERSION` · 沟通定稿界面：`preview-lock\` · 溯源页：`versions\index.html`  
> 锁定界面：`scripts\lock-preview.ps1` · 代码快照：`scripts\snapshot-version.ps1`

## 一、仓库与版本

| 说明 | 绝对路径 |
|------|----------|
| **开发主线（最新代码）** | `d:\【私人】\【外婆闺蜜比价】` |
| **当前版次号** | `d:\【私人】\【外婆闺蜜比价】\VERSION` |
| **锁定预览（定稿界面）** | `d:\【私人】\【外婆闺蜜比价】\preview-lock\dist\` |
| **版本归档总目录** | `d:\【私人】\【外婆闺蜜比价】\versions\` |
| **版本溯源网页** | `d:\【私人】\【外婆闺蜜比价】\versions\index.html` |
| **版本清单 JSON** | `d:\【私人】\【外婆闺蜜比价】\versions\manifest.json` |
| **溯源台账 Markdown** | `d:\【私人】\【外婆闺蜜比价】\VERSION_HISTORY.md` |
| **沟通入口说明** | `d:\【私人】\【外婆闺蜜比价】\CURRENT.md` |
| **版本说明** | `d:\【私人】\【外婆闺蜜比价】\versions\README.md` |
| v0.1.0 说明 | `d:\【私人】\【外婆闺蜜比价】\versions\v0.1.0-骨架与爬虫\RELEASE_NOTES.md` |
| v0.2.0 说明 | `d:\【私人】\【外婆闺蜜比价】\versions\v0.2.0-分类奥扫\RELEASE_NOTES.md` |
| v0.3.0 说明 | `d:\【私人】\【外婆闺蜜比价】\versions\v0.3.0-prd-mvp\RELEASE_NOTES.md` |
| 锁定预览脚本 | `d:\【私人】\【外婆闺蜜比价】\scripts\lock-preview.ps1` |
| 代码快照脚本 | `d:\【私人】\【外婆闺蜜比价】\scripts\snapshot-version.ps1` |
| 打开锁定预览 | `d:\【私人】\【外婆闺蜜比价】\打开介嘎算-锁定预览.bat` → :5174 |
| 打开溯源台账 | `d:\【私人】\【外婆闺蜜比价】\打开版本溯源台账.bat` |

发新版后，完整代码副本位于：`d:\【私人】\【外婆闺蜜比价】\versions\v{版次}-{代号}\`（需执行快照脚本生成）。

## 二、运行与入口

| 说明 | 绝对路径 |
|------|----------|
| 一键启动 | `d:\【私人】\【外婆闺蜜比价】\start-dev.ps1` |
| 前端开发 | `d:\【私人】\【外婆闺蜜比价】\frontend\` → **https://localhost:5173** |
| 后端 API | `d:\【私人】\【外婆闺蜜比价】\backend\` → http://localhost:3001 |
| 总文档 | `d:\【私人】\【外婆闺蜜比价】\README.md` |

## 三、前端（React H5 · 当前产品）

| 说明 | 绝对路径 |
|------|----------|
| 应用入口 | `d:\【私人】\【外婆闺蜜比价】\frontend\src\main.jsx` |
| 三 Tab 壳 | `d:\【私人】\【外婆闺蜜比价】\frontend\src\App.jsx` |
| 底部导航 | `d:\【私人】\【外婆闺蜜比价】\frontend\src\components\BottomNav.jsx` |
| ⚡ 奥扫 | `d:\【私人】\【外婆闺蜜比价】\frontend\src\pages\AoSoPage.jsx` |
| 🍾 暇兜兜 | `d:\【私人】\【外婆闺蜜比价】\frontend\src\pages\XiaDouDouPage.jsx` |
| 👤 我的 | `d:\【私人】\【外婆闺蜜比价】\frontend\src\pages\ProfilePage.jsx` |
| 全局状态 | `d:\【私人】\【外婆闺蜜比价】\frontend\src\context\AppContext.jsx` |
| 场景分类 | `d:\【私人】\【外婆闺蜜比价】\frontend\src\data\sceneTaxonomy.js` |
| 主题色 | `d:\【私人】\【外婆闺蜜比价】\frontend\src\assets\styles\theme.css` |
| 生产构建 | `d:\【私人】\【外婆闺蜜比价】\frontend\dist\` |

## 四、后端（Express MVP）

| 说明 | 绝对路径 |
|------|----------|
| 服务入口 | `d:\【私人】\【外婆闺蜜比价】\backend\server.js` |
| 精选优惠数据 | `d:\【私人】\【外婆闺蜜比价】\backend\data\deals.seed.json` |
| 分类定义 | `d:\【私人】\【外婆闺蜜比价】\backend\data\sceneTaxonomy.js` |
| 搜索日志 | `d:\【私人】\【外婆闺蜜比价】\backend\data\search.log.jsonl` |
| 许愿数据 | `d:\【私人】\【外婆闺蜜比价】\backend\data\wishes.json` |
| 子类覆盖校验 | `d:\【私人】\【外婆闺蜜比价】\backend\scripts\validate-coverage.js` |

## 五、给 DeepSeek 的文字资料（可复制 Markdown + 源码）

| 说明 | 绝对路径 |
|------|----------|
| **中文入口说明** | `d:\【私人】\【外婆闺蜜比价】\给DeepSeek的文字资料\请打开这个文件夹.txt` |
| **实际内容目录** | `d:\【私人】\【外婆闺蜜比价】\export-text-for-ai\v0.3.0-2026-05-20\` |
| 必读 | `...\docs\00-请先读我-复制给DeepSeek.md` |
| 前端源码文本 | `...\source-frontend\` |
| 后端源码文本 | `...\source-backend\` |
| 一键生成 | `d:\【私人】\【外婆闺蜜比价】\打开-生成DeepSeek文字资料.bat` |

不含小程序、不含 node_modules、不含 dist 编译包。

## 六、第三方比对包（Beyond Compare / WinMerge）

| 说明 | 绝对路径 |
|------|----------|
| **比对包总目录** | `d:\【私人】\【外婆闺蜜比价】\export-bundle\` |
| **本次文件夹（推荐打开这个）** | `d:\【私人】\【外婆闺蜜比价】\export-bundle\v0.3.0-2026-05-20\` |
| **ZIP 压缩包** | `d:\【私人】\【外婆闺蜜比价】\export-bundle\jiegasuan-diff-0.3.0-2026-05-20.zip` |
| 中文说明 | `d:\【私人】\【外婆闺蜜比价】\export-bundle\README-diff-zh.md` |
| 一键重新打包 | `d:\【私人】\【外婆闺蜜比价】\打开-生成比对包.bat` |
| 打包脚本 | `d:\【私人】\【外婆闺蜜比价】\scripts\package-for-diff.ps1` |

子文件夹：`A-source-frontend-src` · `B-source-backend-api` · `C-built-h5-frontend-dist` · `D-locked-preview-dist` · `E-legacy-wechat-miniprogram` · `F-docs-and-meta`

## 七、旧版微信小程序（仅归档，未放入 DeepSeek 文字包）

| 说明 | 绝对路径 |
|------|----------|
| 小程序根目录 | `d:\【私人】\【外婆闺蜜比价】\legacy-miniprogram\` |
