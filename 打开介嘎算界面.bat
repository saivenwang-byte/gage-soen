@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  介嘎算 — 正在启动后端 + 前端（开发最新版）...
echo.

start "jiegasuan-backend" cmd /k "%~dp0scripts\run-backend.cmd"
timeout /t 4 /nobreak >nul
start "jiegasuan-frontend" cmd /k "%~dp0scripts\run-frontend-dev.cmd"
echo  等待前端就绪（约 10 秒）...
timeout /t 10 /nobreak >nul

start "" "http://localhost:5173"

echo.
echo  已打开: http://localhost:5173
echo  若空白: 确认 jiegasuan-frontend 窗口无报错；或试 打开介嘎算-锁定预览.bat
echo  手机同 WiFi 要定位: 在 frontend 设 VITE_DEV_HTTPS=1 后 npm run dev，用 https://本机IP:5173
echo  定稿版: 打开介嘎算-锁定预览.bat
echo.
pause
