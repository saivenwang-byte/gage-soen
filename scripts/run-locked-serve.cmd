@echo off
cd /d "%~dp0..\preview-lock\dist"
echo Serving locked preview at http://127.0.0.1:5174
echo Do not close this window.
npx --yes serve -l 5174 -n
