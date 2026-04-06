@echo off
title Payroll Management System Server
echo ==========================================
echo   Starting Payroll Management System...
echo ==========================================
cd server
if not exist node_modules (
    echo [INFO] Installing dependencies...
    call npm install --no-audit --no-fund
)
echo [INFO] Starting server with Node.js...
node index.js
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Server failed to start.
)
pause
