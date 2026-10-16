$ErrorActionPreference = 'Stop'
$env:NEXT_TELEMETRY_DISABLED = '1'
. (Join-Path $PSScriptRoot 'find_python.ps1')
$pythonExecutable = Get-SentinelPython
$npmCommand = Get-Command npm.cmd -ErrorAction Stop
$null = Get-Command node -ErrorAction Stop
Write-Output 'Installing the client-only Python dependency and dashboard packages. This initial step requires internet access.'
& $pythonExecutable -m pip install -r (Join-Path $PSScriptRoot 'endpoint/requirements.txt')
if ($LASTEXITCODE -ne 0) { throw 'The client Python dependency could not be installed.' }
Push-Location (Join-Path $PSScriptRoot 'frontend')
try {
    & $npmCommand.Source ci
    if ($LASTEXITCODE -ne 0) { throw 'The dashboard dependencies could not be installed.' }
    & $npmCommand.Source run build:client
    if ($LASTEXITCODE -ne 0) { throw 'The client dashboard build did not finish.' }
} finally { Pop-Location }
Write-Output 'Client setup complete. Run START_SENTINEL_CLIENT.bat.'
