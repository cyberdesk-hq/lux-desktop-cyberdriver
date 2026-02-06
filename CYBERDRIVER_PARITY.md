# Cyberdriver Parity Checklist (Python -> Tauri/Rust)

Goal: preserve every behavior from `cyberdriver.py` in the Cyberdriver desktop app.

## Runtime & Configuration

- [ ] Config dir resolution (Windows: `LOCALAPPDATA`, else `XDG_CONFIG_HOME` or `~/.config`)
- [ ] Config file creation with `version` + `fingerprint` UUID
- [ ] PID file format + single instance behavior
- [ ] Environment variables: `CYBERDRIVER_STDIO_LOG`, `CYBERDRIVER_DETACHED`, `CYBERDRIVER_RESTART_COUNT`, `CYBERDRIVER_MEI_CORRUPTED`, `NO_COLOR` / `CYBERDRIVER_NO_COLOR`
- [ ] Logging to files (daily debug logs, api errors, tunnel forward errors)
- [ ] Restart logic for corruption (set flag, restart with same args)

## Local HTTP API

### Display
- [ ] `GET /computer/display/screenshot` (modes: `exact`, `aspect_fit`, `aspect_fill`)
- [ ] Default size 1024x768 if no dimensions
- [ ] Retry logic for transient capture failures
- [ ] `GET /computer/display/dimensions`

### Keyboard
- [ ] `POST /computer/input/keyboard/type` (text; ensure caps lock off)
- [ ] `POST /computer/input/keyboard/key` (XDO sequence parser)
- [ ] `POST /computer/copy_to_clipboard` (Ctrl+C + clipboard retry)

### Mouse
- [ ] `GET /computer/input/mouse/position`
- [ ] `POST /computer/input/mouse/move`
- [ ] `POST /computer/input/mouse/click` (button/press/release/clicks)
- [ ] `POST /computer/input/mouse/drag`
- [ ] `POST /computer/input/mouse/scroll` (vertical + horizontal)

### File system
- [ ] `GET /computer/fs/list`
- [ ] `GET /computer/fs/read` (base64, <=100MB)
- [ ] `POST /computer/fs/write` (base64, write/append)

### Shell (Cross-platform)
- [ ] `POST /computer/shell/powershell/simple` (PowerShell on Windows, sh on macOS/Linux)
- [ ] `POST /computer/shell/powershell/test` (PowerShell on Windows, sh on macOS/Linux)
- [ ] `POST /computer/shell/powershell/exec` (timeout, session_id; PowerShell on Windows, sh on macOS/Linux)
- [ ] `POST /computer/shell/powershell/session` (create/destroy, stateless)

### Internal
- [ ] `GET /internal/diagnostics`
- [ ] `POST /internal/update` (self-update; Windows restart flow)
- [ ] `POST /internal/keepalive/remote/activity`
- [ ] `POST /internal/keepalive/remote/enable`
- [ ] `POST /internal/keepalive/remote/disable`

## Reverse Tunnel

- [ ] Connect: `wss://{host}:{port}/tunnel/ws`
- [ ] Headers: `Authorization`, `X-PIGLET-FINGERPRINT`, `X-PIGLET-VERSION`, `X-Remote-Keepalive-For`
- [ ] Message framing: JSON meta -> binary chunks -> "end"
- [ ] Idempotency cache: `X-Idempotency-Key` header, TTL, max size
- [ ] Request forwarding to local API with special timeout for PowerShell
- [ ] Placeholder JSON for empty error bodies
- [ ] Retry/backoff: 1,2,4,8,16s; auth fail stops; rate limit sleeps

## KeepAlive Manager

- [ ] Idle tracking with threshold + randomized cooldown
- [ ] Simulated activity: click + type phrases + ESC
- [ ] Live countdown (UI/logging)
- [ ] Remote keepalive coordination

## Windows-only Features

- [ ] Black screen recovery loop with variance checks + `tscon`
- [ ] Persistent display driver (Amyuni) install with admin elevation
- [ ] Console protections / detached mode behaviors

## UX / GUI mapping

- [ ] GUI controls for API server start/stop
- [ ] GUI controls for tunnel connect/disconnect
- [ ] GUI settings for host/port/secret/keepalive/black-screen
- [ ] Status indicators + log viewer
- [ ] Coordinate capture tool

