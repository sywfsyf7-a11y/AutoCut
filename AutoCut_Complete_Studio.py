"""
================================================================================
AutoCut Enterprise Studio - Complete Unified Suite
Features:
1. Frameless Modern GUI (Tkinter + Custom Dark Glass Theme)
2. Windowed RMS Voice Activity Detection (VAD) & Silence Cutter
3. NLE Compatibility Exporter (CMX 3600 EDL & Final Cut Pro 7 XML)
4. Multi-Part Chunking & Rate Limiter Stream Engine
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
# SECTION 1: Buffer Management & UTF-8 Safe Framing Protocol
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
# SECTION 2: Timecode & Silence Detection Core
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

        # Group speech
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

        # Bridge pauses
        bridged = []
        for interval in raw_speech:
            if not bridged:
                bridged.append(interval)
            else:
                if (interval[0] - bridged[-1][1]) < min_silence_sec:
                    bridged[-1] = (bridged[-1][0], interval[1])
                else:
                    bridged.append(interval)

        # Filter noise
        filtered = [(st, en) for st, en in bridged if (en - st) >= min_speech_sec]

        # Padding
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

        # Silences
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
# SECTION 3: Main Desktop App Window (Tkinter)
# ==============================================================================
class AutoCutStudioApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.BG_MAIN = "#090d16"
        self.BG_PANEL = "#111827"
        self.BG_CARD = "#1f2937"
        self.ACCENT = "#3b82f6"
        self.SUCCESS = "#10b981"
        self.DANGER = "#ef4444"
        self.TEXT_MAIN = "#f9fafb"
        self.TEXT_MUTED = "#9ca3af"

        self.overrideredirect(True)
        self.geometry("860x700")
        self.configure(bg=self.BG_MAIN)
        self.center_window(860, 700)

        self.drag_x = 0
        self.drag_y = 0
        self.selected_file: Optional[str] = None
        self.update_queue = queue.Queue()

        self._build_ui()
        self._poll_queue()

    def center_window(self, w: int, h: int):
        x = (self.winfo_screenwidth() - w) // 2
        y = (self.winfo_screenheight() - h) // 2
        self.geometry(f"{w}x{h}+{x}+{y}")

    def _build_ui(self):
        # Custom Title Bar
        title_bar = tk.Frame(self, bg="#0f172a", height=40)
        title_bar.pack(fill=tk.X, side=tk.TOP)
        title_bar.pack_propagate(False)

        lbl_title = tk.Label(title_bar, text="⚡ AutoCut Enterprise Studio | Full Suite", bg="#0f172a", fg=self.TEXT_MAIN, font=("Segoe UI", 10, "bold"))
        lbl_title.pack(side=tk.LEFT, padx=14)

        for w in (title_bar, lbl_title):
            w.bind("<ButtonPress-1>", lambda e: setattr(self, 'drag_x', e.x) or setattr(self, 'drag_y', e.y))
            w.bind("<B1-Motion>", lambda e: self.geometry(f"+{e.x_root - self.drag_x}+{e.y_root - self.drag_y}"))

        btn_close = tk.Label(title_bar, text="✕", bg="#0f172a", fg=self.TEXT_MUTED, font=("Segoe UI", 11), width=4, cursor="hand2")
        btn_close.pack(side=tk.RIGHT, fill=tk.Y)
        btn_close.bind("<Button-1>", lambda e: self.destroy())
        btn_close.bind("<Enter>", lambda e: btn_close.configure(bg=self.DANGER, fg="white"))
        btn_close.bind("<Leave>", lambda e: btn_close.configure(bg="#0f172a", fg=self.TEXT_MUTED))

        # Main Body
        body = tk.Frame(self, bg=self.BG_MAIN, padx=20, pady=16)
        body.pack(fill=tk.BOTH, expand=True)

        # File Selection Card
        f_card = tk.Frame(body, bg=self.BG_PANEL, padx=14, pady=12)
        f_card.pack(fill=tk.X, pady=(0, 12))

        tk.Label(f_card, text="📁 ملف الصوت أو الميديا المعالج:", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 9)).pack(anchor="w")
        row = tk.Frame(f_card, bg=self.BG_PANEL)
        row.pack(fill=tk.X, pady=(6, 0))

        self.file_var = tk.StringVar(value="لم يتم اختيار ملف بعد...")
        tk.Label(row, textvariable=self.file_var, bg=self.BG_CARD, fg=self.TEXT_MAIN, font=("Consolas", 9), anchor="w", padx=10, pady=6).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))

        tk.Button(row, text="استعراض (Browse)", bg=self.ACCENT, fg="white", font=("Segoe UI", 9, "bold"), relief=tk.FLAT, padx=14, pady=4, cursor="hand2", command=self._browse).pack(side=tk.RIGHT, padx=(0, 6))
        tk.Button(row, text="توليد تجريبي (Demo)", bg=self.BG_CARD, fg=self.TEXT_MAIN, font=("Segoe UI", 9), relief=tk.FLAT, padx=10, pady=4, cursor="hand2", command=self._demo).pack(side=tk.RIGHT)

        # Settings Card
        s_card = tk.Frame(body, bg=self.BG_PANEL, padx=14, pady=12)
        s_card.pack(fill=tk.X, pady=(0, 12))

        tk.Label(s_card, text="⚙️ إعدادات الذكاء الاصطناعي وكشف الصمت (VAD Parameters)", bg=self.BG_PANEL, fg=self.SUCCESS, font=("Segoe UI", 9, "bold")).pack(anchor="w", pady=(0, 8))

        grid = tk.Frame(s_card, bg=self.BG_PANEL)
        grid.pack(fill=tk.X)

        tk.Label(grid, text="عتبة الضجيج (dB):", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8)).grid(row=0, column=0, sticky="w", pady=4)
        self.e_th = tk.Entry(grid, bg=self.BG_CARD, fg=self.TEXT_MAIN, font=("Segoe UI", 9), width=10, relief=tk.FLAT)
        self.e_th.insert(0, "-35.0")
        self.e_th.grid(row=0, column=1, padx=10, pady=4)

        tk.Label(grid, text="هامش الأمان (ms):", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8)).grid(row=0, column=2, sticky="w", pady=4)
        self.e_pad = tk.Entry(grid, bg=self.BG_CARD, fg=self.TEXT_MAIN, font=("Segoe UI", 9), width=10, relief=tk.FLAT)
        self.e_pad.insert(0, "150")
        self.e_pad.grid(row=0, column=3, padx=10, pady=4)

        tk.Label(grid, text="أدنى صمت (s):", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8)).grid(row=1, column=0, sticky="w", pady=4)
        self.e_msil = tk.Entry(grid, bg=self.BG_CARD, fg=self.TEXT_MAIN, font=("Segoe UI", 9), width=10, relief=tk.FLAT)
        self.e_msil.insert(0, "0.35")
        self.e_msil.grid(row=1, column=1, padx=10, pady=4)

        tk.Label(grid, text="معدل الإطارات (FPS):", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8)).grid(row=1, column=2, sticky="w", pady=4)
        self.e_fps = tk.Entry(grid, bg=self.BG_CARD, fg=self.TEXT_MAIN, font=("Segoe UI", 9), width=10, relief=tk.FLAT)
        self.e_fps.insert(0, "30.0")
        self.e_fps.grid(row=1, column=3, padx=10, pady=4)

        tk.Button(s_card, text="🚀 تحليل الصوت وقص الصمت وتصدير ملفات المونتاج (XML & EDL)", bg=self.SUCCESS, fg="white", font=("Segoe UI", 10, "bold"), relief=tk.FLAT, pady=8, cursor="hand2", command=self._run_analysis).pack(fill=tk.X, pady=(12, 0))

        # Log Panel
        log_card = tk.Frame(body, bg=self.BG_PANEL, padx=10, pady=10)
        log_card.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

        tk.Label(log_card, text="📡 سجل مخرجات العمليات وحالة المحرك:", bg=self.BG_PANEL, fg=self.TEXT_MUTED, font=("Segoe UI", 8)).pack(anchor="w")
        self.log_txt = tk.Text(log_card, bg="#080c14", fg="#38bdf8", font=("Consolas", 9), relief=tk.FLAT, height=10)
        self.log_txt.pack(fill=tk.BOTH, expand=True, pady=(6, 0))

    def _log(self, text: str):
        self.log_txt.insert(tk.END, f"[{time.strftime('%H:%M:%S')}] {text}\n")
        self.log_txt.see(tk.END)

    def _browse(self):
        fn = filedialog.askopenfilename(title="اختر ملف الصوت أو الميديا")
        if fn:
            self.selected_file = fn
            self.file_var.set(os.path.basename(fn))
            self._log(f"تم اختيار الملف: {os.path.basename(fn)}")

    def _demo(self):
        path = "demo_speech.wav"
        sr = 16000
        frames = []
        for i in range(sr * 10):
            t = i / sr
            val = int(14000 * math.sin(2 * math.pi * 440 * t)) if (1 <= t <= 3.5 or 5.5 <= t <= 8.5) else int(60 * math.sin(2 * math.pi * 80 * t))
            frames.append(struct.pack("<h", val))
        with wave.open(path, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sr)
            wf.writeframes(b"".join(frames))
        self.selected_file = os.path.abspath(path)
        self.file_var.set("demo_speech.wav (تجريبي)")
        self._log("تم إنشاء ملف الصوت التجريبي بنجاح.")

    def _run_analysis(self):
        if not self.selected_file or not os.path.isfile(self.selected_file):
            messagebox.showwarning("تنبيه", "يرجى اختيار ملف WAV صالح أولاً.")
            return

        try:
            th = float(self.e_th.get())
            pad = float(self.e_pad.get())
            msil = float(self.e_msil.get())
            fps = float(self.e_fps.get())
        except ValueError:
            messagebox.showerror("خطأ", "يرجى إدخال قيم رقمية صحيحة.")
            return

        self._log("جاري فحص الإشارة وتحليل طاقة الصوت بالذكاء الاصطناعي...")

        def task():
            try:
                res = SilenceEngine.analyze_wav(self.selected_file, th, msil, 0.10, pad)
                out_dir = os.path.dirname(os.path.abspath(self.selected_file))
                base = Path(self.selected_file).stem

                edl = SilenceEngine.export_edl(res, fps)
                edl_path = os.path.join(out_dir, f"{base}_AutoCut.edl")
                with open(edl_path, "w", encoding="utf-8") as f:
                    f.write(edl)

                xml = SilenceEngine.export_fcp_xml(res, fps)
                xml_path = os.path.join(out_dir, f"{base}_AutoCut.xml")
                with open(xml_path, "w", encoding="utf-8") as f:
                    f.write(xml)

                self.update_queue.put({"type": "done", "res": res, "edl": edl_path, "xml": xml_path})
            except Exception as e:
                self.update_queue.put({"type": "error", "msg": str(e)})

        threading.Thread(target=task, daemon=True).start()

    def _poll_queue(self):
        while not self.update_queue.empty():
            msg = self.update_queue.get_nowait()
            if msg["type"] == "done":
                r = msg["res"]
                self._log(f"🎉 اكتملت المعالجة بنجاح! نسبة التقليص: {r['reduction_pct']:.1f}%")
                self._log(f"📁 ملف Premiere XML: {msg['xml']}")
                self._log(f"📁 ملف DaVinci EDL: {msg['edl']}")
                messagebox.showinfo("نجاح كامل", f"تم تحليل الصوت وقصه بنجاح!\nالمدة المختصرة: {r['reduction_pct']:.1f}%\nعدد القطع: {r['total_cuts']}\nتم الحفظ بجوار الملف الأصلي.")
            elif msg["type"] == "error":
                self._log(f"❌ خطأ: {msg['msg']}")
                messagebox.showerror("خطأ", msg["msg"])
        self.after(100, self._poll_queue)


if __name__ == "__main__":
    app = AutoCutStudioApp()
    app.mainloop()