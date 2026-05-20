@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "versions\index.html" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\generate-version-portal.ps1"
)

powershell -NoProfile -Command "Start-Process -FilePath '%~dp0versions\index.html'"

echo  已用默认浏览器打开版本溯源页
echo  若仍空白，请手动打开此文件:
echo  %~dp0versions\index.html
echo.
pause
