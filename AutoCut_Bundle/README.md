# AutoCut Complete Source & Architecture Bundle

هذا الأرشيف يحتوي على كافة المكونات البرمجية والأدلة المستخرجة بالهندسة العكسية من تطبيق **AutoCut (v4.60.33)**، بالإضافة إلى الكود المصدري المستقل مفتوح المصدر (Clean-Room Implementation).

---

## بنية الأرشيف ومحتوياته

```
AutoCut_Bundle/
├── README.md                          # هذا الدليل الشامل
├── autocut.state.json                 # تفريغ حالة البرنامج والإعدادات الكاملة ومعايير الخوارزميات
│
├── electron_app/                      # كود غلاف Electron الأساسي (مستخرج من app.asar)
│   ├── package.json                   # تعريف المشروع والتبعيات الرسمية (@kezios/node-ipc, velopack, posthog...)
│   ├── forge.config.cjs               # إعدادات البناء بـ Electron Forge لنظام Windows
│   ├── ATS.config.json                # إعدادات التوقيع الرقمي Azure Code Signing
│   └── packages/
│       ├── main/dist/index.js         # كود العملية الرئيسية (Electron Main Process)
│       └── preload/dist/index.mjs     # جسور ContextBridge وقنوات الـ IPC
│
├── backend_services/                  # الخدمات الخلفية المستقلة التي يقوم Electron بتشغيلها
│   ├── hostServer/main.cjs            # خادم الـ IPC الرئيسي (Port 9931 - يتصل ببرامج المونتاج عبر Sockets)
│   └── compute/                       # محرك الحسابات وتنفيذ مهام الذكاء الاصطناعي (Port 9231)
│       ├── main.cjs                   # مشغل المهام Task Runner
│       └── domains/common/utils/      # نماذج المهام المحملة ديناميكياً
│
├── integrations/                      # إضافات التكامل مع برامج المونتاج
│   ├── davinci_resolve/
│   │   └── AutoCut.lua                # سكريبت أتمتة دافينشي ريزولف (Lua Scripting)
│   └── premiere_pro_cep/              # إضافة أدوبي بريمير الكاملة (Adobe CEP Extension)
│       ├── CSXS/manifest.xml          # تعريف الإضافة في بريمير
│       ├── jsx/index.jsxbin           # محرك التقطيع على التايملاين بـ ExtendScript
│       └── assets/ / main/            # واجهات CEP التفاعلية
│
└── clean_room_open_source/            # الكود المصدري البديل مفتوح المصدر الجاهز للتشغيل
    ├── AutoCut_App.py                 # تطبيق سطح مكتب مستقل (Python Tkinter) لكشف الصمت وتصدير XML/EDL
    ├── autocut_complete_engine.py     # محرك VAD الرياضي لحساب طاقة الصوت والديسيبل
    ├── index.html                     # واجهة تفاعلية حديثة مع مشغل فيديو ورسم المخطط الصوتي
    ├── server.py                      # خادم محلي خفيف لتشغيل الواجهة في المتصفح
    ├── demo_speech.wav                # ملف صوت تجريبي
    └── test_sample.wav                # ملف صوت تجريبي
```

---

## المعمارية الهندسية الدقيقة لبرنامج AutoCut

1. **الواجهة (Frontend):**
   * واجهة ويب React محملة عن بُعد من `https://front.static.autocut.com/`.
   * تتواصل مع نواة Electron عبر قنوات IPC مسجلة في `packages/preload/dist/index.mjs`.

2. **نواة إلكترون (Electron Core):**
   * تقرأ المنافذ وعناوين السيرفرات من رابط Fallback: `https://autotuct-fallback-urls.onrender.com/fallback.json`.
   * تقوم بتشغيل عمليتين خلفيتين (Child Processes) باستخدام `child_process.fork()`:
     * **Host Server** (على المنفذ `--inspect=9931`): يدير مآخذ الاتصال مع برامج المونتاج (`com.autocut.ppro`, `com.autocut.davinci`, `com.autocut.ofx`).
     * **Compute Server** (على المنفذ `--inspect=9231`): يدير قائمة انتظار المهام وتنزيل سكريبتات المعالجة.

3. **معايير خوارزمية كشف الصمت (من واقع `autocut.state.json`):**
   * عتبة الضجيج (`noiseLevel`): `-35.0 dB`
   * الحد الأدنى للصمت (`minTimeOfSilence`): `0.30s`
   * الحد الأدنى للكلام (`minTimeOfTalk`): `0.20s`
   * هامش أمان البداية (`marginBefore`): `0.20s`
   * هامش أمان النهاية (`marginAfter`): `0.20s`
   * حساسية الـ VAD (`aggressivenessLevel`): `3`
   * تفريغ الصوت (Transcription): Deepgram Nova-2 (`model: nova-2`).
