# 本机一键公网：构建 H5 + 启动 API + localtunnel
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

Write-Host "构建前端..." -ForegroundColor Cyan
Set-Location (Join-Path $root "frontend")
if (-not (Test-Path "node_modules\vite")) { npm install }
node node_modules\vite\bin\vite.js build
Set-Location (Join-Path $root "backend")
node scripts/copy-frontend-dist.mjs

$env:SERVE_FRONTEND = "1"
$env:DATA_SOURCE = "curated"
Write-Host "启动介嘎算 http://127.0.0.1:3001 ..." -ForegroundColor Cyan
$job = Start-Job -ScriptBlock {
  Set-Location $using:root\backend
  $env:SERVE_FRONTEND = "1"
  node server.js
}
Start-Sleep -Seconds 2
Write-Host "创建公网隧道..." -ForegroundColor Cyan
npx -y localtunnel --port 3001
