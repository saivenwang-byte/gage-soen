# 推送代码 + 打开部署控制台（版面确认通过后再用；确认前见 版面确认.md）
# 用法：.\scripts\push-and-deploy.ps1

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

Set-Location $root
Write-Host "==> 仓库: $root" -ForegroundColor Cyan

$status = git status --porcelain
if ($status) {
  Write-Host "工作区有未提交改动，请先 commit。" -ForegroundColor Yellow
  git status -s
  exit 1
}

$ahead = (git rev-list --count origin/main..HEAD 2>$null)
if ($LASTEXITCODE -ne 0) { $ahead = "?" }
if ($ahead -and $ahead -ne "0") {
  Write-Host "==> 推送到 GitHub ($ahead 个提交)..." -ForegroundColor Cyan
  git push origin main
  if ($LASTEXITCODE -ne 0) {
    Write-Host "推送失败：请检查网络 / VPN / 代理，或改用 GitHub Desktop 推送。" -ForegroundColor Red
    exit 1
  }
  Write-Host "推送成功。" -ForegroundColor Green
} else {
  Write-Host "已与 origin/main 同步，跳过推送。" -ForegroundColor Green
}

$repo = "https://github.com/saivenwang-byte/gage-soen"
Write-Host ""
Write-Host "=== 接下来在浏览器完成（约 5 分钟）===" -ForegroundColor Cyan
Write-Host "1. Render: New -> Blueprint 或 Web Service，连仓库，Root = backend"
Write-Host "   健康检查: /api/health"
Write-Host "2. 记下后端地址，例如 https://jiegasuan-api.onrender.com"
Write-Host "3. Vercel: Import GitHub 仓库，Root = frontend"
Write-Host "   环境变量 VITE_API_BASE = https://你的后端.onrender.com/api"
Write-Host "4. Vercel Redeploy 后访问线上地址"
Write-Host ""

$urls = @(
  "$repo",
  "https://dashboard.render.com/select-repo?type=blueprint",
  "https://vercel.com/new"
)
foreach ($u in $urls) {
  Start-Process $u
  Start-Sleep -Milliseconds 800
}

Write-Host "已打开 GitHub 仓库、Render、Vercel 页面。" -ForegroundColor Green
