param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$frontendDirectory = Join-Path $PSScriptRoot 'frontend'
$nextExecutable = Join-Path $frontendDirectory 'node_modules/next/dist/bin/next'
if (-not (Test-Path -LiteralPath $nextExecutable) -or -not (Test-Path -LiteralPath (Join-Path $frontendDirectory '.next-client/BUILD_ID'))) { throw 'Run SETUP_SENTINEL_CLIENT.bat first to install and build the client dashboard.' }
& powershell -NoProfile -File (Join-Path $PSScriptRoot 'start_endpoint.ps1') -Mode client
if ($LASTEXITCODE -ne 0) { throw 'The local client agent could not start.' }
$alreadyRunning = $false
$clientProfile = $null
try { $clientProfile = Invoke-RestMethod -Uri 'http://127.0.0.1:3001/api/client/profile' -TimeoutSec 2 } catch { }
if ($clientProfile) {
    if ($clientProfile.profile -ne 'client') { throw 'Another interface is running on port 3001.' }
    $alreadyRunning = $true
}
if (-not $alreadyRunning) {
    $nodeCommand = Get-Command node -ErrorAction Stop
    $env:SENTINEL_INTERFACE = 'client'
    $env:NEXT_TELEMETRY_DISABLED = '1'
    $stateDirectory = Join-Path $PSScriptRoot '.local/client'
    $process = Start-Process -FilePath $nodeCommand.Source -ArgumentList @("`"$nextExecutable`"", 'start', '--hostname', '127.0.0.1', '--port', '3001') -WorkingDirectory $frontendDirectory -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $stateDirectory 'dashboard-stdout.log') -RedirectStandardError (Join-Path $stateDirectory 'dashboard-stderr.log')
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try {
            $clientProfile = Invoke-RestMethod -Uri 'http://127.0.0.1:3001/api/client/profile' -TimeoutSec 1
            if ($clientProfile.profile -eq 'client') { $alreadyRunning = $true; break }
        } catch { }
        if ($process.HasExited) { break }
        Start-Sleep -Milliseconds 300
    }
}
if (-not $alreadyRunning) { throw 'The client dashboard did not become ready. Check sentinel_dashboard/.local/client/dashboard-stderr.log.' }
Write-Output 'Client dashboard: http://127.0.0.1:3001/client'
if (-not $NoBrowser) { Start-Process -FilePath 'http://127.0.0.1:3001/client' -WindowStyle Hidden }
