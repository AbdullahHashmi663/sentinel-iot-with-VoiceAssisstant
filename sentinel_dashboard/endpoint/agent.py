"""Local client health collector. Never executes commands from the relay."""
import argparse
import json
import platform
import socket
import threading
import time
import urllib.error
from pathlib import Path
import psutil
from .common import DEFAULT_STATE, JsonHandler, LocalServer, central_url, clean_metrics, relay_request, resource_alerts, save_private, secret_file


class Collector:
    def __init__(self):
        self.previous = psutil.net_io_counters()
        self.previous_time = time.monotonic()

    def sample(self):
        cpu = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage(Path.home().anchor or '/')
        network, now = psutil.net_io_counters(), time.monotonic()
        elapsed = max(0.1, now - self.previous_time)
        up = max(0, network.bytes_sent - self.previous.bytes_sent) / elapsed / 1024 if network and self.previous else 0
        down = max(0, network.bytes_recv - self.previous.bytes_recv) / elapsed / 1024 if network and self.previous else 0
        self.previous, self.previous_time = network, now
        return clean_metrics({'hostName': socket.gethostname(), 'os': f'{platform.system()} {platform.release()}',
                              'cpuPercent': cpu, 'memoryPercent': memory.percent, 'diskPercent': disk.percent,
                              'memoryUsedGb': memory.used / 1024**3, 'memoryTotalGb': memory.total / 1024**3,
                              'networkUpKbps': up, 'networkDownKbps': down, 'uptimeSec': max(0, time.time() - psutil.boot_time()),
                              'cpuCores': psutil.cpu_count() or 1})


class ClientAgent:
    def __init__(self, directory, collector=None, transport=relay_request):
        self.directory = directory
        self.control_key = secret_file(directory / 'control.key')
        self.config_path = directory / 'connection.json'
        self.config = json.loads(self.config_path.read_text(encoding='utf-8')) if self.config_path.exists() else {}
        self.collector, self.transport = collector or Collector(), transport
        self.lock = threading.RLock()
        self.metrics, self.sampled_at, self.last_sent = None, None, None
        self.last_error, self.rejected = None, False
        self.awaiting_report = bool(self.config.get('token'))
        self.history = []
        self.generation = 0

    def status(self):
        with self.lock:
            cfg = self.config
            paired = bool(cfg.get('token'))
            state = 'unpaired' if not paired else 'paused' if cfg.get('paused') else 'revoked' if self.rejected else 'connected' if self.last_sent and time.time() - self.last_sent < 30 and not self.last_error and not self.awaiting_report else 'retrying'
            return {'paired': paired, 'relayState': state, 'sharingPaused': bool(cfg.get('paused')),
                    'device': {'id': cfg.get('id'), 'name': cfg.get('name') or (self.metrics or {}).get('hostName', 'This computer')},
                    'serverUrl': cfg.get('server', ''), 'sampledAt': self.sampled_at, 'lastSent': self.last_sent,
                    'error': self.last_error, 'metrics': self.metrics, 'history': list(self.history),
                    'alerts': resource_alerts(self.metrics) if self.metrics else []}

    def pair(self, server, key):
        if not isinstance(key, str) or not 30 <= len(key) <= 100:
            raise ValueError('Paste the client pairing key from the main dashboard.')
        server = central_url(server)
        with self.lock:
            if self.config.get('token'):
                raise ValueError('Disconnect this client before pairing again.')
            generation = self.generation
        result = self.transport(server, '/client/claim', key, {})
        if not isinstance(result.get('id'), str) or not isinstance(result.get('name'), str):
            raise ValueError('The relay returned an invalid identity.')
        with self.lock:
            if generation != self.generation:
                raise ValueError('Connection settings changed. Try pairing again.')
            config = {'id': result['id'], 'name': result['name'], 'server': server, 'token': key, 'paused': False}
            save_private(self.config_path, config)
            self.config, self.last_error, self.rejected = config, None, False
            self.last_sent = None
            self.awaiting_report = True
            self.generation += 1

    def control(self, action):
        with self.lock:
            if action == 'disconnect':
                config = {}
                self.last_sent = None
            elif action in ('pause', 'resume') and self.config.get('token'):
                config = {**self.config, 'paused': action == 'pause'}
            else:
                raise ValueError('Pair this client before changing sharing.')
            save_private(self.config_path, config)
            self.config, self.last_error, self.rejected = config, None, False
            self.awaiting_report = bool(config.get('token'))
            self.generation += 1

    def tick(self):
        try:
            measurement = self.collector.sample()
        except (OSError, RuntimeError, psutil.Error):
            with self.lock:
                self.last_error = 'Local measurement collection failed. Check the agent and permissions.'
            return
        now = time.time()
        with self.lock:
            self.metrics, self.sampled_at = measurement, now
            self.history = [*self.history[-59:], {'time': now, 'cpu': measurement['cpuPercent'], 'memory': measurement['memoryPercent']}]
            cfg, generation = dict(self.config), self.generation
        if not cfg.get('token') or cfg.get('paused') or self.rejected:
            return
        try:
            server = central_url(cfg['server'])
            self.transport(server, '/client/heartbeat', cfg['token'], {'metrics': measurement})
            with self.lock:
                if generation == self.generation:
                    self.last_sent, self.last_error = time.time(), None
                    self.awaiting_report = False
        except urllib.error.HTTPError as error:
            rejected = error.code in (401, 403)
            error.close()
            with self.lock:
                if generation == self.generation:
                    self.rejected = rejected
                    self.last_error = 'The relay rejected this device key. Ask the operator for a new enrollment.' if self.rejected else 'The relay could not accept this measurement. It will be retried.'
        except (OSError, ValueError):
            with self.lock:
                if generation == self.generation:
                    self.last_error = 'The private relay is unreachable. Check the SSH tunnel or private HTTPS connection.'


def handler(agent):
    class AgentHandler(JsonHandler):
        def do_GET(self):
            if self.path == '/health':
                return self.reply(200, {'service': 'sentinel-client', 'version': 1})
            if self.path == '/status' and self.authorized(agent.control_key):
                return self.reply(200, agent.status())
            return self.reply(403, {'error': 'Local dashboard access required.'})

        def do_POST(self):
            if self.path != '/control' or not self.authorized(agent.control_key):
                return self.reply(403, {'error': 'Local dashboard access required.'})
            try:
                body = self.body()
                if body.get('action') == 'pair':
                    agent.pair(body.get('serverUrl'), body.get('pairingKey'))
                else:
                    agent.control(body.get('action'))
                return self.reply(200, agent.status())
            except urllib.error.HTTPError as error:
                rejected = error.code in (401, 403)
                error.close()
                return self.reply(400, {'error': 'Pairing was rejected. Use a new key from the main dashboard.' if rejected else 'The relay could not complete pairing. Try again.'})
            except ValueError as error:
                return self.reply(400, {'error': str(error)[:240]})
            except TypeError:
                return self.reply(400, {'error': 'Check the pairing key and private relay address.'})
            except OSError:
                return self.reply(503, {'error': 'The private relay is unreachable. Check the tunnel or private HTTPS connection.'})
    return AgentHandler


def main():
    parser = argparse.ArgumentParser(description='Sentinel local client agent')
    parser.add_argument('--port', type=int, default=8011)
    args = parser.parse_args()
    agent = ClientAgent(DEFAULT_STATE / 'client')
    stopping = threading.Event()
    def monitor():
        while not stopping.is_set():
            agent.tick()
            stopping.wait(5)
    worker = threading.Thread(target=monitor, daemon=True)
    worker.start()
    server = LocalServer(('127.0.0.1', args.port), handler(agent))
    print(f'Sentinel client agent listening locally on port {server.server_port}', flush=True)
    try:
        server.serve_forever()
    finally:
        stopping.set()
        server.server_close()
        worker.join(timeout=6)


if __name__ == '__main__':
    main()
