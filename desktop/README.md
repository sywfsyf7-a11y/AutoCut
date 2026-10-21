# OpenCut Studio desktop shell

The Electron shell loads the statically exported Next.js dashboard from `desktop/renderer` and launches `OpenCutAPI.exe` as a localhost-only sidecar when packaged. The GitHub Actions workflow performs the copies and builds both an installer and a portable EXE.

The media API binds to 127.0.0.1 only. The selected media is sent to that local API only when the frontend build has `NEXT_PUBLIC_OPENCUT_API_URL=http://127.0.0.1:18765` configured.
