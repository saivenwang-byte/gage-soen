# Single share artifact: ZIP with one HTML pointing to production URL (no tunnel)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
& node (Join-Path $PSScriptRoot "sync-deploy-config.mjs") | Out-Null

$cfg = Get-Content (Join-Path $Root "deploy.config.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$ver = (Get-Content (Join-Path $Root "VERSION") -Raw).Trim()
$url = $cfg.productionUrl.TrimEnd('/')
$outBase = "jiegasuan-v$ver-share"
$htmlOut = Join-Path $Root ($outBase + ".html")
$zipOut = Join-Path $Root ($outBase + ".zip")

$enc = New-Object System.Text.UTF8Encoding $true
$tpl = [System.IO.File]::ReadAllText((Join-Path $PSScriptRoot "forward-package-template.html"), [System.Text.Encoding]::UTF8)
$link = "$url/"
$html = $tpl `
  -replace '__VERSION__', $ver `
  -replace '__LINK_DISPLAY__', $link `
  -replace '__LINK_HREF__', $link `
  -replace '__LINK_JS__', ($link.Replace("'", "\'")) `
  -replace '__QR_BLOCK__', "<img class='qr' src='https://api.qrserver.com/v1/create-qr-code/?size=280x280&amp;data=$([uri]::EscapeDataString($link))' alt='QR'/>" `
  -replace '__GENERATED__', (Get-Date -Format "yyyy-MM-dd HH:mm") `
  -replace '__NOTE__', 'Production URL on Render. First load may be slow (cold start).'

[System.IO.File]::WriteAllText($htmlOut, $html, $enc)
if (Test-Path $zipOut) { Remove-Item $zipOut -Force }
Compress-Archive -Path $htmlOut -DestinationPath $zipOut -Force

Write-Host "Share link: $link"
Write-Host "Send file:  $zipOut"
Write-Host "Or send URL directly in WeChat."
