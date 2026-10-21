#!/usr/bin/env python3
"""
================================================================================
AutoCut Silences Engine - Autonomous Silence Detection & Timeline EDL/XML Exporter
Author: AutoCut Reverse-Engineered Simulator
License: MIT
================================================================================
Features:
- Pure Python 3 standard library implementation (Zero pip dependencies required).
- Windowed RMS (dBFS) energy calculation mimicking hardware/DSP voice activity detection.
- Millisecond-accurate safety padding (Margins) before and after speech bursts.
- Dual compatibility exports:
    1. CMX 3600 EDL (.edl) - Compatible with Adobe Premiere Pro, DaVinci Resolve, Final Cut.
    2. Final Cut Pro 7 XML (.xml) - Native multi-clip sequence import for Premiere & Resolve.
    3. JSON Report (.json) - Machine-readable cut coordinates and metrics.
================================================================================
"""

import os
import sys
import wave
import struct
import math
import json
import argparse
from pathlib import Path
from typing import List, Tuple, Dict, Any


# ==============================================================================
# 1. Timecode & Frame Utilities
# ==============================================================================
class Timecode:
    """Converts seconds and frames into SMPTE standard timecodes (HH:MM:SS:FF)."""

    def __init__(self, fps: float = 30.0):
        self.fps = fps

    def seconds_to_frames(self, seconds: float) -> int:
        return int(round(seconds * self.fps))

    def frames_to_timecode(self, total_frames: int) -> str:
        fps_int = int(round(self.fps))
        ff = total_frames % fps_int
        total_seconds = total_frames // fps_int
        ss = total_seconds % 60
        total_minutes = total_seconds // 60
        mm = total_minutes % 60
        hh = total_minutes // 60
        return f"{hh:02d}:{mm:02d}:{ss:02d}:{ff:02d}"

    def seconds_to_timecode(self, seconds: float) -> str:
        return self.frames_to_timecode(self.seconds_to_frames(seconds))


# ==============================================================================
# 2. Audio Processing & Silence Detection Engine
# ==============================================================================
class SilenceDetector:
    """
    Analyzes PCM WAV streams, calculates short-time windowed dBFS energy,
    detects voice presence, applies safety margins, and computes cut intervals.
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

    def analyze_wav(self, wav_path: str) -> Dict[str, Any]:
        """
        Processes the input WAV file and returns kept speech intervals and silence intervals.
        """
        if not os.path.isfile(wav_path):
            raise FileNotFoundError(f"الملف الصوتي غير موجود: {wav_path}")

        with wave.open(wav_path, "rb") as wf:
            channels = wf.getnchannels()
            sampwidth = wf.getsampwidth()
            framerate = wf.getframerate()
            total_frames = wf.getnframes()
            total_duration = total_frames / float(framerate)

            # Determine sample unpacking format and maximum amplitude
            if sampwidth == 1:
                # 8-bit unsigned PCM
                fmt = f"{channels}B"
                max_val = 128.0
                offset = 128.0
            elif sampwidth == 2:
                # 16-bit signed PCM (Standard)
                fmt = f"<{channels}h"
                max_val = 32768.0
                offset = 0.0
            elif sampwidth == 4:
                # 32-bit signed PCM
                fmt = f"<{channels}i"
                max_val = 2147483648.0
                offset = 0.0
            else:
                raise ValueError(f"عرض العينة غير مدعوم حالياً ({sampwidth * 8}-bit). يرجى توفير 16-bit PCM WAV.")

            window_frames = int((self.window_ms / 1000.0) * framerate)
            if window_frames <= 0:
                window_frames = 512

            bytes_per_sample_frame = channels * sampwidth
            energy_timeline: List[Tuple[float, float, bool]] = []  # (start_sec, end_sec, is_speech)

            current_frame_idx = 0
            while current_frame_idx < total_frames:
                read_count = min(window_frames, total_frames - current_frame_idx)
                raw_bytes = wf.readframes(read_count)
                if not raw_bytes:
                    break

                # Extract audio samples and compute RMS for the window
                sample_count = read_count * channels
                unpacked = struct.unpack_from(f"<{read_count * channels}" + fmt[-1], raw_bytes)
                
                # Compute mono/averaged power
                sum_sq = 0.0
                for s in unpacked:
                    val = (float(s) - offset) / max_val
                    sum_sq += val * val

                mean_sq = sum_sq / len(unpacked) if unpacked else 0.0
                rms = math.sqrt(mean_sq)

                # Convert to Decibels Relative to Full Scale (dBFS)
                if rms > 1e-6:
                    db = 20.0 * math.log10(rms)
                else:
                    db = -120.0

                w_start = current_frame_idx / float(framerate)
                w_end = (current_frame_idx + read_count) / float(framerate)
                is_speech = db >= self.db_threshold

                energy_timeline.append((w_start, w_end, is_speech))
                current_frame_idx += read_count

        # ----------------------------------------------------------------------
        # Phase 1: Group contiguous active windows into initial speech intervals
        # ----------------------------------------------------------------------
        raw_speech_intervals: List[Tuple[float, float]] = []
        in_speech = False
        speech_start = 0.0

        for w_start, w_end, is_sp in energy_timeline:
            if is_sp:
                if not in_speech:
                    in_speech = True
                    speech_start = w_start
            else:
                if in_speech:
                    in_speech = False
                    raw_speech_intervals.append((speech_start, w_start))

        if in_speech:
            raw_speech_intervals.append((speech_start, total_duration))

        # ----------------------------------------------------------------------
        # Phase 2: Bridge short pauses (less than min_silence_sec) between words
        # ----------------------------------------------------------------------
        bridged_intervals: List[Tuple[float, float]] = []
        for interval in raw_speech_intervals:
            if not bridged_intervals:
                bridged_intervals.append(interval)
            else:
                prev_start, prev_end = bridged_intervals[-1]
                gap = interval[0] - prev_end
                if gap < self.min_silence_sec:
                    # Bridge gap by merging
                    bridged_intervals[-1] = (prev_start, interval[1])
                else:
                    bridged_intervals.append(interval)

        # ----------------------------------------------------------------------
        # Phase 3: Discard noise artifacts shorter than min_speech_sec
        # ----------------------------------------------------------------------
        filtered_intervals = [
            (st, en) for st, en in bridged_intervals
            if (en - st) >= self.min_speech_sec
        ]

        # ----------------------------------------------------------------------
        # Phase 4: Apply safety padding (Pre-speech & Post-speech Margins)
        # ----------------------------------------------------------------------
        padded_intervals: List[Tuple[float, float]] = []
        for st, en in filtered_intervals:
            new_st = max(0.0, st - self.padding_before_sec)
            new_en = min(total_duration, en + self.padding_after_sec)

            if not padded_intervals:
                padded_intervals.append((new_st, new_en))
            else:
                prev_st, prev_en = padded_intervals[-1]
                # Merge if padding overlaps with previous segment
                if new_st <= prev_en:
                    padded_intervals[-1] = (prev_st, max(prev_en, new_en))
                else:
                    padded_intervals.append((new_st, new_en))

        # ----------------------------------------------------------------------
        # Phase 5: Derive silence/cut intervals (the gaps between kept segments)
        # ----------------------------------------------------------------------
        silence_intervals: List[Tuple[float, float]] = []
        cursor = 0.0
        for k_st, k_en in padded_intervals:
            if k_st > cursor:
                silence_intervals.append((cursor, k_st))
            cursor = k_en
        if cursor < total_duration:
            silence_intervals.append((cursor, total_duration))

        # Statistics
        kept_duration = sum(en - st for st, en in padded_intervals)
        cut_duration = total_duration - kept_duration
        reduction_pct = (cut_duration / total_duration * 100.0) if total_duration > 0 else 0.0

        return {
            "source_file": wav_path,
            "total_duration": total_duration,
            "framerate": framerate,
            "channels": channels,
            "kept_intervals": padded_intervals,
            "silence_intervals": silence_intervals,
            "kept_duration": kept_duration,
            "cut_duration": cut_duration,
            "reduction_pct": reduction_pct,
            "total_cuts": len(silence_intervals),
        }


# ==============================================================================
# 3. Exporter: CMX 3600 Edit Decision List (.edl)
# ==============================================================================
class EdlExporter:
    """Exports cut lists into standard CMX 3600 EDL for Premiere & DaVinci Resolve."""

    @staticmethod
    def generate(analysis: Dict[str, Any], fps: float = 30.0) -> str:
        tc = Timecode(fps)
        clip_name = os.path.basename(analysis["source_file"])
        title = Path(clip_name).stem.upper().replace(" ", "_")[:20]

        lines = [
            f"TITLE: {title}_AUTOCUT",
            "FCM: NON-DROP FRAME",
            "",
        ]

        rec_in_frames = 0
        event_num = 1

        for src_start, src_end in analysis["kept_intervals"]:
            src_in_frames = tc.seconds_to_frames(src_start)
            src_out_frames = tc.seconds_to_frames(src_end)
            clip_len_frames = src_out_frames - src_in_frames

            if clip_len_frames <= 0:
                continue

            rec_out_frames = rec_in_frames + clip_len_frames

            src_in_tc = tc.frames_to_timecode(src_in_frames)
            src_out_tc = tc.frames_to_timecode(src_out_frames)
            rec_in_tc = tc.frames_to_timecode(rec_in_frames)
            rec_out_tc = tc.frames_to_timecode(rec_out_frames)

            # CMX 3600 Event Line (Audio & Video Cut)
            # Line format: {event:03d}  {reel}  {track}  {type}  {src_in} {src_out} {rec_in} {rec_out}
            lines.append(f"{event_num:03d}  AX       AA/V  C        {src_in_tc} {src_out_tc} {rec_in_tc} {rec_out_tc}")
            lines.append(f"* FROM CLIP NAME: {clip_name}")
            lines.append("")

            rec_in_frames = rec_out_frames
            event_num += 1

        return "\n".join(lines)


# ==============================================================================
# 4. Exporter: Final Cut Pro 7 XML (.xml / xmeml)
# ==============================================================================
class FcpXmlExporter:
    """Exports native sequence XML recognized out-of-the-box by Premiere Pro & DaVinci."""

    @staticmethod
    def generate(analysis: Dict[str, Any], fps: float = 30.0) -> str:
        tc = Timecode(fps)
        clip_name = os.path.basename(analysis["source_file"])
        abs_path = os.path.abspath(analysis["source_file"])
        path_url = Path(abs_path).as_uri()

        seq_name = f"{Path(clip_name).stem} (AutoCut Silence Free)"
        timebase = int(round(fps))

        total_rec_frames = 0
        clip_items_xml = []

        item_id = 1
        for src_start, src_end in analysis["kept_intervals"]:
            in_f = tc.seconds_to_frames(src_start)
            out_f = tc.seconds_to_frames(src_end)
            duration_f = out_f - in_f
            if duration_f <= 0:
                continue

            start_f = total_rec_frames
            end_f = start_f + duration_f

            clip_xml = f"""        <clipitem id="clipitem-{item_id}">
          <name>{clip_name} [Part {item_id}]</name>
          <duration>{duration_f}</duration>
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
            clip_items_xml.append(clip_xml)
            total_rec_frames = end_f
            item_id += 1

        all_clips_str = "\n".join(clip_items_xml)

        xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
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
{all_clips_str}
          <enabled>TRUE</enabled>
          <locked>FALSE</locked>
        </track>
      </audio>
    </media>
  </sequence>
</xmeml>
"""
        return xml_content


# ==============================================================================
# 5. Main Execution Entry Point
# ==============================================================================
def run_autocut_pipeline(
    input_wav: str,
    threshold: float = -35.0,
    padding_ms: float = 150.0,
    min_silence: float = 0.35,
    fps: float = 30.0,
    output_dir: Optional[str] = None,
):
    print("=" * 70)
    print("🎬 بدء فحص وتوليد تقطيعات الصمت التلقائية (AutoCut Silences Engine)")
    print("=" * 70)
    print(f"• الملف المصدري: {input_wav}")
    print(f"• عتبة الصوت (dB Threshold): {threshold:.1f} dBFS")
    print(f"• هامش الأمان (Safety Padding): {padding_ms:.1f} ms (قبل وبعد الكلام)")
    print(f"• أدنى مدة صمت للقص: {min_silence:.2f} ثانية")
    print(f"• معدل الإطارات (FPS): {fps} fps")
    print("-" * 70)

    detector = SilenceDetector(
        db_threshold=threshold,
        min_silence_sec=min_silence,
        min_speech_sec=0.10,
        padding_before_ms=padding_ms,
        padding_after_ms=padding_ms,
    )

    analysis = detector.analyze_wav(input_wav)

    print("\n📊 نتائج الفحص والتحليل الصوتي:")
    print(f"  - المدة الكلية الأصلية: {analysis['total_duration']:.2f} ثانية")
    print(f"  - مدة الكلام المحتفظ به: {analysis['kept_duration']:.2f} ثانية")
    print(f"  - مدة الصمت المقتطعة: {analysis['cut_duration']:.2f} ثانية")
    print(f"  - نسبة الاختصار: {analysis['reduction_pct']:.1f}% من وقت المقطع")
    print(f"  - إجمالي عمليات القطع: {analysis['total_cuts']} عملية قطع")
    print(f"  - عدد المقاطع الناتجة: {len(analysis['kept_intervals'])} مقطعاً صوتياً")

    # Destination directory
    if not output_dir:
        output_dir = os.path.dirname(os.path.abspath(input_wav)) or "."
    os.makedirs(output_dir, exist_ok=True)

    base_name = Path(input_wav).stem

    # 1. Export CMX 3600 EDL
    edl_path = os.path.join(output_dir, f"{base_name}_AutoCut.edl")
    edl_content = EdlExporter.generate(analysis, fps=fps)
    with open(edl_path, "w", encoding="utf-8") as f:
        f.write(edl_content)
    print(f"\n[+] تم تصدير ملف EDL بنجاح:")
    print(f"    └── {edl_path}")

    # 2. Export FCP XML
    xml_path = os.path.join(output_dir, f"{base_name}_AutoCut.xml")
    xml_content = FcpXmlExporter.generate(analysis, fps=fps)
    with open(xml_path, "w", encoding="utf-8") as f:
        f.write(xml_content)
    print(f"[+] تم تصدير ملف FCP XML بنجاح:")
    print(f"    └── {xml_path}")

    # 3. Export JSON Details
    json_path = os.path.join(output_dir, f"{base_name}_AutoCut_Report.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    print(f"[+] تم تصدير تقرير الإحداثيات JSON بنجاح:")
    print(f"    └── {json_path}")

    print("\n" + "=" * 70)
    print("✅ اكتملت العملية بنجاح!")
    print("💡 كيفية الاستخدام داخل برامج المونتاج:")
    print("  1. في DaVinci Resolve: اذهب إلى File -> Import -> Timeline... واختر ملف .xml أو .edl.")
    print("  2. في Premiere Pro: اذهب إلى File -> Import... واختر ملف .xml.")
    print("  سيظهر خط زمني جديد مقصوص بالكامل ومطابق للأجزاء النشطة بضغطة زر واحدة!")
    print("=" * 70)

    return analysis


def main():
    parser = argparse.ArgumentParser(
        description="AutoCut Silences Simulator - كاشف الصمت الآلي ومولد ملفات التوافقية لبرامج المونتاج"
    )
    parser.add_argument(
        "--input", "-i",
        type=str,
        help="مسار ملف الصوت (WAV 16-bit PCM)",
        default=None
    )
    parser.add_argument(
        "--threshold", "-t",
        type=float,
        default=-35.0,
        help="عتبة ديسيبل لاعتبار الصوت صمتاً (الافتراضي: -35.0 dBFS)"
    )
    parser.add_argument(
        "--padding", "-p",
        type=float,
        default=150.0,
        help="هامش الأمان بالمللي ثانية قبل وبعد الكلام (الافتراضي: 150ms)"
    )
    parser.add_argument(
        "--min-silence", "-s",
        type=float,
        default=0.35,
        help="أدنى مدة صمت ليتم قصها بالثواني (الافتراضي: 0.35s)"
    )
    parser.add_argument(
        "--fps", "-f",
        type=float,
        default=30.0,
        help="معدل إطارات الخط الزمني المستهدف (الافتراضي: 30.0 fps)"
    )
    parser.add_argument(
        "--output-dir", "-o",
        type=str,
        default=None,
        help="مجلد تصدير ملفات الـ EDL والـ XML الناتجة"
    )

    args = parser.parse_args()

    # If no input provided, look for any .wav files in current directory or prompt user
    input_file = args.input
    if not input_file:
        wav_files = list(Path(".").glob("*.wav"))
        if wav_files:
            input_file = str(wav_files[0])
            print(f"[!] تم العثور تلقائياً على الملف: {input_file}")
        else:
            print("الرجاء تحديد ملف الإدخال عبر الأمر: python autocut_silences.py --input <path_to_audio.wav>")
            sys.exit(1)

    run_autocut_pipeline(
        input_wav=input_file,
        threshold=args.threshold,
        padding_ms=args.padding,
        min_silence=args.min_silence,
        fps=args.fps,
        output_dir=args.output_dir,
    )


if __name__ == "__main__":
    main()
