@echo off
title Payroll Management System
echo ==========================================
echo   Starting Payroll Management System...
echo ==========================================
cd server
echo [INFO] Starting server with Node.js directly...
node index.js
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Server failed to start.
    pause
)
pause
