@echo off
REM Script para rodar o projeto Conexxa no Windows
REM ==============================================

setlocal enabledelayedexpansion

echo.
echo ================================
echo    Conexxa Platform - Windows
echo ================================
echo.

REM Cores não funcionam bem em CMD, então usamos emoji
echo [1/3] Verificando Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js nao encontrado!
    echo Instale de: https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo [2/3] Verificando npm...
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo X npm nao encontrado!
    pause
    exit /b 1
)
echo ✓ npm encontrado

echo.
echo [3/3] Iniciando servidor local...
echo.

REM Ir para a pasta frontend
cd frontend

REM Tentar usar http-server se disponivel
npm list -g http-server >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Iniciando com http-server (porta 8080)...
    http-server -p 8080 -c-1
) else (
    echo Instalando http-server...
    npm install -g http-server
    echo.
    echo Iniciando com http-server (porta 8080)...
    http-server -p 8080 -c-1
)

pause
