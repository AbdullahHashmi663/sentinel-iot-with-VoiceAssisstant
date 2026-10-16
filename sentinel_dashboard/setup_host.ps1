param([switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
$env:NEXT_TELEMETRY_DISABLED = '1'
. (Join-Path $PSScriptRoot 'windows_common.ps1')
$tools = Initialize-SentinelTools -CheckOnly:$CheckOnly -Role host
Invoke-SentinelChecked -Executable $tools.Python -Arguments @((Join-Path $PSScriptRoot 'backend/verify_install.py'),'--assets-only') -Failure 'Host model/data assets are incomplete'
if ($CheckOnly) {
    $null = Get-SentinelOllama
    Write-Host 'Host prerequisite check passed. No software was installed or rebuilt.'
    exit 0
}
Write-Host 'Preparing the HOST. Initial package, CPU inference runtime, and local AI model downloads can take time.'
if (-not (Test-Path -LiteralPath (Join-Path ([Environment]::GetFolderPath('System')) 'vcruntime140.dll'))) {
    Install-SentinelPackage -Id 'Microsoft.VCRedist.2015+.x64' -Scope machine
}
$python = New-SentinelEnvironment -Python $tools.Python -Role host
Invoke-SentinelChecked -Executable $python -Arguments @('-m','pip','install','torch==2.11.0','--index-url','https://download.pytorch.org/whl/cpu') -Failure 'CPU PyTorch installation failed'
Invoke-SentinelChecked -Executable $python -Arguments @('-m','pip','install','-r',(Join-Path $PSScriptRoot 'backend/requirements-host.txt')) -Failure 'Host Python dependency installation failed'
Invoke-SentinelChecked -Executable $python -Arguments @((Join-Path $PSScriptRoot 'backend/verify_install.py')) -Failure 'Host Python verification failed'
Enable-SentinelAiPrivacy
try { $ollama = Get-SentinelOllama } catch {
    Install-SentinelPackage -Id 'Ollama.Ollama' -Scope user
    $ollama = Get-SentinelOllama
}
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'start_local_ai.ps1')
if ($LASTEXITCODE -ne 0) { throw 'Private Ollama could not start.' }
$aiReady = $false
for ($attempt = 0; $attempt -lt 40; $attempt++) {
    try { $null = Invoke-RestMethod 'http://127.0.0.1:11434/api/version' -TimeoutSec 1; $aiReady = $true; break } catch { Start-Sleep -Milliseconds 500 }
}
if (-not $aiReady) { throw 'Ollama did not become ready. Check its local server log and rerun setup.' }
Invoke-SentinelChecked -Executable $ollama -Arguments @('pull','qwen2.5:1.5b') -Failure 'The local conversation model could not be downloaded'
Push-Location (Join-Path $PSScriptRoot 'voice')
try {
    Invoke-SentinelChecked -Executable $tools.Npm -Arguments @('ci','--no-audit','--no-fund') -Failure 'Local neural speech runtime installation failed'
    Invoke-SentinelChecked -Executable $tools.Npm -Arguments @('run','setup') -Failure 'Local female voice model could not be prepared'
} finally { Pop-Location }
Push-Location (Join-Path $PSScriptRoot 'frontend')
try {
    $env:SENTINEL_INTERFACE = 'operator'
    Invoke-SentinelChecked -Executable $tools.Npm -Arguments @('ci') -Failure 'Host dashboard package installation failed'
    Invoke-SentinelChecked -Executable $tools.Npm -Arguments @('run','build') -Failure 'Host dashboard production build failed'
} finally { Pop-Location }
Write-Host 'Host setup complete. Run START_SENTINEL_HOST.bat. Client setup is separate.'
