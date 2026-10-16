param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'windows_common.ps1')
$frontend = Join-Path $PSScriptRoot 'frontend'
$nextExecutable = Join-Path $frontend 'node_modules/next/dist/bin/next'
if (-not (Test-Path -LiteralPath $nextExecutable) -or -not (Test-Path -LiteralPath (Join-Path $frontend '.next/BUILD_ID'))) { throw 'Run SETUP_SENTINEL_HOST.bat first to install and build the host dashboard.' }
$env:SENTINEL_INTERFACE = 'operator'
$env:NEXT_TELEMETRY_DISABLED = '1'
$logDirectory = Join-Path $PSScriptRoot '.local/host'
$null = New-Item -ItemType Directory -Path $logDirectory -Force
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'start_local_ai.ps1')
if ($LASTEXITCODE -ne 0) { throw 'The local AI helper failed. Check its message above.' }
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'start_endpoint.ps1') -Mode fleet
if ($LASTEXITCODE -ne 0) { throw 'The private host relay could not start.' }
$backend = $null
try { $backend = Invoke-RestMethod 'http://127.0.0.1:8000/api/status' -TimeoutSec 2 } catch { }
if ($backend) {
    if ($backend.framework -ne 'Sentinel-IoT Autonomous XDR') { throw 'Another service is using port 8000.' }
} else {
    $python = Get-SentinelPython -Role host
    Invoke-SentinelChecked -Executable $python -Arguments @('-c','import fastapi, uvicorn, torch, sklearn, pandas, numpy, psutil') -Failure 'Host dependencies are missing; run SETUP_SENTINEL_HOST.bat'
    $backendProcess = Start-Process -FilePath $python -ArgumentList @('-m','uvicorn','backend.server:app','--host','127.0.0.1','--port','8000') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $logDirectory 'backend-stdout.log') -RedirectStandardError (Join-Path $logDirectory 'backend-stderr.log')
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        try { $backend = Invoke-RestMethod 'http://127.0.0.1:8000/api/status' -TimeoutSec 1; if ($backend.framework -eq 'Sentinel-IoT Autonomous XDR') { break } } catch { }
        if ($backendProcess.HasExited) { break }
        Start-Sleep -Milliseconds 500
    }
    if (-not $backend -or $backend.framework -ne 'Sentinel-IoT Autonomous XDR') { throw "The host backend did not become ready. See $logDirectory/backend-stderr.log." }
}
$dashboard = $null
try { $dashboard = Invoke-RestMethod 'http://127.0.0.1:3000/api/client/profile' -TimeoutSec 2 } catch { }
if ($dashboard) {
    if ($dashboard.profile -ne 'operator') { throw 'A different interface is using port 3000.' }
} else {
    $node = Get-SentinelNode
    $frontendProcess = Start-Process -FilePath $node -ArgumentList @("`"$nextExecutable`"",'start','--hostname','127.0.0.1','--port','3000') -WorkingDirectory $frontend -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $logDirectory 'dashboard-stdout.log') -RedirectStandardError (Join-Path $logDirectory 'dashboard-stderr.log')
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        try { $dashboard = Invoke-RestMethod 'http://127.0.0.1:3000/api/client/profile' -TimeoutSec 1; if ($dashboard.profile -eq 'operator') { break } } catch { }
        if ($frontendProcess.HasExited) { break }
        Start-Sleep -Milliseconds 300
    }
    if (-not $dashboard -or $dashboard.profile -ne 'operator') { throw "The host dashboard did not become ready. See $logDirectory/dashboard-stderr.log." }
}
Write-Host 'Host dashboard: http://127.0.0.1:3000'
Write-Host 'Client management: http://127.0.0.1:3000/clients'
if (-not $NoBrowser) { Start-Process -FilePath 'http://127.0.0.1:3000' -WindowStyle Hidden }
