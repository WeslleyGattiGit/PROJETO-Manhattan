@echo off
REM Script para abrir o projeto no navegador
REM ========================================

echo Abrindo frontend do Conexxa...

REM Aguarda um pouco para o servidor iniciar se estiver rodando
timeout /t 2 /nobreak

REM Tenta abrir o navegador
start "" "http://localhost:8080/pages/login.html"

echo.
echo Navegador aberto! Se nao funcionou, tente:
echo http://localhost:8080/pages/login.html
echo.
pause
