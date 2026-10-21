"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { Activity, AudioLines, Captions, Check, ChevronDown, Clapperboard, FileVideo, Gauge, Mic2, Scissors, Sparkles, Upload, X } from "lucide-react";

type Interval = { start: number; end: number };
const BASE = { noiseLevel: -35, minSilenceSec: 0.3, minSpeechSec: 0.2, paddingSec: 0.2, maxZoom: 1.3 };
const modules = [
  { id: "silences", name: "AutoCut Silences", desc: "كشف الوقفات الطويلة وحذفها بأمان", icon: Scissors, ready: true },
  { id: "captions", name: "AutoCaptions", desc: "تفريغ الكلام وتوقيت كل كلمة", icon: Captions, ready: false },
  { id: "zoom", name: "AutoZoom", desc: "تقريب ديناميكي حتى 1.3×", icon: Gauge, ready: false },
  { id: "profanity", name: "AutoProfanity Filter", desc: "كتم الكلمات المحددة أو استبدالها", icon: AudioLines, ready: false },
  { id: "angles", name: "AutoCut Angles", desc: "تبديل زوايا الكاميرات المتعددة", icon: Clapperboard, ready: false },
  { id: "podcast", name: "AutoCut Podcast", desc: "تحرير بودكاست متعدد المسارات", icon: Mic2, ready: false },
  { id: "chapters", name: "AutoChapters", desc: "علامات فصول قابلة للتصدير ليوتيوب", icon: Activity, ready: false },
  { id: "repeat", name: "AutoCut Repeat", desc: "تمييز الإعادات والجمل المكررة", icon: AudioLines, ready: false },
  { id: "broll", name: "AutoB-Rolls", desc: "تنظيم لقطات B-roll فوق الفيديو", icon: FileVideo, ready: false },
  { id: "viral", name: "AutoViral", desc: "اختيار لحظات مناسبة للفيديوهات القصيرة", icon: Sparkles, ready: false },
] as const;

function saveFile(name: string, content: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function tc(seconds: number, fps = 30) {
  const total = Math.max(0, Math.round(seconds * fps));
  const frame = total % fps, s = Math.floor(total / fps);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60, frame].map(v => String(v).padStart(2, "0")).join(":");
}

export default function Home() {
  const [active, setActive] = useState("silences");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [cuts, setCuts] = useState<Interval[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("ارفع ملف صوتي لتحليل الصمت. المعالجة داخل المتصفح لا ترفع الملف إلى أي خادم.");
  const [params, setParams] = useState(BASE);
  const [vadEngine, setVadEngine] = useState<"rms" | "silero">("rms");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const current = modules.find(m => m.id === active) ?? modules[0];
  const kept = useMemo(() => {
    const result: Interval[] = []; let cursor = 0;
    for (const cut of cuts) { if (cut.start > cursor + 0.025) result.push({ start: cursor, end: cut.start }); cursor = Math.max(cursor, cut.end); }
    if (cursor < duration - 0.025) result.push({ start: cursor, end: duration });
    return result;
  }, [cuts, duration]);
  const removedSeconds = cuts.reduce((sum, c) => sum + c.end - c.start, 0);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(canvas.clientWidth, 260), height = 148;
    canvas.width = Math.floor(width * ratio); canvas.height = Math.floor(height * ratio);
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.scale(ratio, ratio); ctx.fillStyle = "#10141d"; ctx.fillRect(0, 0, width, height);
    if (!peaks.length) {
      ctx.fillStyle = "#8290a4"; ctx.font = "12px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("ارفع ملفاً صوتياً حتى يظهر شكل الموجة", width / 2, height / 2); return;
    }
    const barW = width / peaks.length;
    peaks.forEach((v, index) => {
      const t = duration * index / peaks.length;
      const silent = cuts.some(c => t >= c.start && t <= c.end);
      ctx.fillStyle = silent ? "#ed6872" : "#43d2ae";
      const h = Math.max(2, Math.min(height - 24, v * (height - 24)));
      ctx.fillRect(index * barW, (height - h) / 2, Math.max(1, barW - 1), h);
    });
    ctx.strokeStyle = "#fac0b1"; ctx.setLineDash([4, 4]);
    cuts.forEach(c => [c.start, c.end].forEach(t => {
      const x = duration ? t / duration * width : 0;
      ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x, height - 8); ctx.stroke();
    }));
    ctx.setLineDash([]);
  }, [peaks, cuts, duration]);

  async function loadFile(f: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f); setPreviewUrl(URL.createObjectURL(f)); setCuts([]); setPeaks([]); setDuration(0); setNotice("جاري تحميل الملف وتحليل شكل الموجة…");
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new AC();
      const buffer = await context.decodeAudioData(await f.arrayBuffer());
      const channel = buffer.getChannelData(0);
      const targetBars = 1300, step = Math.max(1, Math.floor(channel.length / targetBars));
      const generated: number[] = [];
      for (let i = 0; i < channel.length; i += step) {
        const end = Math.min(channel.length, i + step); let power = 0;
        for (let j = i; j < end; j++) power += channel[j] * channel[j];
        generated.push(Math.sqrt(power / Math.max(1, end - i)));
      }
      setPeaks(generated); setDuration(buffer.duration);
      setNotice("تمت قراءة الملف. اضغط تحليل الصمت ثم راجع الفترات المرشحة قبل التصدير.");
      await context.close();
    } catch {
      setNotice("تعذّر فك الصوت داخل المتصفح. جرّب WAV أو استخدم خدمة الخلفية مع FFmpeg لدعم صيغ فيديو وصوت إضافية.");
    }
  }
  function onFile(e: ChangeEvent<HTMLInputElement>) { const f = e.target.files?.[0]; if (f) void loadFile(f); }
  function onDrop(e: DragEvent<HTMLLabelElement>) { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void loadFile(f); }
  function updateParam(key: keyof typeof BASE, value: number) { setParams(p => ({ ...p, [key]: value })); }

  async function analyze() {
    if (!file) { setNotice("حمّل ملفاً أولاً."); return; }
    setBusy(true);
    try {
      const configuredApi = process.env.NEXT_PUBLIC_OPENCUT_API_URL?.trim();
      const apiBase = configuredApi?.endsWith("/") ? configuredApi.slice(0, -1) : configuredApi;
      if (apiBase) {
        const form = new FormData();
        form.append("file", file);
        form.append("threshold_db", String(params.noiseLevel));
        form.append("min_silence_sec", String(params.minSilenceSec));
        form.append("min_speech_sec", String(params.minSpeechSec));
        form.append("padding_sec", String(params.paddingSec));
        form.append("vad_engine", vadEngine);
        const response = await fetch(apiBase + "/api/analyze/silence", { method: "POST", body: form });
        if (!response.ok) throw new Error((await response.text()).slice(0, 500));
        const data = await response.json();
        setCuts((data.silence_intervals ?? []).map((x: { start: number; end: number }) => ({ start: Number(x.start), end: Number(x.end) })));
        if (typeof data.duration_seconds === "number") setDuration(data.duration_seconds);
        setNotice("اكتمل التحليل عبر خدمة FastAPI الخلفية. راجع الفواصل قبل التصدير.");
        return;
      }
      if (vadEngine === "silero") {
        setNotice("Silero-VAD يحتاج الاتصال بخدمة FastAPI وتثبيت torch وsilero-vad على الخادم.");
        return;
      }
      if (!peaks.length || !duration) {
        setNotice("المتصفح لم يستطع فك الصوت. للملفات المضغوطة أو الفيديو، اضبط NEXT_PUBLIC_OPENCUT_API_URL لتفعيل FastAPI + FFmpeg.");
        return;
      }
      await new Promise(resolve => window.setTimeout(resolve, 20));
      const binSec = 0.03, bins = Math.ceil(duration / binSec), flags: boolean[] = [];
      for (let i = 0; i < bins; i++) {
        const start = Math.floor(i / bins * peaks.length);
        const end = Math.min(peaks.length, Math.max(start + 1, Math.floor((i + 1) / bins * peaks.length)));
        let power = 0;
        for (let k = start; k < end; k++) power += peaks[k] * peaks[k];
        const rms = Math.sqrt(power / Math.max(1, end - start));
        const db = rms > 1e-7 ? 20 * Math.log10(rms) : -100;
        flags.push(db < params.noiseLevel);
      }
      // Suppress short false gaps in speech, then merge adjacent quiet windows.
      for (let i = 0; i < flags.length;) {
        let j = i + 1; while (j < flags.length && flags[j] === flags[i]) j++;
        if (!flags[i] && (j - i) * binSec < params.minSpeechSec) for (let k = i; k < j; k++) flags[k] = true;
        i = j;
      }
      const found: Interval[] = [];
      for (let i = 0; i < flags.length;) {
        if (!flags[i]) { i++; continue; }
        let j = i + 1; while (j < flags.length && flags[j]) j++;
        const start = i * binSec, end = Math.min(duration, j * binSec);
        if (end - start >= params.minSilenceSec) {
          const cutStart = Math.max(0, start + params.paddingSec), cutEnd = Math.min(duration, end - params.paddingSec);
          if (cutEnd - cutStart >= 0.08) found.push({ start: cutStart, end: cutEnd });
        }
        i = j;
      }
      setCuts(found);
      const removed = found.reduce((sum, c) => sum + c.end - c.start, 0);
      setNotice(`اكتمل التحليل المحلي: ${found.length} فترات صمت، ومدة مرشحة للحذف ${removed.toFixed(2)} ثانية.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setNotice("تعذّر التحليل: " + message);
    } finally {
      setBusy(false);
    }
  }
  function exportEDL() {
    if (!duration) return;
    const lines = ["TITLE: OPENCUT STUDIO", "FCM: NON-DROP FRAME", ""];
    let recordCursor = 0;
    kept.forEach((seg, index) => {
      const recordEnd = recordCursor + seg.end - seg.start;
      lines.push(`${String(index + 1).padStart(3, "0")}  AX       V     C        ${tc(seg.start)} ${tc(seg.end)} ${tc(recordCursor)} ${tc(recordEnd)}`);
      lines.push(`* FROM CLIP NAME: ${file?.name || "SOURCE"}`, "");
      recordCursor = recordEnd;
    });
    saveFile("opencut_timeline.edl", lines.join("\n"));
  }
  function exportReports() {
    const report = { source: file?.name, durationSeconds: duration, parameters: params, silenceIntervals: cuts, keptIntervals: kept };
    saveFile("opencut_report.json", JSON.stringify(report, null, 2), "application/json");
    const csv = ["type,start_seconds,end_seconds,duration_seconds",
      ...cuts.map(c => `remove,${c.start.toFixed(3)},${c.end.toFixed(3)},${(c.end - c.start).toFixed(3)}`),
      ...kept.map(c => `keep,${c.start.toFixed(3)},${c.end.toFixed(3)},${(c.end - c.start).toFixed(3)}`)].join("\n");
    saveFile("opencut_segments.csv", csv, "text/csv;charset=utf-8");
  }
  function setActiveTool(id: string) {
    setActive(id);
    const tool = modules.find(m => m.id === id);
    if (tool && !tool.ready) setNotice(`${tool.name}: موجودة في خارطة الطريق، ولم تكتمل وظيفتها بعد في هذه النسخة.`);
  }

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">O</span><div><strong>OpenCut Studio</strong><small>INDEPENDENT EDITING SUITE</small></div></div>
      <button className="nav-current" onClick={() => setActiveTool("silences")}>⌘ <span>مساحة العمل</span></button>
      <div className="side-label">أدوات الاستوديو</div>
      {modules.map((tool) => { const Icon = tool.icon; return <button key={tool.id} className={active === tool.id ? "tool-nav selected" : "tool-nav"} onClick={() => setActiveTool(tool.id)}>
        <Icon size={15} /><span>{tool.name}</span><i className={tool.ready ? "dot ready" : "dot"} />
      </button>; })}
      <div className="side-bottom"><span className="local-chip">● معالجة محلية</span><small>مستودع مستقل مفتوح التطوير</small></div>
    </aside>
    <section className="main-area">
      <header className="topbar"><div><span className="crumb">استوديو التحرير</span><span className="slash">/</span><strong>{current.name}</strong></div><div className="top-actions"><span className="pill">نسخة تطوير</span><div className="avatar">O</div></div></header>
      <div className="content">
        <section className="hero"><div><p className="eyebrow">SMART EDITING WORKSPACE</p><h1>المونتاج المتكرر؟<br/><em>خلّيه على الأداة.</em></h1><p className="hero-sub">حلّل الصوت، راجع مناطق الصمت، وجهّز قائمة قص قابلة للتصدير إلى برنامج المونتاج.</p></div>
          <div className="hero-art"><div className="orb orb-a"/><div className="orb orb-b"/><div className="hero-wave">{Array.from({length:38},(_,i)=><span key={i} style={{height:`${15+Math.abs(Math.sin(i*1.7))*67}%`}}/>)}</div><span className="hero-tag">RMS · AUDIO · TIMELINE</span></div>
        </section>
        <div className="section-head"><div><h2>مساحة العمل</h2><p>ارفع الملف واضبط الإعدادات ثم راجع نقاط القص قبل التصدير.</p></div><span className="step-pill">01 / تحليل الصوت</span></div>
        <label className="dropzone" onDragOver={e => e.preventDefault()} onDrop={onDrop}>
          <input type="file" accept="audio/*,video/*,.wav,.mp4,.mov,.mkv" onChange={onFile}/>
          <span className="upload-icon"><Upload size={17}/></span><strong>{file ? file.name : "اسحب الملف إلى هنا أو اضغط للاختيار"}</strong>
          <small>WAV / MP3 / MP4 / MOV — بعض الصيغ تحتاج خدمة معالجة خلفية مع FFmpeg</small>
        </label>
        {previewUrl && file?.type.startsWith("video/") && <video className="video-preview" src={previewUrl} controls/>}
        <section className="wave-card"><div className="card-title"><div><h3>شكل الموجة الصوتية</h3><p>{duration ? `${duration.toFixed(2)} ثانية · ${cuts.length} فترة صمت مرشحة` : "لم يتم تحليل ملف بعد"}</p></div><div className="legend"><span><i className="green"/> كلام</span><span><i className="red"/> صمت مرشح</span></div></div>
          <canvas ref={canvasRef} className="wave-canvas"/><div className="wave-foot"><span>00:00</span><span>{duration ? `${String(Math.floor(duration/60)).padStart(2,"0")}:${String(Math.floor(duration%60)).padStart(2,"0")}` : "00:00"}</span></div>
        </section>
        <div className="work-grid">
          <section className="settings-card"><div className="card-title"><div><h3>إعدادات كشف الصمت</h3><p>تقدر تعدلها حسب طبيعة التسجيل.</p></div><span className="gear">⚙</span></div>
            <div className="param"><div><label>Noise level / عتبة الصوت</label><b>{params.noiseLevel} dB</b></div><input type="range" min="-60" max="-10" step="1" value={params.noiseLevel} onChange={e=>updateParam("noiseLevel",Number(e.target.value))}/></div>
            <div className="param"><div><label>Min silence / أقل صمت</label><b>{params.minSilenceSec.toFixed(2)} s</b></div><input type="range" min=".1" max="1.5" step=".05" value={params.minSilenceSec} onChange={e=>updateParam("minSilenceSec",Number(e.target.value))}/></div>
            <div className="param"><div><label>Min speech / أقل كلام</label><b>{params.minSpeechSec.toFixed(2)} s</b></div><input type="range" min=".05" max="1" step=".05" value={params.minSpeechSec} onChange={e=>updateParam("minSpeechSec",Number(e.target.value))}/></div>
            <div className="param"><div><label>Safety padding / هامش الأمان</label><b>{params.paddingSec.toFixed(2)} s</b></div><input type="range" min="0" max=".5" step=".01" value={params.paddingSec} onChange={e=>updateParam("paddingSec",Number(e.target.value))}/></div>
            <div className="param vad-param"><div><label>محرك اكتشاف الكلام</label><select className="vad-select" value={vadEngine} onChange={e => setVadEngine(e.target.value as "rms" | "silero")}><option value="rms">RMS — يعمل محليًا</option><option value="silero">Silero-VAD — يحتاج API</option></select></div></div>
            <button className="primary full" disabled={busy} onClick={analyze}>{busy ? "جارٍ التحليل…" : "✦ تحليل واكتشاف الصمت"}</button>
          </section>
          <section className="results-card"><div className="card-title"><div><h3>ملخص القصّ</h3><p>راجع النتيجة قبل استيرادها في NLE.</p></div><span className="ready-tag">PREVIEW</span></div>
            <div className="metric-grid"><div className="metric"><small>مدة المصدر</small><strong>{duration.toFixed(1)}<i>ث</i></strong></div><div className="metric"><small>فترات الصمت</small><strong>{cuts.length}</strong></div><div className="metric"><small>مرشحة للحذف</small><strong>{removedSeconds.toFixed(1)}<i>ث</i></strong></div></div>
            <div className="cut-list">{cuts.length ? cuts.slice(0,7).map((c,i)=><div className="cut-row" key={i}><span className="cut-num">{String(i+1).padStart(2,"0")}</span><span>{c.start.toFixed(2)}s — {c.end.toFixed(2)}s</span><b>{(c.end-c.start).toFixed(2)}s</b></div>) : <div className="empty-state">ستظهر فترات الصمت هنا بعد التحليل.</div>}</div>
            <div className="export-row"><button className="secondary" onClick={exportEDL} disabled={!duration}>تصدير EDL ↗</button><button className="secondary" onClick={exportReports} disabled={!duration}>CSV + JSON ↗</button></div>
          </section>
        </div>
        <div className="notice"><span>ⓘ</span><p>{notice} كشف الصمت الحالي تجريبي باستخدام RMS في المتصفح؛ قم بمراجعة الفواصل يدوياً قبل التسليم النهائي.</p></div>
        <section className="section-head tool-section"><div><h2>أدوات التحرير العشر</h2><p>تظهر حالة التنفيذ بوضوح حتى لا تُعرض الميزات المخططة على أنها مكتملة.</p></div><span className="step-pill">10 MODULES</span></section>
        <div className="tool-grid">{modules.map(tool => { const Icon=tool.icon; return <button key={tool.id} className={active===tool.id?"tool-card active":"tool-card"} onClick={()=>setActiveTool(tool.id)}>
          <div className="tool-card-top"><span className="tool-big-icon"><Icon size={16}/></span><span className={tool.ready?"status ready-status":"status"}>{tool.ready?"جاهزة":"قيد التطوير"}</span></div><h3>{tool.name}</h3><p>{tool.desc}</p><span className="tool-open">{tool.ready?"فتح الأداة":"عرض الوحدة"} ↗</span>
        </button>; })}</div>
        <footer>OpenCut Studio · بديل مستقل · لا يستخدم شيفرة AutoCut التجارية الأصلية.</footer>
      </div>
    </section>
  </main>;
}
