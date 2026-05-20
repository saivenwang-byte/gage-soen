# 推送 + 本地构建验证 + 打开 Render Blueprint（单服务部署）
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

node (Join-Path $PSScriptRoot "sync-deploy-config.mjs")
node (Join-Path $PSScriptRoot "github-api-push.mjs")

Write-Host "==> 本地构建（与 Render 相同流程）..." -ForegroundColor Cyan
Set-Location (Join-Path $root "backend")
npm run build:deploy
$env:SERVE_FRONTEND = "1"
Write-Host "构建完成。启动: cd backend && set SERVE_FRONTEND=1&& node server.js" -ForegroundColor Green

Start-Process "https://dashboard.render.com/select-repo?type=blueprint"
Write-Host "已打开 Render Blueprint。选仓库 gage-soen 后一键创建 jiegasuan 服务。" -ForegroundColor Green
Write-Host "部署后访问: https://jiegasuan.onrender.com/ 与 /api/health" -ForegroundColor Cyan
