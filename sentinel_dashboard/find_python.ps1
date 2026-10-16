function Get-SentinelPython {
    param([ValidateSet('host', 'client', '')][string]$Role = '', [switch]$SystemOnly)
    $minimumMinor = if ($Role -eq 'host') { 11 } else { 10 }
    $pythonCandidates = @()
    if ($env:SENTINEL_PYTHON) { $pythonCandidates += $env:SENTINEL_PYTHON }
    if ($Role -and -not $SystemOnly) { $pythonCandidates += (Join-Path $PSScriptRoot ".venv-$Role/Scripts/python.exe") }
    $pythonCandidates += (Join-Path $env:LOCALAPPDATA 'Python/bin/python.exe')
    foreach ($version in @('312', '313', '314', '311', '310')) { $pythonCandidates += (Join-Path $env:LOCALAPPDATA "Programs/Python/Python$version/python.exe") }
    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCommand -and $pythonCommand.Source -notlike '*WindowsApps*') { $pythonCandidates += $pythonCommand.Source }
    foreach ($pythonCandidate in $pythonCandidates | Select-Object -Unique) {
        if (Test-Path -LiteralPath $pythonCandidate) {
            try {
                $resolvedPython = (& $pythonCandidate -c 'import struct,sys; assert (3,int(sys.argv[1])) <= sys.version_info[:2] < (3,15) and struct.calcsize(chr(80)) == 8; print(sys.executable)' $minimumMinor 2>$null) | Select-Object -Last 1
                if ($LASTEXITCODE -eq 0 -and $resolvedPython -and (Test-Path -LiteralPath $resolvedPython)) { return $resolvedPython }
            } catch { }
        }
    }
    $pyLauncher = Get-Command py -ErrorAction SilentlyContinue
    if ($pyLauncher -and $pyLauncher.Source -notlike '*WindowsApps*') {
        try {
            $resolvedPython = (& $pyLauncher.Source -3 -c 'import struct,sys; assert (3,int(sys.argv[1])) <= sys.version_info[:2] < (3,15) and struct.calcsize(chr(80)) == 8; print(sys.executable)' $minimumMinor 2>$null) | Select-Object -Last 1
            if ($LASTEXITCODE -eq 0 -and $resolvedPython -and (Test-Path -LiteralPath $resolvedPython)) { return $resolvedPython }
        } catch { }
    }
    throw "Compatible 64-bit Python 3.$minimumMinor-3.14 was not found. Run the matching SETUP_SENTINEL_HOST.bat or SETUP_SENTINEL_CLIENT.bat first."
}
