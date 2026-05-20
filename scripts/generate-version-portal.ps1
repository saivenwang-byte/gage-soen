# Generate versions\index.html from versions\manifest.json
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $Root "versions\manifest.json"
$outHtml = Join-Path $Root "versions\index.html"

if (-not (Test-Path $manifestPath)) {
  throw "Missing manifest: $manifestPath"
}

$m = Get-Content $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$ver = $m.currentVersion
$preview = $m.previewLock
$generated = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$rows = ""
foreach ($v in $m.versions) {
  $snap = if ($v.snapshot) { "yes" } else { "notes only" }
  $path = $v.path
  $notes = ($v.notes -replace '<', '&lt;') -replace '>', '&gt;'
  $released = if ($v.releasedAt) { $v.releasedAt } else { "-" }
  $rows += @"
    <tr>
      <td><strong>v$($v.version)</strong></td>
      <td>$($v.codename)</td>
      <td>$released</td>
      <td>$snap</td>
      <td><code>$path</code></td>
      <td>$notes</td>
    </tr>
"@
}

$previewBlock = ""
if ($preview) {
  $pSummary = ($preview.summary -replace '<', '&lt;') -replace '>', '&gt;'
  $previewBlock = @"
  <section class="card highlight">
    <h2>Locked preview (for review)</h2>
    <p><strong>v$($preview.version)</strong> locked at $($preview.lockedAt)</p>
    <p>$pSummary</p>
    <ul>
      <li>Folder: <code>$($preview.distPath)</code></li>
      <li>Preview: <a href="$($preview.previewUrl)">$($preview.previewUrl)</a> (run locked-preview bat first)</li>
      <li>Dev build: <a href="http://localhost:5173">http://localhost:5173</a></li>
    </ul>
  </section>
"@
} else {
  $previewBlock = @"
  <section class="card">
    <p>No locked preview yet. Run <code>scripts\lock-preview.ps1</code> then open locked-preview bat.</p>
  </section>
"@
}

$html = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>jiegasuan version ledger</title>
  <style>
    :root { --bg: #f7f4ed; --card: #fff; --accent: #3d5a3c; --honey: #c4a574; }
    body { font-family: "Microsoft YaHei", sans-serif; background: var(--bg); margin: 0; padding: 20px; color: #333; line-height: 1.6; }
    h1 { color: var(--accent); font-size: 1.5rem; }
    .card { background: var(--card); border-radius: 12px; padding: 16px 20px; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .highlight { border-left: 4px solid var(--honey); }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
    th { background: #faf9f5; color: var(--accent); }
    code { font-size: 11px; word-break: break-all; background: #f5f5f0; padding: 2px 6px; border-radius: 4px; }
    .meta { font-size: 12px; color: #888; }
    ol { padding-left: 1.2rem; }
  </style>
</head>
<body>
  <h1>介嘎算 · 版本溯源台账</h1>
  <p class="meta">Generated $generated · current v$ver · workspace <code>$($m.activeCodePath)</code></p>

  $previewBlock

  <section class="card">
    <h2>Workflow</h2>
    <ol>
      <li>Develop: open dev bat -> :5173</li>
      <li>Lock UI: run lock-preview.ps1 -> preview-lock\dist</li>
      <li>Review: open locked-preview bat -> :5174</li>
      <li>Archive code: snapshot-version.ps1 -> versions\vX.Y.Z-name\</li>
    </ol>
  </section>

  <section class="card">
    <h2>Version history</h2>
    <table>
      <thead>
        <tr><th>Version</th><th>Codename</th><th>Date</th><th>Snapshot</th><th>Path</th><th>Notes</th></tr>
      </thead>
      <tbody>
        $rows
      </tbody>
    </table>
  </section>

  <section class="card">
    <h2>Files</h2>
    <ul>
      <li><code>VERSION</code></li>
      <li><code>VERSION_HISTORY.md</code></li>
      <li><code>CURRENT.md</code></li>
      <li><code>PATHS.md</code></li>
      <li><code>versions\manifest.json</code></li>
    </ul>
  </section>
</body>
</html>
"@

$html | Set-Content $outHtml -Encoding UTF8
Write-Host "Generated: $outHtml"
