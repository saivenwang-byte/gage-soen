# One-shot Render deploy via Deploy button + health wait
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$cfg = Get-Content (Join-Path $Root "deploy.config.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$deployUrl = "https://render.com/deploy?repo=https://github.com/saivenwang-byte/gage-soen"
$healthUrl = "$($cfg.productionUrl.TrimEnd('/'))/api/health"

function Test-ProductionLive {
  try {
    $r = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 30
    return ($r.StatusCode -eq 200 -and $r.Content -match '"ok"\s*:\s*true')
  } catch { return $false }
}

if (Test-ProductionLive) {
  Write-Host "OK: Already live at $($cfg.productionUrl)" -ForegroundColor Green
  node (Join-Path $PSScriptRoot "sync-deploy-config.mjs") | Out-Null
  Start-Process $cfg.productionUrl
  exit 0
}

Write-Host "Opening Render Deploy (Blueprint from render.yaml)..." -ForegroundColor Cyan
Start-Process $deployUrl

Write-Host ""
Write-Host "In the browser:" -ForegroundColor Yellow
Write-Host "  1. Log in to Render (and connect GitHub if asked)"
Write-Host "  2. Review service: jiegasuan"
Write-Host "  3. Click Approve / Deploy"
Write-Host "  4. Wait until status is Live (first build ~5-10 min)"
Write-Host ""

$deadline = (Get-Date).AddMinutes(12)
while ((Get-Date) -lt $deadline) {
  if (Test-ProductionLive) {
    Write-Host ""
    Write-Host "SUCCESS: $($cfg.productionUrl)" -ForegroundColor Green
    node (Join-Path $PSScriptRoot "sync-deploy-config.mjs") | Out-Null
    Start-Process $cfg.productionUrl
    exit 0
  }
  Write-Host "Waiting for deploy... $(Get-Date -Format 'HH:mm:ss')"
  Start-Sleep -Seconds 25
}

Write-Host ""
Write-Host "Not live yet. Finish Approve in the Render tab, then run this bat again." -ForegroundColor Yellow
Write-Host "Health check: $healthUrl"
