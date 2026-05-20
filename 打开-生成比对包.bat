@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Packaging jiegasuan for diff tools...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\package-for-diff.ps1"
echo.
echo Open folder: %~dp0export-bundle
pause
