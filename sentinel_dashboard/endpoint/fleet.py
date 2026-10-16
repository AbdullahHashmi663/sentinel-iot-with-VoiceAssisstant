"""Dedicated device relay. No SOC controls, shell commands, or model execution."""
import argparse
import json
import os
import secrets
import sqlite3
import threading
import time
import uuid
from .common import DEFAULT_STATE, JsonHandler, LocalServer, clean_metrics, digest, resource_alerts, secret_file


class FleetStore:
    def __init__(self, directory):
        directory.mkdir(parents=True, exist_ok=True, mode=0o700)
        self.operator = secret_file(directory / 'operator.key')
        self.db = sqlite3.connect(directory / 'devices.sqlite3', check_same_thread=False)
        os.chmod(directory / 'devices.sqlite3', 0o600)
        self.db.row_factory = sqlite3.Row
        self.lock = threading.RLock()
        with self.db:
            self.db.executescript('''
                CREATE TABLE IF NOT EXISTS devices (
                  id TEXT PRIMARY KEY, name TEXT NOT NULL, token_hash TEXT UNIQUE NOT NULL,
                  claimed INTEGER DEFAULT 0, revoked INTEGER DEFAULT 0,
                  created REAL NOT NULL, last_seen REAL, metrics TEXT);
                CREATE TABLE IF NOT EXISTS samples (device_id TEXT, received REAL, metrics TEXT);
                CREATE INDEX IF NOT EXISTS sample_device ON samples(device_id, received);
            ''')

    def enroll(self, name):
        if not isinstance(name, str) or not 1 <= len(name.strip()) <= 80:
            raise ValueError('Give this client a name between 1 and 80 characters.')
        token, device_id = secrets.token_urlsafe(32), str(uuid.uuid4())
        with self.lock, self.db:
            self.db.execute('INSERT INTO devices(id,name,token_hash,created) VALUES (?,?,?,?)', (device_id, name.strip(), digest(token), time.time()))
        return {'id': device_id, 'name': name.strip(), 'pairingKey': token}

    def device(self, token, require_claimed=True):
        with self.lock:
            row = self.db.execute('SELECT * FROM devices WHERE token_hash=? AND revoked=0', (digest(token),)).fetchone()
            if not token or not row or (require_claimed and not row['claimed']):
                return None
            return row

    def claim(self, token):
        with self.lock, self.db:
            row = self.device(token, require_claimed=False)
            if not row or row['claimed']:
                raise PermissionError('This pairing key is invalid, revoked, or already used. Create a new client key in the main dashboard.')
            self.db.execute('UPDATE devices SET claimed=1 WHERE id=?', (row['id'],))
            return {'id': row['id'], 'name': row['name']}

    def report(self, token, metrics):
        measurement = clean_metrics(metrics)
        with self.lock, self.db:
            row = self.device(token)
            if not row:
                raise PermissionError('Device access was rejected. Ask the operator for a new pairing key.')
            now = time.time()
            if row['last_seen'] and now - row['last_seen'] < 2:
                raise ValueError('Please send measurements no more often than every two seconds.')
            encoded = json.dumps(measurement)
            self.db.execute('UPDATE devices SET last_seen=?,metrics=? WHERE id=?', (now, encoded, row['id']))
            self.db.execute('INSERT INTO samples VALUES(?,?,?)', (row['id'], now, encoded))
            self.db.execute('DELETE FROM samples WHERE device_id=? AND rowid NOT IN (SELECT rowid FROM samples WHERE device_id=? ORDER BY received DESC LIMIT 120)', (row['id'], row['id']))
            return {'receivedAt': now, 'alerts': resource_alerts(measurement)}

    def list(self):
        with self.lock:
            rows = self.db.execute('SELECT * FROM devices ORDER BY created DESC').fetchall()
            return [self.view(row) for row in rows]

    @staticmethod
    def view(row):
        metrics = json.loads(row['metrics']) if row['metrics'] else None
        return {'id': row['id'], 'name': row['name'], 'createdAt': row['created'], 'lastSeen': row['last_seen'],
                'status': 'revoked' if row['revoked'] else 'waiting' if not row['last_seen'] else 'online' if time.time() - row['last_seen'] < 30 else 'offline',
                'metrics': metrics, 'alerts': resource_alerts(metrics) if metrics else []}

    def revoke(self, device_id):
        with self.lock, self.db:
            cursor = self.db.execute('UPDATE devices SET revoked=1 WHERE id=?', (device_id,))
            if not cursor.rowcount:
                raise ValueError('Client not found.')


def handler(store):
    class FleetHandler(JsonHandler):
        def do_GET(self):
            if self.path == '/health':
                return self.reply(200, {'service': 'sentinel-fleet', 'version': 1})
            if self.path == '/operator/clients' and self.authorized(store.operator):
                return self.reply(200, {'clients': store.list(), 'checkedAt': time.time()})
            return self.reply(403, {'error': 'Access denied.'})

        def do_POST(self):
            try:
                if self.path.startswith('/operator/') and not self.authorized(store.operator):
                    return self.reply(403, {'error': 'Operator access required.'})
                body = self.body()
                if self.path == '/operator/enroll':
                    return self.reply(201, store.enroll(body.get('name')))
                if self.path == '/operator/revoke':
                    store.revoke(body.get('id'))
                    return self.reply(200, {'ok': True})
                if self.path == '/client/claim':
                    return self.reply(200, store.claim(self.token()))
                if self.path == '/client/heartbeat':
                    return self.reply(200, store.report(self.token(), body.get('metrics')))
                return self.reply(404, {'error': 'Route not found.'})
            except PermissionError as error:
                return self.reply(403, {'error': str(error)})
            except (ValueError, TypeError, sqlite3.Error):
                return self.reply(400, {'error': 'Invalid request or measurement. Check the client name, key, and measurements.'})
    return FleetHandler


def main():
    parser = argparse.ArgumentParser(description='Sentinel private fleet relay')
    parser.add_argument('--port', type=int, default=8010)
    args = parser.parse_args()
    store = FleetStore(DEFAULT_STATE / 'fleet')
    server = LocalServer(('127.0.0.1', args.port), handler(store))
    print(f'Sentinel fleet relay listening locally on port {server.server_port}', flush=True)
    try:
        server.serve_forever()
    finally:
        server.server_close()
        store.db.close()


if __name__ == '__main__':
    main()
