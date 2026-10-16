# Mereoleona private neural voice

Kokoro 82M quantized CPU synthesis, using the published `af_heart` (default) and `af_bella` female voices. This is generated speech, not a recording or imitation of a real person. The model/library is from [hexgrad/kokoro](https://github.com/hexgrad/kokoro/tree/main/kokoro.js), with model assets from [onnx-community/Kokoro-82M-v1.0-ONNX](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX). Review their Apache-2.0/model notices before redistribution.

Host setup runs `npm ci` and `npm run setup` here. Setup downloads the roughly 92 MB quantized model and supporting files to `sentinel_dashboard/.local/voice/models`, synthesizes a sample, and marks installation ready. `preview.wav` is the setup preview. Neither model files nor credentials are committed.

`start_voice.ps1` starts the service hidden on `127.0.0.1:8012`; the host launcher calls it automatically. Setup must run first. A separate local key in `.local/voice/control.key` protects `/speak`; the frontend proxies same-origin requests through `/api/speech`. `GET /health` reports readiness without generation. Input is limited to 1600 characters, voices are allowlisted, and only one synthesis runs at a time. Text and generated reply audio are not saved by runtime synthesis or logged. Setup/test preview files are retained locally.

Runtime blocks outbound `fetch` and configures model loading from its existing local cache. Missing files cause failure rather than downloading during a conversation. Setup alone has network/model-download access. There is no hosted synthesis request. The client-only dashboard does not need this service.

Open Mereoleona's **Voice settings → Preview voice** to audition her. Automatic prefers the neural female voice when the service is ready. A local female system voice is the fallback. Selecting a listed system voice uses that voice explicitly. Spoken responses remain opt-in; changing voice, starting the microphone, closing the panel, or disabling speech stops playback. CPU synthesis can add a delay before a reply starts.

The English microphone pack is independent of text-to-speech. Voice settings offers the browser's `SpeechRecognition.install` flow. This is experimental/browser-dependent; downloading may fail in embedded browsers, and the app reports that failure without enabling cloud recognition. An installed Windows speaking voice does not install the browser recognition pack.

Checks: `node --test runtime.test.mjs` verifies PCM WAV encoding. For a live smoke test, run host services and send a same-origin POST to `/api/speech`; verify a nonempty RIFF/WAVE response. The service also rejects absent/wrong credentials, unknown routes, invalid voices, and oversized input. The frontend speech selection/pack-state tests run in `npm run test:assistant` from the frontend directory.
