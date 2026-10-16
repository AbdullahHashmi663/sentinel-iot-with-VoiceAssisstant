"""Package client source and launchers without credentials, caches, or model weights."""
import hashlib
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'deliverables' / 'Sentinel_Client_Runtime.zip'


def main():
    files = [ROOT / name for name in ['START_SENTINEL_CLIENT.bat', 'SETUP_SENTINEL_CLIENT.bat']]
    files += [ROOT / 'sentinel_dashboard' / name for name in ['start_client.ps1', 'start_endpoint.ps1', 'setup_client.ps1', 'find_python.ps1']]
    endpoint = ROOT / 'sentinel_dashboard' / 'endpoint'
    files += [endpoint / name for name in ['__init__.py', 'common.py', 'agent.py', 'fleet.py', 'requirements.txt', 'README.md']]
    frontend = ROOT / 'sentinel_dashboard' / 'frontend'
    files += [frontend / name for name in ['package.json', 'package-lock.json', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs', 'eslint.config.mjs']]
    files += [path for folder in ['src', 'public', 'scripts'] for path in (frontend / folder).rglob('*') if path.is_file()]
    files = sorted(set(files))
    if any(not path.is_file() for path in files):
        raise RuntimeError('A required runtime source file is missing.')
    for path in files:
        relative = path.relative_to(ROOT)
        if any(part.startswith('.env') or part in {'.local', 'node_modules', '.next', '.next-client', '__pycache__'} for part in relative.parts) or path.suffix in {'.key', '.sqlite3', '.log', '.pt', '.pth'}:
            raise RuntimeError('Private or generated file cannot enter the client bundle: ' + str(relative))
    readme = '''# Sentinel client for Windows

This is the client runtime for a separate Windows computer.

1. Install Python 3.10+ and a Node.js version supported by the included Next.js release (20.9+; this project was tested with Node 24.11.1). Enable their PATH options.
2. Run SETUP_SENTINEL_CLIENT.bat once. It downloads the dependencies and builds the client dashboard.
3. Ask the main Sentinel operator for a one-time client key and a private relay connection. See sentinel_dashboard/endpoint/README.md for the SSH tunnel instructions.
4. Run START_SENTINEL_CLIENT.bat. Open http://127.0.0.1:3001/client on this computer and pair in Connection.

The client dashboard reports this computer's actual health measurements. It does not need the main system's Python ML dependencies, datasets, model weights, or Ollama installation. Mereoleona here is a built-in local guide; the main control room retains its separate local AI model.

The bundle contains source and setup files, not installed Python/Node runtimes or preinstalled packages. Initial setup requires internet access for dependency downloads. Monitoring and communication then use your own private network/tunnel.

Keep the generated sentinel_dashboard/.local folder private. Do not transfer the main operator's state or credentials into this bundle. Closing the browser does not stop reporting; pause sharing or disconnect in the client dashboard to control it.
'''
    manifest = {str(path.relative_to(ROOT)).replace('\\', '/'): hashlib.sha256(path.read_bytes()).hexdigest() for path in files}
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    prefix = 'Sentinel_Client/'
    with zipfile.ZipFile(OUTPUT, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=7) as archive:
        for path in files:
            archive.write(path, prefix + str(path.relative_to(ROOT)).replace('\\', '/'))
        archive.writestr(prefix + 'README_FIRST.md', readme)
        archive.writestr(prefix + 'SOURCE_MANIFEST.json', json.dumps(manifest, indent=2))
    with zipfile.ZipFile(OUTPUT) as archive:
        if archive.testzip():
            raise RuntimeError('Bundle integrity check failed.')
    checksum = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
    OUTPUT.with_suffix('.sha256').write_text(checksum + '  ' + OUTPUT.name + '\n', encoding='utf-8')
    print(f'Created {OUTPUT} ({OUTPUT.stat().st_size:,} bytes; {len(files)} source files).')
    print('Verified: archive integrity and source-only credential exclusions.')


if __name__ == '__main__':
    main()
