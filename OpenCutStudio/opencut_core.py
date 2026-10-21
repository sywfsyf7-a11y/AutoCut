"""OpenCut Studio clean-room media cutting core.

This module uses a general RMS energy detector and standard edit-list formats.
It does not reuse AutoCut's proprietary app code or IPC protocol.
"""
from __future__ import annotations

import csv
import json
import math
import shutil
import subprocess
import tempfile
import wave
from pathlib import Path
from typing import Iterable, Sequence

Interval = tuple[float, float]


def find_executable(name: str) -> str | None:
    return shutil.which(name)


def run_checked(args: Sequence[str]) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if result.returncode != 0:
        message = (result.stderr or result.stdout or "External command failed.").strip()
        raise RuntimeError(message[-2500:])
    return result


def media_info(path: str | Path) -> dict:
    """Return duration and stream flags using ffprobe. Requires FFmpeg tools."""
    ffprobe = find_executable("ffprobe")
    if not ffprobe:
        raise RuntimeError("لم يتم العثور على ffprobe. ثبّت FFmpeg وأضفه إلى PATH لتحليل الفيديو أو الصوت غير WAV.")
    p = str(Path(path).resolve())
    duration_text = run_checked([
        ffprobe, "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", p,
    ]).stdout.strip()
    try:
        duration = float(duration_text)
    except ValueError as exc:
        raise RuntimeError("تعذّر قراءة مدة الملف.") from exc
    has_audio = bool(run_checked([
        ffprobe, "-v", "error", "-select_streams", "a:0", "-show_entries",
        "stream=codec_type", "-of", "csv=p=0", p,
    ]).stdout.strip())
    has_video = bool(run_checked([
        ffprobe, "-v", "error", "-select_streams", "v:0", "-show_entries",
        "stream=codec_type", "-of", "csv=p=0", p,
    ]).stdout.strip())
    return {"duration": duration, "has_audio": has_audio, "has_video": has_video}


def extract_analysis_wav(source: str | Path, destination: str | Path) -> None:
    """Extract a mono 16-kHz PCM analysis track from video or compressed audio."""
    ffmpeg = find_executable("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("تحليل الفيديو/الصوت المضغوط يحتاج FFmpeg. ثبّته وأضف مجلد bin إلى PATH.")
    run_checked([
        ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(Path(source).resolve()),
        "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(Path(destination).resolve()),
    ])


def _decode_pcm(raw: bytes, sample_width: int) -> list[float]:
    """Decode one small PCM chunk into normalized samples."""
    if sample_width == 1:
        return [(b - 128) / 128.0 for b in raw]
    if sample_width == 2:
        import array
        values = array.array("h")
        values.frombytes(raw)
        if __import__("sys").byteorder != "little":
            values.byteswap()
        return [x / 32768.0 for x in values]
    if sample_width == 3:
        result = []
        for i in range(0, len(raw) - 2, 3):
            n = raw[i] | (raw[i + 1] << 8) | (raw[i + 2] << 16)
            if n & 0x800000:
                n -= 1 << 24
            result.append(n / 8388608.0)
        return result
    if sample_width == 4:
        import array
        values = array.array("i")
        values.frombytes(raw)
        if __import__("sys").byteorder != "little":
            values.byteswap()
        return [x / 2147483648.0 for x in values]
    raise RuntimeError(f"صيغة WAV غير مدعومة: {sample_width * 8}-bit PCM.")


def detect_silence(
    wav_path: str | Path,
    threshold_db: float = -35.0,
    min_silence_sec: float = 0.30,
    min_talk_sec: float = 0.20,
    padding_before: float = 0.15,
    padding_after: float = 0.15,
    window_ms: int = 30,
) -> tuple[list[Interval], float]:
    """Return removable low-energy intervals and duration for a PCM WAV.

    Safety padding leaves a small amount of time from both edges of detected
    silence so speech consonants are less likely to be clipped.
    """
    if min_silence_sec < 0 or min_talk_sec < 0 or padding_before < 0 or padding_after < 0:
        raise ValueError("المدد وهوامش الأمان يجب أن تكون صفراً أو أكبر.")
    if not -100.0 <= threshold_db <= 0.0:
        raise ValueError("عتبة الصوت يجب أن تكون بين -100 و0 dBFS.")

    silent_flags: list[tuple[float, float, bool]] = []
    with wave.open(str(wav_path), "rb") as wav:
        channels = wav.getnchannels()
        rate = wav.getframerate()
        width = wav.getsampwidth()
        frames_total = wav.getnframes()
        duration = frames_total / rate if rate else 0.0
        window_frames = max(1, int(rate * window_ms / 1000))
        elapsed = 0
        while elapsed < frames_total:
            want = min(window_frames, frames_total - elapsed)
            raw = wav.readframes(want)
            frames_read = len(raw) // (channels * width)
            if not frames_read:
                break
            samples = _decode_pcm(raw, width)
            if not samples:
                db = -100.0
            else:
                mean_square = sum(x * x for x in samples) / len(samples)
                rms = math.sqrt(mean_square)
                db = 20.0 * math.log10(rms) if rms > 1e-7 else -100.0
            start = elapsed / rate
            elapsed += frames_read
            end = elapsed / rate
            silent_flags.append((start, end, db < threshold_db))

    # Treat tiny above-threshold blips shorter than min_talk_sec as silence.
    flags = [entry[2] for entry in silent_flags]
    i = 0
    while i < len(flags):
        j = i + 1
        while j < len(flags) and flags[j] == flags[i]:
            j += 1
        run_start = silent_flags[i][0]
        run_end = silent_flags[j - 1][1]
        if not flags[i] and run_end - run_start < min_talk_sec:
            for k in range(i, j):
                flags[k] = True
        i = j

    raw_silences: list[Interval] = []
    i = 0
    while i < len(flags):
        if not flags[i]:
            i += 1
            continue
        j = i + 1
        while j < len(flags) and flags[j]:
            j += 1
        start = silent_flags[i][0]
        end = silent_flags[j - 1][1]
        if end - start >= min_silence_sec:
            # Do not delete the small protected regions at silence boundaries.
            cut_start = max(0.0, start + padding_after)
            cut_end = min(duration, end - padding_before)
            if cut_end - cut_start >= 0.08:
                raw_silences.append((round(cut_start, 3), round(cut_end, 3)))
        i = j
    return _merge_intervals(raw_silences), duration


def _merge_intervals(intervals: Iterable[Interval]) -> list[Interval]:
    merged: list[list[float]] = []
    for start, end in sorted(intervals):
        if end <= start:
            continue
        if merged and start <= merged[-1][1] + 0.002:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return [(round(s, 3), round(e, 3)) for s, e in merged]


def keep_intervals(duration: float, cuts: Sequence[Interval]) -> list[Interval]:
    result: list[Interval] = []
    cursor = 0.0
    for start, end in _merge_intervals(cuts):
        start = max(0.0, min(duration, start))
        end = max(start, min(duration, end))
        if start > cursor + 0.03:
            result.append((round(cursor, 3), round(start, 3)))
        cursor = max(cursor, end)
    if duration > cursor + 0.03:
        result.append((round(cursor, 3), round(duration, 3)))
    return result


def seconds_to_timecode(seconds: float, fps: int = 30) -> str:
    total_frames = max(0, int(round(seconds * fps)))
    frame = total_frames % fps
    total_seconds = total_frames // fps
    sec = total_seconds % 60
    minutes = (total_seconds // 60) % 60
    hours = total_seconds // 3600
    return f"{hours:02d}:{minutes:02d}:{sec:02d}:{frame:02d}"


def export_edl(path: str | Path, source_name: str, keep: Sequence[Interval], fps: int = 30) -> None:
    """Write a basic CMX 3600-style EDL whose events keep the speech sections."""
    lines = ["TITLE: OPENCUT STUDIO", "FCM: NON-DROP FRAME", ""]
    record_cursor = 0.0
    for idx, (start, end) in enumerate(keep, 1):
        if end <= start:
            continue
        src_in = seconds_to_timecode(start, fps)
        src_out = seconds_to_timecode(end, fps)
        rec_in = seconds_to_timecode(record_cursor, fps)
        record_cursor += end - start
        rec_out = seconds_to_timecode(record_cursor, fps)
        lines.append(f"{idx:03d}  AX       V     C        {src_in} {src_out} {rec_in} {rec_out}")
        lines.append(f"* FROM CLIP NAME: {Path(source_name).name}")
        lines.append("")
    Path(path).write_text("\n".join(lines), encoding="utf-8")


def export_csv(path: str | Path, cuts: Sequence[Interval], keep: Sequence[Interval]) -> None:
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["type", "start_seconds", "end_seconds", "duration_seconds"])
        for start, end in cuts:
            writer.writerow(["remove_silence", f"{start:.3f}", f"{end:.3f}", f"{end-start:.3f}"])
        for start, end in keep:
            writer.writerow(["keep", f"{start:.3f}", f"{end:.3f}", f"{end-start:.3f}"])


def export_json(path: str | Path, source: str, duration: float, cuts: Sequence[Interval], keep: Sequence[Interval], fps: int) -> None:
    payload = {
        "application": "OpenCut Studio",
        "source": str(Path(source).resolve()),
        "duration_seconds": round(duration, 3),
        "fps": fps,
        "removed_silence": [{"start": s, "end": e, "duration": round(e - s, 3)} for s, e in cuts],
        "kept_segments": [{"start": s, "end": e, "duration": round(e - s, 3)} for s, e in keep],
    }
    Path(path).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def render_wav(source: str | Path, destination: str | Path, keep: Sequence[Interval]) -> None:
    """Join kept ranges from a PCM WAV using only Python's standard library."""
    source_path = Path(source)
    with wave.open(str(source_path), "rb") as src:
        params = src.getparams()
        channels, width, rate, frames_total = params[:4]
        if src.getcomptype() != "NONE":
            raise RuntimeError("إخراج WAV المباشر يتطلب WAV PCM غير مضغوط.")
        output_path = Path(destination)
        with wave.open(str(output_path), "wb") as out:
            out.setparams(params)
            for start, end in keep:
                start_frame = max(0, min(frames_total, int(round(start * rate))))
                end_frame = max(start_frame, min(frames_total, int(round(end * rate))))
                if end_frame <= start_frame:
                    continue
                src.setpos(start_frame)
                remaining = end_frame - start_frame
                while remaining:
                    count = min(65536, remaining)
                    data = src.readframes(count)
                    if not data:
                        break
                    out.writeframesraw(data)
                    remaining -= len(data) // (channels * width)


def render_with_ffmpeg(source: str | Path, destination: str | Path, keep: Sequence[Interval]) -> None:
    """Render retained ranges to MP4 or WAV via a local FFmpeg installation."""
    ffmpeg = find_executable("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("إخراج الفيديو أو الصوت غير WAV يتطلب FFmpeg. ثبّته وأضف مجلد bin إلى PATH.")
    info = media_info(source)
    if not info["has_audio"]:
        raise RuntimeError("الملف لا يحتوي مساراً صوتياً يمكن تحليل الصمت بناءً عليه.")
    if not keep:
        raise RuntimeError("لا توجد مقاطع صالحة للاحتفاظ بها بعد تحليل الصمت.")

    filters: list[str] = []
    concat_inputs: list[str] = []
    for i, (start, end) in enumerate(keep):
        if info["has_video"]:
            filters.append(f"[0:v:0]trim=start={start:.3f}:end={end:.3f},setpts=PTS-STARTPTS[v{i}]")
        filters.append(f"[0:a:0]atrim=start={start:.3f}:end={end:.3f},asetpts=PTS-STARTPTS[a{i}]")
        concat_inputs.append(f"{'[v'+str(i)+']' if info['has_video'] else ''}[a{i}]")
    n = len(keep)
    if info["has_video"]:
        filters.append("".join(concat_inputs) + f"concat=n={n}:v=1:a=1[vout][aout]")
    else:
        filters.append("".join(concat_inputs) + f"concat=n={n}:v=0:a=1[aout]")
    destination_path = Path(destination).resolve()
    source_path = Path(source).resolve()
    with tempfile.NamedTemporaryFile("w", suffix=".ffscript", encoding="utf-8", delete=False) as temp:
        temp.write(";\n".join(filters))
        filter_file = temp.name
    try:
        cmd = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(source_path), "-filter_complex_script", filter_file]
        if info["has_video"]:
            cmd += ["-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart"]
        else:
            cmd += ["-map", "[aout]", "-vn"]
            if destination_path.suffix.lower() == ".wav":
                cmd += ["-c:a", "pcm_s16le"]
            else:
                cmd += ["-c:a", "aac", "-b:a", "192k"]
        cmd.append(str(destination_path))
        run_checked(cmd)
    finally:
        try:
            Path(filter_file).unlink(missing_ok=True)
        except OSError:
            pass
