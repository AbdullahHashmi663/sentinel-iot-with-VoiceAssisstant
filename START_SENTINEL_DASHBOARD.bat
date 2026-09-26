@echo off
title Sentinel-IoT XDR Platform Launcher
color 0b
echo =========================================================================
echo             SENTINEL-IOT: AUTONOMOUS EXPLAINABLE XDR SOC
echo =========================================================================
echo [1/3] Initializing Python FastAPI Conformer Neural Core on port 8000...
start "Sentinel-IoT Backend (FastAPI)" /D "c:\Users\01-135231-001\Desktop\Sentinel_IOT\sentinel_dashboard" "C:\Users\01-135231-001\AppData\Local\Python\bin\python.exe" -m uvicorn backend.server:app --host 127.0.0.1 --port 8000

echo [2/3] Initializing Next.js 16 SOC Dashboard on port 3000...
start "Sentinel-IoT Frontend (Next.js)" /D "c:\Users\01-135231-001\Desktop\Sentinel_IOT\sentinel_dashboard\frontend" cmd /k "npm run dev"

echo [3/3] Waiting for servers to warm up...
timeout /t 3 >nul

echo Launching SOC Dashboard in your default browser...
start http://localhost:3000

echo =========================================================================
echo  Sentinel-IoT is running:
echo  - Frontend: http://localhost:3000
echo  - Backend API: http://127.0.0.1:8000
echo  - Interactive Swagger Docs: http://127.0.0.1:8000/docs
echo =========================================================================
pause
