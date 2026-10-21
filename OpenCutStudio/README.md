# OpenCut Studio

Independent Windows desktop tool for detecting low-energy gaps in audio and exporting edit decisions. This is not the original AutoCut application and does not contain its proprietary code.

## Included
- Arabic desktop interface.
- WAV analysis using Python standard library.
- Adjustable dBFS threshold, silence/talk duration, and speech-protection padding.
- Silence intervals displayed in a table.
- EDL, CSV, and JSON exports.
- Cut WAV output from PCM WAV input.
- Optional FFmpeg support for compressed audio/video analysis and MP4/WAV rendering.

## Run from source
Install Python 3.10 or later, then run: python opencut_studio.py
Install FFmpeg and add ffmpeg and ffprobe to PATH for compressed audio/video support.

## Build the Windows EXE
Open the repository Actions tab. Run workflow "Build OpenCut Studio for Windows". Download the OpenCutStudio-Windows artifact from the completed run. The executable is currently a workflow artifact, not a GitHub Release.

## Limitations
This first version focuses on silence removal. AI captions, multicamera switching, AutoZoom, profanity filtering, AutoViral, and direct Premiere/Resolve timeline control are not implemented. EDL import compatibility depends on the NLE and project settings; review cuts before final use. The detector uses RMS energy and a dBFS threshold, not a learned VAD model. FFmpeg is installed separately.
