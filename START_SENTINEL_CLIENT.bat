@echo off
setlocal
title Sentinel IoT - Client Dashboard
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sentinel_dashboard\start_client.ps1" %*
set "sentinel_exit=%errorlevel%"
if not "%sentinel_exit%"=="0" pause
exit /b %sentinel_exit%
