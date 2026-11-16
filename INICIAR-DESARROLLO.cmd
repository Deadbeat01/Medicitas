@echo off
chcp 65001 >nul
cd /d "%~dp0"
where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js 20 o superior con npm.
  pause
  exit /b 1
)
if not exist .env.local copy .env.example .env.local >nul
if not exist node_modules\vite\bin\vite.js (
  echo Instalando dependencias del proyecto. Espera a que termine.
  call npm.cmd ci
  if errorlevel 1 (
    echo La instalacion fallo. Revisa el mensaje anterior y la conexion a Internet.
    pause
    exit /b 1
  )
)
call npm.cmd run dev
pause
