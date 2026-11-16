@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js 20 o superior y vuelve a abrir este archivo.
  pause
  exit /b 1
)
echo Abriendo la compilacion de MediCitas. No necesita npm install.
echo Copia la direccion que aparezca debajo en tu navegador.
node scripts\serve-built.mjs
pause
