import hashlib
import hmac
import ipaddress
import json
import math
import os
import secrets
import socket
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

DEFAULT_STATE = Path(os.environ.get('SENTINEL_STATE_DIR') or Path(__file__).resolve().parents[1] / '.local')


def secret_file(path):
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    try:
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            stream.write(secrets.token_urlsafe(32))
    except FileExistsError:
        pass
    return path.read_text(encoding='utf-8').strip()


def save_private(path, value):
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    temporary = path.with_name(path.name + '.' + secrets.token_hex(6) + '.tmp')
    try:
        fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            json.dump(value, stream)
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def digest(token):
    return hashlib.sha256(token.encode()).hexdigest()


def clean_metrics(value):
    if not isinstance(value, dict):
        raise ValueError('A measurement object is required.')
    result = {}
    for key, maximum in [('cpuPercent', 100), ('memoryPercent', 100), ('diskPercent', 100),
                         ('memoryUsedGb', 1e6), ('memoryTotalGb', 1e6), ('networkUpKbps', 1e12),
                         ('networkDownKbps', 1e12), ('uptimeSec', 1e10), ('cpuCores', 4096)]:
        number = value.get(key)
        if isinstance(number, bool) or not isinstance(number, (int, float)) or not math.isfinite(number) or not 0 <= number <= maximum:
            raise ValueError('Invalid measurement: ' + key)
        result[key] = round(number, 2)
    for key in ['hostName', 'os']:
        result[key] = str(value.get(key, 'Unknown'))[:120]
    return result


def resource_alerts(metrics):
    alerts = []
    for key, title, detail in [
        ('cpuPercent', 'High processor use', 'Close unnecessary applications or investigate a sustained workload.'),
        ('memoryPercent', 'Memory is running low', 'Close unused applications and check memory use before starting a heavier workload.'),
        ('diskPercent', 'Storage is nearly full', 'Review storage and move or remove files you no longer need.'),
    ]:
        if metrics.get(key, 0) >= 90:
            alerts.append({'id': key, 'title': title, 'detail': detail, 'value': metrics[key], 'kind': 'resource'})
    return alerts


def central_url(value):
    """Allow private destinations; plaintext HTTP is limited to a loopback tunnel."""
    if not isinstance(value, str) or len(value) > 300:
        raise ValueError('Enter the private relay address.')
    url = urllib.parse.urlsplit(value.strip())
    if url.scheme not in ('http', 'https') or not url.hostname or url.username or url.password or url.query or url.fragment or url.path not in ('', '/'):
        raise ValueError('Use a plain relay address, without credentials, paths, or query parameters.')
    if url.hostname != 'localhost':
        try:
            ipaddress.ip_address(url.hostname)
        except ValueError:
            raise ValueError('Use a private IP address or localhost for the relay.') from None
    try:
        addresses = {ipaddress.ip_address(item[4][0]) for item in socket.getaddrinfo(url.hostname, url.port or (443 if url.scheme == 'https' else 80), type=socket.SOCK_STREAM)}
    except (OSError, ValueError):
        raise ValueError('The private relay address could not be resolved.') from None
    if not addresses or any(not ip.is_private or ip.is_unspecified or ip.is_multicast or ip.is_link_local for ip in addresses):
        raise ValueError('The relay must be on a private network or a local tunnel.')
    if url.scheme == 'http' and any(not ip.is_loopback for ip in addresses):
        raise ValueError('Use HTTPS for a remote relay, or HTTP through a loopback SSH tunnel.')
    return urllib.parse.urlunsplit((url.scheme, url.netloc, '', '', ''))


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def relay_request(base, route, token, body=None):
    # Ignore machine-wide proxies so health data stays on the intended private route.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    data = None if body is None else json.dumps(body).encode()
    request = urllib.request.Request(base + route, data=data, headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
    with opener.open(request, timeout=5) as response:
        return json.loads(response.read(65536))


class LocalServer(ThreadingHTTPServer):
    daemon_threads = True


class JsonHandler(BaseHTTPRequestHandler):
    server_version = 'SentinelLocal/1'

    def log_message(self, *args):
        pass  # Do not log device credentials, payloads, or pairing requests.

    def reply(self, code, value):
        data = json.dumps(value, allow_nan=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def body(self):
        length = int(self.headers.get('Content-Length', '0'))
        if length <= 0 or length > 16384:
            raise ValueError('Request size must be between 1 and 16,384 bytes.')
        value = json.loads(self.rfile.read(length))
        if not isinstance(value, dict):
            raise ValueError('A JSON object is required.')
        return value

    def token(self):
        header = self.headers.get('Authorization', '')
        return header[7:] if header.startswith('Bearer ') and len(header) < 200 else ''

    def authorized(self, expected):
        return bool(self.token()) and hmac.compare_digest(self.token(), expected)
