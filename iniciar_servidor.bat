@echo off
title Servidor IFCE - Arquitetura e Montagens de Computador
cls
echo =================================================================
echo   INICIANDO PLATAFORMA EDUCACIONAL IFCE - PROCESSADORES E RAM
echo =================================================================
echo.
echo Verificando Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao foi encontrado no seu computador!
    echo Por favor, instale o Node.js em: https://nodejs.org
    pause
    exit /b
)

echo Iniciando servidor na porta 3000...
echo.
node server.js
pause
