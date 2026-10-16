# Shared Windows setup helpers. Sourcing this file performs no installation.
. (Join-Path $PSScriptRoot 'find_python.ps1')

function Update-SentinelProcessPath {
    $entries = @($env:Path, [Environment]::GetEnvironmentVariable('Path', 'User'), [Environment]::GetEnvironmentVariable('Path', 'Machine'))
    $env:Path = (($entries -join ';').Split(';') | Where-Object { $_ } | Select-Object -Unique) -join ';'
}

function Invoke-SentinelChecked {
    param([string]$Executable, [string[]]$Arguments, [string]$Failure)
    & $Executable @Arguments | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "$Failure (exit code $LASTEXITCODE)." }
}

function Install-SentinelPackage {
    param([string]$Id, [ValidateSet('user','machine')][string]$Scope)
    $winget = Get-Command winget.exe -ErrorAction SilentlyContinue
    if (-not $winget) { throw 'Windows App Installer (WinGet) is required for automatic runtime installation. Install/update App Installer from Microsoft Store, then rerun setup. https://aka.ms/getwinget' }
    Write-Host "Installing $Id. Windows may ask for installation permission."
    & $winget.Source install --id $Id --exact --source winget --scope $Scope --silent --accept-package-agreements --accept-source-agreements --disable-interactivity | Out-Host
    if ($LASTEXITCODE -notin @(0, 3010)) { throw "Could not install $Id (exit code $LASTEXITCODE). Check the installer message and rerun setup." }
    Update-SentinelProcessPath
}

function Get-SentinelNode {
    $candidates = @()
    $command = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($command) { $candidates += $command.Source }
    $candidates += (Join-Path $env:ProgramFiles 'nodejs/node.exe')
    foreach ($candidate in $candidates | Select-Object -Unique) {
        if (-not (Test-Path -LiteralPath $candidate)) { continue }
        try {
            & $candidate -e 'const v=process.versions.node.split(String.fromCharCode(46)).map(Number);process.exit(v[0]>20||(v[0]===20&&v[1]>=9)?0:1)' 2>$null
            if ($LASTEXITCODE -eq 0) { return $candidate }
        } catch { }
    }
    throw 'Node.js 20.9 or newer was not found. Run the matching setup file.'
}

function Initialize-SentinelTools {
    param([switch]$CheckOnly, [ValidateSet('host','client')][string]$Role = 'client')
    Update-SentinelProcessPath
    try { $python = Get-SentinelPython -Role $Role -SystemOnly } catch {
        if ($CheckOnly) { throw }
        Install-SentinelPackage -Id 'Python.Python.3.12' -Scope user
        $python = Get-SentinelPython -Role $Role -SystemOnly
    }
    try { $node = Get-SentinelNode } catch {
        if ($CheckOnly) { throw }
        Install-SentinelPackage -Id 'OpenJS.NodeJS.LTS' -Scope machine
        $node = Get-SentinelNode
    }
    $npm = Join-Path (Split-Path -Parent $node) 'npm.cmd'
    if (-not (Test-Path -LiteralPath $npm)) { throw 'npm is missing from the Node.js installation. Repair Node.js LTS and rerun setup.' }
    return @{ Python = $python; Node = $node; Npm = $npm }
}

function New-SentinelEnvironment {
    param([string]$Python, [ValidateSet('host','client')][string]$Role)
    $directory = Join-Path $PSScriptRoot ".venv-$Role"
    $executable = Join-Path $directory 'Scripts/python.exe'
    if (-not (Test-Path -LiteralPath $executable)) { Invoke-SentinelChecked -Executable $Python -Arguments @('-m','venv',$directory) -Failure "Could not create the isolated $Role Python environment" }
    Invoke-SentinelChecked -Executable $executable -Arguments @('-m','pip','install','--upgrade','pip') -Failure 'Could not prepare pip'
    return $executable
}

function Get-SentinelOllama {
    $local = Join-Path $env:LOCALAPPDATA 'Programs/Ollama/ollama.exe'
    if (Test-Path -LiteralPath $local) { return $local }
    $command = Get-Command ollama.exe -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }
    throw 'Ollama was not found. Run SETUP_SENTINEL_HOST.bat.'
}

function Enable-SentinelAiPrivacy {
    foreach ($setting in @{ OLLAMA_NO_CLOUD='1'; OLLAMA_HOST='127.0.0.1:11434' }.GetEnumerator()) {
        [Environment]::SetEnvironmentVariable($setting.Key, $setting.Value, 'User')
        [Environment]::SetEnvironmentVariable($setting.Key, $setting.Value, 'Process')
    }
    $directory = Join-Path ([Environment]::GetFolderPath('UserProfile')) '.ollama'
    $null = New-Item -ItemType Directory -Path $directory -Force
    $configPath = Join-Path $directory 'server.json'
    $config = if (Test-Path -LiteralPath $configPath) { Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json } else { [PSCustomObject]@{} }
    $config | Add-Member -NotePropertyName disable_ollama_cloud -NotePropertyValue $true -Force
    [IO.File]::WriteAllText($configPath, ($config | ConvertTo-Json -Depth 20), (New-Object Text.UTF8Encoding $false))
}
