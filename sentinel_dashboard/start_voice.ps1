$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'windows_common.ps1')
$stateRoot = if ($env:SENTINEL_STATE_DIR) { $env:SENTINEL_STATE_DIR } else { Join-Path $PSScriptRoot '.local' }
$voiceState = Join-Path $stateRoot 'voice'
if (-not (Test-Path -LiteralPath (Join-Path $voiceState 'ready.json'))) { Write-Warning 'Neural voice is not installed. Run host setup to install it; local system voices remain available.'; exit 0 }
try {
    $health = Invoke-RestMethod 'http://127.0.0.1:8012/health' -TimeoutSec 2
    if ($health.service -ne 'sentinel-voice') { throw 'Another service occupies the voice port.' }
    Write-Host 'Local neural voice is already running.'; exit 0
} catch { if ($health) { throw } }
$node = Get-SentinelNode
$serverScript = Join-Path $PSScriptRoot 'voice/server.mjs'
$process = Start-Process -FilePath $node -ArgumentList @("`"$serverScript`"") -WorkingDirectory (Join-Path $PSScriptRoot 'voice') -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $voiceState 'stdout.log') -RedirectStandardError (Join-Path $voiceState 'stderr.log')
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try { $health = Invoke-RestMethod 'http://127.0.0.1:8012/health' -TimeoutSec 1; if ($health.service -eq 'sentinel-voice') { Write-Host 'Started private neural voice.'; exit 0 } } catch { }
    if ($process.HasExited) { break }
    Start-Sleep -Milliseconds 300
}
throw "Neural voice did not start. Check $voiceState/stderr.log."
