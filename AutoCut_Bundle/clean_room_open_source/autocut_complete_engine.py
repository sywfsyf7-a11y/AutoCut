#!/usr/bin/env python3
"""
================================================================================
AutoCut Unified Architecture Engine: VAD Silence Cutting, UTF-8 Safe Framing,
Buffer Streaming & NLE Timeline Exporter (EDL / FCP XML / JSON)
================================================================================
Language: Python 3 (Pure Standard Library: wave, struct, math, os, sys, json)
Zero External Dependencies (No pip install required).
================================================================================
"""

import os
import sys
import math
import wave
import struct
import json
import argparse
from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional

# ==============================================================================
# SECTION 1: AutoCut Framing, Buffer Management & UTF-8 Boundary Preservation
# (Directly replicated from AutoCut's reverse-engineered IPC framing protocol)
# ==============================================================================

END_OF_TRANSMISSION = b"***END_OF_TRANSMISSION***"
CHUNK_BODY_MAX_UTF8_BYTES = 4039
PROTOCOL_HEADER_CHAR_LENGTH = 32
# U+0080 is from C1 control set, exactly 2 bytes in UTF-8 (0xC2 0x80)
CHUNK_PADDING_CHAR = "\u0080"
CHUNK_PADDING_BYTE = CHUNK_PADDING_CHAR.encode("utf-8")  # b"\xc2\x80"


class AutoCutBufferManager:
    """
    Manages structured buffer fragmentation, UTF-8 multi-byte boundary protection,
    even-byte padding alignment, and frame reassembly.
    """

    @staticmethod
    def chunk_payload(payload_str: str, chunk_size: int = CHUNK_BODY_MAX_UTF8_BYTES) -> List[bytes]:
        """
        Splits UTF-8 string into byte chunks without severing multi-byte characters.
        Pads each chunk to a deterministic size using U+0080 (0xC2 0x80).
        """
        raw_buffer = payload_str.encode("utf-8")
        chunks: List[bytes] = []
        i = 0
        buf_len = len(raw_buffer)

        while i < buf_len:
            end = min(i + chunk_size, buf_len)

            if end < buf_len:
                # 1. Walk back if `end` lands on a UTF-8 continuation byte (10xxxxxx)
                while end > i and (raw_buffer[end] & 0xC0) == 0x80:
                    end -= 1

                # 2. CHUNK_PADDING_BYTE is 2 bytes. The padding must be evenly divisible by 2.
                # If it isn't, step back one more full character until remainder is even.
                while end > i and ((chunk_size - (end - i)) % len(CHUNK_PADDING_BYTE)) != 0:
                    end -= 1
                    while end > i and (raw_buffer[end] & 0xC0) == 0x80:
                        end -= 1

                chunk_data = raw_buffer[i:end]
                padding_needed = chunk_size - len(chunk_data)

                if padding_needed > 0:
                    full_pads = padding_needed // len(CHUNK_PADDING_BYTE)
                    pad_bytes = CHUNK_PADDING_BYTE * full_pads
                    chunks.append(chunk_data + pad_bytes)
                else:
                    chunks.append(chunk_data)
            else:
                chunks.append(raw_buffer[i:end])

            i = end

        return chunks

    @staticmethod
    def build_chunk_header(msg_id: str, total_parts: int, part_index: int) -> bytes:
        """
        Constructs standard 32-character ASCII header:
        Format: 'messageId;partNumber/totalParts;' padded to 32 characters.
        """
        part_str = f"{part_index:04d}"
        total_str = f"{total_parts:04d}"
        raw_header = f"{msg_id};{part_str}/{total_str};"
        return raw_header.ljust(PROTOCOL_HEADER_CHAR_LENGTH, " ").encode("ascii")

    @staticmethod
    def frame_message(msg_id: str, payload_str: str) -> List[bytes]:
        """Encapsulates full payload into 4096-byte protocol frames."""
        chunks = AutoCutBufferManager.chunk_payload(payload_str)
        total_parts = len(chunks)
        frames: List[bytes] = []

        for idx, chunk in enumerate(chunks):
            header = AutoCutBufferManager.build_chunk_header(msg_id, total_parts, idx)
            frame = header + chunk + END_OF_TRANSMISSION
            frames.append(frame)

        return frames

    @staticmethod
    def strip_chunk_padding(text: str) -> str:
        """Removes trailing U+0080 padding characters from reassembled parts."""
        return text.rstrip(CHUNK_PADDING_CHAR)


# ==============================================================================
# SECTION 2: SMPTE Timecode Calculator (Drop-Frame & Non-Drop Frame)
# ==============================================================================

class TimecodeEngine:
    """Calculates SMPTE timecode (HH:MM:SS:FF) and frame coordinates for NLEs."""

    def __init__(self, fps: float = 30.0):
        self.fps = fps

    def seconds_to_frames(self, seconds: float) -> int:
        return int(round(seconds * self.fps))

    def frames_to_smpte(self, frame_count: int) -> str:
        fps_base = int(round(self.fps))
        ff = frame_count % fps_base
        total_seconds = frame_count // fps_base
        ss = total_seconds % 60
        total_minutes = total_seconds // 60
        mm = total_minutes % 60
        hh = total_minutes // 60
        return f"{hh:02d}:{mm:02d}:{ss:02d}:{ff:02d}"

    def seconds_to_smpte(self, seconds: float) -> str:
        return self.frames_to_smpte(self.seconds_to_frames(seconds))


# ==============================================================================
# SECTION 3: VAD Audio Signal Processing & Safety Padding Engine
# ==============================================================================

class AutoCutSilenceEngine:
    """
    Implements Voice Activity Detection (VAD) with Windowed RMS,
    dynamic dBFS thresholding, inter-word pause bridging, and safety margins.
    """

    def __init__(
        self,
        db_threshold: float = -35.0,
        min_silence_sec: float = 0.35,
        min_speech_sec: float = 0.10,
        padding_before_ms: float = 150.0,
        padding_after_ms: float = 150.0,
        window_ms: float = 30.0,
    ):
        self.db_threshold = db_threshold
        self.min_silence_sec = min_silence_sec
        self.min_speech_sec = min_speech_sec
        self.padding_before_sec = padding_before_ms / 1000.0
        self.padding_after_sec = padding_after_ms / 1000.0
        self.window_ms = window_ms

    def analyze(self, wav_file_path: str) -> Dict[str, Any]:
        """Parses audio frames, detects active speech, and returns cut coordinates."""
        if not os.path.isfile(wav_file_path):
            raise FileNotFoundError(f"الملف غير موجود: {wav_file_path}")

        with wave.open(wav_file_path, "rb") as wf:
            channels = wf.getnchannels()
            sampwidth = wf.getsampwidth()
            framerate = wf.getframerate()
            total_frames = wf.getnframes()
            total_duration = total_frames / float(framerate)

            # Sample format resolution
            if sampwidth == 1:
                fmt_char = "B"
                max_amplitude = 128.0
                dc_offset = 128.0
            elif sampwidth == 2:
                fmt_char = "h"
                max_amplitude = 32768.0
                dc_offset = 0.0
            elif sampwidth == 4:
                fmt_char = "i"
                max_amplitude = 2147483648.0
                dc_offset = 0.0
            else:
                raise ValueError(f"صيغة العينة ({sampwidth*8}-bit) غير مدعومة. يرجى توفير 16-bit PCM WAV.")

            window_frames = int((self.window_ms / 1000.0) * framerate)
            if window_frames <= 0:
                window_frames = 512

            # 1. Slide window across entire audio stream and calculate dBFS energy
            timeline_windows: List[Tuple[float, float, bool]] = []
            frame_idx = 0

            while frame_idx < total_frames:
                to_read = min(window_frames, total_frames - frame_idx)
                raw_bytes = wf.readframes(to_read)
                if not raw_bytes:
                    break

                unpacked = struct.unpack_from(f"<{to_read * channels}{fmt_char}", raw_bytes)
                
                # Mean Square Calculation
                sum_squares = 0.0
                for s in unpacked:
                    val = (float(s) - dc_offset) / max_amplitude
                    sum_squares += val * val

                rms = math.sqrt(sum_squares / len(unpacked)) if unpacked else 0.0
                db = 20.0 * math.log10(rms) if rms > 1e-6 else -120.0

                w_start = frame_idx / float(framerate)
                w_end = (frame_idx + to_read) / float(framerate)
                timeline_windows.append((w_start, w_end, db >= self.db_threshold))
                frame_idx += to_read

        # 2. Group contiguous speech windows
        raw_speech: List[Tuple[float, float]] = []
        is_speaking = False
        speech_start = 0.0

        for w_start, w_end, is_speech in timeline_windows:
            if is_speech:
                if not is_speaking:
                    is_speaking = True
                    speech_start = w_start
            else:
                if is_speaking:
                    is_speaking = False
                    raw_speech.append((speech_start, w_start))

        if is_speaking:
            raw_speech.append((speech_start, total_duration))

        # 3. Bridge micro-silences between words (shorter than min_silence_sec)
        bridged: List[Tuple[float, float]] = []
        for interval in raw_speech:
            if not bridged:
                bridged.append(interval)
            else:
                prev_start, prev_end = bridged[-1]
                if (interval[0] - prev_end) < self.min_silence_sec:
                    bridged[-1] = (prev_start, interval[1])
                else:
                    bridged.append(interval)

        # 4. Filter transient clicks/noise (shorter than min_speech_sec)
        filtered = [(st, en) for st, en in bridged if (en - st) >= self.min_speech_sec]

        # 5. Apply safety padding (Pre-speech & Post-speech Margins) and merge overlaps
        padded: List[Tuple[float, float]] = []
        for st, en in filtered:
            pad_st = max(0.0, st - self.padding_before_sec)
            pad_en = min(total_duration, en + self.padding_after_sec)

            if not padded:
                padded.append((pad_st, pad_en))
            else:
                prev_st, prev_en = padded[-1]
                if pad_st <= prev_en:
                    padded[-1] = (prev_st, max(prev_en, pad_en))
                else:
                    padded.append((pad_st, pad_en))

        # 6. Derive cut/silence intervals (the removed spaces)
        silences: List[Tuple[float, float]] = []
        cursor = 0.0
        for k_st, k_en in padded:
            if k_st > cursor:
                silences.append((cursor, k_st))
            cursor = k_en
        if cursor < total_duration:
            silences.append((cursor, total_duration))

        kept_duration = sum(en - st for st, en in padded)
        cut_duration = total_duration - kept_duration
        reduction_pct = (cut_duration / total_duration * 100.0) if total_duration > 0 else 0.0

        return {
            "source_file": wav_file_path,
            "total_duration": total_duration,
            "framerate": framerate,
            "channels": channels,
            "kept_intervals": padded,
            "silence_intervals": silences,
            "kept_duration": kept_duration,
            "cut_duration": cut_duration,
            "reduction_pct": reduction_pct,
            "total_cuts": len(silences),
        }


# ==============================================================================
# SECTION 4: NLE Exporters (CMX 3600 EDL & Final Cut Pro 7 XML)
# ==============================================================================

class TimelineCompatibilityExporter:
    """Exports synchronized edit decision data for Premiere Pro & DaVinci Resolve."""

    @staticmethod
    def export_cmx3600_edl(analysis: Dict[str, Any], fps: float = 30.0) -> str:
        tc = TimecodeEngine(fps)
        clip_name = os.path.basename(analysis["source_file"])
        title = Path(clip_name).stem.upper().replace(" ", "_")[:20]

        lines = [
            f"TITLE: {title}_AUTOCUT",
            "FCM: NON-DROP FRAME",
            "",
        ]

        rec_in_frames = 0
        event_num = 1

        for src_st, src_en in analysis["kept_intervals"]:
            src_in_f = tc.seconds_to_frames(src_st)
            src_out_f = tc.seconds_to_frames(src_en)
            duration_f = src_out_f - src_in_f

            if duration_f <= 0:
                continue

            rec_out_f = rec_in_frames + duration_f

            src_in_tc = tc.frames_to_smpte(src_in_f)
            src_out_tc = tc.frames_to_smpte(src_out_f)
            rec_in_tc = tc.frames_to_smpte(rec_in_frames)
            rec_out_tc = tc.frames_to_smpte(rec_out_f)

            lines.append(f"{event_num:03d}  AX       AA/V  C        {src_in_tc} {src_out_tc} {rec_in_tc} {rec_out_tc}")
            lines.append(f"* FROM CLIP NAME: {clip_name}")
            lines.append("")

            rec_in_frames = rec_out_f
            event_num += 1

        return "\n".join(lines)

    @staticmethod
    def export_fcp7_xml(analysis: Dict[str, Any], fps: float = 30.0) -> str:
        tc = TimecodeEngine(fps)
        clip_name = os.path.basename(analysis["source_file"])
        abs_path = os.path.abspath(analysis["source_file"])
        path_url = Path(abs_path).as_uri()

        seq_name = f"{Path(clip_name).stem} (AutoCut Silence Free)"
        timebase = int(round(fps))

        total_rec_frames = 0
        clip_items = []

        for idx, (src_st, src_en) in enumerate(analysis["kept_intervals"], start=1):
            in_f = tc.seconds_to_frames(src_st)
            out_f = tc.seconds_to_frames(src_en)
            dur_f = out_f - in_f
            if dur_f <= 0:
                continue

            start_f = total_rec_frames
            end_f = start_f + dur_f

            item_xml = f"""        <clipitem id="clipitem-{idx}">
          <name>{clip_name} [Part {idx}]</name>
          <duration>{dur_f}</duration>
          <rate>
            <timebase>{timebase}</timebase>
            <ntsc>FALSE</ntsc>
          </rate>
          <start>{start_f}</start>
          <end>{end_f}</end>
          <in>{in_f}</in>
          <out>{out_f}</out>
          <file id="file-1">
            <name>{clip_name}</name>
            <pathurl>{path_url}</pathurl>
            <rate>
              <timebase>{timebase}</timebase>
              <ntsc>FALSE</ntsc>
            </rate>
            <duration>{tc.seconds_to_frames(analysis['total_duration'])}</duration>
            <media>
              <audio>
                <samplecharacteristics>
                  <depth>16</depth>
                  <samplerate>{analysis['framerate']}</samplerate>
                </samplecharacteristics>
                <channelcount>{analysis['channels']}</channelcount>
              </audio>
            </media>
          </file>
        </clipitem>"""
            clip_items.append(item_xml)
            total_rec_frames = end_f

        clips_body = "\n".join(clip_items)

        return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
  <sequence id="sequence-autocut-1">
    <name>{seq_name}</name>
    <duration>{total_rec_frames}</duration>
    <rate>
      <timebase>{timebase}</timebase>
      <ntsc>FALSE</ntsc>
    </rate>
    <timecode>
      <rate>
        <timebase>{timebase}</timebase>
        <ntsc>FALSE</ntsc>
      </rate>
      <string>00:00:00:00</string>
      <frame>0</frame>
      <displayformat>NDF</displayformat>
    </timecode>
    <media>
      <video>
        <format>
          <samplecharacteristics>
            <width>1920</width>
            <height>1080</height>
            <pixelaspectratio>square</pixelaspectratio>
            <rate>
              <timebase>{timebase}</timebase>
              <ntsc>FALSE</ntsc>
            </rate>
          </samplecharacteristics>
        </format>
      </video>
      <audio>
        <format>
          <samplecharacteristics>
            <depth>16</depth>
            <samplerate>{analysis['framerate']}</samplerate>
          </samplecharacteristics>
        </format>
        <track>
{clips_body}
          <enabled>TRUE</enabled>
          <locked>FALSE</locked>
        </track>
      </audio>
    </media>
  </sequence>
</xmeml>
"""


# ==============================================================================
# SECTION 5: Synthetic Test Generator (For instant zero-setup demonstration)
# ==============================================================================

def create_demo_wav(destination_path: str = "demo_speech.wav", duration_sec: int = 10) -> str:
    """Generates a standard 16kHz 16-bit PCM WAV with speech bursts and silences."""
    sample_rate = 16000
    frames = []

    for i in range(sample_rate * duration_sec):
        t = i / sample_rate
        # Speech bursts at 1.0s -> 3.5s and 5.5s -> 8.5s
        if (1.0 <= t <= 3.5) or (5.5 <= t <= 8.5):
            val = int(14000 * math.sin(2 * math.pi * 440 * t))
        else:
            val = int(60 * math.sin(2 * math.pi * 80 * t))
        frames.append(struct.pack("<h", val))

    with wave.open(destination_path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(b"".join(frames))

    return destination_path


# ==============================================================================
# SECTION 6: Execution Pipeline & CLI Controller
# ==============================================================================

def execute_pipeline(
    wav_path: str,
    threshold: float = -35.0,
    padding_ms: float = 150.0,
    min_silence: float = 0.35,
    fps: float = 30.0,
    output_dir: Optional[str] = None,
):
    print("=" * 75)
    print("🚀 محرك AutoCut الموحد (VAD Engine + Buffer Management + NLE Exporter)")
    print("=" * 75)
    print(f"• الملف الصوتي: {wav_path}")
    print(f"• عتبة النشاط الصوتي: {threshold:.1f} dBFS")
    print(f"• هامش الأمان (Safety Padding): {padding_ms:.1f} ms (قبل وبعد كل جملة)")
    print(f"• أدنى مدة صمت للقص: {min_silence:.2f} ثانية")
    print(f"• معدل الإطارات (FPS): {fps} fps")
    print("-" * 75)

    # 1. Run VAD analysis
    engine = AutoCutSilenceEngine(
        db_threshold=threshold,
        min_silence_sec=min_silence,
        padding_before_ms=padding_ms,
        padding_after_ms=padding_ms,
    )
    analysis = engine.analyze(wav_path)

    print("\n📊 ملخص المعالجة والتحليل الصوتي:")
    print(f"  - المدة الكلية: {analysis['total_duration']:.2f}s")
    print(f"  - مدة الكلام المحتفظ به: {analysis['kept_duration']:.2f}s")
    print(f"  - مدة الصمت المقتطعة: {analysis['cut_duration']:.2f}s")
    print(f"  - نسبة تقليص الوقت: {analysis['reduction_pct']:.1f}%")
    print(f"  - إجمالي عمليات القطع: {analysis['total_cuts']}")
    print(f"  - عدد المقاطع الناتجة: {len(analysis['kept_intervals'])}")

    # 2. Package analysis through AutoCut's UTF-8 Buffer Manager to demonstrate IPC framing
    serialized_json = json.dumps(analysis, ensure_ascii=False)
    ipc_frames = AutoCutBufferManager.frame_message("m_autocut_vad", serialized_json)
    print(f"\n📦 تم تأطير البيانات لنقل الـ IPC: {len(ipc_frames)} إطاراً (حجم كل إطار: 4096 بايت بدقة)")

    # 3. Export Compatibility Files
    if not output_dir:
        output_dir = os.path.dirname(os.path.abspath(wav_path)) or "."
    os.makedirs(output_dir, exist_ok=True)
    base_stem = Path(wav_path).stem

    # Export EDL
    edl_file = os.path.join(output_dir, f"{base_stem}_AutoCut.edl")
    with open(edl_file, "w", encoding="utf-8") as f:
        f.write(TimelineCompatibilityExporter.export_cmx3600_edl(analysis, fps))
    print(f"\n[+] تم تصدير ملف CMX 3600 EDL:")
    print(f"    └── {edl_file}")

    # Export FCP XML
    xml_file = os.path.join(output_dir, f"{base_stem}_AutoCut.xml")
    with open(xml_file, "w", encoding="utf-8") as f:
        f.write(TimelineCompatibilityExporter.export_fcp7_xml(analysis, fps))
    print(f"[+] تم تصدير ملف Final Cut Pro XML:")
    print(f"    └── {xml_file}")

    # Export JSON Report
    json_file = os.path.join(output_dir, f"{base_stem}_AutoCut_Report.json")
    with open(json_file, "w", encoding="utf-8") as f:
        f.write(serialized_json)
    print(f"[+] تم تصدير تقرير الإحداثيات JSON:")
    print(f"    └── {json_file}")

    print("\n" + "=" * 75)
    print("✅ جاهز للاستيراد المباشر إلى برامج المونتاج:")
    print("  • Premiere Pro: File -> Import... -> اختر ملف .xml")
    print("  • DaVinci Resolve: File -> Import -> Timeline... -> اختر ملف .xml أو .edl")
    print("=" * 75)


def main():
    parser = argparse.ArgumentParser(description="AutoCut Silences & Timeline Generator")
    parser.add_argument("--input", "-i", type=str, default=None, help="مسار ملف الصوت (WAV 16-bit PCM)")
    parser.add_argument("--threshold", "-t", type=float, default=-35.0, help="عتبة ديسيبل لاعتبار الصوت صمتاً")
    parser.add_argument("--padding", "-p", type=float, default=150.0, help="هامش الأمان بالمللي ثانية قبل وبعد الكلام")
    parser.add_argument("--min-silence", "-s", type=float, default=0.35, help="أدنى مدة صمت للقص بالثواني")
    parser.add_argument("--fps", "-f", type=float, default=30.0, help="معدل إطارات المشروع (FPS)")
    parser.add_argument("--output-dir", "-o", type=str, default=None, help="مجلد حفظ الملفات الناتجة")
    parser.add_argument("--demo", action="store_true", help="توليد ملف تجريبي وتشغيل الفحص عليه تلقائياً")

    args = parser.parse_args()

    input_file = args.input
    if args.demo or not input_file:
        existing_wavs = list(Path(".").glob("*.wav"))
        if not args.demo and existing_wavs:
            input_file = str(existing_wavs[0])
            print(f"[!] تم العثور على ملف WAV تلقائياً: {input_file}")
        else:
            print("[*] جاري توليد ملف تجريبي 'demo_speech.wav' لاختبار المنظومة فورياً...")
            input_file = create_demo_wav("demo_speech.wav", duration_sec=10)

    execute_pipeline(
        wav_path=input_file,
        threshold=args.threshold,
        padding_ms=args.padding,
        min_silence=args.min_silence,
        fps=args.fps,
        output_dir=args.output_dir,
    )


if __name__ == "__main__":
    main()
