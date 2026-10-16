# Sentinel IoT control room

The dashboard follows the Sentinel portfolio's charcoal, ivory, mint, and coral identity. Its welcome introduces Mereoleona, a private assistant, and a five-step tour. Workspaces include overview, telemetry domains, incident inspection, feature attribution, response records, evidence export, and settings. Original research consoles remain under Research lab.

## Run

For Windows installation, use the project-root `SETUP_SENTINEL_HOST.bat` then `START_SENTINEL_HOST.bat` on the host, or `SETUP_SENTINEL_CLIENT.bat` then `START_SENTINEL_CLIENT.bat` on each separate client. Setup installs missing Python/Node runtimes through WinGet and uses role-specific `.venv-host` / `.venv-client` Python environments. Only host setup installs CPU PyTorch, private Ollama, and the local chat model. Full setup, prerequisites, and pairing instructions are in the project-root README. Run scripts start the production build, check readiness, and reuse healthy services.

With dependencies installed, run `npm run dev` here and open http://127.0.0.1:3000. Both `dev` and production `start` bind the dashboard to this computer's loopback address. Generated demo mode works without Python, model weights, or Ollama. Use the project-root `START_SENTINEL_DASHBOARD.bat` for the existing Python backend and frontend together.

The first visit opens the welcome; Settings → Replay welcome opens it again. Ctrl+K focuses observation search. Conversation remains in page memory while the assistant is closed and clears on reload. Source preference is stored locally; the new workspace does not persist observations.

## Separate client computers

**Client machines** opens `/clients`, the operator view for explicit enrollment, received health measurements, last-seen state, and access revocation. `/client` is the separate endpoint interface. On a Windows client, use `SETUP_SENTINEL_CLIENT.bat` once and `START_SENTINEL_CLIENT.bat` afterward; the client profile runs at `127.0.0.1:3001/client` and blocks operator routes. The main launcher starts a dedicated private relay at `127.0.0.1:8010`. Connect the computers through an existing SSH tunnel or a trusted private HTTPS reverse proxy; the core dashboard and FastAPI service remain on loopback.

The client collects actual CPU, memory, system-drive usage, uptime, and aggregate transfer rates. Its 90% resource warnings are distinct from Conformer attack predictions. Pairing keys are scoped to individual endpoints, operator credentials stay on the main machine, and the client can pause sharing or disconnect locally. The client Mereoleona panel is a clearly labeled built-in guide with no model requests. Full installation, transport, privacy, and retention instructions are in `../endpoint/README.md`. Create the Windows source bundle with `python -m endpoint.build_client_bundle` from `sentinel_dashboard`.

## System check and Undo

Overview includes a compact System check; Settings opens its full details. It probes only the local backend and Ollama metadata, without generating a model reply or launching processes. Checks distinguish reachable services, loaded detection models, installed local chat models, and observations arriving in this browser. Demo data is clearly identified. The panel refreshes every 30 seconds while the page is visible, or when you choose Check again. It provides launcher instructions, demo access, and a Reconnect feed action. Reconnecting starts a fresh observation window. Ask Mereoleona “check system readiness” to open and refresh the check.

Use the Undo bar or say “undo that” to reverse navigation, source selection, domain selection, and pause/resume changes. Up to ten changes stay in page memory. Undo restores only the settings that the action changed and refuses to overwrite conflicting later settings. Source and domain changes start fresh observation windows; Undo does not restore the earlier observations. Exports, confirmed simulations, and manual feed reconnection clear the undo history because their results cannot be reversed by this control. Reloading the page also clears it.

## Private assistant

The built-in project guide works immediately. For conversational language generation:

1. Install Ollama separately from https://ollama.com/download.
2. Download an appropriate local model, for example `ollama pull qwen2.5:1.5b`.
3. Keep Ollama running at `127.0.0.1:11434`.
4. Reopen the assistant. Its badge identifies the active engine.

Set `SENTINEL_OLLAMA_MODEL=qwen2.5:1.5b` in `.env.local` to select the configured compact model. Restart Next.js if changing the value in production. Only installed local models qualify. Cloud aliases, remote model metadata, and embedding models are rejected. The server verifies model metadata before sending context, and local requests cannot follow redirects. Failed or unavailable model calls fall back to the clearly labeled project guide; there is no cloud fallback.

The Windows project launcher now calls `sentinel_dashboard/start_local_ai.ps1` before starting the dashboard. The helper reuses an existing local service or starts the official standalone Ollama executable hidden from `%LOCALAPPDATA%/Programs/Ollama`. It sets `OLLAMA_NO_CLOUD=1`, binds to `127.0.0.1:11434`, and limits parallel requests and loaded models to one. Cloud features are also disabled persistently in `%USERPROFILE%/.ollama/server.json`. Initial installation and model downloads require internet access; inference does not. This machine uses the CPU runtime without the large optional GPU libraries.

Conversations use a 4,096-token context, bounded recent history, concise replies, and a two-minute idle unload interval to leave memory available for telemetry. Conversation history stays in page memory; neither the dashboard nor its Ollama API requests save it to disk. Do not expose the local service through a tunnel or a public listen address.

Try “give me a tour”, “summarize my telemetry”, “show Modbus”, “open incidents”, “pause the telemetry feed”, “resume the feed”, “connect the backend”, “start demo”, “explain the latest alert”, “export snapshot”, or “simulate a threat”. Application actions use a fixed allowlist. Model output cannot execute actions. Demonstrations require explicit review and affect generated observations only. Chat cannot run arbitrary commands, terminate processes, change firewall rules, or shut down devices.

The microphone uses browser on-device recognition only, when an English speech pack is available. Unsupported browsers explain the limitation and retain text input. Transcripts are editable before sending. Spoken replies use local English system voices only. The new workspace does not request remote fonts. Legacy research tools retain their original implementations and assumptions.

## Telemetry and provenance

Settings selects generated demo data or the local FastAPI websocket at `127.0.0.1:8000/ws/telemetry`. Changing source or domain clears the observation window and response rules. Backend mode never silently inserts generated events. Disconnects and stale observations are labeled. Backend data may be dataset replay or host telemetry depending on its configuration; connection does not imply live physical devices.

The frontend normalizes the producer's actual `anomaly_probability`, `forensic_label`, `forensic_confidence`, `saliency_attributions`, `pid`, and `mttr_ms` fields. Sequence warmup frames are skipped. Unreported attribution timing and cryptographic hashes are not fabricated. The map illustrates supported sources and processing; it is not device discovery.

JSON evidence exports contain the most recent 50 retained observations, provenance, and export time. Control mappings and response records are source reports, not certification, verified enforcement, or cryptographic verification. Research lab panels may contain illustrative metrics.

## Validation

- `npm run test:assistant`: commands, negations, summaries, selected-event explanations, private model selection, backend payload normalization.
- This suite also checks printable-report escaping, blocked pop-up failures, and the guard preventing research simulations from entering backend observation windows.
- `npm run build`: production compilation and type checking.
- `npm run lint`: repository linting. Legacy components may have pre-existing findings; workspace modules can be linted separately.

Optional live checks: with the host stack running, set `SENTINEL_E2E_ARTIFACTS` to an output directory and run `node tests/host-browser.cjs`. It requires Playwright and Chrome, uses an isolated browser profile, and checks welcome/tour, navigation, domains, filters, exports, assistant conversation and fallback, research interactions, mobile layouts, API validation, and connection-loss recovery. Set `SENTINEL_E2E_FILTER` to a test-name regular expression for a focused rerun. Downloads and screenshots stay in the selected output directory.

`node tests/backend-live.cjs` checks ten local service endpoints, actual predictions and explanations for all thirteen domains, and playback pause/step/resume. It temporarily changes the backend's global playback/domain settings, then restores them; run it without other active operators changing those settings. `tests/client-browser.cjs` separately exercises host enrollment, accepted client reports, pause/resume, revocation, and disconnect against the isolated `endpoint.verify_runtime` relay described in its source.

Host verification on 2026-10-16 covered thirty browser workflows and twenty-four backend checks. The local-model conversation retained follow-up context, all thirteen actual models returned predictions with saliency, and the isolated client-management flow passed. Browser checks detected no uncaught errors or external browser requests. Production compilation passed. Repository-wide lint still reports older component issues; generated `.next-client` files are now excluded and CommonJS test files have the appropriate lint configuration.

Research boundaries: robustness examples run only in demo mode; unimplemented Carlini-Wagner and DeepFool kernels cannot execute another kernel under their names. Demo threat scenarios do not contact the backend; backend scenarios use its existing WebSocket protocol. Research rule revocation and interlock cancellation are local simulations; backend firewall reversal is not implemented in this view. Audit CLI export downloads explicitly labeled research JSON. The GRC print control opens a report of the retained observations with a Print / Save PDF button; it does not issue a compliance certificate. Research audit bundles identify their illustrative provenance and do not attest to TPM, ZK, signature, or hardware verification. Voice capture still depends on an installed on-device speech pack and microphone access. A real second computer and private SSH/HTTPS connection require separate deployment verification.

The installed CPU-only Ollama runtime was verified with `qwen2.5:1.5b`: the assistant API returned generated replies, remembered a workshop name across messages, and correctly read the supplied anomaly count. A browser session verified the local-model badge, generated replies, conversation continuity across a navigation command, and chat-driven source selection, pause, and incident navigation. No external browser requests were made in that check. Persistent cloud-disable settings and loopback listeners for the dashboard, backend, and Ollama were checked. Initial cold reply: 18 seconds; the measured follow-up: 2 seconds. Timing varies with machine load.

The shell adapts to phone, tablet, and desktop, respects reduced motion, and uses native modal dialogs. The orb releases WebGL resources on unmount and skips rendering when hidden or offscreen.

The local backend was exercised with the existing Conformer weights and dataset: HTTP status and inferred WebSocket observations succeeded. Its existing saved scaler emitted a version mismatch warning (saved with scikit-learn 1.9.0; installed 1.8.0). The environment and weights were left unchanged; align and validate them before relying on predictions.

Design references: [Linear's 2026 interface refresh](https://linear.app/now/behind-the-latest-design-refresh) and [Vercel Geist](https://vercel.com/geist/stack), interpreted through the existing portfolio identity.
