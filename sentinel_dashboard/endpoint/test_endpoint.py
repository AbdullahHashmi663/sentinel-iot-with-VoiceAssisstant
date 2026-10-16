import json
import tempfile
import threading
import unittest
import urllib.error
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import patch
from .agent import ClientAgent, Collector, handler as agent_handler
from .common import JsonHandler, LocalServer, central_url, clean_metrics, relay_request
from .fleet import FleetStore, handler as fleet_handler


METRICS = {'hostName': 'test-client', 'os': 'Windows 11', 'cpuPercent': 14.2, 'memoryPercent': 65,
           'diskPercent': 42, 'memoryUsedGb': 8, 'memoryTotalGb': 16, 'networkUpKbps': 12,
           'networkDownKbps': 90, 'uptimeSec': 3600, 'cpuCores': 8}


@contextmanager
def serving(handler):
    server = LocalServer(('127.0.0.1', 0), handler)
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        yield f'http://127.0.0.1:{server.server_port}'
    finally:
        server.shutdown()
        server.server_close()
        worker.join(timeout=2)


class FakeCollector:
    def sample(self):
        return dict(METRICS)


class EndpointTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.store = FleetStore(self.root / 'fleet')

    def tearDown(self):
        self.store.db.close()
        self.temporary.cleanup()

    def test_claim_once_and_separate_device_identity(self):
        first, second = self.store.enroll('Workshop'), self.store.enroll('Office')
        self.assertNotEqual(first['pairingKey'], second['pairingKey'])
        self.assertEqual(self.store.claim(first['pairingKey'])['id'], first['id'])
        with self.assertRaises(PermissionError):
            self.store.claim(first['pairingKey'])
        self.store.report(first['pairingKey'], METRICS)
        entries = {entry['id']: entry for entry in self.store.list()}
        self.assertEqual(entries[first['id']]['metrics']['cpuPercent'], 14.2)
        self.assertIsNone(entries[second['id']]['metrics'])
        self.assertNotIn(first['pairingKey'], json.dumps(entries))
        self.assertNotIn('token_hash', json.dumps(entries))

    def test_revocation_rejects_existing_device(self):
        client = self.store.enroll('Workshop')
        self.store.claim(client['pairingKey'])
        self.store.revoke(client['id'])
        with self.assertRaises(PermissionError):
            self.store.report(client['pairingKey'], METRICS)
        self.assertEqual(self.store.list()[0]['status'], 'revoked')

    def test_measurements_are_validated_and_alerts_are_resource_only(self):
        for value in [float('nan'), float('inf'), True, -1, 101, '50']:
            with self.assertRaises(ValueError):
                clean_metrics({**METRICS, 'cpuPercent': value})
        client = self.store.enroll('Workshop')
        self.store.claim(client['pairingKey'])
        reply = self.store.report(client['pairingKey'], {**METRICS, 'memoryPercent': 95, 'fileContents': 'never retain'})
        self.assertEqual(reply['alerts'][0]['kind'], 'resource')
        self.assertNotIn('fileContents', self.store.list()[0]['metrics'])

    def test_bounded_history_and_receive_time_offline_state(self):
        client = self.store.enroll('Workshop')
        self.store.claim(client['pairingKey'])
        for index in range(130):
            with patch('endpoint.fleet.time.time', return_value=10000 + index * 5):
                self.store.report(client['pairingKey'], METRICS)
        count = self.store.db.execute('SELECT COUNT(*) FROM samples').fetchone()[0]
        self.assertEqual(count, 120)
        self.assertEqual(self.store.list()[0]['status'], 'offline')

    def test_private_transport_and_redirect_policy(self):
        for url in ['http://192.168.1.10:8010', 'https://8.8.8.8', 'https://example.com',
                    'http://user:password@127.0.0.1:8010', 'http://127.0.0.1/a', 'http://169.254.1.1']:
            with self.assertRaises(ValueError):
                central_url(url)
        self.assertEqual(central_url('http://127.0.0.1:18010/'), 'http://127.0.0.1:18010')
        self.assertEqual(central_url('https://192.168.1.10'), 'https://192.168.1.10')

    def test_pair_report_pause_resume_disconnect_over_real_http(self):
        with serving(fleet_handler(self.store)) as relay:
            client = self.store.enroll('Workshop')
            agent = ClientAgent(self.root / 'client', collector=FakeCollector())
            agent.pair(relay, client['pairingKey'])
            agent.tick()
            self.assertEqual(agent.status()['relayState'], 'connected')
            self.assertEqual(self.store.list()[0]['status'], 'online')
            agent.control('pause')
            before = self.store.list()[0]['lastSeen']
            agent.tick()
            self.assertEqual(agent.status()['relayState'], 'paused')
            self.assertEqual(self.store.list()[0]['lastSeen'], before)
            agent.control('resume')
            self.assertEqual(agent.status()['relayState'], 'retrying', 'Resume must wait for a new acknowledgement, not reuse the old report.')
            self.store.db.execute('UPDATE devices SET last_seen=0')
            self.store.db.commit()
            agent.tick()
            self.assertEqual(agent.status()['relayState'], 'connected')
            self.assertNotIn(client['pairingKey'], json.dumps(agent.status()))
            agent.control('disconnect')
            self.assertEqual(agent.status()['relayState'], 'unpaired')
            self.assertNotIn(client['pairingKey'], agent.config_path.read_text(encoding='utf-8'))

    def test_relay_requests_never_follow_redirects_with_credentials(self):
        hits = []
        class Redirect(JsonHandler):
            def do_GET(self):
                hits.append(self.path)
                if self.path == '/redirect':
                    self.send_response(302)
                    self.send_header('Location', '/destination')
                    self.end_headers()
                else:
                    self.reply(200, {'unexpected': True})
        with serving(Redirect) as relay:
            with self.assertRaises(urllib.error.HTTPError) as redirected:
                relay_request(relay, '/redirect', 'isolated-test-credential')
            self.assertEqual(redirected.exception.code, 302)
            redirected.exception.close()
        self.assertEqual(hits, ['/redirect'])

    def test_client_credentials_cannot_manage_fleet_or_read_local_agent(self):
        client = self.store.enroll('Workshop')
        with serving(fleet_handler(self.store)) as relay:
            for route, body in [('/operator/clients', None), ('/operator/enroll', {'name': 'intruder'}), ('/operator/revoke', {'id': client['id']})]:
                with self.assertRaises(urllib.error.HTTPError) as rejected:
                    relay_request(relay, route, client['pairingKey'], body)
                self.assertEqual(rejected.exception.code, 403)
                rejected.exception.close()
        agent = ClientAgent(self.root / 'client', collector=FakeCollector())
        with serving(agent_handler(agent)) as local:
            with self.assertRaises(urllib.error.HTTPError) as denied:
                relay_request(local, '/status', client['pairingKey'])
            denied.exception.close()
            self.assertEqual(relay_request(local, '/status', agent.control_key)['relayState'], 'unpaired')

    def test_unreachable_and_revoked_links_do_not_fabricate_success(self):
        client = self.store.enroll('Workshop')
        def transport(base, route, token, body):
            if route == '/client/claim':
                return {'id': client['id'], 'name': 'Workshop'}
            raise OSError('offline')
        agent = ClientAgent(self.root / 'client', collector=FakeCollector(), transport=transport)
        agent.pair('http://127.0.0.1:8010', client['pairingKey'])
        agent.tick()
        self.assertEqual(agent.status()['relayState'], 'retrying')
        self.assertIsNone(agent.status()['lastSent'])
        self.assertIsNotNone(agent.status()['metrics'])

    def test_live_collector_returns_real_finite_measurements(self):
        metrics = Collector().sample()
        self.assertEqual(clean_metrics(metrics), metrics)
        self.assertGreater(metrics['memoryTotalGb'], 0)
        self.assertGreaterEqual(metrics['cpuCores'], 1)


if __name__ == '__main__':
    unittest.main()
