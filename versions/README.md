# 介嘎算 · 本地版本归档

## 一句话

| 用途 | 怎么做 |
|------|--------|
| **看「说定的那一版」界面** | 双击 `打开介嘎算-锁定预览.bat` |
| **日常开发最新效果** | 双击 `打开介嘎算界面.bat` |
| **查所有版次与文件夹** | 双击 `打开版本溯源台账.bat` |

## 目录约定

| 用途 | 路径 |
|------|------|
| **当前开发主线**（始终最新） | `d:\【私人】\【外婆闺蜜比价】` |
| **锁定预览**（沟通定稿界面） | `d:\【私人】\【外婆闺蜜比价】\preview-lock\` |
| **版本清单** | `d:\【私人】\【外婆闺蜜比价】\versions\manifest.json` |
| **溯源网页** | `d:\【私人】\【外婆闺蜜比价】\versions\index.html` |
| **溯源 Markdown** | `d:\【私人】\【外婆闺蜜比价】\VERSION_HISTORY.md` |
| **各版本代码快照** | `d:\【私人】\【外婆闺蜜比价】\versions\v{版次}-{代号}\` |

## 版次规则

- 格式：`主版本.次版本.修订号`（如 `0.3.0`）
- 文件夹名：`v{版次}-{简短代号}`
- 发新版：改根目录 `VERSION` → `.\scripts\lock-preview.ps1` → 可选 `.\scripts\snapshot-version.ps1`

## 锁定界面（推荐每次要给家人看之前）

```powershell
cd "d:\【私人】\【外婆闺蜜比价】"
.\scripts\lock-preview.ps1 -Summary "本版说明：民宿种草、娱乐生活场景、暇兜兜不限次"
```

生成 `preview-lock\dist\`，并更新 `versions\index.html`。

## 代码快照（完整副本备案）

```powershell
.\scripts\snapshot-version.ps1 -Codename "种草生活娱乐"
# 或指定版次： .\scripts\snapshot-version.ps1 -Version "0.4.0" -Codename "新功能"
```

快照内含 `preview-dist\`（当时的前端构建），便于多年后仍能打开当时界面。
