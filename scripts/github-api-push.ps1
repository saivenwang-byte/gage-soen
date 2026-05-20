# 当 git push 443 失败时，经 GitHub REST API 更新 main（仅推送相对远端的新增改动）
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

$input = "protocol=https`nhost=github.com`n"
$cred = $input | git credential fill 2>$null
$token = ($cred | Where-Object { $_ -match '^password=' }) -replace '^password=',''
if (-not $token) { throw "无 GitHub token" }

$headers = @{
  Authorization = "Bearer $token"
  "User-Agent"  = "jiegasuan-deploy"
  Accept        = "application/vnd.github+json"
}
$owner = "saivenwang-byte"
$repo = "gage-soen"
$base = "https://api.github.com/repos/$owner/$repo"

$remoteSha = (Invoke-RestMethod -Uri "$base/git/ref/heads/main" -Headers $headers -TimeoutSec 60).object.sha
$localSha = (git rev-parse HEAD).Trim()
if ($remoteSha -eq $localSha) {
  Write-Host "GitHub 已与本地 HEAD 一致，无需推送。" -ForegroundColor Green
  exit 0
}

Write-Host "远端 $remoteSha -> 本地 $localSha" -ForegroundColor Cyan
$baseCommit = Invoke-RestMethod -Uri "$base/git/commits/$remoteSha" -Headers $headers -TimeoutSec 60
$baseTreeSha = $baseCommit.tree.sha

$changed = git diff --name-only $remoteSha HEAD
if (-not $changed) { throw "无变更文件" }

$entries = @()
foreach ($rel in $changed) {
  $full = Join-Path $root $rel
  if (-not (Test-Path $full)) {
    $entries += @{ path = $rel; mode = "100644"; type = "blob"; sha = $null }
    continue
  }
  $bytes = [System.IO.File]::ReadAllBytes($full)
  $b64 = [Convert]::ToBase64String($bytes)
  $blob = Invoke-RestMethod -Uri "$base/git/blobs" -Method Post -Headers $headers -Body (@{
    content = $b64
    encoding = "base64"
  } | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 120
  $entries += @{ path = $rel.Replace('\', '/'); mode = "100644"; type = "blob"; sha = $blob.sha }
  Write-Host "  blob $($rel.Replace('\','/'))"
}

$treeBody = @{ base_tree = $baseTreeSha; tree = $entries } | ConvertTo-Json -Depth 6
$newTree = Invoke-RestMethod -Uri "$base/git/trees" -Method Post -Headers $headers -Body $treeBody -ContentType "application/json" -TimeoutSec 120

$msg = (git log -1 --format=%B $localSha).Trim()
$commitBody = @{
  message = $msg
  tree = $newTree.sha
  parents = @($remoteSha)
} | ConvertTo-Json
$newCommit = Invoke-RestMethod -Uri "$base/git/commits" -Method Post -Headers $headers -Body $commitBody -ContentType "application/json" -TimeoutSec 60

Invoke-RestMethod -Uri "$base/git/refs/heads/main" -Method Patch -Headers $headers -Body (@{
  sha = $newCommit.sha
  force = $false
} | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 60 | Out-Null

Write-Host "已更新 main -> $($newCommit.sha.Substring(0,7))" -ForegroundColor Green
