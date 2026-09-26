import os
import random
import collections
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple

class TelemetryStreamer:
    def __init__(self, workspace_root: str):
        self.workspace_root = workspace_root
        self.fyp_dir = os.path.join(workspace_root, "FYP_WORK")
        self.cleaned_dir = os.path.join(self.fyp_dir, "cleaned_datasets")

        # Sliding sequence buffers (length = 10) per device/domain
        self.sequence_buffers = collections.defaultdict(lambda: collections.deque(maxlen=10))

        # Dataset cache: domain -> DataFrame
        self.dataset_cache: Dict[str, pd.DataFrame] = {}
        self.dataset_indices: Dict[str, int] = collections.defaultdict(int)

        # Preloaded attack index maps: domain -> { attack_type: [row_indices] }
        self.attack_index_maps: Dict[str, Dict[str, List[int]]] = {}

        # Default active domain
        self.active_domain = "Network_Traffic"
        self._preload_domain(self.active_domain)

    def _preload_domain(self, domain_name: str):
        if domain_name in self.dataset_cache:
            return

        if domain_name == "Network_Traffic":
            file_path = os.path.join(self.fyp_dir, "cleaned_network_dataset.csv")
        else:
            file_path = os.path.join(self.cleaned_dir, f"cleaned_{domain_name}.csv")

        if not os.path.exists(file_path):
            print(f"[Streamer] Warning: Dataset file not found at {file_path}")
            return

        print(f"[Streamer] Loading dataset cache for {domain_name}...")
        df = pd.read_csv(file_path, low_memory=False)
        self.dataset_cache[domain_name] = df
        self.dataset_indices[domain_name] = 0

        # Build attack indices map
        type_col = 'type' if 'type' in df.columns else None
        if type_col is not None:
            type_map = collections.defaultdict(list)
            for idx, val in enumerate(df[type_col]):
                val_str = str(val).lower().strip()
                type_map[val_str].append(idx)
            self.attack_index_maps[domain_name] = type_map

        print(f"[Streamer] Preloaded {len(df)} rows for {domain_name}")

    def set_domain(self, domain_name: str):
        self.active_domain = domain_name
        self._preload_domain(domain_name)
        # Clear buffer for new domain
        self.sequence_buffers[domain_name].clear()
        return {"status": "success", "active_domain": domain_name}

    def get_next_telemetry_event(
        self,
        domain_name: Optional[str] = None,
        forced_attack: Optional[str] = None
    ) -> Tuple[List[float], Dict]:
        domain = domain_name or self.active_domain
        self._preload_domain(domain)

        df = self.dataset_cache.get(domain)
        if df is None or len(df) == 0:
            # Fallback mock random features if file missing
            dummy_feats = [float(random.random()) for _ in range(10)]
            meta = {
                "source_ip": f"192.168.1.{random.randint(10, 250)}",
                "dst_ip": "10.0.0.1",
                "pid": random.randint(1000, 9999),
                "true_label": 0,
                "true_type": "normal",
                "feature_names": [f"feat_{i}" for i in range(10)]
            }
            return dummy_feats, meta

        # Determine which row to pull
        row_idx = None
        if forced_attack and domain in self.attack_index_maps:
            normalized_attack = forced_attack.lower().strip()
            indices = self.attack_index_maps[domain].get(normalized_attack, [])
            if indices:
                row_idx = random.choice(indices)

        if row_idx is None:
            curr_idx = self.dataset_indices[domain]
            row_idx = curr_idx % len(df)
            self.dataset_indices[domain] = curr_idx + 1

        row = df.iloc[row_idx]
        feature_cols = [c for c in df.columns if c not in ['label', 'type', 'attack', 'ts', 'date', 'PID', 'index']]
        feature_values = row[feature_cols].values.astype(float).tolist()

        true_label = int(row['label']) if 'label' in row else (int(row['attack']) if 'attack' in row else 0)
        true_type = str(row['type']) if 'type' in row else "unknown"

        meta = {
            "source_ip": f"192.168.1.{100 + (row_idx % 50)}",
            "dst_ip": "10.0.0.5",
            "pid": 2000 + (row_idx % 800),
            "true_label": true_label,
            "true_type": true_type,
            "feature_names": feature_cols
        }

        # Append to 10-step buffer
        self.sequence_buffers[domain].append(feature_values)

        return feature_values, meta

    def get_buffer(self, domain_name: Optional[str] = None) -> List[List[float]]:
        domain = domain_name or self.active_domain
        return list(self.sequence_buffers[domain])

    def is_buffer_full(self, domain_name: Optional[str] = None) -> bool:
        domain = domain_name or self.active_domain
        return len(self.sequence_buffers[domain]) == 10
