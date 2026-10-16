@echo off
setlocal
title Sentinel IoT - Client Setup
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sentinel_dashboard\setup_client.ps1" %*
set "sentinel_exit=%errorlevel%"
if not "%sentinel_exit%"=="0" echo Client setup did not finish. Read the error above before trying again.
if /I not "%~1"=="-CheckOnly" pause
exit /b %sentinel_exit%
