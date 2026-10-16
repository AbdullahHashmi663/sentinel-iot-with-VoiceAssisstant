# Sentinel IoT — Independent Host & Client Dashboards

Sentinel combines a local IoT research dashboard, explainable Conformer predictions, a private Mereoleona assistant, and resource-health reports from separately paired Windows computers. This guide documents the **`sentinel-host-client`** branch.

The host and client run on **different computers**. They share source code, but use separate launchers, Python environments, interface profiles, and private state. A client keeps monitoring itself even when the host is unavailable.

> Research scope: the application includes working inference and health collection alongside legacy simulations. A resource warning, model prediction, control mapping, or simulated response is not proof of compromise, hardware enforcement, or compliance certification.

## Contents

- [Four Windows launchers](#four-windows-launchers)
- [Requirements](#requirements)
- [Host setup](#host-setup)
- [Client setup](#client-setup)
- [Private connection and pairing](#private-connection-and-pairing)
- [Dashboard features](#dashboard-features)
- [Mereoleona](#mereoleona)
- [Privacy and retained data](#privacy-and-retained-data)
- [Ports, configuration, and logs](#ports-configuration-and-logs)
- [Updating and stopping](#updating-and-stopping)
- [Troubleshooting](#troubleshooting)
- [Development and verification](#development-and-verification)
- [Project layout and limits](#project-layout-and-limits)

## Four Windows launchers

Run setup once, then start whenever needed, on the respective machine:

- **[SETUP_SENTINEL_HOST.bat](SETUP_SENTINEL_HOST.bat):** installs host requirements and local AI, verifies research assets, and builds the operator interface.
- **[START_SENTINEL_HOST.bat](START_SENTINEL_HOST.bat):** starts/reuses host services and opens the dashboard.
- **[SETUP_SENTINEL_CLIENT.bat](SETUP_SENTINEL_CLIENT.bat):** installs monitoring/frontend requirements and builds the client interface.
- **[START_SENTINEL_CLIENT.bat](START_SENTINEL_CLIENT.bat):** starts/reuses the local agent and client dashboard.

Keep the BAT files beside `sentinel_dashboard`; copying a BAT alone is insufficient. Initial setup requires internet. `START_SENTINEL_DASHBOARD.bat` remains a host compatibility alias. Run setup again after updates requiring new dependencies or a rebuild.

## Requirements

Both machines need a 64-bit Windows environment, a writable project folder, and internet for initial installers/packages. Required runtimes are Node.js **20.9+** with npm, and 64-bit Python **3.11–3.14 on the host**, **3.10–3.14 on clients**. Setup reuses compatible runtimes or installs Python 3.12 and Node.js LTS through WinGet when needed.

Automatic installation requires Microsoft App Installer / WinGet. Alternatively install compatible Python/Node yourself and rerun setup. Windows may request installer permission; Node.js and the host Visual C++ runtime use machine-scoped installation. Installer commands follow [Microsoft's WinGet interface](https://learn.microsoft.com/en-us/windows/package-manager/winget/install).

The **host needs the full project** with actual weights, scalers, metadata, and datasets under `FYP_WORK`. Setup checks all thirteen domains and detects missing files/LFS pointers; it does not fabricate models or download missing private research datasets from guessed sources.

Host dependencies are in [requirements-host.txt](sentinel_dashboard/backend/requirements-host.txt). CPU PyTorch 2.11.0 is installed from [the official PyTorch CPU index](https://download.pytorch.org/whl/cpu/torch/). Setup checks Visual C++ and installs private Ollama plus `qwen2.5:1.5b`. Clients need only [psutil](sentinel_dashboard/endpoint/requirements.txt) and the frontend packages, not PyTorch, research data, or Ollama.

Allow disk space for data, weights, Python/Node packages, builds, and the chat model. Performance and memory needs vary; the project does not enforce a measured hardware minimum.

Private SSH transport requires an already configured SSH server/account on the host, an SSH command on the client, and private-network/VPN reachability. Setup does **not** configure SSH, firewall rules, or the tunnel.

## Host setup

### Get this branch

With Git installed:

```powershell
git clone --branch sentinel-host-client --single-branch https://github.com/AbdullahHashmi663/sentinel-iot-with-VoiceAssisstant.git
cd sentinel-iot-with-VoiceAssisstant
```

Or download/extract this branch through GitHub. Ensure the actual `FYP_WORK` assets are present. The client-only ZIP cannot run the full host.

### Install, then start

From the project root, or by double-clicking:

```powershell
.\SETUP_SENTINEL_HOST.bat
.\START_SENTINEL_HOST.bat
```

Host setup finds/installs runtimes, checks thirteen domains' assets, creates `sentinel_dashboard/.venv-host`, installs host packages/CPU PyTorch, verifies imports, configures private Ollama, downloads the chat model, runs `npm ci`, and builds the production interface. If any stage fails, read the error, fix it, and rerun; partial setup is not success.

The start file reuses healthy services or starts local AI, the dedicated relay, detection backend, and operator frontend. It checks backend/interface readiness before opening the browser.

- Host dashboard: `http://127.0.0.1:3000`
- Client management: `http://127.0.0.1:3000/clients`
- Backend status: `http://127.0.0.1:8000/api/status`
- Backend API docs: `http://127.0.0.1:8000/docs`

The welcome offers a tour. Generated demo observations are labeled. Choose **Settings → Local backend** to connect the main feed to the detection engine.

## Client setup

Use a separate checkout or generate a client ZIP on the host after setup. From the project root:

```powershell
Set-Location sentinel_dashboard
.\.venv-host\Scripts\python.exe -m endpoint.build_client_bundle
Set-Location ..
```

Outputs are `deliverables/Sentinel_Client_Runtime.zip` and its `.sha256` checksum. The ZIP is generated locally, **not committed to GitHub**. Transfer it to the separate client and extract completely. It contains source, helpers, client launchers, instructions, and a source hash manifest; it excludes credentials, state, installed packages, research weights, and Ollama models.

On the client, run:

```powershell
.\SETUP_SENTINEL_CLIENT.bat
.\START_SENTINEL_CLIENT.bat
```

Setup creates `.venv-client`, installs monitoring/frontend dependencies, and builds the client profile. Open `http://127.0.0.1:3001/client` **on that computer**. Real local measurements appear before pairing; an unpaired client reports nothing to the host.

## Private connection and pairing

### How the machines connect

The host runs the operator interface, inference engine, endpoint relay, and Ollama. The client runs its own interface and monitoring agent. The agent sends authenticated health reports through a private tunnel or trusted private HTTPS endpoint. The relay accepts measurements; it cannot send arbitrary commands, shut down endpoints, or change their firewall rules.

`127.0.0.1` refers to the machine where it is entered. The tunnel connects local client port `18010` to host relay port `8010`; neither dashboard needs to open the other's interface. Resource reports are separate from the host's IoT threat-prediction stream.

### 1. Enroll on the host

1. Keep host services running and open **Client machines → Enroll client**.
2. Enter a recognizable name, such as `Workshop laptop`.
3. Choose **Create client key** and give it directly to the client operator.

The key claims one enrollment once. Its display is held only in current page state. Losing it before pairing means revoking that enrollment and creating another. After pairing, the agent saves its credential for subsequent reports; the relay stores a hash.

### 2. Open the tunnel on the client

Run in a terminal **on the client**:

```text
ssh -N -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -L 127.0.0.1:18010:127.0.0.1:8010 YOUR_USER@HOST_PRIVATE_IP
```

Replace `YOUR_USER` with the host's SSH-enabled account and `HOST_PRIVATE_IP` with its actual private address. Verify the SSH host key with the operator, authenticate, and **keep the terminal open**. The tunnel forwards only the dedicated relay, not the research backend, dashboards, or Ollama.

### 3. Pair in the client dashboard

1. Open `http://127.0.0.1:3001/client` on the client and choose **Connection**.
2. Enter **Private relay address:** `http://127.0.0.1:18010`.
3. Paste **Client pairing key:** the host-generated key.
4. Choose **Pair this computer** and wait for **Connected to Sentinel**.
5. Inspect the reporting device on the host's **Client machines** page.

Connected status requires an accepted report. Reporting normally occurs every five seconds; thirty seconds without a report makes the host mark the device offline. Both computers can use identical loopback ports because they are separate machines.

Do not enter `127.0.0.1:8010` directly on a separate client unless a local tunnel forwards that port; it otherwise points to the client itself. A lost tunnel/host does not stop local monitoring; a running paired, unpaused agent retries reporting. Revoked credentials need a new enrollment.

### Private HTTPS alternative

An operator may configure a private-IP HTTPS reverse proxy forwarding to the loopback relay. Its certificate must match the IP and be trusted by the client's Python environment. TLS verification is never disabled. The client accepts private literal-IP HTTPS and loopback HTTP, rejecting public destinations, arbitrary hostnames, URL credentials, custom paths, queries/fragments, and redirects. Relay requests bypass system HTTP proxies.

Setup does not create the proxy. See the [endpoint transport guide](sentinel_dashboard/endpoint/README.md).

## Dashboard features

### Host

- **Overview:** counts, provenance, activity chart, recent observations, architecture illustration, and System check.
- **Network & devices:** select a telemetry domain. The map illustrates architecture; it is not physical-device discovery.
- **Incidents:** search/filter, inspect scores, classifications, sources, response records, and influential features.
- **Intelligence:** saliency and model context. Attribution describes influence, not proven causation.
- **Response:** source-reported response statuses and research playbooks; verify actual enforcement independently.
- **Evidence & audit:** reported control mappings and observation JSON export.
- **Client machines:** enroll, search, inspect resource reports/last-seen state, and revoke device access.
- **Settings:** demo/backend selection, local readiness, reconnect, welcome replay, tour, and assistant guidance.
- **Research lab:** scenarios, XAI modes, robustness examples, remediation/interlocks, GRC, asset priority, audit console, and playbook dry runs. Some outputs are illustrative.

Thirteen model/data domains: Network Traffic; Modbus; Fridge; GPS Tracker; Garage Door; Motion Light; Thermostat; Weather; Linux process, disk, and memory; Windows 10; Windows 7. These are not discovered client machines.

`Ctrl+K` focuses search. Pause retains the current window; Resume restarts updates. Source/domain changes and reconnection clear the observation window. Up to fifty host observations are retained in page memory.

**Undo** reverses recent navigation, source, domain, and pause changes in the current session. It cannot recover cleared observations, reverse downloads/simulations, or undo host actions. Export, confirmed simulation, manual reconnection, and page reload clear history.

JSON snapshots include retained observations, provenance, and export time. The GRC **Print observation report / PDF** opens a printable report; use Print / Save PDF there. Research audit JSON identifies illustrative provenance. None of these exports issues compliance certification.

### Client

Measures host name, OS, logical cores, CPU/memory/system-drive use, uptime, and aggregate upload/download rates. It displays trends, connection status, privacy guidance, and resource warnings at 90% CPU/memory/storage. These warnings are not threat predictions and do not feed trained IoT models automatically.

- **Pause sharing:** stops future reports while collection continues; a request already in flight may finish.
- **Resume sharing:** waits for a fresh accepted report before showing connected.
- **Disconnect:** removes the saved credential; reconnecting needs a new enrollment.
- **Host Revoke access:** rejects future reports from that credential; historical reports remain.

Closing the browser does not stop reporting. A paused/disconnected client eventually appears offline on the host. Stale measurements/retained snapshots are explicitly labeled.

## Mereoleona

Host setup downloads `qwen2.5:1.5b`. The assistant sends bounded recent conversation and dashboard context to local Ollama at `127.0.0.1:11434`. Badges distinguish model replies from the built-in guide; no cloud fallback is used.

Try `Give me a tour`, `Summarize my telemetry`, `Show Modbus`, `Open incidents`, `Explain the latest alert`, `Pause the telemetry feed`, `Resume the telemetry feed`, `Check system readiness`, `Undo that`, `Export snapshot`, or `Simulate a threat`.

Application actions come from a fixed allowlist, never from arbitrary generated commands. Chat cannot shut down devices, terminate processes, or change firewall rules. Demonstrations require confirmation and use generated data. The built-in guide supports commands/help when generation fails.

To select a particular installed local chat model, set `sentinel_dashboard/frontend/.env.local`, then restart the frontend:

```dotenv
SENTINEL_OLLAMA_MODEL=qwen2.5:1.5b
```

Without an explicit setting, a suitable installed local chat model is selected. Cloud aliases, remote model metadata, and embedding models are rejected. Conversation stays in page memory while the panel is closed and clears on reload.

The helper sets `OLLAMA_NO_CLOUD=1`, loopback binding, one loaded model, and one parallel request. Setup persists `disable_ollama_cloud` in `%USERPROFILE%/.ollama/server.json`; restart an older running instance after configuration changes. See [Ollama's privacy settings](https://docs.ollama.com/faq#how-do-i-disable-ollamas-cloud-features).

Client Mereoleona is a **built-in local guide**, not an Ollama chatbot, and does not reuse the host's AI connection. Host private voice input depends on browser on-device recognition, English speech resources, and permission. Text remains available when these are missing; transcripts can be reviewed before sending. Spoken responses use local system voices.

## Privacy and retained data

The endpoint agent collects no file contents, browser history, keystrokes, process lists, or packet contents. Separate research host/packet tools are not the endpoint collector.

Private state under `sentinel_dashboard/.local/` includes:

- `fleet/operator.key`: host-only operator credential.
- `fleet/devices.sqlite3`: enrollments, hashed device credentials, reports/history.
- `client/control.key`: local agent API credential.
- `client/connection.json`: saved device credential, identity, relay, and sharing state.

Keep state private to its owning Windows account. Never publish or copy host state to clients. Files are not encrypted at rest by the application. State, virtual environments, builds, and client ZIP/checksum are ignored by Git.

Client trends retain sixty samples in memory. The relay stores up to 120 samples per device, plus latest state/enrollment; revocation retains history. The host browser keeps fifty observations in memory and stores source preference locally. Research backend audit logs have separate retention behavior.

Supplied launchers bind services to loopback. Client profile restrictions block operator pages/APIs. Device/operator credentials are distinct. These local interfaces rely on the Windows user/session boundary and are not a complete multi-user internet deployment.

Initial setup contacts package, installer, and model sources. Tested local runtime browser flows made no external requests. Local/private inference does not make an internet-connected installation physically air-gapped. Do not expose the original research backend or Ollama publicly.

## Ports, configuration, and logs

Host services use **3000** (dashboard), **8000** (backend and `/ws/telemetry`), **8010** (relay), **11434** (Ollama). Client services use **3001** (dashboard), **8011** (agent), and **18010** for the example tunnel.

Advanced environment variables:

- `SENTINEL_PYTHON`: explicit compatible interpreter, overriding normal role-environment lookup.
- `SENTINEL_STATE_DIR`: alternate state root; associated frontend/services must agree. Launcher logs still use their normal project paths.
- `SENTINEL_INTERFACE`: `client` selects restricted routes/`.next-client`; host launcher selects `operator`/`.next`. Prefer the launchers.
- `SENTINEL_OLLAMA_MODEL`: installed host chat-model selection.

Logs are under `.local/host/` (host backend/dashboard), `.local/client/` (agent/dashboard), and `.local/fleet/` (relay). Ollama helper logs are `%LOCALAPPDATA%/Ollama/sentinel-server.log` and `sentinel-stdout.log`. Older/manual launches may log elsewhere; read the path printed in the error.

```powershell
.\SETUP_SENTINEL_HOST.bat -CheckOnly
.\SETUP_SENTINEL_CLIENT.bat -CheckOnly
.\START_SENTINEL_HOST.bat -NoBrowser
.\START_SENTINEL_CLIENT.bat -NoBrowser
```

`-CheckOnly` checks runtime prerequisites without installs/rebuilds; host also checks assets/Ollama executable. It is not a complete dependency/generation test. `-NoBrowser` starts without opening the browser. The BAT execution-policy override is process-scoped, not a permanent machine-policy change; organization-managed policies may still restrict execution.

## Updating and stopping

```powershell
git switch sentinel-host-client
git pull --ff-only origin sentinel-host-client
```

Stop the relevant application's services before replacing dependencies/rebuilding, rerun its setup, then start. ZIP clients need a newly generated/transferred bundle rather than `git pull`; retain only their own private state as appropriate. Recreate environments instead of copying them across computers.

No startup tasks, Windows services, or stop BAT are installed. Closing the browser/launcher terminal does not stop hidden processes. Pause/Disconnect stops client sharing; to stop the application, identify its project Python/Node command lines in Task Manager and end only those processes, or sign out/restart Windows. Closing the SSH terminal ends its tunnel. Avoid ending unrelated workloads.

Start files reuse healthy services; restart older processes deliberately after updates so new code is loaded.

## Troubleshooting

### Missing WinGet/Python/Node/npm or failed setup

Install/update Microsoft App Installer or manually install compatible Python/Node with npm. Open a fresh terminal and rerun. Store Python aliases are skipped. Use `SENTINEL_PYTHON` only for a compatible explicit interpreter. Read the first installer/pip/npm/build error, resolve network/proxy/permission issues, and rerun. A partial run is not completed setup; restart Windows first if an installer requires it.

### Missing host assets or build

Use the full host project and restore paths reported by `backend/verify_install.py` from real research assets, resolving LFS pointers where necessary. The client ZIP deliberately excludes weights/data. Host startup needs `.next/BUILD_ID`; client startup needs `.next-client/BUILD_ID`. Run the matching setup and inspect stderr logs.

### Port conflict or stale service

Check which application owns the required port and deliberately stop/reconfigure it. Sentinel does not kill unrelated services. After code changes, restart the actual old processes before assuming a reused service loaded the update.

### Assistant uses the built-in guide

Inspect System check, Ollama logs, and `ollama list`. Confirm loopback service availability and installed/configured model name. Restart the frontend after `.env.local` changes. First replies can be slower while weights load; failure falls back to the guide.

### SSH, pairing, or offline client

Verify host SSH/account, private IP, routing/VPN, firewall access, credentials, and server host key with the operator. Port 18010 may already belong to another tunnel. Keep it open; use `http://127.0.0.1:18010`, an unused enrollment key, and unpaused sharing. Lost/used/revoked credentials need a new enrollment and client re-pairing. Connected status waits for acceptance; thirty seconds without a report yields offline.

### HTTPS/certificate error

Use a private literal IP and certificate matching that IP and trusted by the Python environment. Do not disable validation. Public URLs, remote HTTP, redirects, custom paths, and hostname-only URLs do not meet relay policy.

### Empty/stale data or scaler warning

Check source badge/playback and reconnect as appropriate. Domain/source changes reset observations; warmup frames are not predictions. Connection alone does not prove physical-device monitoring. Saved scalers report scikit-learn 1.9.0 serialization while the tested host pins 1.8.0; inference checks passed with a warning, not statistical certification. Align/re-export scalers in a validated environment before operational reliance.

### Voice or PDF window unavailable

Text works when private recognition resources/permission or local voices are missing. Allow local pop-ups for the printable observation report and use Print / Save PDF. Blocked report windows report failure rather than claiming an export.

## Development and verification

The frontend uses Next.js 16.3.6, React 19, TypeScript, and Zustand. Backend inference uses CPU PyTorch Conformer sequences/saliency. Endpoint HTTP uses Python's standard library, psutil, and local SQLite.

Frontend development, from `sentinel_dashboard/frontend` after installing dependencies:

```powershell
npm run dev
```

Client commands are `npm run dev:client`, `npm run build:client`, and `npm run start:client`. Run one process per chosen port. BAT launchers use production builds.

Manual host Python commands from `sentinel_dashboard`, each in its own terminal:

```powershell
.\.venv-host\Scripts\python.exe -m uvicorn backend.server:app --host 127.0.0.1 --port 8000
.\.venv-host\Scripts\python.exe -m endpoint.fleet
```

On clients use `.\.venv-client\Scripts\python.exe -m endpoint.agent`. The agent is portable Python; double-click launchers target Windows.

Frontend checks:

```powershell
npm run test:assistant
npm run build
npx tsc --noEmit
npm run lint
```

Python checks from `sentinel_dashboard`:

```powershell
.\.venv-host\Scripts\python.exe -m unittest endpoint.test_endpoint -v
.\.venv-host\Scripts\python.exe backend/verify_install.py
```

Optional Playwright/Chrome checks: set `SENTINEL_E2E_ARTIFACTS` to a writable output directory and run `node tests/host-browser.cjs` from the frontend with services running. `SENTINEL_E2E_FILTER` supports focused name matches. `node tests/backend-live.cjs` temporarily changes global domain/playback and restores them; run without another operator changing those settings. `tests/client-browser.cjs` uses isolated `endpoint.verify_runtime` and `SENTINEL_E2E_STATE`; see its source/[frontend guide](sentinel_dashboard/frontend/README.md). Do not use production enrollments as test state.

### Recorded checks — 16 October 2026

- Thirty host browser workflows, including domains, navigation, assistant commands/conversation, exports, research controls, mobile layouts, and recovery; one timing-sensitive scenario assertion passed on focused rerun.
- Twenty-four backend checks covering ten APIs, thirteen models' predictions/explanations, and pause/step/resume.
- Seventeen frontend regressions and ten endpoint protocol tests passed.
- Isolated pairing/reporting, pause/resume, revocation, and credential removal passed.
- Production build/type checks passed; tested browser flows recorded no uncaught errors or external requests.
- Windows prerequisite/run checks passed, including isolated client startup and a path with spaces. Fresh-machine WinGet installation was not tested on a clean Windows installation.

Older repository-wide lint findings remain; targeted changed-feature lint passed. Actual microphone hardware, a separate physical client, and SSH/HTTPS deployment need environment-specific verification. These recorded checks are not guarantees for every installation.

## Project layout and limits

```text
Sentinel_IOT/
├── README.md
├── SETUP_SENTINEL_HOST.bat / START_SENTINEL_HOST.bat
├── SETUP_SENTINEL_CLIENT.bat / START_SENTINEL_CLIENT.bat
├── START_SENTINEL_DASHBOARD.bat           # Host compatibility alias
├── sentinel_dashboard/
│   ├── setup_host.ps1 / start_host.ps1
│   ├── setup_client.ps1 / start_client.ps1
│   ├── windows_common.ps1 / find_python.ps1
│   ├── start_local_ai.ps1 / start_endpoint.ps1
│   ├── backend/                         # Inference/research APIs
│   ├── endpoint/                        # Agent, relay, tests, bundle builder
│   ├── frontend/                        # Shared UI, separate profiles
│   ├── .venv-host/ / .venv-client/       # Generated, ignored
│   └── .local/                          # Private state/logs, ignored
├── FYP_WORK/                            # Host weights/scalers/data
└── deliverables/                        # Generated client ZIP/checksum
```

Current limits:

- Local research deployment, not complete multi-user internet hosting or a production SOC.
- Backend data may be replay or configured host-derived features; client resource reports remain a separate stream.
- Maps are illustrative. Packet, TPM/ZK, hardware attestation, playbook traces, and some metrics contain research simulations.
- Robustness examples run only in demo; unimplemented Carlini-Wagner/DeepFool kernels cannot execute another algorithm under their names.
- Interlock/rule-revocation research controls are local simulations; backend firewall reversal is not implemented there. Response records need independent verification.
- Observation/research exports do not perform cryptographic or compliance certification. Historical accuracy/latency/benchmark claims are not independently validated here.
- Client Mereoleona is a guide; full conversation runs on the host. Voice capability depends on installed local resources.
- Initial downloads need internet, transport needs configuration, and state is not application-encrypted.
- Scaler compatibility and legacy lint issues require further validation before operational use.

Further documentation: [Endpoint transport/privacy](sentinel_dashboard/endpoint/README.md), [frontend/assistant guide](sentinel_dashboard/frontend/README.md), [host package versions](sentinel_dashboard/backend/requirements-host.txt). The [historical research overview](sentinel_dashboard/RESEARCH_OVERVIEW_LEGACY.md) is retained for history; this guide supersedes its older operational/certification descriptions.

Project lead: **Abdullah Bin Zubair Hashmi**, Computer Science & Cybersecurity Final Year Project, Bahria University. Research artifacts are in `FYP_WORK`. Review bundled third-party licenses before redistribution; no single project-wide license file was added by this dashboard branch.
