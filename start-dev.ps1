# 介嘎算 — 一键启动（开两个窗口）
$root = $PSScriptRoot
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm start"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"
Write-Host "介嘎算已启动：后端 http://localhost:3001"
Write-Host "前端 http://localhost:5173 （手机定位需 HTTPS 时在 frontend 执行 `$env:VITE_DEV_HTTPS='1'; npm run dev`）"
