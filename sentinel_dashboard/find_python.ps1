function Get-SentinelPython {
    $pythonCandidates = @()
    if ($env:SENTINEL_PYTHON) { $pythonCandidates += $env:SENTINEL_PYTHON }
    $pythonCandidates += (Join-Path $env:LOCALAPPDATA 'Python/bin/python.exe')
    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCommand -and $pythonCommand.Source -notlike '*WindowsApps*') { $pythonCandidates += $pythonCommand.Source }
    foreach ($pythonCandidate in $pythonCandidates | Select-Object -Unique) {
        if (Test-Path -LiteralPath $pythonCandidate) {
            try {
                $resolvedPython = (& $pythonCandidate -c 'import sys; print(sys.executable)' 2>$null) | Select-Object -Last 1
                if ($LASTEXITCODE -eq 0 -and $resolvedPython -and (Test-Path -LiteralPath $resolvedPython)) { return $resolvedPython }
            } catch { }
        }
    }
    $pyLauncher = Get-Command py -ErrorAction SilentlyContinue
    if ($pyLauncher -and $pyLauncher.Source -notlike '*WindowsApps*') {
        try {
            $resolvedPython = (& $pyLauncher.Source -3 -c 'import sys; print(sys.executable)' 2>$null) | Select-Object -Last 1
            if ($LASTEXITCODE -eq 0 -and $resolvedPython -and (Test-Path -LiteralPath $resolvedPython)) { return $resolvedPython }
        } catch { }
    }
    throw 'Python 3 was not found. Install Python with PATH enabled, or set SENTINEL_PYTHON to its python.exe path, then run the launcher again.'
}
