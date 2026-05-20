# Lock current frontend build as the agreed preview UI -> preview-lock\dist
param(
  [string]$Summary = "",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ver = (Get-Content (Join-Path $Root "VERSION") -Raw).Trim()
$frontend = Join-Path $Root "frontend"
$distSrc = Join-Path $frontend "dist"
$lockRoot = Join-Path $Root "preview-lock"
$distDest = Join-Path $lockRoot "dist"
$stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$dateOnly = Get-Date -Format "yyyy-MM-dd"

if (-not $Summary) {
  $Summary = "Locked preview for family review. Version $ver."
}

Write-Host "[jiegasuan] lock preview v$ver"
Write-Host "source: $frontend"

if (-not $SkipBuild) {
  Write-Host "npm run build..."
  Push-Location $frontend
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
  Pop-Location
}

if (-not (Test-Path $distSrc)) {
  throw "Missing $distSrc - run npm run build first"
}

if (Test-Path $distDest) {
  Remove-Item $distDest -Recurse -Force
}
New-Item -ItemType Directory -Path $lockRoot -Force | Out-Null
Copy-Item $distSrc $distDest -Recurse -Force

$gitHash = ""
try {
  Push-Location $Root
  $gitHash = (git rev-parse --short HEAD 2>$null)
  Pop-Location
} catch { $gitHash = "" }

$manifest = @{
  product        = "jiegasuan"
  version        = $ver
  lockedAt       = $stamp
  lockedDate     = $dateOnly
  summary        = $Summary
  sourceRoot     = $Root
  sourceFrontend = $frontend
  previewDist    = $distDest
  previewUrl     = "http://localhost:5174"
  devUrl         = "http://localhost:5173"
  gitCommit      = $gitHash
}

$manifest | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $lockRoot "MANIFEST.json") -Encoding UTF8

$releaseLines = @(
  "# Locked preview v$ver",
  "",
  "- lockedAt: $stamp",
  "- preview: http://localhost:5174 (run bat in repo root)",
  "- dev: http://localhost:5173",
  "",
  "## Summary",
  $Summary,
  "",
  "## Paths",
  "- dist: preview-lock\dist",
  "- src: frontend\src",
  "- VERSION file at repo root"
)
$releaseLines | Set-Content (Join-Path $lockRoot "RELEASE.md") -Encoding UTF8

$manifestPath = Join-Path $Root "versions\manifest.json"
if (Test-Path $manifestPath) {
  $m = Get-Content $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $m.currentVersion = $ver
  $m.previewLock = @{
    version    = $ver
    lockedAt   = $stamp
    path       = $lockRoot
    distPath   = $distDest
    previewUrl = "http://localhost:5174"
    summary    = $Summary
  }
  $m | ConvertTo-Json -Depth 6 | Set-Content $manifestPath -Encoding UTF8
}

$history = Join-Path $Root "VERSION_HISTORY.md"
$line = "| $ver | lock-preview | $dateOnly | preview-lock\ | $Summary |"
if (Test-Path $history) {
  $content = Get-Content $history -Raw -Encoding UTF8
  if ($content -notmatch [regex]::Escape("lock-preview | $dateOnly")) {
    Add-Content $history $line -Encoding UTF8
  }
}

& (Join-Path $PSScriptRoot "generate-version-portal.ps1")

Write-Host ""
Write-Host "Done. Locked preview v$ver"
Write-Host "  dist: $distDest"
Write-Host "  open: preview bat -> :5174"
Write-Host "  ledger: versions\index.html"
