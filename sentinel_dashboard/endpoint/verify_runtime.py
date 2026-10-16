"""Isolated browser verification services. Never uses the production fleet database."""
import json
import signal
import threading
import uuid
from .agent import ClientAgent, handler as agent_handler
from .common import DEFAULT_STATE, LocalServer, save_private
from .fleet import FleetStore, handler as fleet_handler


def main():
    directory = DEFAULT_STATE / ('verification-' + uuid.uuid4().hex[:10])
    store = FleetStore(directory / 'fleet')
    agent = ClientAgent(directory / 'client')
    relay = LocalServer(('127.0.0.1', 18020), fleet_handler(store))
    local = LocalServer(('127.0.0.1', 8011), agent_handler(agent))
    stopping = threading.Event()
    save_private(directory / 'verification.json', {'operatorKey': store.operator, 'relay': 'http://127.0.0.1:18020'})
    def monitor():
        while not stopping.is_set():
            agent.tick()
            stopping.wait(5)
    workers = [threading.Thread(target=server.serve_forever, daemon=True) for server in [relay, local]]
    workers.append(threading.Thread(target=monitor, daemon=True))
    for worker in workers:
        worker.start()
    signal.signal(signal.SIGINT, lambda *_: stopping.set())
    signal.signal(signal.SIGTERM, lambda *_: stopping.set())
    print('STATE_DIR=' + str(directory), flush=True)
    print('Isolated relay and local agent ready for verification.', flush=True)
    try:
        stopping.wait()
    finally:
        stopping.set()
        for server in [relay, local]:
            server.shutdown()
            server.server_close()
        for worker in workers:
            worker.join(timeout=6)
        store.db.close()


if __name__ == '__main__':
    main()
