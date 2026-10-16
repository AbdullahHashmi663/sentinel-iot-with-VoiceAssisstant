$ErrorActionPreference = 'Stop'

# Keep the inference service private, even when launched from a fresh Windows session.
$env:OLLAMA_NO_CLOUD = '1'
$env:OLLAMA_HOST = '127.0.0.1:11434'
$env:OLLAMA_NUM_PARALLEL = '1'
$env:OLLAMA_MAX_LOADED_MODELS = '1'
$env:OLLAMA_CONTEXT_LENGTH = '4096'

$ollamaExecutable = Join-Path $env:LOCALAPPDATA 'Programs/Ollama/ollama.exe'
if (-not (Test-Path -LiteralPath $ollamaExecutable)) {
    Write-Warning 'Ollama is not installed. Sentinel will use its built-in project guide.'
    exit 0
}

try {
    $null = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/version' -TimeoutSec 2
    Write-Output 'Private local AI is already running.'
    exit 0
} catch {
    $logDirectory = Join-Path $env:LOCALAPPDATA 'Ollama'
    $null = New-Item -ItemType Directory -Path $logDirectory -Force
    Start-Process -FilePath $ollamaExecutable -ArgumentList 'serve' -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $logDirectory 'sentinel-stdout.log') `
        -RedirectStandardError (Join-Path $logDirectory 'sentinel-server.log')
    Write-Output 'Started private local AI on this computer. The model loads when you send a message.'
}
