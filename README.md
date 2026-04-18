# Antigravity Codex Comfort Kit

Make the Codex chat inside Google Antigravity easier to read.

This project patches the installed `openai.chatgpt-*` Antigravity extension by injecting:

- a custom CSS override for typography and spacing
- a small in-app reading mode switcher
- an auto-targeting installer that finds the latest installed extension version

## Features

- Better readability for long conversations
- Three reading modes: `Compact`, `Comfort`, `Spacious`
- Small `Aa` switcher inside the UI
- One-command reinstall after Antigravity updates
- Clean uninstall support

## Default Comfort Preset

- Body text: `14px`
- Code / small text: `13px`
- Large text: `17px`
- Main content width: `52rem`
- Wide markdown blocks: `62rem`
- Text line-height: `1.6`
- Code line-height: `1.65`

## Repository Layout

- `antigravity-codex-comfort.css` — UI typography and spacing overrides
- `antigravity-codex-comfort.js` — in-app mode switcher logic
- `install-antigravity-codex-comfort.ps1` — installer for the latest matching Antigravity extension
- `update-antigravity-codex-comfort.ps1` — short wrapper for reinstall / status / uninstall
- `ANTIGRAVITY_CODEX_COMFORT_README.md` — detailed project documentation in Russian

## Installation

Run from PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File ".\install-antigravity-codex-comfort.ps1"
```

The installer will:

- locate the latest `openai.chatgpt-*` folder under `C:\Users\user\.antigravity\extensions`
- patch the extension `webview\index.html`
- copy the comfort CSS and JS into `webview\assets`
- preserve a backup of `index.html` when needed
- clean up older marker formats from previous patch versions

## After Antigravity Updates

When Antigravity updates, the extension often moves to a new versioned folder. Reapply the patch with:

```powershell
powershell -ExecutionPolicy Bypass -File ".\update-antigravity-codex-comfort.ps1"
```

Check status:

```powershell
powershell -ExecutionPolicy Bypass -File ".\update-antigravity-codex-comfort.ps1" -Status
```

Remove the patch:

```powershell
powershell -ExecutionPolicy Bypass -File ".\update-antigravity-codex-comfort.ps1" -Uninstall
```

## How The UI Works

The patch adds a small `Aa` button in the bottom-right corner of the Codex interface.

- Click `Aa` to open or collapse the mode switcher
- Choose `Compact`, `Comfort`, or `Spacious`
- The selected mode is stored in `localStorage`
- Hidden mode still keeps a small clickable entry point

## Notes

- This is an unofficial UI patch
- Extension updates can overwrite or bypass it
- The project currently targets the Windows Antigravity layout used during development

## Screenshots

You can add screenshots later in a `docs/` folder and reference them here, for example:

```md
![Comfort mode](docs/comfort-mode.png)
```

## Roadmap

- More presets
- Separate code-only scaling
- A more native-looking switcher skin
- Optional scheduled auto-reapply after updates
- Import/export of user preferences
