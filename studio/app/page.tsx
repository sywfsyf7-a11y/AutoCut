"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AudioLines, Captions, ChevronLeft, ChevronRight, Clapperboard,
  FileVideo, Gauge, Mic2, Scissors, Settings2, Sparkles, Upload, Waves, X,
  Play, Clock3, Layers3, ArrowDownToLine, PanelLeftClose, Volume2
} from "lucide-react";

type Interval = { start: number; end: number };
type VisualKind = "wave" | "captions" | "zoom" | "profanity" | "angles" | "podcast" | "chapters" | "repeat" | "broll" | "viral";
type StudioTool = {
  id: string; name: string; description: string; icon: typeof Scissors;
  visual: VisualKind; available: boolean; tag?: string;
};
const TOOLS: StudioTool[] = [
  { id: "silences", name: "AutoCut Silences", description: "Remove pauses and dead air from your timeline.", icon: Scissors, visual: "wave", available: true, tag: "AVAILABLE" },
  { id: "podcast", name: "AutoCut Podcast", description: "Build a first cut from a multi-camera podcast.", icon: Mic2, visual: "podcast", available: false },
  { id: "captions", name: "AutoCaptions", description: "Create word-timed captions with animated highlights.", icon: Captions, visual: "captions", available: false },
  { id: "zoom", name: "AutoZoom", description: "Add natural, dynamic zooms to talking-head edits.", icon: Gauge, visual: "zoom", available: false },
  { id: "repeat", name: "AutoCut Repeat", description: "Find repeated takes and keep the strongest version.", icon: AudioLines, visual: "repeat", available: false },
  { id: "profanity", name: "AutoProfanity Filter", description: "Locate words to mute or censor in the edit.", icon: Volume2, visual: "profanity", available: false },
  { id: "angles", name: "AutoCut Angles", description: "Switch between camera angles using speaker activity.", icon: Clapperboard, visual: "angles", available: false, tag: "BETA" },
  { id: "broll", name: "AutoB-Rolls", description: "Layer supporting footage over your main sequence.", icon: Layers3, visual: "broll", available: false, tag: "BETA" },
  { id: "chapters", name: "AutoChapters", description: "Turn a long video into timestamped chapters.", icon: Clock3, visual: "chapters", available: false },
  { id: "viral", name: "AutoViral", description: "Pick moments worth shaping into short-form clips.", icon: Sparkles, visual: "viral", available: false },
];

const DEFAULTS = { threshold: -35, minSilence: 0.3, minSpeech: 0.2, padding: 0.2 };
const WAVE = [14, 25, 18, 42, 31, 58, 24, 35, 66, 44, 21, 53, 73, 36, 20, 45, 63, 31, 50, 22, 38, 70, 43, 29, 57, 34, 18, 62, 45, 28, 52, 21, 39, 67, 30, 48, 19, 42, 58, 25, 36, 61, 32, 49];

function downloadFile(name: string, content: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function timecode(seconds: number, fps = 30) {
  const total = Math.max(0, Math.round(seconds * fps));
  const frame = total % fps; const s = Math.floor(total / fps);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60, frame].map(v => String(v).padStart(2, "0")).join(":");
}
function timestamp(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

function MiniScene({ kind }: { kind: VisualKind }) {
  if (kind === "wave") return <div className="scene scene-wave"><div className="scene-head"><span/><span/><span/></div><div className="scene-waveform">{WAVE.map((h,i)=><i key={i} className={i>12&&i<19?"quiet":i>30&&i<34?"quiet":""} style={{height:h+"%"}}/>)}</div><div className="scene-track"><i/><i/><i/><i/></div></div>;
  if (kind === "captions") return <div className="scene scene-captions"><div className="scene-video"><span className="subject"/><span className="caption-line">That’s the <b>BEST</b> part</span></div><div className="scene-caption-bars"><i/><i/><i/></div></div>;
  if (kind === "zoom") return <div className="scene scene-zoom"><div className="zoom-frame"><span/><span/><span/><span/><i className="zoom-subject"/></div><div className="zoom-path"><i/><i/><i/><i/><i/></div><b>1.3×</b></div>;
  if (kind === "profanity") return <div className="scene scene-profanity"><div className="profanity-wave">{WAVE.slice(0,32).map((h,i)=><i key={i} style={{height:h+"%"}} className={i>13&&i<19?"censored":""}/>)}</div><span className="bleep-pill">BEEP  1000 Hz</span><div className="mute-track"><i/></div></div>;
  if (kind === "angles") return <div className="scene scene-angles"><div className="camera camera-one"><span>CAM A</span><i/></div><div className="camera camera-two"><span>CAM B</span><i/></div><div className="switch-line"><i/><i/><i/><i/></div></div>;
  if (kind === "podcast") return <div className="scene scene-podcast"><div className="speaker speaker-one"><span>HOST</span><i/></div><div className="speaker speaker-two"><span>GUEST</span><i/></div><div className="speaker-wave">{WAVE.slice(0,30).map((h,i)=><i key={i} style={{height:h+"%"}}/>)}</div></div>;
  if (kind === "chapters") return <div className="scene scene-chapters"><div className="chapter-time"><i/>00:00 <b>Introduction</b></div><div className="chapter-time"><i/>02:14 <b>Main topic</b></div><div className="chapter-time"><i/>06:38 <b>Conclusion</b></div><div className="chapter-progress"><i/></div></div>;
  if (kind === "repeat") return <div className="scene scene-repeat"><div className="take take-bad"><span>TAKE 01</span><i/><b>×</b></div><div className="take take-good"><span>TAKE 02</span><i/><b>✓</b></div><div className="take take-bad"><span>TAKE 03</span><i/><b>×</b></div></div>;
  if (kind === "broll") return <div className="scene scene-broll"><div className="broll-main"><i/></div><div className="broll-strip"><i/><i/><i/><i/></div><div className="broll-overlay">V2 · B-ROLL</div></div>;
  return <div className="scene scene-viral"><div className="phone-preview"><i/><span/><b>SHORTS</b><em>9:16</em></div><div className="viral-score"><small>VIRAL SCORE</small><strong>96</strong><span>HIGH POTENTIAL</span><i/></div></div>;
}

export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [cuts, setCuts] = useState<Interval[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("Choose a media file to get started.");
  const [params, setParams] = useState(DEFAULTS);
  const [vadEngine, setVadEngine] = useState<"rms" | "silero">("rms");
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const activeTool = TOOLS.find(t => t.id === activeId) ?? null;
  const isSilences = activeId === "silences";
  const kept = useMemo(() => {
    const result: Interval[] = []; let cursor = 0;
    for (const cut of cuts) { if (cut.start > cursor + 0.025) result.push({ start: cursor, end: cut.start }); cursor = Math.max(cursor, cut.end); }
    if (cursor < duration - 0.025) result.push({ start: cursor, end: duration });
    return result.filter(x => x.end - x.start > 0.025);
  }, [cuts, duration]);
  const removedSeconds = cuts.reduce((sum,c)=>sum+c.end-c.start,0);
  const timeline = useMemo(() => {
    const out: {start:number;end:number;cut:boolean}[]=[]; let cursor=0;
    for(const c of cuts){ if(c.start>cursor)out.push({start:cursor,end:c.start,cut:false}); out.push({start:c.start,end:c.end,cut:true}); cursor=c.end; }
    if(cursor<duration)out.push({start:cursor,end:duration,cut:false});
    return out;
  },[cuts,duration]);

  useEffect(() => {
    const canvas = waveformRef.current; if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(canvas.clientWidth, 260), height = 105;
    canvas.width = Math.floor(width*ratio); canvas.height = Math.floor(height*ratio);
    const ctx=canvas.getContext("2d"); if(!ctx)return;
    ctx.scale(ratio,ratio); ctx.fillStyle="#141820"; ctx.fillRect(0,0,width,height);
    if(!peaks.length){ctx.fillStyle="#707b8c";ctx.font="11px Arial";ctx.textAlign="center";ctx.fillText("Waveform preview appears here",width/2,height/2);return;}
    const barW=width/peaks.length;
    peaks.forEach((value,index)=>{
      const t=duration*index/peaks.length, cut=cuts.some(c=>t>=c.start&&t<=c.end);
      ctx.fillStyle=cut?"#e35d62":"#60c7a0";
      const h=Math.max(2,Math.min(height-18,value*(height-18)));
      ctx.fillRect(index*barW,(height-h)/2,Math.max(1,barW-1),h);
    });
    ctx.strokeStyle="#ffb098";ctx.setLineDash([3,4]);
    cuts.forEach(c=>[c.start,c.end].forEach(t=>{const x=duration?t/duration*width:0;ctx.beginPath();ctx.moveTo(x,5);ctx.lineTo(x,height-5);ctx.stroke();}));
    ctx.setLineDash([]);
  },[peaks,cuts,duration,activeId]);

  async function loadFile(nextFile: File) {
    if(previewUrl)URL.revokeObjectURL(previewUrl);
    setFile(nextFile);setPreviewUrl(URL.createObjectURL(nextFile));setCuts([]);setPeaks([]);setDuration(0);
    setNotice("Reading media file…");
    try {
      const AC=window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;
      const context=new AC();const buffer=await context.decodeAudioData(await nextFile.arrayBuffer());const channel=buffer.getChannelData(0);
      const step=Math.max(1,Math.floor(channel.length/1100));const generated:number[]=[];
      for(let i=0;i<channel.length;i+=step){let power=0;const end=Math.min(channel.length,i+step);for(let j=i;j<end;j++)power+=channel[j]*channel[j];generated.push(Math.sqrt(power/Math.max(1,end-i)));}
      setPeaks(generated);setDuration(buffer.duration);
      setNotice("Media loaded. Analyze silences, review the red sections, then export.");
      await context.close();
    } catch {
      setNotice("Browser audio decoding failed for this codec. WAV usually works locally; connect the FastAPI backend for FFmpeg-supported formats.");
    }
  }
  function onFileChange(event:ChangeEvent<HTMLInputElement>){const next=event.target.files?.[0];if(next)void loadFile(next);}
  function onDrop(event:DragEvent<HTMLLabelElement>){event.preventDefault();const next=event.dataTransfer.files?.[0];if(next)void loadFile(next);}
  function updateParam(key:keyof typeof DEFAULTS,value:number){setParams(current=>({...current,[key]:value}));}

  async function analyze() {
    if(!file){setNotice("Choose a media file first.");return;}
    setBusy(true);setNotice("Analyzing audio…");
    try {
      const configuredApi=process.env.NEXT_PUBLIC_OPENCUT_API_URL?.trim();
      const apiBase=configuredApi?.endsWith("/")?configuredApi.slice(0,-1):configuredApi;
      if(apiBase){
        const form=new FormData();form.append("file",file);form.append("threshold_db",String(params.threshold));
        form.append("min_silence_sec",String(params.minSilence));form.append("min_speech_sec",String(params.minSpeech));
        form.append("padding_sec",String(params.padding));form.append("vad_engine",vadEngine);
        const response=await fetch(apiBase+"/api/analyze/silence",{method:"POST",body:form});
        if(!response.ok)throw new Error((await response.text()).slice(0,400));
        const result=await response.json();
        setCuts((result.silence_intervals??[]).map((x:{start:number;end:number})=>({start:Number(x.start),end:Number(x.end)})));
        if(typeof result.duration_seconds==="number")setDuration(result.duration_seconds);
        setNotice("Analysis completed by the local processing engine. Review all cut points before export.");
        return;
      }
      if(vadEngine==="silero"){setNotice("Silero-VAD needs the optional FastAPI service with torch and silero-vad installed.");return;}
      if(!peaks.length||!duration){setNotice("This file could not be decoded by the browser. Connect FastAPI + FFmpeg for this media format.");return;}
      await new Promise(resolve=>window.setTimeout(resolve,20));
      const binSec=.03,bins=Math.ceil(duration/binSec),flags:boolean[]=[];
      for(let i=0;i<bins;i++){
        const start=Math.floor(i/bins*peaks.length),end=Math.min(peaks.length,Math.max(start+1,Math.floor((i+1)/bins*peaks.length)));
        let power=0;for(let k=start;k<end;k++)power+=peaks[k]*peaks[k];
        const rms=Math.sqrt(power/Math.max(1,end-start)),db=rms>1e-7?20*Math.log10(rms):-100;flags.push(db<params.threshold);
      }
      for(let i=0;i<flags.length;){let j=i+1;while(j<flags.length&&flags[j]===flags[i])j++;if(!flags[i]&&(j-i)*binSec<params.minSpeech)for(let k=i;k<j;k++)flags[k]=true;i=j;}
      const found:Interval[]=[];
      for(let i=0;i<flags.length;){if(!flags[i]){i++;continue;}let j=i+1;while(j<flags.length&&flags[j])j++;
        const start=i*binSec,end=Math.min(duration,j*binSec);
        if(end-start>=params.minSilence){const a=Math.max(0,start+params.padding),b=Math.min(duration,end-params.padding);if(b-a>=.08)found.push({start:a,end:b});}i=j;}
      setCuts(found);
      setNotice(`Analysis complete: ${found.length} silence regions marked. Review before applying.`);
    } catch(error) {setNotice("Analysis failed: "+(error instanceof Error?error.message:String(error)));}
    finally {setBusy(false);}
  }

  function exportEDL(){
    if(!duration)return;const lines=["TITLE: OPENCUT STUDIO","FCM: NON-DROP FRAME",""];let cursor=0;
    kept.forEach((segment,index)=>{const recOut=cursor+segment.end-segment.start;
      lines.push(`${String(index+1).padStart(3,"0")}  AX       V     C        ${timecode(segment.start)} ${timecode(segment.end)} ${timecode(cursor)} ${timecode(recOut)}`);
      lines.push(`* FROM CLIP NAME: ${file?.name||"SOURCE"}`,"");cursor=recOut;});
    downloadFile("opencut_timeline.edl",lines.join("\n"));
  }
  function exportReports(){
    const report={source:file?.name,durationSeconds:duration,parameters:params,silenceIntervals:cuts,keptIntervals:kept};
    downloadFile("opencut_report.json",JSON.stringify(report,null,2),"application/json");
    downloadFile("opencut_segments.csv",["type,start_seconds,end_seconds,duration_seconds",
      ...cuts.map(c=>`remove,${c.start.toFixed(3)},${c.end.toFixed(3)},${(c.end-c.start).toFixed(3)}`),
      ...kept.map(c=>`keep,${c.start.toFixed(3)},${c.end.toFixed(3)},${(c.end-c.start).toFixed(3)}`)].join("\n"),"text/csv;charset=utf-8");
  }

  function openTool(id:string){setActiveId(id);const tool=TOOLS.find(t=>t.id===id);if(tool&&!tool.available)setNotice(`${tool.name} is on the roadmap and is not implemented yet.`);}

  return <main className="app-shell" dir="ltr">
    <header className="app-titlebar">
      <div className="app-brand"><span className="brand-mark"><AudioLines size={17}/></span><strong>OpenCut</strong><span className="brand-muted">STUDIO</span><span className="version-tag">v0.2</span></div>
      <div className="window-title">Independent Editing Suite</div>
      <div className="titlebar-actions"><span className="connection-dot"/><span>Local workspace</span><span className="language-button" aria-label="Interface language">EN <ChevronRight size={11}/></span><span className="icon-button" aria-hidden="true">⋮</span></div>
    </header>

    <div className="app-body">
      <aside className="rail"><button className={activeId===null?"rail-button active":"rail-button"} onClick={()=>setActiveId(null)} title="Home"><PanelLeftClose size={17}/><span>HOME</span></button><div className="rail-rule"/><button className={activeId!==null?"rail-button active":"rail-button"} onClick={()=>setActiveId("silences")} title="Tools"><Waves size={17}/><span>TOOLS</span></button><div className="rail-spacer"/><div className="rail-version">OC</div></aside>
      <section className="content-area">
        <div className="top-line"><div className="breadcrumbs"><span>OPENCUT STUDIO</span><ChevronRight size={13}/><strong>{activeTool?activeTool.name:"HOME"}</strong></div><div className="top-status"><span className="status-dot"/>{file?"MEDIA LOADED":"READY TO EDIT"}</div></div>
        {activeId===null ? <section className="home-view">
          <div className="home-intro"><div><div className="section-kicker"><span className="kicker-mark"/> EDIT. EMPOWER. ELEVATE.</div><h1>Your editing tools,<br/><em>all in one place.</em></h1><p>Choose a workflow to get started. Automate the repetitive parts and stay focused on the edit.</p></div><div className="intro-decoration"><div className="deco-ring ring-one"/><div className="deco-ring ring-two"/><div className="deco-wave">{WAVE.slice(0,26).map((h,i)=><i key={i} style={{height:h+"%"}}/>)}</div><span className="deco-chip">AUDIO · TIMELINE · AI</span></div></div>
          <div className="tools-heading"><div><h2>Explore the tools</h2><p>10 focused tools for a faster editing workflow.</p></div><span className="tool-count"><b>{TOOLS.length.toString().padStart(2,"0")}</b> MODULES</span></div>
          <div className="feature-grid">{TOOLS.map((tool,index)=>{const Icon=tool.icon;return <button key={tool.id} className={tool.available?"feature-card available-card":"feature-card"} onClick={()=>openTool(tool.id)}>
            <div className="feature-image"><MiniScene kind={tool.visual}/><div className="feature-open"><ChevronRight size={15}/></div>{tool.tag&&<span className={tool.available?"feature-tag tag-live":"feature-tag"}>{tool.tag}</span>}</div>
            <div className="feature-info"><div className="feature-title"><span className="feature-icon"><Icon size={15}/></span><h3>{tool.name}</h3></div><p>{tool.description}</p><div className="feature-footer"><span className={tool.available?"feature-status status-live":"feature-status"}><i/>{tool.available?"READY TO USE":"COMING SOON"}</span><ChevronRight size={13}/></div></div>
          </button>;})}</div>
          <div className="home-footnote"><span><span className="footnote-dot"/> Built for creators</span><span>Independent project · v0.2.0</span></div>
        </section> : isSilences ? <section className="tool-view">
          <button className="back-link" onClick={()=>setActiveId(null)}><ChevronLeft size={14}/> All tools</button>
          <div className="tool-page-heading"><div className="tool-page-symbol"><Scissors size={20}/></div><div className="tool-page-title"><div className="section-kicker">AUDIO INTELLIGENCE</div><h1>AutoCut Silences</h1><p>Detect dead air, protect speech, and prepare a clean first cut.</p></div><span className="working-pill"><i/> ANALYSIS READY</span></div>
          <div className="editor-grid">
            <div className="editor-main">
              <section className="media-card">
                <div className="panel-heading"><div><h2>Source media</h2><p>{file?file.name:"Load a clip to begin"}</p></div><label className="small-action"><Upload size={14}/> Browse<input type="file" accept="audio/*,video/*,.wav,.mp4,.mov,.mkv" onChange={onFileChange}/></label></div>
                {!file ? <label className="media-drop" onDragOver={e=>e.preventDefault()} onDrop={onDrop}><input type="file" accept="audio/*,video/*,.wav,.mp4,.mov,.mkv" onChange={onFileChange}/><span className="drop-icon"><Upload size={20}/></span><b>Drop your media here</b><small>WAV, MP3, MP4, MOV · Files stay local unless a backend URL is configured.</small><span className="outline-action">Choose file</span></label> : <div className="loaded-media">{file.type.startsWith("video/")?<video src={previewUrl} controls/>:<div className="audio-placeholder"><div className="audio-disc"><AudioLines size={23}/></div><div><b>{file.name}</b><span>{timestamp(duration)} · Audio waveform loaded</span></div><Volume2 size={17}/></div>}<div className="file-meta"><span><FileVideo size={13}/>{(file.size/1024/1024).toFixed(1)} MB</span><span><Clock3 size={13}/>{duration.toFixed(2)} sec</span><button onClick={()=>{setFile(null);setPeaks([]);setCuts([]);setDuration(0);setPreviewUrl("");}}>Remove <X size={12}/></button></div></div>}
              </section>
              <section className="timeline-card"><div className="panel-heading"><div><h2>Timeline analysis</h2><p>Green = keep · Red = suggested silence cut</p></div><span className="timeline-duration">{duration?timestamp(duration):"00:00"}</span></div>
                <div className="timeline-ruler"><span>00:00</span><span>{timestamp(duration*.25)}</span><span>{timestamp(duration*.5)}</span><span>{timestamp(duration*.75)}</span><span>{timestamp(duration)}</span></div>
                <canvas ref={waveformRef} className="detail-waveform"/>
                <div className="timeline-track">{timeline.length?timeline.map((block,index)=><div key={index} className={block.cut?"timeline-segment segment-cut":"timeline-segment segment-keep"} style={{width:Math.max(.5,(block.end-block.start)/duration*100)+"%"}} title={`${block.start.toFixed(2)}s – ${block.end.toFixed(2)}s`}/>):<div className="timeline-empty">Load media to build the timeline</div>}</div>
                <div className="timeline-legend"><span><i className="legend-keep"/> Speech retained</span><span><i className="legend-cut"/> Silence to remove</span><span><i className="legend-marker"/> Cut boundary</span></div>
              </section>
              <section className="cuts-card"><div className="panel-heading"><div><h2>Detected intervals</h2><p>Check the proposed edits before exporting.</p></div><span className="small-count">{cuts.length} CUTS</span></div>
                {cuts.length?<div className="interval-list">{cuts.slice(0,8).map((cut,index)=><div className="interval-row" key={index}><span className="interval-index">{String(index+1).padStart(2,"0")}</span><span className="interval-range">{timestamp(cut.start)} <i>→</i> {timestamp(cut.end)}</span><span className="interval-length">{(cut.end-cut.start).toFixed(2)}s</span></div>)}</div>:<div className="interval-empty"><Activity size={17}/><span>No intervals yet. Run analysis to preview proposed cuts.</span></div>}
                <div className="export-actions"><button className="secondary-button" disabled={!duration} onClick={exportReports}><ArrowDownToLine size={14}/> Export report</button><button className="secondary-button" disabled={!duration} onClick={exportEDL}><ArrowDownToLine size={14}/> Export EDL</button></div>
              </section>
            </div>
            <aside className="settings-panel"><div className="panel-heading"><div><h2>Detection settings</h2><p>Fine-tune your cut style.</p></div><Settings2 size={16}/></div>
              <div className="setting-field"><div className="setting-label"><label>Noise threshold</label><b>{params.threshold} dB</b></div><input type="range" min="-60" max="-10" step="1" value={params.threshold} onChange={e=>updateParam("threshold",Number(e.target.value))}/><div className="range-labels"><span>More sensitive</span><span>Less sensitive</span></div></div>
              <div className="setting-field"><div className="setting-label"><label>Remove silences longer than</label><b>{Math.round(params.minSilence*1000)} ms</b></div><input type="range" min=".1" max="1.5" step=".05" value={params.minSilence} onChange={e=>updateParam("minSilence",Number(e.target.value))}/></div>
              <div className="setting-field"><div className="setting-label"><label>Keep talks longer than</label><b>{Math.round(params.minSpeech*1000)} ms</b></div><input type="range" min=".05" max="1" step=".05" value={params.minSpeech} onChange={e=>updateParam("minSpeech",Number(e.target.value))}/></div>
              <div className="setting-field"><div className="setting-label"><label>Safety padding</label><b>{Math.round(params.padding*1000)} ms</b></div><input type="range" min="0" max=".5" step=".01" value={params.padding} onChange={e=>updateParam("padding",Number(e.target.value))}/><div className="range-labels"><span>Precise</span><span>Protect speech edges</span></div></div>
              <div className="divider-line"/>
              <div className="setting-field"><div className="setting-label"><label>Detection engine</label><span className="optional-label">OPTIONAL</span></div><select className="engine-select" value={vadEngine} onChange={e=>setVadEngine(e.target.value as "rms"|"silero")}><option value="rms">RMS energy · Local</option><option value="silero">Silero-VAD · Backend</option></select></div>
              <button className="apply-button" disabled={busy||!file} onClick={analyze}>{busy?<><span className="spinner"/> Analyzing…</>:<><Scissors size={15}/> Analyze silences</>}</button>
              <p className="privacy-note"><span/> {process.env.NEXT_PUBLIC_OPENCUT_API_URL?"Media is sent to your configured local API for analysis.":"Local preview mode. Media is not uploaded by this page."}</p>
              <div className="summary-panel"><span className="summary-title">ANALYSIS SUMMARY</span><div><span>Duration</span><b>{duration.toFixed(2)} s</b></div><div><span>Silence regions</span><b>{cuts.length}</b></div><div><span>Time to remove</span><b className="red-value">{removedSeconds.toFixed(2)} s</b></div></div>
            </aside>
          </div>
          <div className="notice-bar"><span>i</span><p>{notice} Review the suggested cut points before using the exported edit list.</p></div>
        </section> : <section className="coming-view">
          <button className="back-link" onClick={()=>setActiveId(null)}><ChevronLeft size={14}/> All tools</button>
          <div className="coming-card"><div className="coming-scene"><MiniScene kind={activeTool?.visual??"wave"}/></div><div className="coming-copy"><span className="coming-label"><Sparkles size={13}/> ON THE ROADMAP</span><h1>{activeTool?.name}</h1><p>{activeTool?.description}</p><div className="coming-status"><span/> This module is not implemented yet.</div><button className="secondary-button" onClick={()=>setActiveId(null)}><ChevronLeft size={14}/> Back to all tools</button></div></div>
        </section>}
      </section>
    </div>
  </main>;
}
