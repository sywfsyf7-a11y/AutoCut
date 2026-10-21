from __future__ import annotations

import asyncio
import json
import os
import re
import shutil
import sys
import tempfile
import uuid
from pathlib import Path
from typing import Literal

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse, Response
import xml.etree.ElementTree as ET
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "OpenCutStudio"))
import opencut_core as core  # noqa: E402

APP_VERSION = "0.2.0"
MAX_UPLOAD_BYTES = int(os.getenv("OPENCUT_MAX_UPLOAD_MB", "2048")) * 1024 * 1024
JOB_ROOT = Path(tempfile.gettempdir()) / "opencut-studio-jobs"
JOB_ROOT.mkdir(parents=True, exist_ok=True)
JOBS: dict[str, dict] = {}

app = FastAPI(
    title="OpenCut Studio API",
    version=APP_VERSION,
    description="Independent media-editing API: silence detection, exports and optional transcription.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("OPENCUT_CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


def safe_filename(name: str | None) -> str:
    candidate = Path(name or "upload.bin").name
    candidate = re.sub(r"[^\w.() -]", "_", candidate, flags=re.UNICODE).strip(" .")
    return candidate or "upload.bin"


async def save_upload(upload: UploadFile, destination: Path) -> int:
    total = 0
    destination.parent.mkdir(parents=True, exist_ok=True)
    try:
        with destination.open("wb") as target:
            while chunk := await upload.read(1024 * 1024):
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    raise HTTPException(413, f"الملف أكبر من الحد المسموح ({MAX_UPLOAD_BYTES // (1024*1024)} MB).")
                target.write(chunk)
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        await upload.close()
    if total == 0:
        destination.unlink(missing_ok=True)
        raise HTTPException(400, "الملف المرفوع فارغ.")
    return total


class EDLRequest(BaseModel):
    source_name: str = "source.mov"
    duration: float = Field(gt=0)
    silence_intervals: list[tuple[float, float]]
    fps: int = Field(default=30, ge=1, le=120)


class FCP7XMLRequest(BaseModel):
    source_name: str = "source.mov"
    source_path: str
    duration: float = Field(gt=0)
    silence_intervals: list[tuple[float, float]]
    fps: int = Field(default=30, ge=1, le=120)
    width: int = Field(default=1920, ge=1, le=16384)
    height: int = Field(default=1080, ge=1, le=16384)


class CaptionWord(BaseModel):
    start: float = Field(ge=0)
    end: float = Field(gt=0)
    word: str
    probability: float | None = Field(default=None, ge=0, le=1)


class SRTRequest(BaseModel):
    words: list[CaptionWord]


class ProfanityRequest(BaseModel):
    words: list[CaptionWord]
    blocked_terms: list[str] = Field(default_factory=list)
    replacement: Literal["mute", "bleep"] = "mute"


class ChaptersRequest(BaseModel):
    chapters: list[dict]
    # Each chapter is {"start": seconds, "title": string}


class RenderJobStatus(BaseModel):
    job_id: str
    status: Literal["queued", "running", "completed", "failed"]
    progress: int = 0
    message: str = ""
    output_filename: str | None = None


@app.get("/health")
def health():
    return {
        "ok": True,
        "name": "OpenCut Studio API",
        "version": APP_VERSION,
        "ffmpeg": bool(core.find_executable("ffmpeg")),
        "ffprobe": bool(core.find_executable("ffprobe")),
        "whisper_available": _whisper_available(),
        "silero_vad_available": _silero_available(),
    }


def _silero_available() -> bool:
    try:
        import silero_vad  # noqa: F401
        import torch  # noqa: F401
        return True
    except ImportError:
        return False


def _whisper_available() -> bool:
    try:
        import faster_whisper  # noqa: F401
        return True
    except ImportError:
        return False


@app.post("/api/analyze/silence")
async def analyze_silence(
    file: UploadFile = File(...),
    threshold_db: float = Form(-35.0, ge=-100, le=0),
    min_silence_sec: float = Form(0.3, ge=0.05, le=20),
    min_speech_sec: float = Form(0.2, ge=0, le=10),
    padding_sec: float = Form(0.2, ge=0, le=5),
    vad_engine: Literal["rms", "silero"] = Form("rms"),
):
    with tempfile.TemporaryDirectory(prefix="opencut-analyze-") as temp:
        source = Path(temp) / safe_filename(file.filename)
        await save_upload(file, source)
        analysis_file = source
        if source.suffix.lower() != ".wav":
            if not core.find_executable("ffmpeg"):
                raise HTTPException(501, "هذا النوع من الملفات يحتاج FFmpeg على الخادم.")
            analysis_file = Path(temp) / "analysis.wav"
            try:
                await asyncio.to_thread(core.extract_analysis_wav, source, analysis_file)
            except RuntimeError as exc:
                raise HTTPException(422, str(exc)) from exc
        try:
            if vad_engine == "silero":
                cuts, duration = await asyncio.to_thread(
                    core.detect_silence_silero,
                    analysis_file,
                    min_silence_sec,
                    min_speech_sec,
                    padding_sec,
                )
            else:
                cuts, duration = await asyncio.to_thread(
                    core.detect_silence,
                    analysis_file,
                    threshold_db,
                    min_silence_sec,
                    min_speech_sec,
                    padding_sec,
                    padding_sec,
                )
        except ImportError as exc:
            raise HTTPException(501, str(exc)) from exc
        except (RuntimeError, ValueError, OSError) as exc:
            raise HTTPException(422, f"تعذّر تحليل الملف: {exc}") from exc
        keep = core.keep_intervals(duration, cuts)
        return {
            "duration_seconds": round(duration, 3),
            "parameters": {
                "threshold_db": threshold_db,
                "min_silence_sec": min_silence_sec,
                "min_speech_sec": min_speech_sec,
                "padding_sec": padding_sec,
                "vad_engine": vad_engine,
            },
            "silence_intervals": [{"start": s, "end": e, "duration": round(e-s, 3)} for s, e in cuts],
            "kept_intervals": [{"start": s, "end": e, "duration": round(e-s, 3)} for s, e in keep],
        }


@app.post("/api/export/edl", response_class=PlainTextResponse)
def export_edl(request: EDLRequest):
    cuts = []
    for start, end in request.silence_intervals:
        if start < 0 or end <= start or end > request.duration + 0.02:
            raise HTTPException(422, f"فترة زمنية غير صحيحة: {start} - {end}")
        cuts.append((start, end))
    kept = core.keep_intervals(request.duration, cuts)
    with tempfile.TemporaryDirectory(prefix="opencut-edl-") as temp:
        output = Path(temp) / "timeline.edl"
        core.export_edl(output, request.source_name, kept, request.fps)
        return PlainTextResponse(output.read_text(encoding="utf-8"), media_type="text/plain")


@app.post("/api/export/fcp7xml")
def export_fcp7xml(request: FCP7XMLRequest):
    """Create a basic FCP7 xmeml v4 sequence referencing a media file on the editor's machine."""
    cuts = []
    for start, end in request.silence_intervals:
        if start < 0 or end <= start or end > request.duration + 0.02:
            raise HTTPException(422, f"فترة زمنية غير صحيحة: {start} - {end}")
        cuts.append((start, end))
    kept = core.keep_intervals(request.duration, cuts)
    fps = request.fps
    source = Path(request.source_path).expanduser().resolve()
    try:
        path_url = source.as_uri()
    except ValueError as exc:
        raise HTTPException(422, "مسار المصدر غير صالح. استخدم مسار ملف مطلقاً على جهاز المونتاج.") from exc

    root = ET.Element("xmeml", {"version": "4"})
    sequence = ET.SubElement(root, "sequence", {"id": "sequence-opencut"})
    ET.SubElement(sequence, "name").text = "OpenCut Studio - Edited Sequence"
    total_frames = sum(max(1, round((end - start) * fps)) for start, end in kept)
    ET.SubElement(sequence, "duration").text = str(total_frames)

    def add_rate(parent):
        rate = ET.SubElement(parent, "rate")
        ET.SubElement(rate, "timebase").text = str(fps)
        ET.SubElement(rate, "ntsc").text = "FALSE"

    add_rate(sequence)
    timecode = ET.SubElement(sequence, "timecode")
    add_rate(timecode)
    ET.SubElement(timecode, "string").text = "00:00:00:00"
    ET.SubElement(timecode, "frame").text = "0"
    ET.SubElement(timecode, "displayformat").text = "NDF"
    media = ET.SubElement(sequence, "media")
    video = ET.SubElement(media, "video")
    video_format = ET.SubElement(video, "format")
    sample = ET.SubElement(video_format, "samplecharacteristics")
    ET.SubElement(sample, "width").text = str(request.width)
    ET.SubElement(sample, "height").text = str(request.height)
    add_rate(sample)
    video_track = ET.SubElement(video, "track")
    audio = ET.SubElement(media, "audio")
    audio_track = ET.SubElement(audio, "track")
    audio_format = ET.SubElement(audio, "format")
    audio_sample = ET.SubElement(audio_format, "samplecharacteristics")
    ET.SubElement(audio_sample, "depth").text = "16"
    ET.SubElement(audio_sample, "samplerate").text = "48000"

    record_frame = 0
    file_id = "file-opencut-source"
    for index, (src_start, src_end) in enumerate(kept, 1):
        src_in = max(0, round(src_start * fps))
        src_out = max(src_in + 1, round(src_end * fps))
        clip_duration = src_out - src_in
        rec_in, rec_out = record_frame, record_frame + clip_duration
        record_frame = rec_out
        for track, media_type in ((video_track, "video"), (audio_track, "audio")):
            item = ET.SubElement(track, "clipitem", {"id": f"{media_type}-clip-{index}"})
            ET.SubElement(item, "name").text = request.source_name
            ET.SubElement(item, "enabled").text = "TRUE"
            ET.SubElement(item, "duration").text = str(clip_duration)
            add_rate(item)
            ET.SubElement(item, "start").text = str(rec_in)
            ET.SubElement(item, "end").text = str(rec_out)
            ET.SubElement(item, "in").text = str(src_in)
            ET.SubElement(item, "out").text = str(src_out)
            file_node = ET.SubElement(item, "file", {"id": file_id})
            if index == 1 and media_type == "video":
                ET.SubElement(file_node, "name").text = request.source_name
                ET.SubElement(file_node, "pathurl").text = path_url
                ET.SubElement(file_node, "duration").text = str(round(request.duration * fps))
                add_rate(file_node)
                file_media = ET.SubElement(file_node, "media")
                fm_video = ET.SubElement(file_media, "video")
                fm_char = ET.SubElement(fm_video, "samplecharacteristics")
                ET.SubElement(fm_char, "width").text = str(request.width)
                ET.SubElement(fm_char, "height").text = str(request.height)
                add_rate(fm_char)
                fm_audio = ET.SubElement(file_media, "audio")
                ET.SubElement(fm_audio, "channelcount").text = "2"
                fm_audio_char = ET.SubElement(fm_audio, "samplecharacteristics")
                ET.SubElement(fm_audio_char, "depth").text = "16"
                ET.SubElement(fm_audio_char, "samplerate").text = "48000"
            if media_type == "audio":
                source_track = ET.SubElement(item, "sourcetrack")
                ET.SubElement(source_track, "mediatype").text = "audio"
                ET.SubElement(source_track, "trackindex").text = "1"
            ET.SubElement(item, "compositemode").text = "normal"
    ET.indent(root, space="  ")
    payload = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    return Response(
        content=payload,
        media_type="application/xml",
        headers={"Content-Disposition": 'attachment; filename="opencut_timeline.xml"'},
    )


def _srt_time(seconds: float) -> str:
    ms = max(0, int(round(seconds * 1000)))
    hours, rem = divmod(ms, 3_600_000)
    minutes, rem = divmod(rem, 60_000)
    secs, millis = divmod(rem, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


@app.post("/api/export/srt", response_class=PlainTextResponse)
def export_srt(request: SRTRequest):
    ordered = sorted(request.words, key=lambda w: (w.start, w.end))
    rows = []
    for index, word in enumerate(ordered, 1):
        if word.end <= word.start:
            raise HTTPException(422, "يجب أن تكون نهاية كل كلمة بعد بدايتها.")
        rows.extend([str(index), f"{_srt_time(word.start)} --> {_srt_time(word.end)}", word.word.strip(), ""])
    return PlainTextResponse("\n".join(rows), media_type="text/plain")


@app.post("/api/profanity/filter")
def filter_profanity(request: ProfanityRequest):
    blocked = {term.casefold().strip() for term in request.blocked_terms if term.strip()}
    matches = []
    for word in request.words:
        normalized = re.sub(r"[^\w]", "", word.word.casefold(), flags=re.UNICODE)
        if normalized in blocked:
            matches.append({
                "start": word.start,
                "end": word.end,
                "word": word.word,
                "action": request.replacement,
                "tone_hz": 1000 if request.replacement == "bleep" else None,
            })
    return {"matches": matches, "count": len(matches), "note": "طبّق الكتم أو نغمة الحجب على الفترات في مرحلة التصيير."}


@app.post("/api/export/chapters", response_class=PlainTextResponse)
def export_chapters(request: ChaptersRequest):
    normalized = []
    for chapter in request.chapters:
        try:
            start = float(chapter["start"])
            title = str(chapter["title"]).strip()
        except (KeyError, TypeError, ValueError) as exc:
            raise HTTPException(422, "كل فصل يحتاج start وtitle.") from exc
        if start < 0 or not title:
            raise HTTPException(422, "وقت الفصل يجب أن يكون موجباً وعنوانه غير فارغ.")
        normalized.append((start, title))
    normalized.sort()
    lines = []
    for start, title in normalized:
        total = int(start)
        lines.append(f"{total // 3600:02d}:{(total // 60) % 60:02d}:{total % 60:02d} {title}")
    return PlainTextResponse("\n".join(lines), media_type="text/plain")


def _render_job(job_id: str, source: Path, keep: list[tuple[float, float]], target: str):
    job = JOBS[job_id]
    job["status"] = "running"
    job["progress"] = 20
    try:
        output = source.parent / ("output_cut" + (".mp4" if target == "mp4" else ".wav"))
        if source.suffix.lower() == ".wav" and target == "wav":
            core.render_wav(source, output, keep)
        else:
            core.render_with_ffmpeg(source, output, keep)
        job.update({
            "status": "completed", "progress": 100, "message": "اكتمل التصيير.",
            "output": str(output), "output_filename": output.name,
        })
    except Exception as exc:
        job.update({"status": "failed", "progress": 100, "message": str(exc)})


@app.post("/api/jobs/render", response_model=RenderJobStatus)
async def create_render_job(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    kept_intervals_json: str = Form(...),
    target_format: Literal["mp4", "wav"] = Form("mp4"),
):
    try:
        keep_raw = json.loads(kept_intervals_json)
        keep = [(float(x[0]), float(x[1])) for x in keep_raw]
        if not keep or any(a < 0 or b <= a for a, b in keep):
            raise ValueError
    except (ValueError, TypeError, json.JSONDecodeError, IndexError) as exc:
        raise HTTPException(422, "kept_intervals_json يجب أن يحتوي قائمة [start, end] صالحة.") from exc
    job_id = uuid.uuid4().hex
    folder = JOB_ROOT / job_id
    source = folder / safe_filename(file.filename)
    await save_upload(file, source)
    JOBS[job_id] = {"job_id": job_id, "status": "queued", "progress": 0, "message": "في قائمة الانتظار.", "source": str(source)}
    background_tasks.add_task(_render_job, job_id, source, keep, target_format)
    return RenderJobStatus(job_id=job_id, status="queued", progress=0, message="في قائمة الانتظار.")


@app.get("/api/jobs/{job_id}", response_model=RenderJobStatus)
def job_status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "المهمة غير موجودة أو انتهت صلاحيتها.")
    return RenderJobStatus(**{key: job.get(key) for key in ("job_id", "status", "progress", "message", "output_filename")})


@app.get("/api/jobs/{job_id}/download")
def download_render(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "المهمة غير موجودة أو انتهت صلاحيتها.")
    if job["status"] != "completed" or not job.get("output"):
        raise HTTPException(409, "لم يكتمل التصيير بعد.")
    output = Path(job["output"]).resolve()
    if JOB_ROOT.resolve() not in output.parents or not output.is_file():
        raise HTTPException(404, "ملف الإخراج غير متاح.")
    return FileResponse(output, filename=job.get("output_filename", output.name), media_type="application/octet-stream")


@app.post("/api/transcribe")
async def transcribe(file: UploadFile = File(...), model_name: str = Form("small"), language: str | None = Form(None)):
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise HTTPException(501, "التفريغ غير مثبت. ثبّت faster-whisper على الخادم لتفعيل AutoCaptions.") from exc
    with tempfile.TemporaryDirectory(prefix="opencut-transcribe-") as temp:
        source = Path(temp) / safe_filename(file.filename)
        await save_upload(file, source)
        def do_transcribe():
            model = WhisperModel(model_name, device=os.getenv("WHISPER_DEVICE", "auto"), compute_type=os.getenv("WHISPER_COMPUTE_TYPE", "default"))
            segments, info = model.transcribe(str(source), language=language or None, word_timestamps=True, vad_filter=True)
            output = []
            for seg in segments:
                for word in (seg.words or []):
                    output.append({
                        "start": round(float(word.start), 3), "end": round(float(word.end), 3),
                        "word": word.word, "probability": round(float(word.probability), 4),
                    })
            return {"language": info.language, "language_probability": info.language_probability, "words": output}
        try:
            return await asyncio.to_thread(do_transcribe)
        except Exception as exc:
            raise HTTPException(500, f"فشل التفريغ: {exc}") from exc
