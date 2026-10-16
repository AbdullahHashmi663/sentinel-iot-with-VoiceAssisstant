@echo off
setlocal
title Sentinel IoT - Host Setup
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sentinel_dashboard\setup_host.ps1" %*
set "sentinel_exit=%errorlevel%"
if not "%sentinel_exit%"=="0" echo Host setup did not finish. Read the error above before trying again.
if /I not "%~1"=="-CheckOnly" pause
exit /b %sentinel_exit%
