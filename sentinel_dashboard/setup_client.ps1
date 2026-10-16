param([switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
$env:NEXT_TELEMETRY_DISABLED = '1'
. (Join-Path $PSScriptRoot 'windows_common.ps1')
$tools = Initialize-SentinelTools -CheckOnly:$CheckOnly
if ($CheckOnly) { Write-Host 'Client prerequisite check passed. No software was installed or rebuilt.'; exit 0 }
$pythonExecutable = New-SentinelEnvironment -Python $tools.Python -Role client
Write-Output 'Installing the client-only Python dependency and dashboard packages. This initial step requires internet access.'
Invoke-SentinelChecked -Executable $pythonExecutable -Arguments @('-m','pip','install','-r',(Join-Path $PSScriptRoot 'endpoint/requirements.txt')) -Failure 'The client Python dependency could not be installed'
Invoke-SentinelChecked -Executable $pythonExecutable -Arguments @('-c','import psutil') -Failure 'The client monitoring dependency could not load'
Push-Location (Join-Path $PSScriptRoot 'frontend')
try {
    Invoke-SentinelChecked -Executable $tools.Npm -Arguments @('ci') -Failure 'The dashboard dependencies could not be installed'
    Invoke-SentinelChecked -Executable $tools.Npm -Arguments @('run','build:client') -Failure 'The client dashboard build did not finish'
} finally { Pop-Location }
Write-Output 'Client setup complete. Run START_SENTINEL_CLIENT.bat.'
