# StudioReserve

StudioReserve is a niche, polished finance cockpit for freelancers, creators, and boutique studios.

It is local-first, desktop-oriented, and designed around the financial questions studio operators actually face: client income, tax reserve, retainers, project margin, expenses, invoices, and runway.

## What Is Included

- Static promotional homepage in `site/`
- Desktop app interface in `src/`
- Electron entry for native desktop packaging
- Windows `.exe` and macOS `.dmg` build scripts
- Local storage persistence and JSON export
- Google/Facebook sign-in hooks for a future encrypted backup layer

## Open The Homepage

The homepage does not need localhost. Open this file directly:

```text
site/index.html
```

## Preview The App During Development

```powershell
& "C:\Users\andri\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" tools/serve.js
```

Then open `http://127.0.0.1:4173`.

## Build Installers

Install dependencies:

```powershell
npm install
```

Build Windows installer:

```powershell
npm run build:win
```

Build macOS installer:

```powershell
npm run build:mac
```

Windows produces an `.exe` installer. macOS produces a `.dmg` installer because macOS does not run `.exe` installers natively.
