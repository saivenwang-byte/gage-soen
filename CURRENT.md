# 当前沟通口径（自动生成摘要）

| 项目 | 值 |
|------|-----|
| **开发主线（最新代码）** | `d:\【私人】\【外婆闺蜜比价】` |
| **版次号** | 见 `VERSION` 文件 |
| **锁定预览（对外展示界面）** | `preview-lock\dist\` |
| **版本溯源页** | `versions\index.html` |

## 三个入口怎么选

| 你想… | 双击 |
|--------|------|
| 日常改功能、看最新效果 | `打开介嘎算界面.bat` → **http://localhost:5173** |
| 确认「我们说定的那一版」长什么样 | `打开介嘎算-锁定预览.bat` → http://127.0.0.1:5174 |
| 查历史版次、文件夹路径、说明 | `打开版本溯源台账.bat` |

## 发新版给外婆/家人前

```powershell
cd "d:\【私人】\【外婆闺蜜比价】"
# 1. 改 VERSION 如 0.3.1
# 2. 锁定界面（生成 preview-lock）
.\scripts\lock-preview.ps1
# 3. 可选：整仓代码快照
.\scripts\snapshot-version.ps1 -Codename "简短代号"
```

执行后打开 `versions\index.html` 可看到完整溯源表。
