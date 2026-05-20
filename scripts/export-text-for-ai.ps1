# Export copy-paste text for DeepSeek (markdown + source text, no miniprogram)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ver = (Get-Content (Join-Path $Root "VERSION") -Raw).Trim()
$dateTag = Get-Date -Format "yyyy-MM-dd"
$outRoot = Join-Path $Root "export-text-for-ai"
$outVer = Join-Path $outRoot "v$ver-$dateTag"

$textExt = @('.md', '.txt', '.js', '.jsx', '.json', '.css', '.mjs', '.cjs', '.ps1', '.bat', '.env.example')

function Copy-TextFiles($src, $dest, [string[]]$skipRelPrefixes) {
  if (-not (Test-Path $src)) { return }
  Get-ChildItem $src -Recurse -File | ForEach-Object {
    $ext = $_.Extension.ToLower()
    if ($textExt -notcontains $ext) { return }
    if ($_.Name -eq 'package-lock.json') { return }
    $rel = $_.FullName.Substring($src.Length).TrimStart('\')
    foreach ($p in $skipRelPrefixes) {
      if ($rel -like "$p*") { return }
    }
    $target = Join-Path $dest $rel
    $parent = Split-Path $target -Parent
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Copy-Item $_.FullName $target -Force
  }
}

if (Test-Path $outVer) { Remove-Item $outVer -Recurse -Force }
$docDir = Join-Path $outVer "docs"
$feDir = Join-Path $outVer "source-frontend"
$beDir = Join-Path $outVer "source-backend"
$metaDir = Join-Path $outVer "project-meta"
New-Item -ItemType Directory -Path $docDir, $feDir, $beDir, $metaDir -Force | Out-Null

$tpl = Join-Path $PSScriptRoot "export-text-templates"
if (Test-Path $tpl) {
  Copy-Item (Join-Path $tpl '*.md') $docDir -Force
}

Copy-TextFiles (Join-Path $Root "frontend\src") $feDir @()
foreach ($f in @('package.json', 'vite.config.js', 'index.html', '.env.example')) {
  $p = Join-Path $Root "frontend\$f"
  if (Test-Path $p) { Copy-Item $p (Join-Path $feDir $f) -Force }
}

Copy-TextFiles (Join-Path $Root "backend") $beDir @('node_modules')

foreach ($f in @('VERSION', 'README.md', 'PATHS.md', 'CURRENT.md', 'VERSION_HISTORY.md')) {
  $p = Join-Path $Root $f
  if (Test-Path $p) { Copy-Item $p $metaDir -Force }
}

$idx = @(
  "# File list",
  "",
  "version: $ver",
  "generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
  "folder: $outVer",
  "",
  "## For DeepSeek: read docs/00 first, then copy source files as needed",
  ""
)
Get-ChildItem $outVer -Recurse -File | Sort-Object FullName | ForEach-Object {
  $rel = $_.FullName.Substring($outVer.Length).TrimStart('\')
  $idx += "- $rel"
}
Set-Content (Join-Path $outVer "FILE-LIST.md") -Value ($idx -join [Environment]::NewLine) -Encoding UTF8

$readme = @"
# Text bundle for DeepSeek (介嘎算)

Physical folder: export-text-for-ai\v$ver-$dateTag

All files are plain text (Markdown, JS, JSX, JSON, CSS).
NO WeChat miniprogram. NO node_modules. NO compiled dist.

Start: docs/00-请先读我-复制给DeepSeek.md

Regenerate: scripts\export-text-for-ai.ps1
"@
[System.IO.File]::WriteAllText((Join-Path $outRoot "README-START-HERE.txt"), $readme, [System.Text.UTF8Encoding]::new($true))

Write-Host "Done: $outVer"
