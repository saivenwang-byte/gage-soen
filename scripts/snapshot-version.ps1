# Snapshot dev tree into versions\v{version}-{codename}
param(
  [string]$Version = "",
  [string]$Codename = "snapshot",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

$verFile = Join-Path $Root "VERSION"
if (-not $Version) {
  $Version = (Get-Content $verFile -Raw).Trim()
}
if (-not $Version) { throw "VERSION file is empty" }

$safeCodename = ($Codename -replace '[\\/:*?"<>|]', '-').Trim()
$destName = "v$Version-$safeCodename"
$dest = Join-Path $Root "versions" $destName

if (Test-Path $dest) {
  Write-Host "Already exists: $dest"
  Write-Host "Delete it or use another -Codename"
  exit 1
}

Write-Host "[jiegasuan] snapshot v$Version ($safeCodename)"

$frontend = Join-Path $Root "frontend"
if (-not $SkipBuild) {
  Push-Location $frontend
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
  Pop-Location
}

New-Item -ItemType Directory -Path $dest -Force | Out-Null

$robocopyArgs = @(
  $Root,
  $dest,
  '/E', '/XD', 'node_modules', '.git', 'dist', '.cursor', 'preview-lock\dist',
  '/XF', '*.db', '*.log',
  '/NFL', '/NDL', '/NJH', '/NJS', '/nc', '/ns', '/np'
)

Get-ChildItem (Join-Path $Root "versions") -Directory -ErrorAction SilentlyContinue | ForEach-Object {
  $robocopyArgs += '/XD'
  $robocopyArgs += $_.FullName
}

& robocopy @robocopyArgs | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed: $LASTEXITCODE" }

$distSrc = Join-Path $frontend "dist"
if (Test-Path $distSrc) {
  Copy-Item $distSrc (Join-Path $dest "preview-dist") -Recurse -Force
}

$stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$dateOnly = Get-Date -Format "yyyy-MM-dd"

@(
  "# Snapshot v$Version ($safeCodename)",
  "",
  "generated: $stamp",
  "source: $Root",
  "dest: $dest",
  "ui build: preview-dist\"
) | Set-Content (Join-Path $dest "SNAPSHOT.txt") -Encoding UTF8

$manifestPath = Join-Path $Root "versions\manifest.json"
if (Test-Path $manifestPath) {
  $m = Get-Content $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $m.currentVersion = $Version
  $entry = @{
    version    = $Version
    codename   = $Codename
    path       = $dest
    snapshot   = $true
    notes      = "Code snapshot $safeCodename"
    releasedAt = $dateOnly
  }
  $newVersions = @()
  $replaced = $false
  foreach ($v in $m.versions) {
    if ($v.version -eq $Version -and $v.codename -eq $Codename) {
      $newVersions += $entry
      $replaced = $true
    } else {
      $newVersions += $v
    }
  }
  if (-not $replaced) { $newVersions += $entry }
  $m.versions = $newVersions
  $m.activeCodePath = $Root
  $m | ConvertTo-Json -Depth 6 | Set-Content $manifestPath -Encoding UTF8
}

$history = Join-Path $Root "VERSION_HISTORY.md"
$line = "| $Version | $Codename | $dateOnly | versions\$destName\ | code snapshot |"
if (Test-Path $history) {
  if (-not (Select-String -Path $history -Pattern $destName -Quiet)) {
    Add-Content $history $line -Encoding UTF8
  }
}

& (Join-Path $PSScriptRoot "generate-version-portal.ps1")

Write-Host "Done: $dest"
