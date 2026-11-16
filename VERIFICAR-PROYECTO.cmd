@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "verifyFailed=0"
if not exist node_modules\vite\bin\vite.js (
  call npm.cmd ci
  if errorlevel 1 exit /b 1
)
call npm.cmd run verify:frontend
if errorlevel 1 set "verifyFailed=1"
call npm.cmd run lint
if errorlevel 1 set "verifyFailed=1"
call npm.cmd exec -- tsc --noEmit -p tsconfig.app.json
if errorlevel 1 set "verifyFailed=1"
call npm.cmd run build
if errorlevel 1 set "verifyFailed=1"
if "%verifyFailed%"=="0" (echo Comprobaciones terminadas sin errores.) else (echo Hay comprobaciones con errores. Revisa la salida.)
pause
exit /b %verifyFailed%
