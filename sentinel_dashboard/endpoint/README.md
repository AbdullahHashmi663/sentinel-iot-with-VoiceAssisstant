# Sentinel client machines

The operator dashboard stays on the main Sentinel computer. A separate Windows computer runs its own client dashboard and lightweight agent. The dedicated relay accepts authenticated health reports; it does not expose the original FastAPI research controls to clients.

Each dashboard runs independently on its own machine. The client continues displaying local health measurements when the host is offline; sharing resumes when its private connection is available. `127.0.0.1` always refers to the computer where the address is used.

## On the main Sentinel computer

1. Run `SETUP_SENTINEL_HOST.bat` once, then `START_SENTINEL_HOST.bat`. The host launcher starts the dedicated relay on `127.0.0.1:8010` as well as the main services. `START_SENTINEL_DASHBOARD.bat` is a compatibility alias.
2. Open **Client machines** in the main dashboard, or visit `http://127.0.0.1:3000/clients`.
3. Choose **Enroll client**, give the computer a recognizable name, and create a key. Copy it directly to the client operator. The key is displayed once in page state and is usable once for pairing. The relay retains only its hash.

## On the separate Windows client

1. Extract `Sentinel_Client_Runtime.zip` to a folder owned by the client user. Do not copy the main computer's `.local` folder, `.env.local`, model weights, or Ollama profile.
2. Ensure Microsoft App Installer (WinGet) is available if Python or Node is missing. The setup file installs missing runtimes automatically. Alternatively, install 64-bit Python 3.10-3.14 and Node.js 20.9+ yourself.
3. Run `SETUP_SENTINEL_CLIENT.bat` once. It creates an isolated `.venv-client`, installs `psutil` and the pinned dashboard packages, then builds the client interface for production. Initial downloads need internet access; Windows may ask for installer permission. Client monitoring does not require PyTorch, the Conformer weights, Ollama, or a cloud account.
4. Establish a private connection to the main relay using the transport instructions below.
5. Run `START_SENTINEL_CLIENT.bat`. Open `http://127.0.0.1:3001/client` on the client computer. Its Connection page accepts the private relay address and pairing key.
6. The client says **Connected to Sentinel** only after a report is accepted. The main dashboard then lists the device's received measurements. A report is normally sent every five seconds.

The Windows launchers run the local agent and production dashboard hidden and keep logs under `sentinel_dashboard/.local/client/`. Framework telemetry is disabled for the client setup and runtime. Run the launcher again to reuse them. They do not register startup tasks or system services. Closing the browser does not stop the agent; use **Pause sharing**, **Disconnect**, or stop the launched Python process if you want reporting to stop.

## Private transport between computers

Both dashboards, the relay, and the client agent listen on loopback. Do not change the main dashboard or FastAPI server to a public listen address to connect a client.

If the main computer already has an SSH server configured and reachable over your private network, run this in a terminal on the client:

```text
ssh -N -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -L 127.0.0.1:18010:127.0.0.1:8010 YOUR_USER@MAIN_COMPUTER_PRIVATE_IP
```

Replace the two placeholders with your actual SSH account and main computer's private address. Verify the server host key through your operator; keep the terminal open. In the client Connection page, use `http://127.0.0.1:18010`. The tunnel forwards only the dedicated relay, not the SOC dashboard or FastAPI controls. This project does not enable SSH or change Windows firewall rules automatically.

With the tunnel running, complete pairing **on the client computer**:

1. Open `http://127.0.0.1:3001/client` and go to **Connection**.
2. Enter **Relay address:** `http://127.0.0.1:18010`.
3. Enter **Pairing key:** the one-time key from **Client machines → Enroll client** on the host, then select **Pair**.
4. Wait for **Connected to Sentinel**, then check the host's Client machines page for the client's measurements. Normal reporting is every five seconds.

Keep the host relay and SSH tunnel running while sharing. The two dashboards remain separate; neither needs to open the other computer's dashboard. Do not use `http://127.0.0.1:8010` directly on a separate client unless a local tunnel explicitly forwards that port: otherwise it points to the client, not the host.

If SSH refuses the connection or times out, check the host's SSH service, private address, and private-network firewall access. If pairing fails, confirm the host launcher and tunnel are running and use a fresh enrollment key when the old one was already used or revoked. A lost connection does not stop local monitoring.

Alternatively, an operator can configure a private HTTPS reverse proxy forwarding to the loopback relay. Use an IP certificate trusted by the client OS/Python environment; certificate validation is never disabled. The client accepts private IP HTTPS addresses and loopback HTTP addresses only. It rejects public destinations, URL credentials, custom paths, and redirects, and does not use system HTTP proxies. An HTTP address on a remote LAN is intentionally rejected because it would expose the device credential in transit.

## What is collected

Host name, OS, logical core count, CPU and memory usage, system-drive storage usage, uptime, and aggregate network send/receive rates. No process lists, file contents, browser history, keystrokes, or packet contents are collected. Resource warnings begin at 90% CPU, memory, or storage use; these are **not threat predictions**. Client measurements are not silently converted into Conformer inputs.

The client keeps sixty trend samples in memory and saves its connection credential locally. The relay keeps the latest state and up to 120 samples per device in its local SQLite database. Keep `.local` private to its owning user; the files are not encrypted by this project. The relay accepts the paired device's reports, not remote execution instructions. Operators use a separate local credential; it is never bundled or sent to clients.

Pause sharing stops future reports while local collection continues. One request already in flight may finish. Disconnect removes the saved client credential; new pairing requires a new enrollment. Revoke access in the main dashboard to reject the device's future reports. A client becomes offline in the main view after thirty seconds without an accepted report; paused and disconnected clients may therefore appear offline. Earlier received measurements remain labeled by their receipt time.

Mereoleona on the client is explicitly a **built-in local guide**, with health explanations, pairing help, privacy answers, and allowlisted pause/resume commands. It does not send language-model requests or reuse the main computer's AI connection. The main dashboard retains its local Ollama assistant.

## Manual development / portable agent

From `sentinel_dashboard`, run `python -m endpoint.agent`; from `sentinel_dashboard/frontend`, run `npm run dev:client`. The client profile uses a separate `.next-client` directory, port 3001, and redirects operator pages away from the client interface. Operator APIs are denied in that profile. For a production build use `npm run build:client`, then `npm run start:client`.

The monitoring agent also runs on Linux/macOS with Python and `psutil`; the supplied double-click launchers target Windows. To start only the main relay, use `python -m endpoint.fleet` from `sentinel_dashboard`.

Validate the client protocol with `python -m unittest endpoint.test_endpoint -v` from `sentinel_dashboard`. The tests use isolated temporary databases and local HTTP servers; they do not enroll test clients into your production relay.
