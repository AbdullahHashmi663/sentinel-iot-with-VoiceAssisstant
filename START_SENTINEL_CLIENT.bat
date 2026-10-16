@echo off
title Sentinel IoT - Client Dashboard
powershell -NoProfile -File "%~dp0sentinel_dashboard\start_client.ps1"
if errorlevel 1 pause
