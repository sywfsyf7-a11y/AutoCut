# OpenCut Studio API

Independent FastAPI service for the OpenCut Studio clean-room application.

## Run locally
From the repository root:
```bash
python -m venv .venv
# activate the venv
pip install -r backend/requirements.txt
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```
Open http://127.0.0.1:8000/docs for the API schema.

## Implemented endpoints
- `GET /health`: reports FFmpeg and optional Whisper availability.
- `POST /api/analyze/silence`: upload media and receive silence/kept intervals.
- `POST /api/export/edl`: generate an EDL from returned silence intervals.
- `POST /api/export/fcp7xml`: generate a basic FCP7 xmeml v4 sequence referencing a media path on the editor's machine.
- `POST /api/export/srt`: export word timestamps to SRT.
- `POST /api/profanity/filter`: match word timestamps against a caller-supplied term list.
- `POST /api/export/chapters`: generate YouTube chapter text.
- `POST /api/jobs/render`, `GET /api/jobs/{id}`, `GET /api/jobs/{id}/download`: asynchronous render job endpoints.
- `POST /api/transcribe`: optional Faster-Whisper endpoint; install `faster-whisper` and select a model to enable it.

## Notes
This backend is a functional first increment, not a production SaaS deployment. Jobs are currently stored in memory and in a local temp folder; use a durable queue, object storage, authentication, quotas, malware scanning, and cleanup policy before exposing it publicly. Silence detection is an RMS fallback, not a learned Silero VAD. Direct NLE plugin integrations, multicamera inference, AutoZoom keyframes, and semantic AutoViral scoring are not complete.
