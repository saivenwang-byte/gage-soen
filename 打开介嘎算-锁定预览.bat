@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "preview-lock\dist\index.html" (
  echo  正在生成锁定预览...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\lock-preview.ps1"
  if errorlevel 1 (
    echo  失败：请先在 frontend 目录执行 npm install
    pause
    exit /b 1
  )
)

echo.
echo  介嘎算 — 锁定预览（定稿界面）
echo.

start "jiegasuan-lock-5174" cmd /k "%~dp0scripts\run-locked-serve.cmd"
echo  等待服务启动...
timeout /t 7 /nobreak >nul
start "" "http://127.0.0.1:5174/"

echo.
echo  浏览器: http://127.0.0.1:5174/
echo  请勿关闭 jiegasuan-lock-5174 窗口
echo.
pause
