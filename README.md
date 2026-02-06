# Cyberdriver Desktop

Cyberdriver Desktop is a Tauri-based GUI that runs the Cyberdriver local API and reverse tunnel. It replaces the CLI workflow with a native desktop experience while preserving all Cyberdriver functionality.

## Prerequisites (macOS)

Install Node.js, npm, and the Rust toolchain:

```bash
# Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
. "$HOME/.nvm/nvm.sh"
nvm install 24

# Rust (rustup)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

## Build & Run (macOS)

```bash
npm install
npm run tauri dev
```

To build a local test release:

```bash
npm run tauri build
```

The built app will be at:

- `src-tauri/target/release/bundle/macos/cyberdriver.app`

If macOS blocks the app as damaged (unsigned build), run:

```bash
xattr -dr com.apple.quarantine "/Users/alanduong/Downloads/Cyberdriver.app"
```

## Permissions (macOS)

The app requires:

- **Screen Recording** permission for screenshots
- **Accessibility** permission for mouse/keyboard control

You can grant both in **System Settings → Privacy & Security**.

## Usage

1. Open the app.
2. Enter your Cyberdesk API key.
3. Click **Start Local API** to run the local server.
4. Click **Connect Tunnel** to establish the reverse tunnel.

## Local API Quick Test

```bash
curl "http://127.0.0.1:3000/computer/display/dimensions"
curl "http://127.0.0.1:3000/computer/display/screenshot?width=1024&height=768" --output screenshot.png
```

## Windows Notes

- **Persistent Display** requires the Amyuni driver files. Provide a path in the app settings if you have the driver bundle locally.
- **PowerShell** endpoints are Windows-only.

