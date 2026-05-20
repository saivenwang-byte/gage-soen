# 使用系统已保存的 GitHub 凭据推送（不打印 token）
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

$input = "protocol=https`nhost=github.com`n"
$cred = $input | git credential fill 2>$null
if (-not $cred) { throw "无法读取 GitHub 凭据" }
$user = ($cred | Where-Object { $_ -match '^username=' }) -replace '^username=',''
$pass = ($cred | Where-Object { $_ -match '^password=' }) -replace '^password=',''
if (-not $pass) { throw "GitHub 凭据缺少 token" }

$remote = "https://${user}:$pass@github.com/saivenwang-byte/gage-soen.git"
git push $remote HEAD:main 2>&1 | ForEach-Object {
  if ($_ -match 'password|gho_|ghp_') { $_ -replace 'gh[oap]_[A-Za-z0-9]+', '***' } else { $_ }
}
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "已推送到 GitHub main。" -ForegroundColor Green
