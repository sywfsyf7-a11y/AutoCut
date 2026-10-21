from __future__ import annotations
import os, queue, tempfile, threading, tkinter as tk
from tkinter import filedialog, messagebox, ttk
from pathlib import Path
import opencut_core as core

class OpenCutStudio(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("OpenCut Studio | قص الصمت تلقائياً")
        self.geometry("1050x700"); self.minsize(850,580); self.configure(bg="#151923")
        self.source=tk.StringVar(); self.threshold=tk.DoubleVar(value=-35); self.silence=tk.DoubleVar(value=.30)
        self.talk=tk.DoubleVar(value=.20); self.before=tk.DoubleVar(value=.15); self.after_pad=tk.DoubleVar(value=.15)
        self.fps=tk.IntVar(value=30); self.status=tk.StringVar(value="اختر ملفاً ثم اضغط تحليل الصوت.")
        self.events=queue.Queue(); self.cuts=[]; self.keep=[]; self.duration=0; self._ui(); self.after(100,self._poll)
    def _ui(self):
        s=ttk.Style(self); s.theme_use("clam"); s.configure("TFrame",background="#151923")
        s.configure("TLabel",background="#151923",foreground="#edf2fa",font=("Segoe UI",10))
        s.configure("Title.TLabel",font=("Segoe UI",23,"bold")); s.configure("Sub.TLabel",foreground="#aab5c7")
        s.configure("TButton",padding=8,font=("Segoe UI",10))
        root=ttk.Frame(self,padding=22); root.pack(fill="both",expand=True)
        ttk.Label(root,text="OpenCut Studio",style="Title.TLabel").pack(anchor="w")
        ttk.Label(root,text="قص الصمت تلقائياً • نسخة مستقلة",style="Sub.TLabel").pack(anchor="w",pady=(0,14))
        f=ttk.LabelFrame(root,text="ملف المصدر",padding=10); f.pack(fill="x",pady=6)
        r=ttk.Frame(f); r.pack(fill="x"); ttk.Entry(r,textvariable=self.source).pack(side="left",fill="x",expand=True,padx=(0,8))
        ttk.Button(r,text="اختيار ملف",command=self._choose).pack(side="left")
        ttk.Label(f,text="WAV يعمل مباشرة. الفيديو والصوت المضغوط يحتاجان FFmpeg و ffprobe.",style="Sub.TLabel").pack(anchor="w",pady=6)
        o=ttk.LabelFrame(root,text="إعدادات التحليل",padding=10); o.pack(fill="x",pady=6)
        options=[("عتبة الصوت dBFS",self.threshold,-60,0,1),("أقل صمت بالثواني",self.silence,.1,2,.05),("أقل كلام بالثواني",self.talk,0,1,.05),("هامش قبل نهاية الكلام",self.before,0,.5,.01),("هامش بعد بداية الكلام",self.after_pad,0,.5,.01),("FPS للتصدير",self.fps,1,120,1)]
        for i,(label,var,lo,hi,step) in enumerate(options):
            c=ttk.Frame(o); c.grid(row=0,column=i,sticky="ew",padx=5); o.columnconfigure(i,weight=1)
            ttk.Label(c,text=label).pack(anchor="w"); ttk.Spinbox(c,textvariable=var,from_=lo,to=hi,increment=step,width=8).pack(anchor="w",pady=5)
        a=ttk.Frame(root); a.pack(fill="x",pady=10)
        for label,cmd in [("تحليل الصوت",self._analyze),("تصدير EDL",self._edl),("تصدير CSV + JSON",self._data),("إنشاء ملف مقصوص",self._render)]:
            ttk.Button(a,text=label,command=cmd).pack(side="left",padx=(0,7))
        box=ttk.LabelFrame(root,text="فترات الصمت المكتشفة",padding=8); box.pack(fill="both",expand=True)
        self.table=ttk.Treeview(box,columns=("start","end","dur"),show="headings")
        for col,title in [("start","بداية القص (ث)"),("end","نهاية القص (ث)"),("dur","المدة (ث)")]:
            self.table.heading(col,text=title); self.table.column(col,width=170,anchor="center")
        self.table.pack(fill="both",expand=True)
        self.progress=ttk.Progressbar(root,maximum=100); self.progress.pack(fill="x",pady=(12,5))
        ttk.Label(root,textvariable=self.status,style="Sub.TLabel").pack(anchor="w")
    def _choose(self):
        p=filedialog.askopenfilename(filetypes=[("ملفات وسائط","*.wav *.mp3 *.m4a *.aac *.flac *.ogg *.mp4 *.mov *.mkv *.avi *.webm"),("كل الملفات","*.*")])
        if p: self.source.set(p); self.status.set("تم اختيار: "+Path(p).name)
    def _async(self,fn):
        if not self.source.get() or not Path(self.source.get()).is_file():
            messagebox.showwarning("ملف المصدر","اختر ملفاً موجوداً أولاً."); return
        self.progress["value"]=5; self.status.set("جارٍ التنفيذ...")
        def run():
            try:self.events.put(("ok",fn()))
            except Exception as e:self.events.put(("error",str(e)))
        threading.Thread(target=run,daemon=True).start()
    def _analyze(self):
        def work():
            src=Path(self.source.get()); wav=src
            if src.suffix.lower()!=".wav":
                info=core.media_info(src)
                if not info["has_audio"]: raise RuntimeError("الملف لا يحتوي مساراً صوتياً.")
                wav=Path(tempfile.gettempdir())/("opencut_"+str(os.getpid())+".wav")
                core.extract_analysis_wav(src,wav)
            cuts,dur=core.detect_silence(wav,float(self.threshold.get()),float(self.silence.get()),float(self.talk.get()),float(self.before.get()),float(self.after_pad.get()))
            return ("analysis",cuts,dur,core.keep_intervals(dur,cuts))
        self._async(work)
    def _poll(self):
        try:
            while True:
                item=self.events.get_nowait(); self.progress["value"]=100
                if item[0]=="error": self.status.set("فشل التنفيذ"); messagebox.showerror("خطأ",item[1]); continue
                result=item[1]
                if result[0]=="analysis":
                    _,self.cuts,self.duration,self.keep=result
                    for i in self.table.get_children():self.table.delete(i)
                    for s,e in self.cuts:self.table.insert("","end",values=(f"{s:.3f}",f"{e:.3f}",f"{e-s:.3f}"))
                    removed=sum(e-s for s,e in self.cuts)
                    self.status.set(f"اكتمل التحليل | المدة {self.duration:.2f} ث | الصمت {len(self.cuts)} | المحذوف {removed:.2f} ث | المتبقي {len(self.keep)} مقاطع")
                else:
                    self.status.set("تم حفظ الملف: "+str(result)); messagebox.showinfo("اكتمل","تم حفظ الملف بنجاح.")
        except queue.Empty: pass
        self.after(100,self._poll)
    def _ready(self):
        if self.duration<=0: messagebox.showwarning("النتائج","حلّل الملف أولاً."); return False
        return True
    def _edl(self):
        if not self._ready():return
        p=filedialog.asksaveasfilename(defaultextension=".edl",initialfile="opencut_timeline.edl",filetypes=[("EDL","*.edl")])
        if p:
            try:core.export_edl(p,self.source.get(),self.keep,int(self.fps.get()));self.status.set("تم حفظ EDL: "+p)
            except Exception as e:messagebox.showerror("خطأ",str(e))
    def _data(self):
        if not self._ready():return
        folder=filedialog.askdirectory()
        if folder:
            try:
                d=Path(folder);core.export_csv(d/"opencut_segments.csv",self.cuts,self.keep)
                core.export_json(d/"opencut_segments.json",self.source.get(),self.duration,self.cuts,self.keep,int(self.fps.get()))
                self.status.set("تم حفظ CSV وJSON في "+folder)
            except Exception as e:messagebox.showerror("خطأ",str(e))
    def _render(self):
        if not self._ready():return
        src=Path(self.source.get()); ext=".mp4" if src.suffix.lower() in {".mp4",".mov",".mkv",".avi",".webm"} else ".wav"
        p=filedialog.asksaveasfilename(defaultextension=ext,initialfile=src.stem+"_cut"+ext,filetypes=[("MP4","*.mp4"),("WAV","*.wav"),("كل الملفات","*.*")])
        if not p:return
        def work():
            dst=Path(p)
            if src.suffix.lower()==".wav" and dst.suffix.lower()==".wav":core.render_wav(src,dst,self.keep)
            else:core.render_with_ffmpeg(src,dst,self.keep)
            return ("rendered",str(dst))
        self._async(work)
if __name__=="__main__": OpenCutStudio().mainloop()
