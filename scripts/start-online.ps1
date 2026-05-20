# 本机一键公网：构建 H5 + 启动 API（同端口）+ cloudflared 隧道
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

Write-Host "==> 构建前端..." -ForegroundColor Cyan
Set-Location (Join-Path $root "frontend")
if (-not (Test-Path "node_modules\vite")) { npm install }
node node_modules\vite\bin\vite.js build
node (Join-Path $root "backend\scripts\copy-frontend-dist.mjs")

$backend = Join-Path $root "backend"
Set-Location $backend

# 停掉占用 3001 的旧进程（仅 node server.js）
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 1

$env:SERVE_FRONTEND = "1"
$env:DATA_SOURCE = "curated"
Write-Host "==> 启动介嘎算 http://127.0.0.1:3001/ ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backend'; `$env:SERVE_FRONTEND='1'; node server.js"
Start-Sleep -Seconds 3

try {
  $h = Invoke-RestMethod "http://127.0.0.1:3001/api/health" -TimeoutSec 5
  if (-not $h.ok) { throw "health not ok" }
} catch {
  Write-Host "后端未就绪，请查看新开的 server 窗口报错。" -ForegroundColor Red
  exit 1
}

Write-Host "==> 创建公网隧道（cloudflared）..." -ForegroundColor Cyan
$urlFile = Join-Path $root "ONLINE-URL.txt"
npx -y cloudflared tunnel --url http://127.0.0.1:3001 2>&1 | ForEach-Object {
  Write-Host $_
  if ($_ -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
    $u = $Matches[0]
    @(
      "# 介嘎算公网（cloudflared，需保持本脚本窗口与本机 server 运行）",
      "",
      "$u/",
      "",
      "健康检查: $u/api/health"
    ) | Set-Content -Path $urlFile -Encoding UTF8
    Write-Host "`n已写入 ONLINE-URL.txt : $u" -ForegroundColor Green
    Start-Process $u
  }
}
