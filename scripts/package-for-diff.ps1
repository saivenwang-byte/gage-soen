# Package all app surfaces for third-party diff tools
param(
  [switch]$SkipBuild,
  [switch]$SkipLockPreview,
  [switch]$NoZip
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ver = (Get-Content (Join-Path $Root "VERSION") -Raw).Trim()
$dateTag = Get-Date -Format "yyyy-MM-dd"
$bundleRoot = Join-Path $Root "export-bundle"
$outName = "v$ver-$dateTag"
$outDir = Join-Path $bundleRoot $outName
$zipPath = Join-Path $bundleRoot "jiegasuan-diff-$ver-$dateTag.zip"

function Copy-Tree($src, $dest, [string[]]$excludeDirNames = @('node_modules', '.git', '.cursor')) {
  if (-not (Test-Path $src)) {
    Write-Warning "Skip missing: $src"
    return
  }
  New-Item -ItemType Directory -Path $dest -Force | Out-Null
  $xd = @()
  foreach ($d in $excludeDirNames) { $xd += '/XD'; $xd += $d }
  $args = @($src, $dest, '/E', '/NFL', '/NDL', '/NJH', '/NJS', '/nc', '/ns', '/np') + $xd
  & robocopy @args | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "robocopy failed $src -> $dest ($LASTEXITCODE)" }
}

Write-Host "[jiegasuan] package for diff -> $outDir"

if (-not $SkipBuild) {
  Push-Location (Join-Path $Root "frontend")
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "frontend build failed" }
  Pop-Location
}

if (-not $SkipLockPreview) {
  & (Join-Path $PSScriptRoot "lock-preview.ps1") -SkipBuild
}

if (Test-Path $outDir) { Remove-Item $outDir -Recurse -Force }
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

Copy-Tree (Join-Path $Root "frontend\src") (Join-Path $outDir "A-source-frontend-src")
$fePublic = Join-Path $Root "frontend\public"
if (Test-Path $fePublic) {
  Copy-Tree $fePublic (Join-Path $outDir "A-source-frontend-public") @()
}
Copy-Tree (Join-Path $Root "backend") (Join-Path $outDir "B-source-backend-api") @('node_modules')

$dist = Join-Path $Root "frontend\dist"
if (Test-Path $dist) {
  Copy-Item $dist (Join-Path $outDir "C-built-h5-frontend-dist") -Recurse -Force
}

$lockDist = Join-Path $Root "preview-lock\dist"
if (Test-Path $lockDist) {
  Copy-Item $lockDist (Join-Path $outDir "D-locked-preview-dist") -Recurse -Force
}

$legacy = Join-Path $Root "legacy-miniprogram"
if (Test-Path $legacy) {
  Copy-Tree $legacy (Join-Path $outDir "E-legacy-wechat-miniprogram")
}

$docsDest = Join-Path $outDir "F-docs-and-meta"
New-Item -ItemType Directory -Path $docsDest -Force | Out-Null
foreach ($f in @('VERSION', 'README.md', 'PATHS.md', 'CURRENT.md', 'VERSION_HISTORY.md')) {
  $p = Join-Path $Root $f
  if (Test-Path $p) { Copy-Item $p $docsDest -Force }
}
Get-ChildItem (Join-Path $Root "versions") -Directory -ErrorAction SilentlyContinue | ForEach-Object {
  $rp = Join-Path $_.FullName "RELEASE_NOTES.md"
  if (Test-Path $rp) {
    $destName = $_.Name + "-RELEASE_NOTES.md"
    Copy-Item $rp (Join-Path $docsDest $destName) -Force
  }
}

$readmeEn = @"
# Jiegasuan diff bundle

version: $ver
generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
folder: $outDir

## Folders

- A-source-frontend-src     React source (AoSo / XiaDouDou / Profile)
- B-source-backend-api      Express API + seed JSON
- C-built-h5-frontend-dist  Latest npm build (static H5)
- D-locked-preview-dist     Locked preview build (family review snapshot)
- E-legacy-wechat-miniprogram  Old WeChat mini program archive
- F-docs-and-meta         VERSION, README, release notes

## Suggested diffs

1. C vs D  = latest UI vs locked preview
2. A vs E  = H5 vs legacy mini program
3. A alone = source review

Dev URLs (not in zip): https://localhost:5173  |  http://127.0.0.1:5174
"@
Set-Content (Join-Path $outDir "README-diff-en.txt") -Value $readmeEn -Encoding UTF8

$readmeZhPath = Join-Path $Root "export-bundle\README-diff-zh.md"
if (Test-Path $readmeZhPath) {
  Copy-Item $readmeZhPath (Join-Path $outDir "README-diff-zh.md") -Force
}

if (-not $NoZip) {
  if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
  Compress-Archive -Path "$outDir\*" -DestinationPath $zipPath -CompressionLevel Optimal
  Write-Host "ZIP: $zipPath"
}

Write-Host "Folder: $outDir"
Write-Host "Done."
