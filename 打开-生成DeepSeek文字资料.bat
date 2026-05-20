@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Generating text bundle for DeepSeek...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\export-text-for-ai.ps1"
echo.
echo Open folder:
echo %~dp0export-text-for-ai
explorer "%~dp0export-text-for-ai"
pause
