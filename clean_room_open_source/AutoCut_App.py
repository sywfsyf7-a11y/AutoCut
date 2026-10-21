"""
================================================================================
AutoCut Suite - Standalone Desktop Application
Features:
1. Multi-Part Chunking & Rate Limiter Stream Engine (Frameless Window GUI)
2. AutoCut Silences Engine (VAD Signal Processing & Timeline XML/EDL Exporter)
================================================================================
"""

import os
import sys
import math
import wave
import struct
import json
import time
import queue
import threading
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional

# ==============================================================================
# SECTION 1: AutoCut Framing, Buffer Management & UTF-8 Boundary Preservation
# ==============================================================================
END_OF_TRANSMISSION = b"***END_OF_TRANSMISSION***"
CHUNK_BODY_MAX_UTF8_BYTES = 4039
PROTOCOL_HEADER_CHAR_LENGTH = 32
CHUNK_PADDING_CHAR = "\u0080"
CHUNK_PADDING_BYTE = CHUNK_PADDING_CHAR.encode("utf-8")  # b"\xc2\x80"


class AutoCutBufferManager:
    @staticmethod
    def chunk_payload(payload_str: str, chunk_size: int = CHUNK_BODY_MAX_UTF8_BYTES) -> List[bytes]:
        raw_buffer = payload_str.encode("utf-8")
        chunks: List[bytes] = []
        i = 0
        buf_len = len(raw_buffer)

        while i < buf_len:
            end = min(i + chunk_size, buf_len)
            if end < buf_len:
                while end > i and (raw_buffer[end] & 0xC0) == 0x80:
                    end -= 1
                while end > i and ((chunk_size - (end - i)) % len(CHUNK_PADDING_BYTE)) != 0:
                    end -= 1
                    while end > i and (raw_buffer[end] & 0xC0) == 0x80:
                        end -= 1

                chunk_data = raw_buffer[i:end]
                padding_needed = chunk_size - len(chunk_data)
                if padding_needed > 0:
                    full_pads = padding_needed // len(CHUNK_PADDING_BYTE)
                    chunks.append(chunk_data + (CHUNK_PADDING_BYTE * full_pads))
                else:
                    chunks.append(chunk_data)
            else:
                chunks.append(raw_buffer[i:end])
            i = end

        return chunks

    @staticmethod
    def build_chunk_header(msg_id: str, total_parts: int, part_index: int) -> bytes:
        raw_header = f"{msg_id};{part_index:04d}/{total_parts:04d};"
        return raw_header.ljust(PROTOCOL_HEADER_CHAR_LENGTH, " ").encode("ascii")

    @staticmethod
    def frame_chunk(msg_id: str, max_chunks: int, chunk_index: int, data: bytes) -> bytes:
        header = AutoCutBufferManager.build_chunk_header(msg_id, max_chunks, chunk_index)
        padding_needed = CHUNK_BODY_MAX_UTF8_BYTES - len(data)
        pad_bytes = b""
        if padding_needed > 0:
            full_pads = padding_needed // len(CHUNK_PADDING_BYTE)
            pad_bytes = CHUNK_PADDING_BYTE * full_pads
            rem = padding_needed % len(CHUNK_PADDING_BYTE)
            if rem:
                pad_bytes += b" " * rem
        return header + data + pad_bytes + END_OF_TRANSMISSION


# ==============================================================================
# SECTION 2: VAD & Silence Cutting Core Logic
# ==============================================================================
class TimecodeEngine:
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


class SilenceEngine:
    @staticmethod
    def analyze_wav(
        wav_path: str,
        threshold_db: float = -35.0,
        min_silence_sec: float = 0.35,
        min_speech_sec: float = 0.10,
        padding_ms: float = 150.0,
        window_ms: float = 30.0
    ) -> Dict[str, Any]:
        padding_sec = padding_ms / 1000.0

        with wave.open(wav_path, "rb") as wf:
            channels = wf.getnchannels()
            sampwidth = wf.getsampwidth()
            framerate = wf.getframerate()
            total_frames = wf.getnframes()
            total_duration = total_frames / float(framerate)

            if sampwidth == 1:
                fmt_char, max_amp, offset = "B", 128.0, 128.0
            elif sampwidth == 2:
                fmt_char, max_amp, offset = "h", 32768.0, 0.0
            elif sampwidth == 4:
                fmt_char, max_amp, offset = "i", 2147483648.0, 0.0
            else:
                raise ValueError("يرجى توفير ملف 16-bit PCM WAV.")

            window_frames = max(256, int((window_ms / 1000.0) * framerate))
            timeline_windows = []
            frame_idx = 0

            while frame_idx < total_frames:
                to_read = min(window_frames, total_frames - frame_idx)
                raw_bytes = wf.readframes(to_read)
                if not raw_bytes:
                    break

                unpacked = struct.unpack_from(f"<{to_read * channels}{fmt_char}", raw_bytes)
                sum_sq = sum(((float(s) - offset) / max_amp) ** 2 for s in unpacked)
                rms = math.sqrt(sum_sq / len(unpacked)) if unpacked else 0.0
                db = 20.0 * math.log10(rms) if rms > 1e-6 else -120.0

                w_st = frame_idx / float(framerate)
                w_en = (frame_idx + to_read) / float(framerate)
                timeline_windows.append((w_st, w_en, db >= threshold_db))
                frame_idx += to_read

        # 1. Group contiguous speech
        raw_speech = []
        in_sp = False
        sp_st = 0.0
        for st, en, is_sp in timeline_windows:
            if is_sp:
                if not in_sp:
                    in_sp, sp_st = True, st
            else:
                if in_sp:
                    in_sp = False
                    raw_speech.append((sp_st, st))
        if in_sp:
            raw_speech.append((sp_st, total_duration))

        # 2. Bridge short pauses
        bridged = []
        for interval in raw_speech:
            if not bridged:
                bridged.append(interval)
            else:
                if (interval[0] - bridged[-1][1]) < min_silence_sec:
                    bridged[-1] = (bridged[-1][0], interval[1])
                else:
                    bridged.append(interval)

        # 3. Filter short noise
        filtered = [(st, en) for st, en in bridged if (en - st) >= min_speech_sec]

        # 4. Apply safety padding
        padded = []
        for st, en in filtered:
            pad_st = max(0.0, st - padding_sec)
            pad_en = min(total_duration, en + padding_sec)
            if not padded:
                padded.append((pad_st, pad_en))
            else:
                if pad_st <= padded[-1][1]:
                    padded[-1] = (padded[-1][0], max(padded[-1][1], pad_en))
                else:
                    padded.append((pad_st, pad_en))

        # 5. Extract silences
        silences = []
        cursor = 0.0
        for k_st, k_en in padded:
            if k_st > cursor:
                silences.append((cursor, k_st))
            cursor = k_en
        if cursor < total_duration:
            silences.append((cursor, total_duration))

        kept_dur = sum(en - st for st, en in padded)
        cut_dur = total_duration - kept_dur
        red_pct = (cut_dur / total_duration * 100.0) if total_duration > 0 else 0.0

        return {
            "source_file": wav_path,
            "total_duration": total_duration,
            "framerate": framerate,
            "channels": channels,
            "kept_intervals": padded,
            "silence_intervals": silences,
            "kept_duration": kept_dur,
            "cut_duration": cut_dur,
            "reduction_pct": red_pct,
            "total_cuts": len(silences),
        }

    @staticmethod
    def export_edl(analysis: Dict[str, Any], fps: float = 30.0) -> str:
        tc = TimecodeEngine(fps)
        clip_name = os.path.basename(analysis["source_file"])
        lines = [f"TITLE: {Path(clip_name).stem.upper()[:20]}_AUTOCUT", "FCM: NON-DROP FRAME", ""]
        rec_in_f, ev = 0, 1

        for src_st, src_en in analysis["kept_intervals"]:
            src_in_f = tc.seconds_to_frames(src_st)
            src_out_f = tc.seconds_to_frames(src_en)
            dur_f = src_out_f - src_in_f
            if dur_f <= 0:
                continue
            rec_out_f = rec_in_f + dur_f
            lines.append(f"{ev:03d}  AX       AA/V  C        {tc.frames_to_smpte(src_in_f)} {tc.frames_to_smpte(src_out_f)} {tc.frames_to_smpte(rec_in_f)} {tc.frames_to_smpte(rec_out_f)}")
            lines.append(f"* FROM CLIP NAME: {clip_name}\n")
            rec_in_f = rec_out_f
            ev += 1
        return "\n".join(lines)

    @staticmethod
    def export_fcp_xml(analysis: Dict[str, Any], fps: float = 30.0) -> str:
        tc = TimecodeEngine(fps)
        clip_name = os.path.basename(analysis["source_file"])
        path_url = Path(os.path.abspath(analysis["source_file"])).as_uri()
        timebase = int(round(fps))
        total_rec_frames, clip_items = 0, []

        for idx, (st, en) in enumerate(analysis["kept_intervals"], start=1):
            in_f = tc.seconds_to_frames(st)
            out_f = tc.seconds_to_frames(en)
            dur_f = out_f - in_f
            if dur_f <= 0:
                continue
            start_f, end_f = total_rec_frames, total_rec_frames + dur_f
            clip_items.append(f"""        <clipitem id="clipitem-{idx}">
          <name>{clip_name} [Part {idx}]</name>
          <duration>{dur_f}</duration>
          <rate><timebase>{timebase}</timebase><ntsc>FALSE</ntsc></rate>
          <start>{start_f}</start><end>{end_f}</end>
          <in>{in_f}</in><out>{out_f}</out>
          <file id="file-1">
            <name>{clip_name}</name><pathurl>{path_url}</pathurl>
            <rate><timebase>{timebase}</timebase><ntsc>FALSE</ntsc></rate>
            <duration>{tc.seconds_to_frames(analysis['total_duration'])}</duration>
            <media><audio><samplecharacteristics><depth>16</depth><samplerate>{analysis['framerate']}</samplerate></samplecharacteristics><channelcount>{analysis['channels']}</channelcount></audio></media>
          </file>
        </clipitem>""")
            total_rec_frames = end_f

        all_clips = "\n".join(clip_items)
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
  <sequence id="sequence-autocut-1">
    <name>{Path(clip_name).stem} (AutoCut Silence Free)</name>
    <duration>{total_rec_frames}</duration>
    <rate><timebase>{timebase}</timebase><ntsc>FALSE</ntsc></rate>
    <media>
      <video><format><samplecharacteristics><width>1920</width><height>1080</height><rate><timebase>{timebase}</timebase><ntsc>FALSE</ntsc></rate></samplecharacteristics></format></video>
      <audio><format><samplecharacteristics><depth>16</depth><samplerate>{analysis['framerate']}</samplerate></samplecharacteristics></format><track>{all_clips}<enabled>TRUE</enabled><locked>FALSE</locked></track></audio>
    </media>
  </sequence>
</xmeml>"""


# ==============================================================================
# SECTION 3: Stream Transfer Task Worker
# ==============================================================================
class StreamWorker:
    def __init__(self, file_path: str, speed_limit_kbps: float, update_queue: queue.Queue):
        self.file_path = file_path
        self.file_size = os.path.getsize(file_path)
        self.speed_limit_kbps = speed_limit_kbps
        self.update_queue = update_queue
        self.msg_id = f"m_{int(time.time()*1000)%1000000:06d}"
        self.total_chunks = max(1, math.ceil(self.file_size / CHUNK_BODY_MAX_UTF8_BYTES))
        self.is_running = False
        self.is_paused = False
        self.is_cancelled = False
        self.sent_bytes = 0
        self.sent_chunks = 0
        self.start_time = 0.0

    def run(self):
        self.is_running = True
        self.start_time = time.time()
        chunk_idx = 0
        try:
            with open(self.file_path, "rb") as f:
                while self.is_running and not self.is_cancelled:
                    while self.is_paused and not self.is_cancelled:
                        time.sleep(0.1)
                    if self.is_cancelled:
                        break

                    chunk_st = time.time()
                    raw = f.read(CHUNK_BODY_MAX_UTF8_BYTES)
                    if not raw:
                        break

                    frame = AutoCutBufferManager.frame_chunk(self.msg_id, self.total_chunks, chunk_idx, raw)
                    self.sent_bytes += len(raw)
                    self.sent_chunks += 1
                    chunk_idx += 1

                    if self.speed_limit_kbps > 0:
                        target_bps = self.speed_limit_kbps * 1024
                        exp_dur = len(frame) / target_bps
                        slp = exp_dur - (time.time() - chunk_st)
                        if slp > 0:
                            time.sleep(slp)

                    elapsed = max(0.001, time.time() - self.start_time)
                    speed_kbps = (self.sent_bytes / 1024) / elapsed
                    pct = (self.sent_chunks / self.total_chunks) * 100

                    self.update_queue.put({
                        "type": "stream_progress",
                        "progress": pct,
                        "sent_chunks": self.sent_chunks,
                        "total_chunks": self.total_chunks,
                        "sent_bytes": self.sent_bytes,
                        "total_bytes": self.file_size,
                        "speed_kbps": speed_kbps,
                        "log": f"Part {chunk_idx}/{self.total_chunks} [Frame 4096B] Sent",
                    })

            if not self.is_cancelled:
                self.update_queue.put({"type": "stream_done", "total": self.sent_chunks})
            else:
                self.update_queue.put({"type": "stream_cancelled"})
        except Exception as e:
            self.update_queue.put({"type": "error", "message": str(e)})
        finally:
            self.is_running = False


# ==============================================================================
# SECTION 4: Modern Frameless GUI Application
# ==============================================================================
class AutoCutApp(tk.Tk):
    def __init__(self):
        super().__init__()

        # Styling
        self.BG_MAIN = "#090d16"
        self.BG_PANEL = "#111827"
        self.BG_CARD = "#1f2937"
        self.ACCENT = "#3b82f6"
        self.ACCENT_HOVER = "#2563eb"
        self.SUCCESS = "#10b981"
        self.DANGER = "#ef4444"
        self.TEXT_MAIN = "#f9fafb"
        self.TEXT_MUTED = "#9ca3af"

        self.overrideredirect(True)
        self.geometry("820x680")
        self.configure(bg=self.BG_MAIN)
        self.center_window(820, 680)

        self.drag_x = 0
        self.drag_y = 0
        self.selected_file: Optional[str] = None
        self.active_stream: Optional[StreamWorker] = None
        self.update_queue = queue.Queue()

        self._build_ui()
        self._poll_queue()

    def center_window(self, width: int, height: int):
        x = (self.winfo_screenwidth() - width) // 2
        y = (self.winfo_screenheight() - height) // 2
        self.geometry(f"{width}x{height}+{x}+{y}")

    def _build_ui(self):
        # 1. Title bar
        title_bar = tk.Frame(self, bg="#0f172a", height=40)
        title_bar.pack(fill=tk.X, side=tk.TOP)
        title_bar.pack_propagate(False)

        title_lbl = tk.Label(
            title_bar,
            text="⚡ AutoCut Studio | VAD Silence Cutter & Multi-Part Stream Engine",
            bg="#0f172a",
            fg=self.TEXT_MAIN,
            font=("Segoe UI", 10, "bold")
        )
        title_lbl.pack(side=tk.LEFT, padx=14)

        for w in (title_bar, title_lbl):
            w.bind("<ButtonPress-1>", self._start_drag)
            w.bind("<B1-Motion>", self._do_drag)

        btn_close = tk.Label(title_bar, text="✕", bg="#0f172a", fg=self.TEXT_MUTED, font=("Segoe UI", 11), width=4)
        btn_close.pack(side=tk.RIGHT, fill=tk.Y)
        btn_close.bind("<Enter>", lambda e: btn_close.configure(bg=self.DANGER, fg="white"))
        btn_close.bind("<Leave>", lambda e: btn_close.configure(bg="#0f172a", fg=self.TEXT_MUTED))
        btn_close.bind("<Button-1>", lambda e: self.destroy())

        btn_min = tk.Label(title_bar, text="—", bg="#0f172a", fg=self.TEXT_MUTED, font=("Segoe UI", 10), width=4)
        btn_min.pack(side=tk.RIGHT, fill=tk.Y)
        btn_min.bind("<Enter>", lambda e: btn_min.configure(bg=self.BG_CARD, fg="white"))
        btn_min.bind("<Leave>", lambda e: btn_min.configure(bg="#0f172a", fg=self.TEXT_MUTED))
        btn_min.bind("<Button-1>", lambda e: self._minimize())

        # Main Body
        body = tk.Frame(self, bg=self.BG_MAIN, padx=18, pady=14)
        body.pack(fill=tk.BOTH, expand=True)

        # 2. File Selection Card
        file_card = tk.Frame(body, bg=self.BG_PANEL, padx=14, pady=10)
        file_card.pack(fill=tk.X, pady=(0, 8))

        tk.Label(file_card, text="📁 ملف الميديا / الصوت المحدد:", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 9)).pack(anchor="w")

        file_row = tk.Frame(file_card, bg=self.BG_PANEL)
        file_row.pack(fill=tk.X, pady=(4, 0))

        self.file_var = tk.StringVar(value="لم يتم اختيار ملف بعد (اختر ملف WAV أو أي ملف)...")
        lbl_file = tk.Label(file_row, textvariable=self.file_var, bg=self.BG_CARD, fg=self.TEXT_MAIN, font=("Consolas", 9), anchor="w", padx=10, pady=6)
        lbl_file.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))

        btn_browse = tk.Button(file_row, text="استعراض (Browse)", bg=self.ACCENT, fg="white", font=("Segoe UI", 9, "bold"), relief=tk.FLAT, padx=14, pady=4, cursor="hand2", command=self._select_file)
        btn_browse.pack(side=tk.RIGHT, padx=(0, 6))

        btn_demo = tk.Button(file_row, text="توليد تجريبي (Demo WAV)", bg=self.BG_CARD, fg=self.TEXT_MAIN, font=("Segoe UI", 9), relief=tk.FLAT, padx=10, pady=4, cursor="hand2", command=self._create_demo_file)
        btn_demo.pack(side=tk.RIGHT)

        # 3. Two-Column Functional Deck
        deck = tk.Frame(body, bg=self.BG_MAIN)
        deck.pack(fill=tk.X, pady=(0, 8))

        # Left Column: AutoCut Silences & NLE Exporter
        col_silence = tk.Frame(deck, bg=self.BG_PANEL, padx=12, pady=10)
        col_silence.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 6))

        tk.Label(col_silence, text="✂️ قص الصمت وتصدير المونتاج (AutoCut Silences)", bg=self.BG_PANEL, fg=self.SUCCESS, font=("Segoe UI", 9, "bold")).pack(anchor="w")
        
        cfg_grid = tk.Frame(col_silence, bg=self.BG_PANEL)
        cfg_grid.pack(fill=tk.X, pady=6)

        tk.Label(cfg_grid, text="عتبة الصوت (dB):", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8)).grid(row=0, column=0, sticky="w")
        self.entry_thresh = tk.Entry(cfg_grid, bg=self.BG_CARD, fg=self.TEXT_MAIN, font=("Segoe UI", 8), width=8, relief=tk.FLAT)
        self.entry_thresh.insert(0, "-35.0")
        self.entry_thresh.grid(row=0, column=1, padx=6, pady=2)

        tk.Label(cfg_grid, text="هامش الأمان (ms):", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8)).grid(row=0, column=2, sticky="w")
        self.entry_pad = tk.Entry(cfg_grid, bg=self.BG_CARD, fg=self.TEXT_MAIN, font=("Segoe UI", 8), width=8, relief=tk.FLAT)
        self.entry_pad.insert(0, "150")
        self.entry_pad.grid(row=0, column=3, padx=6, pady=2)

        tk.Label(cfg_grid, text="أدنى صمت (s):", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8)).grid(row=1, column=0, sticky="w")
        self.entry_minsil = tk.Entry(cfg_grid, bg=self.BG_CARD, fg=self.TEXT_MAIN, font=("Segoe UI", 8), width=8, relief=tk.FLAT)
        self.entry_minsil.insert(0, "0.35")
        self.entry_minsil.grid(row=1, column=1, padx=6, pady=2)

        tk.Label(cfg_grid, text="معدل الإطارات (FPS):", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8)).grid(row=1, column=2, sticky="w")
        self.entry_fps = tk.Entry(cfg_grid, bg=self.BG_CARD, fg=self.TEXT_MAIN, font=("Segoe UI", 8), width=8, relief=tk.FLAT)
        self.entry_fps.insert(0, "30.0")
        self.entry_fps.grid(row=1, column=3, padx=6, pady=2)

        btn_run_cut = tk.Button(col_silence, text="🎬 قص الصمت وتصدير XML & EDL للمونتاج", bg=self.SUCCESS, fg="white", font=("Segoe UI", 9, "bold"), relief=tk.FLAT, pady=6, cursor="hand2", command=self._run_silence_cut)
        btn_run_cut.pack(fill=tk.X, pady=(6, 0))

        # Right Column: Rate Limiter Stream Engine
        col_stream = tk.Frame(deck, bg=self.BG_PANEL, padx=12, pady=10)
        col_stream.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(6, 0))

        tk.Label(col_stream, text="⚡ محرك التدفق والتقطيع (Rate Limiter)", bg=self.BG_PANEL, fg=self.ACCENT, font=("Segoe UI", 9, "bold")).pack(anchor="w")

        stream_hdr = tk.Frame(col_stream, bg=self.BG_PANEL)
        stream_hdr.pack(fill=tk.X, pady=(4, 0))
        tk.Label(stream_hdr, text="السرعة:", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8)).pack(side=tk.LEFT)
        self.lbl_speed_val = tk.Label(stream_hdr, text="غير محدود (Unlimited)", bg=self.BG_PANEL, fg=self.ACCENT, font=("Segoe UI", 8, "bold"))
        self.lbl_speed_val.pack(side=tk.RIGHT)

        self.scale_speed = tk.Scale(col_stream, from_=0, to=10240, orient=tk.HORIZONTAL, bg=self.BG_PANEL, fg=self.TEXT_MAIN, troughcolor=self.BG_CARD, activebackground=self.ACCENT, highlightthickness=0, showvalue=False, command=self._on_speed_scale)
        self.scale_speed.set(0)
        self.scale_speed.pack(fill=tk.X, pady=4)

        presets = tk.Frame(col_stream, bg=self.BG_PANEL)
        presets.pack(fill=tk.X)
        for lbl, v in [("Unlim", 0), ("512K", 512), ("1M", 1024), ("5M", 5120)]:
            tk.Button(presets, text=lbl, bg=self.BG_CARD, fg=self.TEXT_MUTED, font=("Segoe UI", 7), relief=tk.FLAT, padx=6, pady=1, cursor="hand2", command=lambda val=v: self.scale_speed.set(val)).pack(side=tk.LEFT, padx=2)

        # 4. Metrics & Progress
        metrics_card = tk.Frame(body, bg=self.BG_PANEL, padx=14, pady=10)
        metrics_card.pack(fill=tk.X, pady=(0, 8))

        self.progress_canvas = tk.Canvas(metrics_card, height=12, bg=self.BG_CARD, highlightthickness=0)
        self.progress_canvas.pack(fill=tk.X, pady=(0, 6))
        self.progress_bar = self.progress_canvas.create_rectangle(0, 0, 0, 12, fill=self.ACCENT, width=0)

        grid = tk.Frame(metrics_card, bg=self.BG_PANEL)
        grid.pack(fill=tk.X)
        self.lbl_prog = tk.Label(grid, text="التقدم: 0.0%", bg=self.BG_PANEL, fg=self.TEXT_MAIN, font=("Segoe UI", 8, "bold"))
        self.lbl_prog.grid(row=0, column=0, sticky="w", padx=(0, 16))

        self.lbl_parts = tk.Label(grid, text="الأجزاء: 0 / 0", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8))
        self.lbl_parts.grid(row=0, column=1, sticky="w", padx=(0, 16))

        self.lbl_curr_speed = tk.Label(grid, text="السرعة اللحظية: 0 KB/s", bg=self.BG_PANEL, fg=self.SUCCESS, font=("Segoe UI", 8, "bold"))
        self.lbl_curr_speed.grid(row=0, column=2, sticky="w", padx=(0, 16))

        self.lbl_size = tk.Label(grid, text="المنقول: 0 MB / 0 MB", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8))
        self.lbl_size.grid(row=0, column=3, sticky="w")

        # 5. Live Feed Log
        feed_frame = tk.Frame(body, bg=self.BG_PANEL, padx=10, pady=6)
        feed_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 8))
        tk.Label(feed_frame, text="📡 سجل العمليات والإطارات (Stream & Cut Feed):", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8)).pack(anchor="w")

        self.log_txt = tk.Text(feed_frame, bg="#080c14", fg="#38bdf8", font=("Consolas", 8), relief=tk.FLAT, height=6)
        self.log_txt.pack(fill=tk.BOTH, expand=True, pady=(4, 0))

        # 6. Action Controls
        ctrls = tk.Frame(body, bg=self.BG_MAIN)
        ctrls.pack(fill=tk.X)

        self.btn_stream = tk.Button(ctrls, text="▶ بدء محاكاة التدفق (Stream)", bg=self.ACCENT, fg="white", font=("Segoe UI", 9, "bold"), relief=tk.FLAT, padx=14, pady=5, cursor="hand2", command=self._start_stream)
        self.btn_stream.pack(side=tk.LEFT, padx=(0, 8))

        self.btn_pause = tk.Button(ctrls, text="⏸ إيقاف مؤقت", bg=self.BG_CARD, fg=self.TEXT_MUTED, font=("Segoe UI", 9), relief=tk.FLAT, padx=12, pady=5, state=tk.DISABLED, cursor="hand2", command=self._toggle_pause)
        self.btn_pause.pack(side=tk.LEFT, padx=(0, 8))

        self.btn_cancel = tk.Button(ctrls, text="⏹ إلغاء", bg=self.BG_CARD, fg=self.DANGER, font=("Segoe UI", 9), relief=tk.FLAT, padx=12, pady=5, state=tk.DISABLED, cursor="hand2", command=self._cancel_stream)
        self.btn_cancel.pack(side=tk.LEFT)

    def _start_drag(self, e):
        self.drag_x = e.x
        self.drag_y = e.y

    def _do_drag(self, e):
        self.geometry(f"+{self.winfo_pointerx() - self.drag_x}+{self.winfo_pointery() - self.drag_y}")

    def _minimize(self):
        self.overrideredirect(False)
        self.iconify()
        self.bind("<FocusIn>", self._restore_min)

    def _restore_min(self, e):
        self.unbind("<FocusIn>")
        self.overrideredirect(True)

    def _log(self, text: str):
        self.log_txt.insert(tk.END, f"[{time.strftime('%H:%M:%S')}] {text}\n")
        self.log_txt.see(tk.END)

    def _select_file(self):
        fn = filedialog.askopenfilename(title="اختر ملف الميديا أو الصوت")
        if fn:
            self.selected_file = fn
            sz_mb = os.path.getsize(fn) / (1024 * 1024)
            self.file_var.set(f"{os.path.basename(fn)} ({sz_mb:.2f} MB)")
            self._log(f"تم اختيار الملف: {os.path.basename(fn)} ({sz_mb:.2f} MB)")

    def _create_demo_file(self):
        dest = os.path.abspath("demo_speech.wav")
        sample_rate = 16000
        frames = []
        for i in range(sample_rate * 10):
            t = i / sample_rate
            if (1.0 <= t <= 3.5) or (5.5 <= t <= 8.5):
                val = int(14000 * math.sin(2 * math.pi * 440 * t))
            else:
                val = int(60 * math.sin(2 * math.pi * 80 * t))
            frames.append(struct.pack("<h", val))

        with wave.open(dest, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            wf.writeframes(b"".join(frames))

        self.selected_file = dest
        self.file_var.set(f"demo_speech.wav (10s | 16kHz PCM WAV)")
        self._log(f"تم إنشاء وتحديد الملف التجريبي بنجاح: {dest}")

    def _on_speed_scale(self, val):
        kbps = int(val)
        if kbps == 0:
            self.lbl_speed_val.configure(text="غير محدود (Unlimited)", fg=self.ACCENT)
        elif kbps < 1024:
            self.lbl_speed_val.configure(text=f"{kbps} KB/s", fg="#38bdf8")
        else:
            self.lbl_speed_val.configure(text=f"{kbps / 1024:.2f} MB/s", fg="#38bdf8")
        if self.active_stream and self.active_stream.is_running:
            self.active_stream.speed_limit_kbps = kbps

    def _run_silence_cut(self):
        if not self.selected_file or not os.path.isfile(self.selected_file):
            messagebox.showwarning("تنبيه", "يرجى اختيار ملف WAV صالح أولاً.")
            return

        try:
            th = float(self.entry_thresh.get())
            pad = float(self.entry_pad.get())
            msil = float(self.entry_minsil.get())
            fps = float(self.entry_fps.get())
        except ValueError:
            messagebox.showerror("خطأ", "يرجى التأكد من كتابة قيم رقمية صحيحة للإعدادات.")
            return

        self._log("جاري فحص الإشارة الصوتية وكشف الصمت...")

        def task():
            try:
                analysis = SilenceEngine.analyze_wav(self.selected_file, th, msil, 0.10, pad)
                out_dir = os.path.dirname(os.path.abspath(self.selected_file))
                base = Path(self.selected_file).stem

                # Export EDL
                edl_path = os.path.join(out_dir, f"{base}_AutoCut.edl")
                with open(edl_path, "w", encoding="utf-8") as f:
                    f.write(SilenceEngine.export_edl(analysis, fps))

                # Export XML
                xml_path = os.path.join(out_dir, f"{base}_AutoCut.xml")
                with open(xml_path, "w", encoding="utf-8") as f:
                    f.write(SilenceEngine.export_fcp_xml(analysis, fps))

                # Export JSON
                json_path = os.path.join(out_dir, f"{base}_AutoCut_Report.json")
                with open(json_path, "w", encoding="utf-8") as f:
                    json.dump(analysis, f, indent=2, ensure_ascii=False)

                self.update_queue.put({
                    "type": "silence_done",
                    "analysis": analysis,
                    "edl": edl_path,
                    "xml": xml_path,
                })
            except Exception as e:
                self.update_queue.put({"type": "error", "message": str(e)})

        threading.Thread(target=task, daemon=True).start()

    def _start_stream(self):
        if not self.selected_file or not os.path.isfile(self.selected_file):
            messagebox.showwarning("تنبيه", "يرجى اختيار ملف صالح أولاً.")
            return

        speed = self.scale_speed.get()
        self.active_stream = StreamWorker(self.selected_file, speed, self.update_queue)
        self.btn_stream.configure(state=tk.DISABLED, bg=self.BG_CARD)
        self.btn_pause.configure(state=tk.NORMAL, text="⏸ إيقاف مؤقت", fg=self.TEXT_MAIN)
        self.btn_cancel.configure(state=tk.NORMAL)
        threading.Thread(target=self.active_stream.run, daemon=True).start()
        self._log(f"بدء تدفق البيانات للأجزاء [ID: {self.active_stream.msg_id}] بإجمالي {self.active_stream.total_chunks} جزء...")

    def _toggle_pause(self):
        if not self.active_stream:
            return
        if self.active_stream.is_paused:
            self.active_stream.is_paused = False
            self.btn_pause.configure(text="⏸ إيقاف مؤقت", fg=self.TEXT_MAIN)
            self._log("تم استئناف التدفق.")
        else:
            self.active_stream.is_paused = True
            self.btn_pause.configure(text="▶ استئناف", fg=self.SUCCESS)
            self._log("تم إيقاف التدفق مؤقتاً.")

    def _cancel_stream(self):
        if self.active_stream:
            self.active_stream.is_cancelled = True
            self._log("جاري إلغاء التدفق...")

    def _reset_stream_btns(self):
        self.btn_stream.configure(state=tk.NORMAL, bg=self.ACCENT)
        self.btn_pause.configure(state=tk.DISABLED, text="⏸ إيقاف مؤقت", fg=self.TEXT_MUTED)
        self.btn_cancel.configure(state=tk.DISABLED)

    def _poll_queue(self):
        while not self.update_queue.empty():
            msg = self.update_queue.get_nowait()
            mtype = msg.get("type")

            if mtype == "stream_progress":
                pct = msg["progress"]
                bw = (pct / 100.0) * self.progress_canvas.winfo_width()
                self.progress_canvas.coords(self.progress_bar, 0, 0, bw, 12)
                self.lbl_prog.configure(text=f"التقدم: {pct:.1f}%")
                self.lbl_parts.configure(text=f"الأجز Architecture: {msg['sent_chunks']}/{msg['total_chunks']}")
                spd = msg["speed_kbps"]
                self.lbl_curr_speed.configure(text=f"السرعة: {spd/1024:.2f} MB/s" if spd > 1024 else f"السرعة: {spd:.1f} KB/s")
                self.lbl_size.configure(text=f"المنقول: {msg['sent_bytes']/(1024*1024):.2f}/{msg['total_bytes']/(1024*1024):.2f} MB")
                if msg.get("log"):
                    self._log(msg["log"])

            elif mtype == "stream_done":
                self.progress_canvas.coords(self.progress_bar, 0, 0, self.progress_canvas.winfo_width(), 12)
                self.lbl_prog.configure(text="التقدم: 100.0%")
                self._log(f"🎉 اكتمل تدفق وتأطير {msg['total']} إطاراً بنجاح!")
                messagebox.showinfo("نجاح", "اكتمل تدفق وتأطير الملف بنجاح.")
                self._reset_stream_btns()

            elif mtype == "stream_cancelled":
                self._log("⚠️ تم إلغاء التدفق.")
                self._reset_stream_btns()

            elif mtype == "silence_done":
                a = msg["analysis"]
                self._log(f"✅ تم الانتهاء من قص الصمت: تقليص {a['reduction_pct']:.1f}% من الوقت ({a['cut_duration']:.2f}s محذوفة).")
                self._log(f"📁 تم تصدير XML: {os.path.basename(msg['xml'])}")
                self._log(f"📁 تم تصدير EDL: {os.path.basename(msg['edl'])}")
                messagebox.showinfo(
                    "اكتمل التصدير بنجاح",
                    f"تم تحليل الملف وقص فترات الصمت بنجاح!\n\n"
                    f"• نسبة الاختصار: {a['reduction_pct']:.1f}%\n"
                    f"• عدد عمليات القطع: {a['total_cuts']}\n"
                    f"• تم حفظ ملف XML و EDL بجوار ملف الصوت الأصلي.\n\n"
                    f"يمكنك الآن استيراده مباشرة إلى Premiere Pro أو DaVinci Resolve!"
                )

            elif mtype == "error":
                self._log(f"❌ خطأ: {msg['message']}")
                messagebox.showerror("خطأ", msg["message"])
                self._reset_stream_btns()

        self.after(50, self._poll_queue)


if __name__ == "__main__":
    app = AutoCutApp()
    app.mainloop()
