@echo off
chcp 65001 >nul
set "DIST=%~dp0..\preview-lock\dist"
if not exist "%DIST%\index.html" (
  echo [错误] 缺少 preview-lock\dist\index.html
  echo 请先双击「打开介嘎算-锁定预览.bat」会自动构建，或运行:
  echo   powershell -File scripts\lock-preview.ps1
  pause
  exit /b 1
)
cd /d "%DIST%"
echo Serving locked preview SPA at http://127.0.0.1:5174/
echo Root: %CD%
echo Do not close this window.
npx --yes serve -s -l 5174 -n .
