# OpenCut Studio web workspace

## Start
Use Node.js 20+:
```bash
cd studio
npm install
npm run dev
```
Open http://localhost:3000.

## Start the optional API backend
1. Start the service using the instructions in `../backend/README.md`.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_OPENCUT_API_URL=http://127.0.0.1:8000`.
3. Restart Next.js. When this value is set, the browser sends the chosen file to that API for analysis. If it is blank, the page uses client-side analysis when the browser can decode the audio.

## Implemented
- Next.js 15 / React 19 / TypeScript dashboard scaffold.
- Responsive dark editing workspace listing ten planned modules.
- Client-side waveform visualization and RMS-threshold silence marking for media whose audio stream the browser can decode.
- Optional connection to the FastAPI silence-analysis endpoint for FFmpeg-supported media.
- User-adjustable noise threshold, minimum silence/speech durations, and safety padding.
- Basic EDL, CSV, and JSON report export.

## Not yet implemented
The remaining tools are roadmap placeholders; they do not yet perform transcription, AI zoom, profanity censoring, multicamera switching, chapter inference, repeat detection, B-roll matching, or viral clip scoring. The web demo marks approximate intervals on a waveform; use the Python/FastAPI backend for more reliable file analysis. Browser decoding support varies by codec/container. If the API endpoint is configured, media is uploaded to that configured service for analysis; otherwise supported audio files are processed locally in the browser.
