"""Check required research assets and Python imports without starting services."""
import argparse
import importlib
import json
from pathlib import Path


def verify_assets(root):
    metadata_path = root / 'FYP_WORK/cleaned_datasets/model_metadata.json'
    if not metadata_path.is_file():
        raise RuntimeError('The host needs the full Sentinel repository, including FYP_WORK/model assets. This is not in the client-only ZIP.')
    metadata = json.loads(metadata_path.read_text(encoding='utf-8'))
    required = [metadata_path]
    for domain in metadata:
        if domain == 'Network_Traffic':
            required += [root / 'FYP_WORK' / name for name in ['conformer_sentinel_model_opt.pth', 'network_scaler.joblib', 'cleaned_network_dataset.csv']]
        else:
            base = root / 'FYP_WORK/cleaned_datasets'
            required += [base / 'models' / f'sentinel_cleaned_{domain}.pth', base / 'scalers' / f'scaler_cleaned_{domain}.joblib', base / f'cleaned_{domain}.csv']
    missing = [str(item.relative_to(root)) for item in required if not item.is_file() or item.stat().st_size == 0]
    if missing:
        raise RuntimeError('Missing host assets; restore these from your full project copy:\n' + '\n'.join(missing))
    for item in required:
        with item.open('rb') as stream:
            if stream.read(80).startswith(b'version https://git-lfs.github.com/spec/'):
                raise RuntimeError(f'{item.name} is a Git LFS pointer. Download the actual model/data files before host setup.')
    print(f'Host assets verified for {len(metadata)} domains.')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--assets-only', action='store_true')
    args = parser.parse_args()
    verify_assets(Path(__file__).resolve().parents[2])
    if not args.assets_only:
        for name in ['fastapi', 'uvicorn', 'torch', 'numpy', 'pandas', 'sklearn', 'joblib', 'psutil', 'websockets']:
            importlib.import_module(name)
        print('Host Python dependencies verified.')


if __name__ == '__main__':
    main()
