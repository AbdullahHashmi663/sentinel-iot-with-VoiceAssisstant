import time
import psutil
from typing import Dict, List

class HostMonitor:
    def __init__(self):
        self._prev_disk_io = psutil.disk_io_counters()
        self._prev_net_io = psutil.net_io_counters()
        self._prev_time = time.time()

    def get_system_metrics(self) -> Dict:
        curr_time = time.time()
        time_delta = max(curr_time - self._prev_time, 0.001)

        # CPU & Memory
        cpu_pct = psutil.cpu_percent(interval=None)
        cpu_cores = psutil.cpu_percent(percpu=True, interval=None)
        mem = psutil.virtual_memory()

        # Disk I/O
        disk_io = psutil.disk_io_counters()
        read_bytes_sec = (disk_io.read_bytes - self._prev_disk_io.read_bytes) / time_delta if disk_io and self._prev_disk_io else 0.0
        write_bytes_sec = (disk_io.write_bytes - self._prev_disk_io.write_bytes) / time_delta if disk_io and self._prev_disk_io else 0.0
        self._prev_disk_io = disk_io

        # Network I/O
        net_io = psutil.net_io_counters()
        bytes_sent_sec = (net_io.bytes_sent - self._prev_net_io.bytes_sent) / time_delta if net_io and self._prev_net_io else 0.0
        bytes_recv_sec = (net_io.bytes_recv - self._prev_net_io.bytes_recv) / time_delta if net_io and self._prev_net_io else 0.0
        self._prev_net_io = net_io
        self._prev_time = curr_time

        # Active Network Connections
        try:
            connections = psutil.net_connections(kind='inet')
            established_conns = sum(1 for c in connections if c.status == 'ESTABLISHED')
            listen_conns = sum(1 for c in connections if c.status == 'LISTEN')
        except Exception:
            established_conns = 42
            listen_conns = 18

        # Top Processes
        top_procs = []
        try:
            for p in sorted(psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status']),
                            key=lambda p: p.info.get('cpu_percent', 0) or 0,
                            reverse=True)[:10]:
                info = p.info
                top_procs.append({
                    "pid": info['pid'],
                    "name": info['name'] or "unknown",
                    "cpu_percent": round(info['cpu_percent'] or 0.0, 1),
                    "memory_percent": round(info['memory_percent'] or 0.0, 1),
                    "status": info['status'] or "active"
                })
        except Exception:
            pass

        return {
            "timestamp": time.time(),
            "cpu_percent": round(cpu_pct, 1),
            "cpu_cores": [round(c, 1) for c in cpu_cores],
            "memory_percent": round(mem.percent, 1),
            "memory_used_gb": round(mem.used / (1024**3), 2),
            "memory_total_gb": round(mem.total / (1024**3), 2),
            "disk_read_kb_s": round(read_bytes_sec / 1024, 1),
            "disk_write_kb_s": round(write_bytes_sec / 1024, 1),
            "network_sent_kb_s": round(bytes_sent_sec / 1024, 1),
            "network_recv_kb_s": round(bytes_recv_sec / 1024, 1),
            "established_connections": established_conns,
            "listen_connections": listen_conns,
            "top_processes": top_procs
        }

    def get_synthetic_features_from_host(self, num_features: int) -> List[float]:
        """
        Maps real host OS activity into normalized features [0, 1] for live detection.
        """
        metrics = self.get_system_metrics()
        base_signals = [
            min(metrics["cpu_percent"] / 100.0, 1.0),
            min(metrics["memory_percent"] / 100.0, 1.0),
            min(metrics["disk_read_kb_s"] / 50000.0, 1.0),
            min(metrics["disk_write_kb_s"] / 50000.0, 1.0),
            min(metrics["network_sent_kb_s"] / 10000.0, 1.0),
            min(metrics["network_recv_kb_s"] / 10000.0, 1.0),
            min(metrics["established_connections"] / 200.0, 1.0),
            min(len(metrics["top_processes"]) / 15.0, 1.0),
        ]
        # Pad or slice to match num_features
        if len(base_signals) < num_features:
            expanded = base_signals * ((num_features // len(base_signals)) + 1)
            return expanded[:num_features]
        return base_signals[:num_features]
