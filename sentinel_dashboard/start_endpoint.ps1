param([ValidateSet('fleet', 'client')][string]$Mode = 'fleet')
$ErrorActionPreference = 'Stop'
$endpointPort = if ($Mode -eq 'fleet') { 8010 } else { 8011 }
$serviceName = if ($Mode -eq 'fleet') { 'sentinel-fleet' } else { 'sentinel-client' }
$moduleName = if ($Mode -eq 'fleet') { 'endpoint.fleet' } else { 'endpoint.agent' }
$health = $null
try { $health = Invoke-RestMethod -Uri "http://127.0.0.1:$endpointPort/health" -TimeoutSec 2 } catch { }
if ($health) {
    if ($health.service -ne $serviceName) { throw "Another service is using port $endpointPort." }
    Write-Output "$serviceName is already running locally."
    exit 0
}

. (Join-Path $PSScriptRoot 'find_python.ps1')
$pythonRole = if ($Mode -eq 'fleet') { 'host' } else { 'client' }
$pythonExecutable = Get-SentinelPython -Role $pythonRole
if ($Mode -eq 'client') {
    & $pythonExecutable -c 'import psutil' 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'Client dependencies are missing. Run SETUP_SENTINEL_CLIENT.bat first.' }
}
$stateDirectory = Join-Path $PSScriptRoot ".local/$Mode"
$null = New-Item -ItemType Directory -Path $stateDirectory -Force
$process = Start-Process -FilePath $pythonExecutable -ArgumentList @('-m', $moduleName) -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $stateDirectory 'stdout.log') -RedirectStandardError (Join-Path $stateDirectory 'stderr.log')
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:$endpointPort/health" -TimeoutSec 1
        if ($health.service -eq $serviceName) { Write-Output "Started $serviceName on this computer."; exit 0 }
    } catch { }
    if ($process.HasExited) { throw "The service could not start. Check $stateDirectory/stderr.log." }
}
throw "The service did not become ready. Check $stateDirectory/stderr.log."
