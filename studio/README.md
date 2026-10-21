# OpenCut Studio web workspace

## Start
Use Node.js 20+:
```bash
cd studio
npm install
npm run dev
```
Open http://localhost:3000.

## Implemented
- Next.js 15 / React 19 / TypeScript dashboard scaffold.
- Responsive dark editing workspace listing ten planned modules.
- Client-side waveform visualization and RMS-threshold silence marking for media whose audio stream the browser can decode.
- User-adjustable noise threshold, minimum silence/speech durations, and safety padding.
- Basic EDL, CSV, and JSON report export.

## Not yet implemented
The remaining tools are roadmap placeholders; they do not yet perform transcription, AI zoom, profanity censoring, multicamera switching, chapter inference, repeat detection, B-roll matching, or viral clip scoring. The web demo marks approximate intervals on a waveform; use the Python/FastAPI backend for more reliable file analysis. Browser decoding support varies by codec/container. No media is uploaded by this page.
