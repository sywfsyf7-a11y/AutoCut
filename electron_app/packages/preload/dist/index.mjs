import { ipcRenderer as r, shell as O, webUtils as B, contextBridge as x } from "electron";
import { spawn as V, execFile as j, execSync as G } from "child_process";
import p, { userInfo as H, type as J, platform as z, tmpdir as R } from "os";
import { randomUUID as Z, createVerify as Q } from "crypto";
import { writeFileSync as L, unlinkSync as X, symlinkSync as K, statSync as y, rmSync as Y, renameSync as ee, realpathSync as te, readFileSync as F, readdirSync as oe, readdir as ne, read as re, open as se, mkdirSync as m, lstatSync as ce, existsSync as u, copyFileSync as ae, close as ie, access as le, createWriteStream as de } from "fs";
import ue, { dirname as E, posix as fe, join as d, extname as pe, basename as ge, win32 as me } from "path";
import I from "got";
import { unzipSync as we } from "fflate";
import { IpcClient as U } from "@kezios/node-ipc";
import v from "sudo-prompt";
const ye = {
  flushLogs: () => r.invoke("electron:flushLogs"),
  getClipboard: () => r.sendSync("electron:getClipboard"),
  getIPInfos: () => r.sendSync("electron:getIPInfos"),
  getNativePath: (e) => r.sendSync("electron:getNativePath", { name: e }),
  getPath: (e, t) => r.sendSync("electron:getPath", {
    name: e,
    skipShortify: t
  }),
  getSharedVariables: () => r.sendSync("electron:getSharedVariables"),
  getVersion: () => r.sendSync("electron:getVersion"),
  getWindowsEnvironmentPath: (e) => r.sendSync("electron:getWindowsEnvironmentPath", {
    name: e
  }),
  loadDevUrl: () => {
    console.log("Preload: Sending request to load dev URL"), r.send("electron:load-dev-url");
  },
  minimize: () => r.send("electron:reduceWindow"),
  /**
   * Called once if compute or host-server dies outside of a normal shutdown,
   * including when that happened before this subscription. Returns the
   * unsubscribe function.
   */
  onSubprocessTerminated: (e) => {
    let t = !1;
    const o = (s) => {
      t || (t = !0, e(s));
    }, n = (s, c) => o(c);
    return r.on("electron:subprocess-terminated", n), r.invoke("electron:get-terminated-subprocess").then((s) => {
      s && o(s);
    }), () => {
      t = !0, r.removeListener("electron:subprocess-terminated", n);
    };
  },
  openLinkInBrowser: (e) => O.openExternal(e),
  refreshSharedVariables: () => r.invoke("electron:refreshSharedVariables"),
  reload: () => r.send("electron:restart"),
  retryStartupNetwork: () => r.send("electron:retryStartupNetwork"),
  setClipboard: (e) => r.sendSync("electron:setClipboard", { text: e }),
  setWindowExpanded: (e) => r.send("electron:setWindowExpanded", e),
  showSaveDialog: (e) => r.sendSync("electron:showSaveDialog", e ?? {}),
  togglePinWindow: () => r.sendSync("electron:toggleAlwaysOnTop")
}, Se = (e) => Buffer.concat(e).toString("base64"), he = {
  from: Buffer.from,
  subarray: (e, t, o) => e.subarray(t, o),
  concat: Buffer.concat,
  alloc: Buffer.alloc,
  encodeToBase64: Se
};
let b;
const ve = () => {
  if (b !== void 0)
    return b;
  const e = r.sendSync("electron:getSharedVariables").ARCH;
  if (e !== "arm64" && e !== "x64")
    throw new Error(`Unsupported or missing ARCH shared variable: "${e}"`);
  return b = e, e;
}, f = {
  homedir: () => r.sendSync("electron:getSharedVariables").HOME_DIR_PATH,
  tmpdir: R,
  platform: z,
  type: J,
  arch: ve,
  userInfo: H
}, k = (e) => f.platform() === "win32" ? `chcp 65001>nul && ${e}` : e, be = "$OutputEncoding=[Console]::OutputEncoding=[Text.Encoding]::UTF8;", S = (e, t, o) => {
  if (o && "shell" in o)
    throw new Error("The renderer execFile bridge does not allow shell mode");
  return new Promise((n) => {
    j(e, t, o ?? {}, (s, c, i) => {
      n({
        error: s,
        stderr: i.toString(),
        stdout: c.toString()
      });
    });
  });
}, ke = {
  execFile: S,
  powershell: (e, t) => {
    const o = t?.skipUTF8Encoding ? e : `${be}${e}`;
    return S("powershell", ["-NoProfile", "-Command", o], {
      env: { ...process.env, ...t?.env }
    });
  },
  spawn: V
}, Fe = (e, t, o) => {
  const n = Buffer.from(e), s = Q("SHA256");
  return s.update(n.toString()), s.verify(t, o, "base64");
}, Ee = { verifySignature: Fe, randomUUID: Z }, xe = (e) => y(e).isFile(), Pe = (e) => {
  switch (e.toLowerCase()) {
    case ".gif":
      return "image/gif";
    case ".jpeg":
    case ".jpg":
      return "image/jpeg";
    case ".mov":
      return "video/quicktime";
    case ".mp4":
      return "video/mp4";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    // Add more MIME types as needed
    default:
      return "application/octet-stream";
  }
}, Te = (e) => {
  try {
    const t = F(e), o = ue.extname(e), n = Pe(o), s = t.toString("base64");
    return `data:${n};base64,${s}`;
  } catch (t) {
    throw console.error(
      `[Preload fs] Error generating data URL for ${e}:`,
      t
    ), t;
  }
}, $e = (e) => {
  const t = E(e);
  u(t) || m(t, { recursive: !0 });
  const o = de(e, { flags: "w+" });
  return o.on("error", () => {
  }), {
    waitForDrain: () => new Promise((n) => {
      o.write("", () => n());
    }),
    write: (n) => {
      o.write(n);
    }
  };
}, Ae = {
  access: le,
  Buffer,
  close: ie,
  copyFileSync: ae,
  createLogStream: $e,
  existsSync: u,
  getPathAsDataUrl: Te,
  isFile: xe,
  lstatSync: ce,
  mkdirSync: m,
  open: se,
  read: re,
  readdir: ne,
  readdirSync: oe,
  readFileSync: F,
  realpathSync: te,
  renameSync: ee,
  rmSync: Y,
  statSync: y,
  symlinkSync: K,
  unlinkSync: X,
  writeFileSync: L
}, N = (e) => e instanceof Error ? {
  cause: N(e.cause),
  code: e.code,
  message: e.message,
  name: e.name,
  stack: e.stack
} : e, _ = (e, t) => {
  const o = {
    error: N(e),
    stack: "preload-got",
    url: t
  };
  r.send("electron:logNetworkError", o);
}, Ce = {
  redirectToFront: () => {
    console.log("Redirecting to front"), r.send("electron:redirectToFront"), console.log("Redirected to front");
  },
  pingFront: () => {
    const [e, t, o, n] = r.sendSync(
      "electron:isReady"
    );
    if (!e) {
      console.log("Not ready, waiting for ready event");
      const c = n === "offline" || n === "unreachable";
      return Promise.resolve([
        c ? !1 : null,
        null,
        t,
        o
      ]);
    }
    const { FRONT_URL: s } = r.sendSync(
      "electron:getSharedVariables"
    );
    return new Promise(async (c) => {
      try {
        const a = (await I.get(s)).statusCode || 0;
        a >= 200 && a < 300 ? (console.log(`(${s}) Service online.`), c([!0, s])) : (console.log(`(${s}) Service offline. (${a})`), c([!1, null]));
      } catch (i) {
        _(i, s), console.log(`(${s}) Service offline.`, i), c([!1, null]);
      }
    });
  }
}, Re = {
  basename: ge,
  dirname: E,
  extname: pe,
  join: d,
  joinUrl: (e, ...t) => {
    const o = new URL(e);
    return new URL(d(o.pathname, ...t), o.origin).href;
  },
  // Only join is used, and naming the full `posix` type ties the generated
  // front declaration to one @types/node major (25 dropped PlatformPath).
  posix: { join: (...e) => fe.join(...e) }
}, Le = "tar", Ie = () => {
  const e = process.env.SystemRoot;
  if (!(typeof e != "string" || e.trim() === ""))
    return me.join(e, "System32", "tar.exe");
}, Ue = p.platform() === "win32", q = (e) => Array.from(
  new Set(
    e.split(/\r?\n/).map((t) => t.trim()).filter((t) => t.length > 0).map((t) => t.split("/")[0]).filter((t) => t.length > 0)
  )
), W = (e, t, o) => `${e} failed (exit ${o.code ?? "unknown"}): ${t || o.message || "no error output"}`, Ne = () => {
  const { TAR_PATH: e } = r.sendSync("electron:getSharedVariables"), t = [];
  typeof e == "string" && e !== "" && u(e) && t.push(e), t.push(Le);
  const o = Ie();
  return o && t.push(o), t;
}, P = async (e, t) => {
  const o = Ne(), n = [];
  for (const s of o) {
    console.log("Running", s, e.join(" "));
    const { stdout: c, stderr: i, error: a } = await S(s, e);
    if (a === null)
      return c;
    n.push(W(`tar "${s}"`, i, a));
  }
  throw new Error(
    `${t} failed for all tar candidates: "${n.join('" | "')}"`
  );
}, T = async (e, t, o) => {
  console.log("Running", e, t.join(" "));
  const { stdout: n, stderr: s, error: c } = await S(e, t);
  if (c !== null)
    throw new Error(W(o, s, c));
  return n;
}, _e = (e, t) => {
  const o = we(F(e)), n = /* @__PURE__ */ new Set();
  for (const [s, c] of Object.entries(o)) {
    const i = s.replace(/\\/g, "/"), a = i.split("/")[0];
    a.length > 0 && n.add(a);
    const h = d(t, i);
    if (i.endsWith("/")) {
      m(h, { recursive: !0 });
      continue;
    }
    m(E(h), { recursive: !0 }), L(h, c);
  }
  return Array.from(n);
}, qe = async (e, t) => {
  try {
    const o = await P(["-tf", e], "tar list"), n = q(o);
    return await P(["-xvf", e, "-C", t], "tar extract"), n.map((s) => d(t, s));
  } catch (o) {
    return console.warn(
      "tar extraction failed, falling back to fflate",
      `${o}`
    ), _e(e, t).map((s) => d(t, s));
  }
}, We = {
  download: async (e, t) => {
    console.log("Getting tempPath");
    const o = r.sendSync("electron:getPath", { name: "temp" });
    console.log("Got tempPath", o);
    const n = t?.outputDir || o;
    console.log(`Downloding from ${e} to ${n}`), u(n) || m(n, { recursive: !0 });
    try {
      const s = await r.sendSync(
        "electron:download",
        e,
        n,
        { requireHttps: t?.requireHttps }
      );
      return console.log(`Downloaded ${e} to ${n}`), s;
    } catch (s) {
      throw console.error(`Error downloading ${e} to ${n}`, s), s;
    }
  },
  preparePproJsx: (e) => r.invoke("electron:preparePproJsx", e),
  unzip: async (e, t) => {
    if (t === void 0 || t === "")
      throw new Error("unzip: unzipPath is required");
    if (u(t) || m(t, { recursive: !0 }), Ue)
      return await qe(e, t);
    const o = await T("unzip", ["-Z1", e], "unzip list"), n = q(o);
    return await T(
      "unzip",
      ["-o", e, "-d", t],
      "unzip extract"
    ), n.map((s) => d(t, s));
  }
}, De = {
  getFFMPEGPath: () => {
    console.log("Looking for FFMPEG");
    const e = d(
      r.sendSync("electron:getPath", { name: "userData" }),
      "ffmpeg"
    ), t = d(
      e,
      f.platform() === "darwin" ? "ffmpeg" : "ffmpeg.exe"
    ), o = d(
      e,
      f.platform() === "darwin" ? "ffprobe" : "ffprobe.exe"
    );
    if (u(e) && u(t) && u(o)) {
      console.log("FFMPEG and FFprobe found in path");
      const n = {
        darwin: {
          arm64: { ffmpeg: 1737140207e3, ffprobe: 1737140207e3 },
          x64: { ffmpeg: 1737143975e3, ffprobe: 1737143975e3 }
        },
        win32: {
          x64: { ffmpeg: 1727698786e3, ffprobe: 1727698788e3 },
          x32: { ffmpeg: 1725204808e3, ffprobe: 1725205063e3 },
          arm64: { ffmpeg: 1750334747e3, ffprobe: 1750406524e3 }
        }
      }, s = y(t), c = y(o);
      return s.mtimeMs >= n[f.platform()][f.arch()].ffmpeg && c.mtimeMs >= n[f.platform()][f.arch()].ffprobe ? (console.log("FFMPEG and FFprobe are up to date"), e) : (console.log("FFMPEG or FFprobe is outdated"), !1);
    } else
      return console.log("FFMPEG or FFprobe not found in path"), !1;
  },
  downloadFFMPEG: () => r.sendSync("electron:downloadFFMPEG")
}, Me = async (e, t) => await r.sendSync("cookies:set", e, JSON.stringify(t)), Oe = async (e) => {
  const t = await r.sendSync("cookies:get", e);
  if (t)
    return JSON.parse(t);
}, Be = async () => {
  const e = await r.sendSync("cookies:getAll"), t = {};
  for (const [o, n] of Object.entries(e))
    t[o] = JSON.parse(n);
  return t;
}, Ve = async () => await r.sendSync("cookies:clearAll"), je = {
  clearAll: Ve,
  getAllCookies: Be,
  getCookie: Oe,
  setCookie: Me
}, $ = "front-ipc:cancel-requested", A = "front-ipc:stat", Ge = {
  /**
   * Called when the user dismissed the busy modal themselves. Returns the
   * unsubscribe function — the renderer subscribes for as long as a process can
   * be cancelled, not for the lifetime of the app.
   */
  onCancelRequested: (e) => {
    const t = () => e();
    return r.on($, t), () => {
      r.removeListener($, t);
    };
  },
  /**
   * Called for each analytics event the busy modal reports about its own
   * lifetime (opened, and the single close stat naming why it went away).
   * Returns the unsubscribe function.
   */
  onStat: (e) => {
    const t = (o, n) => e(n);
    return r.on(A, t), () => {
      r.removeListener(A, t);
    };
  },
  /**
   * `send` and not `sendSync`: pushing to the busy modal is fire-and-forget and
   * must never be able to stall or break the caller.
   */
  sendMessage: (e) => r.send("front-ipc:send-message", e)
}, D = d(R(), "com.autocut", "com.autocut.aea"), l = new U({ socketRootPath: D }), He = (e) => l.request(
  "startTask",
  e
), Je = (e) => l.request("killTasks", { requestIds: e }), ze = () => l.request("killAllTasks"), Ze = (e) => l.abortRequest(e), Qe = () => l.abortAllRequests(), Xe = () => l.request("getTasks"), Ke = (e) => l.request("getProgress", {
  requestId: e
}), Ye = () => l.request("flushLogs"), et = {
  abortAllRequests: Qe,
  abortRequest: Ze,
  connect: () => l.connect("com.autocut.compute"),
  flushLogs: Ye,
  getTaskProgress: Ke,
  getTasks: Xe,
  isConnected: () => l.connected,
  killAllTasks: ze,
  killTasks: Je,
  setVerboseLevel: (e) => l.verboseLevel = e,
  startTask: He
}, w = new U({
  maxRetries: 999999999,
  socketRootPath: D
}), tt = {
  connect: () => w.connect("com.autocut.hostServer"),
  isConnected: () => w.connected,
  request: (e, t) => w.request(e, t),
  setVerboseLevel: (e) => w.verboseLevel = e
}, g = (e) => p.platform() === "win32" ? `"${e.replace(/"/g, '""')}"` : `'${e.replace(/'/g, "'\\''")}'`, ot = (e) => p.platform() === "win32" ? `if not exist ${g(e)} mkdir ${g(e)}` : `mkdir -p ${g(e)}`, M = {
  createFolder: async (e) => new Promise((t, o) => {
    v.exec(
      k(ot(e)),
      { name: "AutoCut" },
      (n, s, c) => {
        n || c && c !== "" ? o(n || c) : t(!0);
      }
    );
  }),
  unzip: async (e, t) => new Promise(async (o, n) => {
    t && !u(t) && await M.createFolder(t);
    const s = p.platform() === "darwin" ? `unzip -o ${g(e)} -d ${g(t ?? "")}` : `tar -xvf ${g(e)} -C ${g(t ?? "")}`;
    v.exec(
      k(s),
      { name: "AutoCut" },
      (c, i, a) => {
        c || a && a !== "" ? n(c || a) : o(!0);
      }
    );
  }),
  isAdmin: async () => {
    try {
      if (p.platform() === "win32")
        return G("net session", { stdio: "ignore" }), !0;
      if (p.platform() === "darwin")
        return process.getuid && process.getuid() === 0;
      throw new Error(
        "isAdmin check is only implemented for Windows and macOS"
      );
    } catch {
      return !1;
    }
  },
  runAsAdmin: async (e) => {
    const t = p.platform() === "win32" ? " & " : "; ", o = Array.isArray(e) ? e.join(t) : e;
    return new Promise(
      async (n, s) => {
        v.exec(
          k(o),
          { name: "AutoCut" },
          (c, i, a) => {
            if (c) {
              s(c);
              return;
            }
            a && a !== "" && console.warn("[sudo.runAsAdmin] stderr:", a), n(i);
          }
        );
      }
    );
  }
}, nt = {
  getInfos: () => r.sendSync("updater:getInfos"),
  quitAndInstall: () => r.sendSync("updater:restart")
}, rt = {
  redirectToFront: () => {
    console.log("Redirecting to front"), r.send("electron:onboarding:redirectToFront"), console.log("Redirected to front");
  },
  complete: () => {
    r.send("electron:onboarding:completed");
  },
  pingFront: () => {
    const { ONBOARDING_URL: e } = r.sendSync(
      "electron:getSharedVariables"
    );
    return new Promise(async (t) => {
      try {
        const n = (await I.get(e)).statusCode || 0;
        n >= 200 && n < 300 ? (console.log(`(${e}) Service online.`), t([!0, e])) : (console.log(`(${e}) Service offline. (${n})`), t([!1, null]));
      } catch (o) {
        _(o, e), console.log(`(${e}) Service offline.`, o), t([!1, null]);
      }
    });
  }
}, st = {
  install: (e) => r.invoke(
    "electron:premiere-tools:install",
    e ?? {}
  ),
  isInstallNeeded: () => r.invoke("electron:premiere-tools:is-needed")
}, ct = {
  getPahtForFile: (e) => B.getPathForFile(e)
};
console.log("[Preload] Script started");
const C = {
  childProcess: ke,
  fs: Ae,
  os: f,
  path: Re,
  electron: ye,
  onboarding: rt,
  premiereTools: st,
  https: Ce,
  computeNodeIpc: et,
  frontNodeIpc: Ge,
  hostNodeIpc: tt,
  ffmpegSetup: De,
  resources: We,
  nodeCrypto: Ee,
  updater: nt,
  buffer: he,
  sudo: M,
  cookies: je,
  file: ct
};
try {
  x.exposeInMainWorld("__autocut_preload__", C), x.exposeInMainWorld("__electron_preload__", C), console.log(
    "[Preload] contextBridge.exposeInMainWorld executed successfully."
  );
} catch (e) {
  console.error(
    "[Preload] Error executing contextBridge.exposeInMainWorld:",
    e
  );
}
console.log("[Preload] Script finished");
export {
  C as autocutPreload
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi9zcmMvZWxlY3Ryb24udHMiLCIuLi9zcmMvbm9kZS9idWZmZXIubm9kZS50cyIsIi4uL3NyYy9ub2RlL29zLm5vZGUudHMiLCIuLi9zcmMvbm9kZS9jaGlsZFByb2Nlc3Mubm9kZS50cyIsIi4uL3NyYy9ub2RlL2NyeXB0by5ub2RlLnRzIiwiLi4vc3JjL25vZGUvZnMubm9kZS50cyIsIi4uL3NyYy9ub2RlL3Rsc0Vycm9yLm5vZGUudHMiLCIuLi9zcmMvbm9kZS9odHRwcy5ub2RlLnRzIiwiLi4vc3JjL25vZGUvcGF0aC5ub2RlLnRzIiwiLi4vc3JjL3VuemlwLnV0aWxzLnRzIiwiLi4vc3JjL3Jlc291cmNlcy50cyIsIi4uL3NyYy9zZXR1cC9mZm1wZWcvZmZtcGVnLnNldHVwLnRzIiwiLi4vc3JjL2Nvb2tpZXMudHMiLCIuLi9zcmMvZnJvbnRJcGMudHMiLCIuLi9zcmMvbm9kZUlwYy50cyIsIi4uL3NyYy9zaGVsbFF1b3RlLnV0aWxzLnRzIiwiLi4vc3JjL3N1ZG8udHMiLCIuLi9zcmMvdXBkYXRlci50cyIsIi4uL3NyYy9ub2RlL29uYm9hcmRpbmcubm9kZS50cyIsIi4uL3NyYy9ub2RlL3ByZW1pZXJlVG9vbHMubm9kZS50cyIsIi4uL3NyYy9maWxlLnRzIiwiLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXBjUmVuZGVyZXIsIHNoZWxsfSBmcm9tICdlbGVjdHJvbic7XG5cbmltcG9ydCB0eXBlIHtUZXJtaW5hdGVkU3VicHJvY2Vzc30gZnJvbSAnLi4vLi4vLi4vdHlwZXMvc3VicHJvY2Vzc1Rlcm1pbmF0aW9uJztcblxudHlwZSBXaW5kb3dzRW52aXJvbm1lbnRQYXRoTmFtZSA9XG4gIHwgJ0NvbW1vblByb2dyYW1GaWxlcydcbiAgfCAnTE9DQUxBUFBEQVRBJ1xuICB8ICdQcm9ncmFtRGF0YSdcbiAgfCAnU3lzdGVtUm9vdCc7XG5cbmNvbnN0IGVsZWN0cm9uID0ge1xuICBmbHVzaExvZ3M6ICgpID0+IGlwY1JlbmRlcmVyLmludm9rZSgnZWxlY3Ryb246Zmx1c2hMb2dzJykgYXMgUHJvbWlzZTx2b2lkPixcbiAgZ2V0Q2xpcGJvYXJkOiAoKSA9PiBpcGNSZW5kZXJlci5zZW5kU3luYygnZWxlY3Ryb246Z2V0Q2xpcGJvYXJkJykgYXMgc3RyaW5nLFxuICBnZXRJUEluZm9zOiAoKSA9PlxuICAgIGlwY1JlbmRlcmVyLnNlbmRTeW5jKCdlbGVjdHJvbjpnZXRJUEluZm9zJykgYXMge1xuICAgICAgY2M6IHN0cmluZztcbiAgICAgIGNvdW50cnk6IHN0cmluZztcbiAgICAgIGlwOiBzdHJpbmc7XG4gICAgfSxcbiAgZ2V0TmF0aXZlUGF0aDogKG5hbWU6ICdhcHBEYXRhJyB8ICdleGUnKSA9PlxuICAgIGlwY1JlbmRlcmVyLnNlbmRTeW5jKCdlbGVjdHJvbjpnZXROYXRpdmVQYXRoJywge25hbWV9KSBhcyBzdHJpbmcsXG4gIGdldFBhdGg6IChuYW1lOiBzdHJpbmcsIHNraXBTaG9ydGlmeT86IGJvb2xlYW4pID0+IHtcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIuc2VuZFN5bmMoJ2VsZWN0cm9uOmdldFBhdGgnLCB7XG4gICAgICBuYW1lLFxuICAgICAgc2tpcFNob3J0aWZ5LFxuICAgIH0pIGFzIHN0cmluZztcbiAgfSxcbiAgZ2V0U2hhcmVkVmFyaWFibGVzOiAoKSA9PlxuICAgIGlwY1JlbmRlcmVyLnNlbmRTeW5jKCdlbGVjdHJvbjpnZXRTaGFyZWRWYXJpYWJsZXMnKSBhcyB7XG4gICAgICBBUElfVVJMOiBzdHJpbmc7XG4gICAgICBBUkNIOiAnYXJtNjQnIHwgJ3g2NCc7XG4gICAgICBDT01QVVRFX1VSTDogc3RyaW5nO1xuICAgICAgREFWSU5DSV9ET1dOTE9BRF9VUkw6IHN0cmluZztcbiAgICAgIERBVklOQ0lfUExVR0lOX0RPV05MT0FEX1VSTDogc3RyaW5nO1xuICAgICAgRlJPTlRfVVJMOiBzdHJpbmc7XG4gICAgICBIT01FX0RJUl9QQVRIOiBzdHJpbmc7XG4gICAgICBIT1NUX1NFUlZFUl9VUkw6IHN0cmluZztcbiAgICAgIExPR19GSUxFX1BBVEg6IHN0cmluZztcbiAgICAgIFBQUk9fRE9XTkxPQURfVVJMOiBzdHJpbmc7XG4gICAgICBQUFJPX0pTWF9ET1dOTE9BRF9VUkw6IHN0cmluZztcbiAgICAgIFBSRU1JRVJFX1BMVUdJTl9ESVI6IHN0cmluZztcbiAgICAgIFBST0pFQ1RfVkVSU0lPTlM6IHN0cmluZztcbiAgICAgIFBST1hZX09SSUdJTl9NQVA6IHN0cmluZztcbiAgICAgIFJFU09VUkNFU19QQVRIOiBzdHJpbmc7XG4gICAgICBUQVJfUEFUSDogc3RyaW5nO1xuICAgICAgVEVNUF9GT0xERVJfUEFUSDogc3RyaW5nO1xuICAgICAgVVBEQVRFUl9VUkw6IHN0cmluZztcbiAgICAgIFdFQkFQUF9VUkw6IHN0cmluZztcbiAgICAgIFdFQlNJVEVfVVJMOiBzdHJpbmc7XG4gICAgfSxcbiAgZ2V0VmVyc2lvbjogKCkgPT4gaXBjUmVuZGVyZXIuc2VuZFN5bmMoJ2VsZWN0cm9uOmdldFZlcnNpb24nKSBhcyBzdHJpbmcsXG4gIGdldFdpbmRvd3NFbnZpcm9ubWVudFBhdGg6IChuYW1lOiBXaW5kb3dzRW52aXJvbm1lbnRQYXRoTmFtZSkgPT5cbiAgICBpcGNSZW5kZXJlci5zZW5kU3luYygnZWxlY3Ryb246Z2V0V2luZG93c0Vudmlyb25tZW50UGF0aCcsIHtcbiAgICAgIG5hbWUsXG4gICAgfSkgYXMgc3RyaW5nLFxuICBsb2FkRGV2VXJsOiAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1ByZWxvYWQ6IFNlbmRpbmcgcmVxdWVzdCB0byBsb2FkIGRldiBVUkwnKTtcbiAgICBpcGNSZW5kZXJlci5zZW5kKCdlbGVjdHJvbjpsb2FkLWRldi11cmwnKTtcbiAgfSxcbiAgbWluaW1pemU6ICgpID0+IGlwY1JlbmRlcmVyLnNlbmQoJ2VsZWN0cm9uOnJlZHVjZVdpbmRvdycpLFxuICAvKipcbiAgICogQ2FsbGVkIG9uY2UgaWYgY29tcHV0ZSBvciBob3N0LXNlcnZlciBkaWVzIG91dHNpZGUgb2YgYSBub3JtYWwgc2h1dGRvd24sXG4gICAqIGluY2x1ZGluZyB3aGVuIHRoYXQgaGFwcGVuZWQgYmVmb3JlIHRoaXMgc3Vic2NyaXB0aW9uLiBSZXR1cm5zIHRoZVxuICAgKiB1bnN1YnNjcmliZSBmdW5jdGlvbi5cbiAgICovXG4gIG9uU3VicHJvY2Vzc1Rlcm1pbmF0ZWQ6IChcbiAgICBjYWxsYmFjazogKGRldGFpbHM6IFRlcm1pbmF0ZWRTdWJwcm9jZXNzKSA9PiB2b2lkLFxuICApID0+IHtcbiAgICAvLyBUaGUgcHVzaCBhbmQgdGhlIHB1bGwgY2FuIGJvdGggZGVsaXZlciB0aGUgc2FtZSB0ZXJtaW5hdGlvbi5cbiAgICBsZXQgaXNOb3RpZmllZCA9IGZhbHNlO1xuICAgIGNvbnN0IG5vdGlmeSA9IChkZXRhaWxzOiBUZXJtaW5hdGVkU3VicHJvY2VzcykgPT4ge1xuICAgICAgaWYgKGlzTm90aWZpZWQpIHJldHVybjtcbiAgICAgIGlzTm90aWZpZWQgPSB0cnVlO1xuICAgICAgY2FsbGJhY2soZGV0YWlscyk7XG4gICAgfTtcbiAgICBjb25zdCBsaXN0ZW5lciA9IChfZXZlbnQ6IHVua25vd24sIGRldGFpbHM6IFRlcm1pbmF0ZWRTdWJwcm9jZXNzKSA9PlxuICAgICAgbm90aWZ5KGRldGFpbHMpO1xuICAgIGlwY1JlbmRlcmVyLm9uKCdlbGVjdHJvbjpzdWJwcm9jZXNzLXRlcm1pbmF0ZWQnLCBsaXN0ZW5lcik7XG4gICAgdm9pZCAoXG4gICAgICBpcGNSZW5kZXJlci5pbnZva2UoJ2VsZWN0cm9uOmdldC10ZXJtaW5hdGVkLXN1YnByb2Nlc3MnKSBhcyBQcm9taXNlPFxuICAgICAgICBUZXJtaW5hdGVkU3VicHJvY2VzcyB8IHVuZGVmaW5lZFxuICAgICAgPlxuICAgICkudGhlbihkZXRhaWxzID0+IHtcbiAgICAgIGlmIChkZXRhaWxzKSBub3RpZnkoZGV0YWlscyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaXNOb3RpZmllZCA9IHRydWU7XG4gICAgICBpcGNSZW5kZXJlci5yZW1vdmVMaXN0ZW5lcignZWxlY3Ryb246c3VicHJvY2Vzcy10ZXJtaW5hdGVkJywgbGlzdGVuZXIpO1xuICAgIH07XG4gIH0sXG4gIG9wZW5MaW5rSW5Ccm93c2VyOiAodXJsOiBzdHJpbmcpID0+IHNoZWxsLm9wZW5FeHRlcm5hbCh1cmwpLFxuICByZWZyZXNoU2hhcmVkVmFyaWFibGVzOiAoKSA9PlxuICAgIGlwY1JlbmRlcmVyLmludm9rZSgnZWxlY3Ryb246cmVmcmVzaFNoYXJlZFZhcmlhYmxlcycpIGFzIFByb21pc2U8XG4gICAgICB8IHVuZGVmaW5lZFxuICAgICAgfCB7XG4gICAgICAgICAgQVBJX1VSTDogc3RyaW5nO1xuICAgICAgICAgIEFSQ0g6ICdhcm02NCcgfCAneDY0JztcbiAgICAgICAgICBDT01QVVRFX1VSTDogc3RyaW5nO1xuICAgICAgICAgIERBVklOQ0lfRE9XTkxPQURfVVJMOiBzdHJpbmc7XG4gICAgICAgICAgREFWSU5DSV9QTFVHSU5fRE9XTkxPQURfVVJMOiBzdHJpbmc7XG4gICAgICAgICAgRlJPTlRfVVJMOiBzdHJpbmc7XG4gICAgICAgICAgSE9NRV9ESVJfUEFUSDogc3RyaW5nO1xuICAgICAgICAgIEhPU1RfU0VSVkVSX1VSTDogc3RyaW5nO1xuICAgICAgICAgIExPR19GSUxFX1BBVEg6IHN0cmluZztcbiAgICAgICAgICBQUFJPX0RPV05MT0FEX1VSTDogc3RyaW5nO1xuICAgICAgICAgIFBQUk9fSlNYX0RPV05MT0FEX1VSTDogc3RyaW5nO1xuICAgICAgICAgIFBSRU1JRVJFX1BMVUdJTl9ESVI6IHN0cmluZztcbiAgICAgICAgICBQUk9KRUNUX1ZFUlNJT05TOiBzdHJpbmc7XG4gICAgICAgICAgUFJPWFlfT1JJR0lOX01BUDogc3RyaW5nO1xuICAgICAgICAgIFJFU09VUkNFU19QQVRIOiBzdHJpbmc7XG4gICAgICAgICAgVEFSX1BBVEg6IHN0cmluZztcbiAgICAgICAgICBURU1QX0ZPTERFUl9QQVRIOiBzdHJpbmc7XG4gICAgICAgICAgVVBEQVRFUl9VUkw6IHN0cmluZztcbiAgICAgICAgICBXRUJBUFBfVVJMOiBzdHJpbmc7XG4gICAgICAgICAgV0VCU0lURV9VUkw6IHN0cmluZztcbiAgICAgICAgfVxuICAgID4sXG4gIHJlbG9hZDogKCkgPT4gaXBjUmVuZGVyZXIuc2VuZCgnZWxlY3Ryb246cmVzdGFydCcpLFxuICByZXRyeVN0YXJ0dXBOZXR3b3JrOiAoKSA9PiBpcGNSZW5kZXJlci5zZW5kKCdlbGVjdHJvbjpyZXRyeVN0YXJ0dXBOZXR3b3JrJyksXG4gIHNldENsaXBib2FyZDogKHRleHQ6IHN0cmluZykgPT5cbiAgICBpcGNSZW5kZXJlci5zZW5kU3luYygnZWxlY3Ryb246c2V0Q2xpcGJvYXJkJywge3RleHR9KSBhcyB2b2lkLFxuICBzZXRXaW5kb3dFeHBhbmRlZDogKGV4cGFuZGVkOiBib29sZWFuKSA9PlxuICAgIGlwY1JlbmRlcmVyLnNlbmQoJ2VsZWN0cm9uOnNldFdpbmRvd0V4cGFuZGVkJywgZXhwYW5kZWQpLFxuICBzaG93U2F2ZURpYWxvZzogKG9wdGlvbnM/OiB7XG4gICAgZGVmYXVsdFBhdGg/OiBzdHJpbmc7XG4gICAgZmlsdGVycz86IHtleHRlbnNpb25zOiBzdHJpbmdbXTsgbmFtZTogc3RyaW5nfVtdO1xuICB9KSA9PlxuICAgIGlwY1JlbmRlcmVyLnNlbmRTeW5jKCdlbGVjdHJvbjpzaG93U2F2ZURpYWxvZycsIG9wdGlvbnMgPz8ge30pIGFzXG4gICAgICB8IHN0cmluZ1xuICAgICAgfCB1bmRlZmluZWQsXG4gIHRvZ2dsZVBpbldpbmRvdzogKCkgPT5cbiAgICBpcGNSZW5kZXJlci5zZW5kU3luYygnZWxlY3Ryb246dG9nZ2xlQWx3YXlzT25Ub3AnKSBhcyBib29sZWFuLFxufTtcblxuZXhwb3J0IHtlbGVjdHJvbn07XG4iLCJjb25zdCBlbmNvZGVUb0Jhc2U2NCA9IChidWZmZXI6IFVpbnQ4QXJyYXlbXSk6IHN0cmluZyA9PiB7XG4gIHJldHVybiBCdWZmZXIuY29uY2F0KGJ1ZmZlcikudG9TdHJpbmcoJ2Jhc2U2NCcpO1xufTtcblxuY29uc3QgYnVmZmVyID0ge1xuICBmcm9tOiBCdWZmZXIuZnJvbSxcbiAgc3ViYXJyYXk6IChidWZmZXI6IEJ1ZmZlciwgc3RhcnQ6IG51bWJlciwgZW5kPzogbnVtYmVyKSA9PlxuICAgIGJ1ZmZlci5zdWJhcnJheShzdGFydCwgZW5kKSxcbiAgY29uY2F0OiBCdWZmZXIuY29uY2F0LFxuICBhbGxvYzogQnVmZmVyLmFsbG9jLFxuICBlbmNvZGVUb0Jhc2U2NCxcbn07XG5cbmV4cG9ydCB7YnVmZmVyfTtcbiIsImltcG9ydCB7aXBjUmVuZGVyZXJ9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7cGxhdGZvcm0sIHRtcGRpciwgdHlwZSwgdXNlckluZm99IGZyb20gJ29zJztcblxubGV0IGNhY2hlZEFyY2g6ICdhcm02NCcgfCAneDY0JyB8IHVuZGVmaW5lZDtcblxuY29uc3QgZ2V0QXJjaCA9ICgpOiAnYXJtNjQnIHwgJ3g2NCcgPT4ge1xuICBpZiAoY2FjaGVkQXJjaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGNhY2hlZEFyY2g7XG4gIH1cbiAgY29uc3QgYXJjaCA9IGlwY1JlbmRlcmVyLnNlbmRTeW5jKCdlbGVjdHJvbjpnZXRTaGFyZWRWYXJpYWJsZXMnKS5BUkNIO1xuICBpZiAoYXJjaCAhPT0gJ2FybTY0JyAmJiBhcmNoICE9PSAneDY0Jykge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgb3IgbWlzc2luZyBBUkNIIHNoYXJlZCB2YXJpYWJsZTogXCIke2FyY2h9XCJgKTtcbiAgfVxuICBjYWNoZWRBcmNoID0gYXJjaDtcbiAgcmV0dXJuIGFyY2g7XG59O1xuXG5jb25zdCBvcyA9IHtcbiAgaG9tZWRpcjogKCkgPT4ge1xuICAgIHJldHVybiBpcGNSZW5kZXJlci5zZW5kU3luYygnZWxlY3Ryb246Z2V0U2hhcmVkVmFyaWFibGVzJykuSE9NRV9ESVJfUEFUSDtcbiAgfSxcbiAgdG1wZGlyLFxuICBwbGF0Zm9ybSxcbiAgdHlwZSxcbiAgYXJjaDogZ2V0QXJjaCxcbiAgdXNlckluZm8sXG59O1xuXG5leHBvcnQge29zfTtcbiIsImltcG9ydCB0eXBlIHtFeGVjRXhjZXB0aW9uLCBFeGVjRmlsZU9wdGlvbnN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5pbXBvcnQge2V4ZWNGaWxlIGFzIGV4ZWNGaWxlTm9kZSwgc3Bhd259IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5pbXBvcnQge29zfSBmcm9tICcuL29zLm5vZGUnO1xuXG50eXBlIFJlbmRlcmVyRXhlY0ZpbGVPcHRpb25zID0gT21pdDxFeGVjRmlsZU9wdGlvbnMsICdzaGVsbCc+ICYge1xuICBzaGVsbD86IG5ldmVyO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFVURjhDb21tYW5kID0gKGNvbW1hbmQ6IHN0cmluZykgPT4ge1xuICByZXR1cm4gb3MucGxhdGZvcm0oKSA9PT0gJ3dpbjMyJyA/IGBjaGNwIDY1MDAxPm51bCAmJiAke2NvbW1hbmR9YCA6IGNvbW1hbmQ7XG59O1xuXG5jb25zdCBVVEY4X1BPV0VSU0hFTExfUFJFRklYID1cbiAgJyRPdXRwdXRFbmNvZGluZz1bQ29uc29sZV06Ok91dHB1dEVuY29kaW5nPVtUZXh0LkVuY29kaW5nXTo6VVRGODsnO1xuXG5leHBvcnQgY29uc3QgZXhlY0ZpbGUgPSAoXG4gIGZpbGU6IHN0cmluZyxcbiAgYXJnczogc3RyaW5nW10sXG4gIG9wdGlvbnM/OiBSZW5kZXJlckV4ZWNGaWxlT3B0aW9ucyxcbik6IFByb21pc2U8e2Vycm9yOiBFeGVjRXhjZXB0aW9uIHwgbnVsbDsgc3RkZXJyOiBzdHJpbmc7IHN0ZG91dDogc3RyaW5nfT4gPT4ge1xuICBpZiAob3B0aW9ucyAmJiAnc2hlbGwnIGluIG9wdGlvbnMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSByZW5kZXJlciBleGVjRmlsZSBicmlkZ2UgZG9lcyBub3QgYWxsb3cgc2hlbGwgbW9kZScpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgIGV4ZWNGaWxlTm9kZShmaWxlLCBhcmdzLCBvcHRpb25zID8/IHt9LCAoZXJyLCBzdGRvdXQsIHN0ZGVycikgPT4ge1xuICAgICAgcmVzb2x2ZSh7XG4gICAgICAgIGVycm9yOiBlcnIgYXMgRXhlY0V4Y2VwdGlvbiB8IG51bGwsXG4gICAgICAgIHN0ZGVycjogc3RkZXJyLnRvU3RyaW5nKCksXG4gICAgICAgIHN0ZG91dDogc3Rkb3V0LnRvU3RyaW5nKCksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG5jb25zdCBjaGlsZFByb2Nlc3MgPSB7XG4gIGV4ZWNGaWxlLFxuICBwb3dlcnNoZWxsOiAoXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiB7ZW52PzogTm9kZUpTLlByb2Nlc3NFbnY7IHNraXBVVEY4RW5jb2Rpbmc/OiBib29sZWFufSxcbiAgKSA9PiB7XG4gICAgY29uc3QgZnVsbENvbW1hbmQgPSBvcHRpb25zPy5za2lwVVRGOEVuY29kaW5nXG4gICAgICA/IGNvbW1hbmRcbiAgICAgIDogYCR7VVRGOF9QT1dFUlNIRUxMX1BSRUZJWH0ke2NvbW1hbmR9YDtcbiAgICByZXR1cm4gZXhlY0ZpbGUoJ3Bvd2Vyc2hlbGwnLCBbJy1Ob1Byb2ZpbGUnLCAnLUNvbW1hbmQnLCBmdWxsQ29tbWFuZF0sIHtcbiAgICAgIGVudjogey4uLnByb2Nlc3MuZW52LCAuLi5vcHRpb25zPy5lbnZ9LFxuICAgIH0pO1xuICB9LFxuICBzcGF3bixcbn07XG5cbmV4cG9ydCB7Y2hpbGRQcm9jZXNzfTtcbiIsImltcG9ydCB7Y3JlYXRlVmVyaWZ5LCByYW5kb21VVUlEfSBmcm9tICdjcnlwdG8nO1xuXG5jb25zdCB2ZXJpZnlTaWduYXR1cmUgPSAoXG4gIHN0cmluZ1RvU2lnbjogc3RyaW5nLFxuICBwdWJsaWNLZXk6IHN0cmluZyxcbiAgc2lnbmF0dXJlOiBzdHJpbmcsXG4pOiBib29sZWFuID0+IHtcbiAgY29uc3QgYnVmZmVyZWRTdHJpbmcgPSBCdWZmZXIuZnJvbShzdHJpbmdUb1NpZ24pO1xuICBjb25zdCB2ZXJpZmllciA9IGNyZWF0ZVZlcmlmeSgnU0hBMjU2Jyk7XG4gIHZlcmlmaWVyLnVwZGF0ZShidWZmZXJlZFN0cmluZy50b1N0cmluZygpKTtcblxuICByZXR1cm4gdmVyaWZpZXIudmVyaWZ5KHB1YmxpY0tleSwgc2lnbmF0dXJlLCAnYmFzZTY0Jyk7XG59O1xuXG5jb25zdCBub2RlQ3J5cHRvID0ge3ZlcmlmeVNpZ25hdHVyZSwgcmFuZG9tVVVJRH07XG5cbmV4cG9ydCB7bm9kZUNyeXB0b307XG4iLCJpbXBvcnQge1xuICBhY2Nlc3MsXG4gIGNsb3NlLFxuICBjb3B5RmlsZVN5bmMsXG4gIGNyZWF0ZVdyaXRlU3RyZWFtLFxuICBleGlzdHNTeW5jLFxuICBsc3RhdFN5bmMsXG4gIG1rZGlyU3luYyxcbiAgb3BlbixcbiAgcmVhZCxcbiAgcmVhZGRpcixcbiAgcmVhZGRpclN5bmMsXG4gIHJlYWRGaWxlU3luYyxcbiAgcmVhbHBhdGhTeW5jLFxuICByZW5hbWVTeW5jLFxuICBybVN5bmMsXG4gIHN0YXRTeW5jLFxuICBzeW1saW5rU3luYyxcbiAgdW5saW5rU3luYyxcbiAgd3JpdGVGaWxlU3luYyxcbn0gZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGgsIHtkaXJuYW1lfSBmcm9tICdwYXRoJztcblxuY29uc3QgaXNGaWxlID0gKGZpbGVQYXRoOiBzdHJpbmcpID0+IHtcbiAgY29uc3Qgc3RhdHMgPSBzdGF0U3luYyhmaWxlUGF0aCk7XG5cbiAgcmV0dXJuIHN0YXRzLmlzRmlsZSgpO1xufTtcblxuY29uc3QgZ2V0TWltZVR5cGUgPSAoZXh0OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBzd2l0Y2ggKGV4dC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnLmdpZic6XG4gICAgICByZXR1cm4gJ2ltYWdlL2dpZic7XG4gICAgY2FzZSAnLmpwZWcnOlxuICAgIGNhc2UgJy5qcGcnOlxuICAgICAgcmV0dXJuICdpbWFnZS9qcGVnJztcbiAgICBjYXNlICcubW92JzpcbiAgICAgIHJldHVybiAndmlkZW8vcXVpY2t0aW1lJztcbiAgICBjYXNlICcubXA0JzpcbiAgICAgIHJldHVybiAndmlkZW8vbXA0JztcbiAgICBjYXNlICcucG5nJzpcbiAgICAgIHJldHVybiAnaW1hZ2UvcG5nJztcbiAgICBjYXNlICcuc3ZnJzpcbiAgICAgIHJldHVybiAnaW1hZ2Uvc3ZnK3htbCc7XG4gICAgY2FzZSAnLndlYnAnOlxuICAgICAgcmV0dXJuICdpbWFnZS93ZWJwJztcbiAgICAvLyBBZGQgbW9yZSBNSU1FIHR5cGVzIGFzIG5lZWRlZFxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7IC8vIERlZmF1bHQgYmluYXJ5IHR5cGVcbiAgfVxufTtcblxuY29uc3QgZ2V0UGF0aEFzRGF0YVVybCA9IChmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBmaWxlQnVmZmVyID0gcmVhZEZpbGVTeW5jKGZpbGVQYXRoKTtcbiAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpO1xuICAgIGNvbnN0IG1pbWVUeXBlID0gZ2V0TWltZVR5cGUoZXh0KTtcbiAgICBjb25zdCBiYXNlNjREYXRhID0gZmlsZUJ1ZmZlci50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgcmV0dXJuIGBkYXRhOiR7bWltZVR5cGV9O2Jhc2U2NCwke2Jhc2U2NERhdGF9YDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgYFtQcmVsb2FkIGZzXSBFcnJvciBnZW5lcmF0aW5nIGRhdGEgVVJMIGZvciAke2ZpbGVQYXRofTpgLFxuICAgICAgZXJyb3IsXG4gICAgKTtcbiAgICAvLyBPcHRpb25hbGx5IHJlLXRocm93IG9yIHJldHVybiBhIHNwZWNpZmljIGVycm9yIHN0cmluZy9udWxsXG4gICAgdGhyb3cgZXJyb3I7IC8vIFJlLXRocm93aW5nIGZvciBub3csIGNhbiBiZSBhZGp1c3RlZCBiYXNlZCBvbiByZXF1aXJlbWVudHNcbiAgfVxufTtcblxuZXhwb3J0IHR5cGUgTG9nU3RyZWFtSGFuZGxlID0ge1xuICB3YWl0Rm9yRHJhaW46ICgpID0+IFByb21pc2U8dm9pZD47XG4gIHdyaXRlOiAoZGF0YTogc3RyaW5nIHwgVWludDhBcnJheSkgPT4gdm9pZDtcbn07XG5cbmNvbnN0IGNyZWF0ZUxvZ1N0cmVhbSA9IChmaWxlUGF0aDogc3RyaW5nKTogTG9nU3RyZWFtSGFuZGxlID0+IHtcbiAgY29uc3QgZGlyID0gZGlybmFtZShmaWxlUGF0aCk7XG4gIGlmICghZXhpc3RzU3luYyhkaXIpKSBta2RpclN5bmMoZGlyLCB7cmVjdXJzaXZlOiB0cnVlfSk7XG4gIGNvbnN0IHN0cmVhbSA9IGNyZWF0ZVdyaXRlU3RyZWFtKGZpbGVQYXRoLCB7ZmxhZ3M6ICd3Kyd9KTtcbiAgLy8gQSBmYWlsZWQgd3JpdGUgKGUuZy4gRU5PU1BDKSBpcyBlbWl0dGVkIGhlcmU7IHdpdGggbm8gbGlzdGVuZXIgaXQgaXMgYW5cbiAgLy8gdW5jYXVnaHQgZXhjZXB0aW9uLiBEcm9wIGl0OiBzdGF5aW5nIGFsaXZlIGJlYXRzIHRoZSBsb2cgbGluZS4gVGhlIHVwZGF0ZXIsXG4gIC8vIHdoaWNoIGFsc28gd3JpdGVzIHRocm91Z2ggdGhpcywgY2hlY2tzIHRoZSBwZXJzaXN0ZWQgc2l6ZSBpdHNlbGYuXG4gIHN0cmVhbS5vbignZXJyb3InLCAoKSA9PiB7fSk7XG4gIHJldHVybiB7XG4gICAgd2FpdEZvckRyYWluOiAoKSA9PlxuICAgICAgbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiB7XG4gICAgICAgIHN0cmVhbS53cml0ZSgnJywgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICAgIH0pLFxuICAgIHdyaXRlOiAoZGF0YTogc3RyaW5nIHwgVWludDhBcnJheSkgPT4ge1xuICAgICAgc3RyZWFtLndyaXRlKGRhdGEpO1xuICAgIH0sXG4gIH07XG59O1xuXG5jb25zdCBmcyA9IHtcbiAgYWNjZXNzLFxuICBCdWZmZXIsXG4gIGNsb3NlLFxuICBjb3B5RmlsZVN5bmMsXG4gIGNyZWF0ZUxvZ1N0cmVhbSxcbiAgZXhpc3RzU3luYyxcbiAgZ2V0UGF0aEFzRGF0YVVybCxcbiAgaXNGaWxlLFxuICBsc3RhdFN5bmMsXG4gIG1rZGlyU3luYyxcbiAgb3BlbixcbiAgcmVhZCxcbiAgcmVhZGRpcixcbiAgcmVhZGRpclN5bmMsXG4gIHJlYWRGaWxlU3luYyxcbiAgcmVhbHBhdGhTeW5jLFxuICByZW5hbWVTeW5jLFxuICBybVN5bmMsXG4gIHN0YXRTeW5jLFxuICBzeW1saW5rU3luYyxcbiAgdW5saW5rU3luYyxcbiAgd3JpdGVGaWxlU3luYyxcbn07XG5cbmV4cG9ydCB7ZnN9O1xuIiwiaW1wb3J0IHtpcGNSZW5kZXJlcn0gZnJvbSAnZWxlY3Ryb24nO1xuXG50eXBlIFByZWxvYWROZXR3b3JrRXJyb3JQYXlsb2FkID0ge1xuICBlcnJvcjogdW5rbm93bjtcbiAgc3RhY2s6ICdwcmVsb2FkLWdvdCc7XG4gIHVybDogc3RyaW5nO1xufTtcblxuY29uc3Qgc2VyaWFsaXplRXJyb3IgPSAoZXJyb3I6IHVua25vd24pOiB1bmtub3duID0+IHtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2F1c2U6IHNlcmlhbGl6ZUVycm9yKGVycm9yLmNhdXNlKSxcbiAgICAgIGNvZGU6IChlcnJvciBhcyBOb2RlSlMuRXJybm9FeGNlcHRpb24pLmNvZGUsXG4gICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgbmFtZTogZXJyb3IubmFtZSxcbiAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICB9O1xuICB9XG4gIHJldHVybiBlcnJvcjtcbn07XG5cbmV4cG9ydCBjb25zdCBsb2dQcmVsb2FkTmV0d29ya0Vycm9yID0gKFxuICBlcnJvcjogdW5rbm93bixcbiAgdXJsOiBzdHJpbmcsXG4pOiB2b2lkID0+IHtcbiAgY29uc3QgcGF5bG9hZDogUHJlbG9hZE5ldHdvcmtFcnJvclBheWxvYWQgPSB7XG4gICAgZXJyb3I6IHNlcmlhbGl6ZUVycm9yKGVycm9yKSxcbiAgICBzdGFjazogJ3ByZWxvYWQtZ290JyxcbiAgICB1cmwsXG4gIH07XG4gIGlwY1JlbmRlcmVyLnNlbmQoJ2VsZWN0cm9uOmxvZ05ldHdvcmtFcnJvcicsIHBheWxvYWQpO1xufTtcbiIsImltcG9ydCB7aXBjUmVuZGVyZXJ9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCBnb3QgZnJvbSAnZ290JztcblxuaW1wb3J0IHtsb2dQcmVsb2FkTmV0d29ya0Vycm9yfSBmcm9tICcuL3Rsc0Vycm9yLm5vZGUnO1xuXG5jb25zdCBodHRwcyA9IHtcbiAgcmVkaXJlY3RUb0Zyb250OiAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1JlZGlyZWN0aW5nIHRvIGZyb250Jyk7XG4gICAgaXBjUmVuZGVyZXIuc2VuZCgnZWxlY3Ryb246cmVkaXJlY3RUb0Zyb250Jyk7XG4gICAgY29uc29sZS5sb2coJ1JlZGlyZWN0ZWQgdG8gZnJvbnQnKTtcbiAgfSxcbiAgcGluZ0Zyb250OiAoKSA9PiB7XG4gICAgY29uc3QgW2lzUmVhZHksIHN0ZXAsIGFwcFVVSUQsIHN0YXJ0dXBOZXR3b3JrU3RhdGVdID0gaXBjUmVuZGVyZXIuc2VuZFN5bmMoXG4gICAgICAnZWxlY3Ryb246aXNSZWFkeScsXG4gICAgKSBhcyBbXG4gICAgICBib29sZWFuLFxuICAgICAgc3RyaW5nLFxuICAgICAgc3RyaW5nLFxuICAgICAgJ2NoZWNraW5nJyB8ICdvZmZsaW5lJyB8ICdyZWFkeScgfCAndW5yZWFjaGFibGUnLFxuICAgIF07XG4gICAgaWYgKCFpc1JlYWR5KSB7XG4gICAgICBjb25zb2xlLmxvZygnTm90IHJlYWR5LCB3YWl0aW5nIGZvciByZWFkeSBldmVudCcpO1xuICAgICAgY29uc3QgaXNDb25uZWN0aXZpdHlCbG9ja2VkID1cbiAgICAgICAgc3RhcnR1cE5ldHdvcmtTdGF0ZSA9PT0gJ29mZmxpbmUnIHx8XG4gICAgICAgIHN0YXJ0dXBOZXR3b3JrU3RhdGUgPT09ICd1bnJlYWNoYWJsZSc7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtcbiAgICAgICAgaXNDb25uZWN0aXZpdHlCbG9ja2VkID8gZmFsc2UgOiBudWxsLFxuICAgICAgICBudWxsLFxuICAgICAgICBzdGVwLFxuICAgICAgICBhcHBVVUlELFxuICAgICAgXSk7XG4gICAgfVxuXG4gICAgY29uc3Qge0ZST05UX1VSTDogdXJsfSA9IGlwY1JlbmRlcmVyLnNlbmRTeW5jKFxuICAgICAgJ2VsZWN0cm9uOmdldFNoYXJlZFZhcmlhYmxlcycsXG4gICAgKSBhcyB7XG4gICAgICBGUk9OVF9VUkw6IHN0cmluZztcbiAgICB9O1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyByZXNvbHZlID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGdvdC5nZXQodXJsKTtcbiAgICAgICAgY29uc3QgY29kZSA9IHJlcy5zdGF0dXNDb2RlIHx8IDA7XG4gICAgICAgIGlmIChjb2RlID49IDIwMCAmJiBjb2RlIDwgMzAwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCgke3VybH0pIFNlcnZpY2Ugb25saW5lLmApO1xuICAgICAgICAgIHJlc29sdmUoW3RydWUsIHVybF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGAoJHt1cmx9KSBTZXJ2aWNlIG9mZmxpbmUuICgke2NvZGV9KWApO1xuICAgICAgICAgIHJlc29sdmUoW2ZhbHNlLCBudWxsXSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nUHJlbG9hZE5ldHdvcmtFcnJvcihlLCB1cmwpO1xuICAgICAgICBjb25zb2xlLmxvZyhgKCR7dXJsfSkgU2VydmljZSBvZmZsaW5lLmAsIGUpO1xuICAgICAgICByZXNvbHZlKFtmYWxzZSwgbnVsbF0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxufTtcblxuZXhwb3J0IHtodHRwc307XG4iLCJpbXBvcnQge2Jhc2VuYW1lLCBkaXJuYW1lLCBleHRuYW1lLCBqb2luLCBwb3NpeH0gZnJvbSAncGF0aCc7XG5cbmNvbnN0IHBhdGggPSB7XG4gIGJhc2VuYW1lLFxuICBkaXJuYW1lLFxuICBleHRuYW1lLFxuICBqb2luLFxuICBqb2luVXJsOiAoYmFzZTogc3RyaW5nLCAuLi5hcmdzOiBzdHJpbmdbXSkgPT4ge1xuICAgIC8vIFRvIG1hbmFnZSBjYXNlIHdoZXJlIGJhc2UgY29udGFpbiBwYXRoIHNlZ21lbnRzIGxpa2UgaHR0cHM6Ly9leGFtcGxlLmNvbS9wYXRoL3RvLyB3ZSB1c2UgYSBmaXJzdCBVUkwgb2JqZWN0IHRvIHNlcGFyYXRlIG9yaWdpbiBmcm9tIHBhdGhcbiAgICBjb25zdCBiYXNlVXJsID0gbmV3IFVSTChiYXNlKTtcbiAgICByZXR1cm4gbmV3IFVSTChqb2luKGJhc2VVcmwucGF0aG5hbWUsIC4uLmFyZ3MpLCBiYXNlVXJsLm9yaWdpbikuaHJlZjtcbiAgfSxcbiAgLy8gT25seSBqb2luIGlzIHVzZWQsIGFuZCBuYW1pbmcgdGhlIGZ1bGwgYHBvc2l4YCB0eXBlIHRpZXMgdGhlIGdlbmVyYXRlZFxuICAvLyBmcm9udCBkZWNsYXJhdGlvbiB0byBvbmUgQHR5cGVzL25vZGUgbWFqb3IgKDI1IGRyb3BwZWQgUGxhdGZvcm1QYXRoKS5cbiAgcG9zaXg6IHtqb2luOiAoLi4ucGF0aHM6IHN0cmluZ1tdKSA9PiBwb3NpeC5qb2luKC4uLnBhdGhzKX0sXG59O1xuXG5leHBvcnQge3BhdGh9O1xuIiwiaW1wb3J0IHR5cGUge0V4ZWNFeGNlcHRpb259IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5pbXBvcnQge2lwY1JlbmRlcmVyfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQge2V4aXN0c1N5bmMsIG1rZGlyU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3VuemlwU3luY30gZnJvbSAnZmZsYXRlJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQge2Rpcm5hbWUsIGpvaW4sIHdpbjMyfSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtleGVjRmlsZX0gZnJvbSAnLi9ub2RlL2NoaWxkUHJvY2Vzcy5ub2RlJztcblxuLy8gV2luZG93cyAxMCsgc2hpcHMgYnNkdGFyIHVuZGVyICVTeXN0ZW1Sb290JVxcU3lzdGVtMzIgYW5kIG5vcm1hbGx5IGV4cG9zZXMgaXQgb24gUEFUSCBhcyBgdGFyYC5cbmNvbnN0IFdJTkRPV1NfREVGQVVMVF9UQVIgPSAndGFyJztcblxuY29uc3QgZ2V0V2luZG93c0RlZmF1bHRUYXJQYXRoID0gKCk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG4gIGNvbnN0IHN5c3RlbVJvb3RQYXRoID0gcHJvY2Vzcy5lbnYuU3lzdGVtUm9vdDtcbiAgaWYgKHR5cGVvZiBzeXN0ZW1Sb290UGF0aCAhPT0gJ3N0cmluZycgfHwgc3lzdGVtUm9vdFBhdGgudHJpbSgpID09PSAnJykge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHdpbjMyLmpvaW4oc3lzdGVtUm9vdFBhdGgsICdTeXN0ZW0zMicsICd0YXIuZXhlJyk7XG59O1xuXG5leHBvcnQgY29uc3QgaXNXaW5kb3dzID0gb3MucGxhdGZvcm0oKSA9PT0gJ3dpbjMyJztcblxuZXhwb3J0IGNvbnN0IHBhcnNlVG9wTGV2ZWxFbnRyaWVzID0gKGxpc3RTdGRvdXQ6IHN0cmluZyk6IHN0cmluZ1tdID0+XG4gIEFycmF5LmZyb20oXG4gICAgbmV3IFNldChcbiAgICAgIGxpc3RTdGRvdXRcbiAgICAgICAgLnNwbGl0KC9cXHI/XFxuLylcbiAgICAgICAgLm1hcChsaW5lID0+IGxpbmUudHJpbSgpKVxuICAgICAgICAuZmlsdGVyKGxpbmUgPT4gbGluZS5sZW5ndGggPiAwKVxuICAgICAgICAubWFwKGxpbmUgPT4gbGluZS5zcGxpdCgnLycpWzBdKVxuICAgICAgICAuZmlsdGVyKHNlZ21lbnQgPT4gc2VnbWVudC5sZW5ndGggPiAwKSxcbiAgICApLFxuICApO1xuXG5jb25zdCBmb3JtYXRFeGVjRmFpbHVyZSA9IChcbiAgbGFiZWw6IHN0cmluZyxcbiAgc3RkZXJyOiBzdHJpbmcsXG4gIGVycm9yOiBFeGVjRXhjZXB0aW9uLFxuKTogc3RyaW5nID0+XG4gIGAke2xhYmVsfSBmYWlsZWQgKGV4aXQgJHtlcnJvci5jb2RlID8/ICd1bmtub3duJ30pOiAke1xuICAgIHN0ZGVyciB8fCBlcnJvci5tZXNzYWdlIHx8ICdubyBlcnJvciBvdXRwdXQnXG4gIH1gO1xuXG5jb25zdCBnZXRXaW5kb3dzVGFyQ2FuZGlkYXRlcyA9ICgpOiBzdHJpbmdbXSA9PiB7XG4gIGNvbnN0IHtUQVJfUEFUSH0gPSBpcGNSZW5kZXJlci5zZW5kU3luYygnZWxlY3Ryb246Z2V0U2hhcmVkVmFyaWFibGVzJyk7XG4gIGNvbnN0IGNhbmRpZGF0ZXM6IHN0cmluZ1tdID0gW107XG4gIGlmICh0eXBlb2YgVEFSX1BBVEggPT09ICdzdHJpbmcnICYmIFRBUl9QQVRIICE9PSAnJyAmJiBleGlzdHNTeW5jKFRBUl9QQVRIKSkge1xuICAgIGNhbmRpZGF0ZXMucHVzaChUQVJfUEFUSCk7XG4gIH1cbiAgY2FuZGlkYXRlcy5wdXNoKFdJTkRPV1NfREVGQVVMVF9UQVIpO1xuICBjb25zdCB3aW5kb3dzRGVmYXVsdFRhclBhdGggPSBnZXRXaW5kb3dzRGVmYXVsdFRhclBhdGgoKTtcbiAgaWYgKHdpbmRvd3NEZWZhdWx0VGFyUGF0aCkge1xuICAgIGNhbmRpZGF0ZXMucHVzaCh3aW5kb3dzRGVmYXVsdFRhclBhdGgpO1xuICB9XG4gIHJldHVybiBjYW5kaWRhdGVzO1xufTtcblxuLy8gUnVucyBhIHRhciBzdWItY29tbWFuZCwgZmFsbGluZyBiYWNrIHRvIHRoZSBPUy1kZWZhdWx0IHRhciB3aGVuIHRoZVxuLy8gQXV0b0N1dC1pbnN0YWxsZWQgYmluYXJ5IGlzIG1pc3NpbmcsIGVtcHR5LCBvciBmYWlscyB0byBleGVjdXRlLlxuZXhwb3J0IGNvbnN0IHJ1bldpbmRvd3NUYXIgPSBhc3luYyAoXG4gIHRhckFyZ3M6IHN0cmluZ1tdLFxuICBsYWJlbDogc3RyaW5nLFxuKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgY29uc3QgY2FuZGlkYXRlcyA9IGdldFdpbmRvd3NUYXJDYW5kaWRhdGVzKCk7XG4gIGNvbnN0IGZhaWx1cmVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgdGFyQmluYXJ5IG9mIGNhbmRpZGF0ZXMpIHtcbiAgICBjb25zb2xlLmxvZygnUnVubmluZycsIHRhckJpbmFyeSwgdGFyQXJncy5qb2luKCcgJykpO1xuICAgIGNvbnN0IHtzdGRvdXQsIHN0ZGVyciwgZXJyb3J9ID0gYXdhaXQgZXhlY0ZpbGUodGFyQmluYXJ5LCB0YXJBcmdzKTtcbiAgICBpZiAoZXJyb3IgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBzdGRvdXQ7XG4gICAgfVxuICAgIGZhaWx1cmVzLnB1c2goZm9ybWF0RXhlY0ZhaWx1cmUoYHRhciBcIiR7dGFyQmluYXJ5fVwiYCwgc3RkZXJyLCBlcnJvcikpO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgIGAke2xhYmVsfSBmYWlsZWQgZm9yIGFsbCB0YXIgY2FuZGlkYXRlczogXCIke2ZhaWx1cmVzLmpvaW4oJ1wiIHwgXCInKX1cImAsXG4gICk7XG59O1xuXG5leHBvcnQgY29uc3QgcnVuVW56aXAgPSBhc3luYyAoXG4gIGJpbjogc3RyaW5nLFxuICBhcmdzOiBzdHJpbmdbXSxcbiAgbGFiZWw6IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gIGNvbnNvbGUubG9nKCdSdW5uaW5nJywgYmluLCBhcmdzLmpvaW4oJyAnKSk7XG4gIGNvbnN0IHtzdGRvdXQsIHN0ZGVyciwgZXJyb3J9ID0gYXdhaXQgZXhlY0ZpbGUoYmluLCBhcmdzKTtcbiAgaWYgKGVycm9yICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdEV4ZWNGYWlsdXJlKGxhYmVsLCBzdGRlcnIsIGVycm9yKSk7XG4gIH1cbiAgcmV0dXJuIHN0ZG91dDtcbn07XG5cbi8vIFB1cmUtSlMgZXh0cmFjdGlvbiB1c2VkIGFzIGEgbGFzdCByZXNvcnQgd2hlbiBubyBzeXN0ZW0gdGFyIGJpbmFyeSB3b3Jrcy5cbi8vIEhhbmRsZXMgb25seSAuemlwIGFyY2hpdmVzICh0aGUgZm9ybWF0IEF1dG9DdXQgcmVzb3VyY2VzIHNoaXAgYXMpLlxuZXhwb3J0IGNvbnN0IGV4dHJhY3RaaXBXaXRoRmZsYXRlID0gKFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICB1bnppcFBhdGg6IHN0cmluZyxcbik6IHN0cmluZ1tdID0+IHtcbiAgY29uc3QgYXJjaGl2ZSA9IHVuemlwU3luYyhyZWFkRmlsZVN5bmMoZmlsZVBhdGgpKTtcbiAgY29uc3QgdG9wTGV2ZWxFbnRyaWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgZm9yIChjb25zdCBbZW50cnlQYXRoLCBjb250ZW50XSBvZiBPYmplY3QuZW50cmllcyhhcmNoaXZlKSkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gZW50cnlQYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICBjb25zdCB0b3BTZWdtZW50ID0gbm9ybWFsaXplZFBhdGguc3BsaXQoJy8nKVswXTtcbiAgICBpZiAodG9wU2VnbWVudC5sZW5ndGggPiAwKSB7XG4gICAgICB0b3BMZXZlbEVudHJpZXMuYWRkKHRvcFNlZ21lbnQpO1xuICAgIH1cblxuICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gam9pbih1bnppcFBhdGgsIG5vcm1hbGl6ZWRQYXRoKTtcbiAgICAvLyBEaXJlY3RvcnkgZW50cmllcyBlbmQgd2l0aCAnLycgYW5kIGNhcnJ5IG5vIGRhdGEuXG4gICAgaWYgKG5vcm1hbGl6ZWRQYXRoLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgIG1rZGlyU3luYyhkZXN0aW5hdGlvbiwge3JlY3Vyc2l2ZTogdHJ1ZX0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgbWtkaXJTeW5jKGRpcm5hbWUoZGVzdGluYXRpb24pLCB7cmVjdXJzaXZlOiB0cnVlfSk7XG4gICAgd3JpdGVGaWxlU3luYyhkZXN0aW5hdGlvbiwgY29udGVudCk7XG4gIH1cblxuICByZXR1cm4gQXJyYXkuZnJvbSh0b3BMZXZlbEVudHJpZXMpO1xufTtcbiIsImltcG9ydCB7aXBjUmVuZGVyZXJ9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7ZXhpc3RzU3luYywgbWtkaXJTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge1xuICBleHRyYWN0WmlwV2l0aEZmbGF0ZSxcbiAgaXNXaW5kb3dzLFxuICBwYXJzZVRvcExldmVsRW50cmllcyxcbiAgcnVuVW56aXAsXG4gIHJ1bldpbmRvd3NUYXIsXG59IGZyb20gJy4vdW56aXAudXRpbHMnO1xuXG5jb25zdCB1bnppcE9uV2luZG93cyA9IGFzeW5jIChcbiAgZmlsZVBhdGg6IHN0cmluZyxcbiAgdW56aXBQYXRoOiBzdHJpbmcsXG4pOiBQcm9taXNlPHN0cmluZ1tdPiA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgbGlzdFN0ZG91dCA9IGF3YWl0IHJ1bldpbmRvd3NUYXIoWyctdGYnLCBmaWxlUGF0aF0sICd0YXIgbGlzdCcpO1xuICAgIGNvbnN0IHRvcExldmVsRW50cmllcyA9IHBhcnNlVG9wTGV2ZWxFbnRyaWVzKGxpc3RTdGRvdXQpO1xuICAgIGF3YWl0IHJ1bldpbmRvd3NUYXIoWycteHZmJywgZmlsZVBhdGgsICctQycsIHVuemlwUGF0aF0sICd0YXIgZXh0cmFjdCcpO1xuICAgIHJldHVybiB0b3BMZXZlbEVudHJpZXMubWFwKGVudHJ5ID0+IGpvaW4odW56aXBQYXRoLCBlbnRyeSkpO1xuICB9IGNhdGNoICh0YXJFcnJvcikge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgICd0YXIgZXh0cmFjdGlvbiBmYWlsZWQsIGZhbGxpbmcgYmFjayB0byBmZmxhdGUnLFxuICAgICAgYCR7dGFyRXJyb3J9YCxcbiAgICApO1xuICAgIGNvbnN0IHRvcExldmVsRW50cmllcyA9IGV4dHJhY3RaaXBXaXRoRmZsYXRlKGZpbGVQYXRoLCB1bnppcFBhdGgpO1xuICAgIHJldHVybiB0b3BMZXZlbEVudHJpZXMubWFwKGVudHJ5ID0+IGpvaW4odW56aXBQYXRoLCBlbnRyeSkpO1xuICB9XG59O1xuXG5jb25zdCByZXNvdXJjZXMgPSB7XG4gIGRvd25sb2FkOiBhc3luYyAoXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IHtcbiAgICAgIG91dHB1dERpcj86IHN0cmluZztcbiAgICAgIHJlcXVpcmVIdHRwcz86IGJvb2xlYW47XG4gICAgfSxcbiAgKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ0dldHRpbmcgdGVtcFBhdGgnKTtcbiAgICBjb25zdCB0ZW1wUGF0aCA9IGlwY1JlbmRlcmVyLnNlbmRTeW5jKCdlbGVjdHJvbjpnZXRQYXRoJywge25hbWU6ICd0ZW1wJ30pO1xuICAgIGNvbnNvbGUubG9nKCdHb3QgdGVtcFBhdGgnLCB0ZW1wUGF0aCk7XG4gICAgY29uc3QgZG93bmxvYWRQYXRoID0gb3B0aW9ucz8ub3V0cHV0RGlyIHx8IHRlbXBQYXRoO1xuICAgIGNvbnNvbGUubG9nKGBEb3dubG9kaW5nIGZyb20gJHt1cmx9IHRvICR7ZG93bmxvYWRQYXRofWApO1xuXG4gICAgaWYgKCFleGlzdHNTeW5jKGRvd25sb2FkUGF0aCkpIHtcbiAgICAgIG1rZGlyU3luYyhkb3dubG9hZFBhdGgsIHtyZWN1cnNpdmU6IHRydWV9KTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBhd2FpdCBpcGNSZW5kZXJlci5zZW5kU3luYyhcbiAgICAgICAgJ2VsZWN0cm9uOmRvd25sb2FkJyxcbiAgICAgICAgdXJsLFxuICAgICAgICBkb3dubG9hZFBhdGgsXG4gICAgICAgIHtyZXF1aXJlSHR0cHM6IG9wdGlvbnM/LnJlcXVpcmVIdHRwc30sXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coYERvd25sb2FkZWQgJHt1cmx9IHRvICR7ZG93bmxvYWRQYXRofWApO1xuXG4gICAgICByZXR1cm4gZmlsZVBhdGg7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGRvd25sb2FkaW5nICR7dXJsfSB0byAke2Rvd25sb2FkUGF0aH1gLCBlcnIpO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfSxcbiAgcHJlcGFyZVBwcm9Kc3g6ICh1cmw6IHN0cmluZykgPT5cbiAgICBpcGNSZW5kZXJlci5pbnZva2UoJ2VsZWN0cm9uOnByZXBhcmVQcHJvSnN4JywgdXJsKSBhcyBQcm9taXNlPHZvaWQ+LFxuICB1bnppcDogYXN5bmMgKGZpbGVQYXRoOiBzdHJpbmcsIHVuemlwUGF0aD86IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+ID0+IHtcbiAgICBpZiAodW56aXBQYXRoID09PSB1bmRlZmluZWQgfHwgdW56aXBQYXRoID09PSAnJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnppcDogdW56aXBQYXRoIGlzIHJlcXVpcmVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFleGlzdHNTeW5jKHVuemlwUGF0aCkpIHtcbiAgICAgIG1rZGlyU3luYyh1bnppcFBhdGgsIHtyZWN1cnNpdmU6IHRydWV9KTtcbiAgICB9XG5cbiAgICBpZiAoaXNXaW5kb3dzKSB7XG4gICAgICByZXR1cm4gYXdhaXQgdW56aXBPbldpbmRvd3MoZmlsZVBhdGgsIHVuemlwUGF0aCk7XG4gICAgfVxuXG4gICAgY29uc3QgbGlzdFN0ZG91dCA9IGF3YWl0IHJ1blVuemlwKCd1bnppcCcsIFsnLVoxJywgZmlsZVBhdGhdLCAndW56aXAgbGlzdCcpO1xuICAgIGNvbnN0IHRvcExldmVsRW50cmllcyA9IHBhcnNlVG9wTGV2ZWxFbnRyaWVzKGxpc3RTdGRvdXQpO1xuICAgIGF3YWl0IHJ1blVuemlwKFxuICAgICAgJ3VuemlwJyxcbiAgICAgIFsnLW8nLCBmaWxlUGF0aCwgJy1kJywgdW56aXBQYXRoXSxcbiAgICAgICd1bnppcCBleHRyYWN0JyxcbiAgICApO1xuXG4gICAgcmV0dXJuIHRvcExldmVsRW50cmllcy5tYXAoZW50cnkgPT4gam9pbih1bnppcFBhdGgsIGVudHJ5KSk7XG4gIH0sXG59O1xuXG5leHBvcnQge3Jlc291cmNlc307XG4iLCJpbXBvcnQge29zfSBmcm9tICdAL25vZGUvb3Mubm9kZSc7XG5pbXBvcnQge2lwY1JlbmRlcmVyfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQge2V4aXN0c1N5bmMsIHN0YXRTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuXG5jb25zdCBmZm1wZWdTZXR1cCA9IHtcbiAgZ2V0RkZNUEVHUGF0aDogKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdMb29raW5nIGZvciBGRk1QRUcnKTtcbiAgICBjb25zdCBwYXRoID0gam9pbihcbiAgICAgIGlwY1JlbmRlcmVyLnNlbmRTeW5jKCdlbGVjdHJvbjpnZXRQYXRoJywge25hbWU6ICd1c2VyRGF0YSd9KSxcbiAgICAgICdmZm1wZWcnLFxuICAgICk7XG5cbiAgICBjb25zdCBmZm1wZWdQYXRoID0gam9pbihcbiAgICAgIHBhdGgsXG4gICAgICBvcy5wbGF0Zm9ybSgpID09PSAnZGFyd2luJyA/ICdmZm1wZWcnIDogJ2ZmbXBlZy5leGUnLFxuICAgICk7XG4gICAgY29uc3QgZmZwcm9iZVBhdGggPSBqb2luKFxuICAgICAgcGF0aCxcbiAgICAgIG9zLnBsYXRmb3JtKCkgPT09ICdkYXJ3aW4nID8gJ2ZmcHJvYmUnIDogJ2ZmcHJvYmUuZXhlJyxcbiAgICApO1xuXG4gICAgaWYgKGV4aXN0c1N5bmMocGF0aCkgJiYgZXhpc3RzU3luYyhmZm1wZWdQYXRoKSAmJiBleGlzdHNTeW5jKGZmcHJvYmVQYXRoKSkge1xuICAgICAgY29uc29sZS5sb2coJ0ZGTVBFRyBhbmQgRkZwcm9iZSBmb3VuZCBpbiBwYXRoJyk7XG5cbiAgICAgIGNvbnN0IHZlcnNpb25zOiBhbnkgPSB7XG4gICAgICAgIGRhcndpbjoge1xuICAgICAgICAgIGFybTY0OiB7ZmZtcGVnOiAxNzM3MTQwMjA3MDAwLCBmZnByb2JlOiAxNzM3MTQwMjA3MDAwfSxcbiAgICAgICAgICB4NjQ6IHtmZm1wZWc6IDE3MzcxNDM5NzUwMDAsIGZmcHJvYmU6IDE3MzcxNDM5NzUwMDB9LFxuICAgICAgICB9LFxuICAgICAgICB3aW4zMjoge1xuICAgICAgICAgIHg2NDoge2ZmbXBlZzogMTcyNzY5ODc4NjAwMCwgZmZwcm9iZTogMTcyNzY5ODc4ODAwMH0sXG4gICAgICAgICAgeDMyOiB7ZmZtcGVnOiAxNzI1MjA0ODA4MDAwLCBmZnByb2JlOiAxNzI1MjA1MDYzMDAwfSxcbiAgICAgICAgICBhcm02NDoge2ZmbXBlZzogMTc1MDMzNDc0NzAwMCwgZmZwcm9iZTogMTc1MDQwNjUyNDAwMH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBmZm1wZWdTdGF0ID0gc3RhdFN5bmMoZmZtcGVnUGF0aCk7XG4gICAgICBjb25zdCBmZnByb2JlU3RhdCA9IHN0YXRTeW5jKGZmcHJvYmVQYXRoKTtcblxuICAgICAgaWYgKFxuICAgICAgICBmZm1wZWdTdGF0Lm10aW1lTXMgPj0gdmVyc2lvbnNbb3MucGxhdGZvcm0oKV1bb3MuYXJjaCgpXS5mZm1wZWcgJiZcbiAgICAgICAgZmZwcm9iZVN0YXQubXRpbWVNcyA+PSB2ZXJzaW9uc1tvcy5wbGF0Zm9ybSgpXVtvcy5hcmNoKCldLmZmcHJvYmVcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZygnRkZNUEVHIGFuZCBGRnByb2JlIGFyZSB1cCB0byBkYXRlJyk7XG5cbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnRkZNUEVHIG9yIEZGcHJvYmUgaXMgb3V0ZGF0ZWQnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnRkZNUEVHIG9yIEZGcHJvYmUgbm90IGZvdW5kIGluIHBhdGgnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sXG4gIGRvd25sb2FkRkZNUEVHOiAoKSA9PiB7XG4gICAgcmV0dXJuIGlwY1JlbmRlcmVyLnNlbmRTeW5jKCdlbGVjdHJvbjpkb3dubG9hZEZGTVBFRycpO1xuICB9LFxufTtcblxuZXhwb3J0IHtmZm1wZWdTZXR1cH07XG4iLCJpbXBvcnQge2lwY1JlbmRlcmVyfSBmcm9tICdlbGVjdHJvbic7XG5cbmNvbnN0IHNldENvb2tpZSA9IGFzeW5jIChuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpID0+IHtcbiAgcmV0dXJuIGF3YWl0IGlwY1JlbmRlcmVyLnNlbmRTeW5jKCdjb29raWVzOnNldCcsIG5hbWUsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG59O1xuXG5jb25zdCBnZXRDb29raWUgPSBhc3luYyA8VD4obmFtZTogc3RyaW5nKTogUHJvbWlzZTxUIHwgdW5kZWZpbmVkPiA9PiB7XG4gIGNvbnN0IGNvb2tpZVZhbHVlID0gYXdhaXQgaXBjUmVuZGVyZXIuc2VuZFN5bmMoJ2Nvb2tpZXM6Z2V0JywgbmFtZSk7XG4gIGlmICghY29va2llVmFsdWUpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIEpTT04ucGFyc2UoY29va2llVmFsdWUpO1xufTtcblxuY29uc3QgZ2V0QWxsQ29va2llcyA9IGFzeW5jICgpID0+IHtcbiAgY29uc3QgYWxsQ29va2llcyA9IChhd2FpdCBpcGNSZW5kZXJlci5zZW5kU3luYygnY29va2llczpnZXRBbGwnKSkgYXMge1xuICAgIFtrZXk6IHN0cmluZ106IGFueTtcbiAgfTtcblxuICBjb25zdCBwYXJzZWRDb29raWVzOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhhbGxDb29raWVzKSkge1xuICAgIHBhcnNlZENvb2tpZXNba2V5XSA9IEpTT04ucGFyc2UodmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHBhcnNlZENvb2tpZXM7XG59O1xuXG5jb25zdCBjbGVhckFsbENvb2tpZXMgPSBhc3luYyAoKSA9PiB7XG4gIHJldHVybiBhd2FpdCBpcGNSZW5kZXJlci5zZW5kU3luYygnY29va2llczpjbGVhckFsbCcpO1xufTtcblxuZXhwb3J0IGNvbnN0IGNvb2tpZXMgPSB7XG4gIGNsZWFyQWxsOiBjbGVhckFsbENvb2tpZXMsXG4gIGdldEFsbENvb2tpZXMsXG4gIGdldENvb2tpZSxcbiAgc2V0Q29va2llLFxufTtcbiIsImltcG9ydCB7aXBjUmVuZGVyZXJ9IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IHR5cGUge0Zyb250SXBjTWVzc2FnZSwgRnJvbnRJcGNTdGF0TWVzc2FnZX0gZnJvbSAnLi4vLi4vLi4vdHlwZXMvZnJvbnRJcGMnO1xuXG5jb25zdCBDQU5DRUxfUkVRVUVTVEVEX1JPVVRFID0gJ2Zyb250LWlwYzpjYW5jZWwtcmVxdWVzdGVkJztcbmNvbnN0IFNUQVRfUk9VVEUgPSAnZnJvbnQtaXBjOnN0YXQnO1xuXG4vKipcbiAqIEJyaWRnZSB0byB0aGUgZnJvbnQgSVBDIHNlcnZlciwgd2hpY2ggbGl2ZXMgaW4gdGhlIG1haW4gcHJvY2VzcyAoc2VlXG4gKiBgcGFja2FnZXMvbWFpbi9zcmMvZnJvbnRJcGMudHNgIGZvciB3aHkgaXQgY2Fubm90IGxpdmUgaGVyZSkuXG4gKi9cbmNvbnN0IGZyb250Tm9kZUlwYyA9IHtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB1c2VyIGRpc21pc3NlZCB0aGUgYnVzeSBtb2RhbCB0aGVtc2VsdmVzLiBSZXR1cm5zIHRoZVxuICAgKiB1bnN1YnNjcmliZSBmdW5jdGlvbiDigJQgdGhlIHJlbmRlcmVyIHN1YnNjcmliZXMgZm9yIGFzIGxvbmcgYXMgYSBwcm9jZXNzIGNhblxuICAgKiBiZSBjYW5jZWxsZWQsIG5vdCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBhcHAuXG4gICAqL1xuICBvbkNhbmNlbFJlcXVlc3RlZDogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgY29uc3QgbGlzdGVuZXIgPSAoKSA9PiBjYWxsYmFjaygpO1xuICAgIGlwY1JlbmRlcmVyLm9uKENBTkNFTF9SRVFVRVNURURfUk9VVEUsIGxpc3RlbmVyKTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpcGNSZW5kZXJlci5yZW1vdmVMaXN0ZW5lcihDQU5DRUxfUkVRVUVTVEVEX1JPVVRFLCBsaXN0ZW5lcik7XG4gICAgfTtcbiAgfSxcblxuICAvKipcbiAgICogQ2FsbGVkIGZvciBlYWNoIGFuYWx5dGljcyBldmVudCB0aGUgYnVzeSBtb2RhbCByZXBvcnRzIGFib3V0IGl0cyBvd25cbiAgICogbGlmZXRpbWUgKG9wZW5lZCwgYW5kIHRoZSBzaW5nbGUgY2xvc2Ugc3RhdCBuYW1pbmcgd2h5IGl0IHdlbnQgYXdheSkuXG4gICAqIFJldHVybnMgdGhlIHVuc3Vic2NyaWJlIGZ1bmN0aW9uLlxuICAgKi9cbiAgb25TdGF0OiAoY2FsbGJhY2s6IChtZXNzYWdlOiBGcm9udElwY1N0YXRNZXNzYWdlKSA9PiB2b2lkKSA9PiB7XG4gICAgY29uc3QgbGlzdGVuZXIgPSAoX2V2ZW50OiB1bmtub3duLCBtZXNzYWdlOiBGcm9udElwY1N0YXRNZXNzYWdlKSA9PlxuICAgICAgY2FsbGJhY2sobWVzc2FnZSk7XG4gICAgaXBjUmVuZGVyZXIub24oU1RBVF9ST1VURSwgbGlzdGVuZXIpO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlwY1JlbmRlcmVyLnJlbW92ZUxpc3RlbmVyKFNUQVRfUk9VVEUsIGxpc3RlbmVyKTtcbiAgICB9O1xuICB9LFxuXG4gIC8qKlxuICAgKiBgc2VuZGAgYW5kIG5vdCBgc2VuZFN5bmNgOiBwdXNoaW5nIHRvIHRoZSBidXN5IG1vZGFsIGlzIGZpcmUtYW5kLWZvcmdldCBhbmRcbiAgICogbXVzdCBuZXZlciBiZSBhYmxlIHRvIHN0YWxsIG9yIGJyZWFrIHRoZSBjYWxsZXIuXG4gICAqL1xuICBzZW5kTWVzc2FnZTogKG1lc3NhZ2U6IEZyb250SXBjTWVzc2FnZSkgPT5cbiAgICBpcGNSZW5kZXJlci5zZW5kKCdmcm9udC1pcGM6c2VuZC1tZXNzYWdlJywgbWVzc2FnZSksXG59O1xuXG5leHBvcnQge2Zyb250Tm9kZUlwY307XG4iLCJpbXBvcnQge0lwY0NsaWVudH0gZnJvbSAnQGtlemlvcy9ub2RlLWlwYyc7XG5pbXBvcnQge3RtcGRpcn0gZnJvbSAnb3MnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuY29uc3Qgc29ja2V0Um9vdFBhdGggPSBqb2luKHRtcGRpcigpLCAnY29tLmF1dG9jdXQnLCAnY29tLmF1dG9jdXQuYWVhJyk7XG5cbmV4cG9ydCB0eXBlIENvbXB1dGVUYXNrID0ge1xuICBkYXRhPzogYW55O1xuICBkZWFjdGl2YXRlZFRyYWNrSW5kZXhlcz86IG51bWJlcltdO1xuICBkZWJ1Zz86IGJvb2xlYW47XG4gIGRvbWFpbjoge3NsdWc6IHN0cmluZzsgdGFyZ2V0OiBzdHJpbmd9O1xuICBwcmlvcml0eTogbnVtYmVyO1xuICBzZWxlY3RlZFNlY3Rpb25zPzogbnVtYmVyW11bXTtcbiAgdGltZWxpbmVJZD86IHN0cmluZztcbiAgdXNlcj86IHtcbiAgICBrZXk6IHN0cmluZztcbiAgICBwb3N0aG9nSWQ/OiBzdHJpbmc7XG4gICAgdG9rZW5zPzoge2FjY2Vzc1Rva2VuOiBzdHJpbmc7IHJlZnJlc2hUb2tlbjogc3RyaW5nfTtcbiAgfTtcbn07XG5cbi8vIFRPRE8oQVVUT0NVVC1GUk9OVC05RDcsIDIwMjYtMTEtMDUpOiBSZW1vdmUgdGhlIHJhdyBUIGJyYW5jaCBhbmQgcmVzdG9yZVxuLy8gc3RhcnRUYXNrIHRvIFByb21pc2U8Q29tcHV0ZVRhc2tJcGNSZXN1bHQ8VD4+IGFmdGVyIGxlZ2FjeSBDb21wdXRlIGNhY2hlcyBleHBpcmUuXG5leHBvcnQgdHlwZSBDb21wdXRlVGFza0lwY1Jlc3BvbnNlPFQ+ID0gQ29tcHV0ZVRhc2tJcGNSZXN1bHQ8VD4gfCBUO1xuZXhwb3J0IHR5cGUgQ29tcHV0ZVRhc2tJcGNSZXN1bHQ8VD4gPSB7XG4gIGRhdGE6IFQ7XG4gIGlkOiBzdHJpbmc7XG59O1xuXG5jb25zdCBjb21wdXRlTm9kZUlwY0NsaWVudCA9IG5ldyBJcGNDbGllbnQoe3NvY2tldFJvb3RQYXRofSk7XG5cbmNvbnN0IHN0YXJ0VGFzayA9IDxUPih0YXNrOiBDb21wdXRlVGFzaykgPT4ge1xuICByZXR1cm4gY29tcHV0ZU5vZGVJcGNDbGllbnQucmVxdWVzdDxDb21wdXRlVGFza0lwY1Jlc3BvbnNlPFQ+PihcbiAgICAnc3RhcnRUYXNrJyxcbiAgICB0YXNrLFxuICApO1xufTtcblxuY29uc3Qga2lsbFRhc2tzID0gPFQ+KHRhc2tJZHM6IHN0cmluZ1tdKSA9PiB7XG4gIHJldHVybiBjb21wdXRlTm9kZUlwY0NsaWVudC5yZXF1ZXN0PFQ+KCdraWxsVGFza3MnLCB7cmVxdWVzdElkczogdGFza0lkc30pO1xufTtcblxuY29uc3Qga2lsbEFsbFRhc2tzID0gPFQ+KCkgPT4ge1xuICByZXR1cm4gY29tcHV0ZU5vZGVJcGNDbGllbnQucmVxdWVzdDxUPigna2lsbEFsbFRhc2tzJyk7XG59O1xuXG5jb25zdCBhYm9ydFJlcXVlc3QgPSAocmVxdWVzdElkOiBzdHJpbmcpID0+IHtcbiAgcmV0dXJuIGNvbXB1dGVOb2RlSXBjQ2xpZW50LmFib3J0UmVxdWVzdChyZXF1ZXN0SWQpO1xufTtcblxuY29uc3QgYWJvcnRBbGxSZXF1ZXN0cyA9ICgpID0+IHtcbiAgcmV0dXJuIGNvbXB1dGVOb2RlSXBjQ2xpZW50LmFib3J0QWxsUmVxdWVzdHMoKTtcbn07XG5cbmNvbnN0IGdldFRhc2tzID0gPFQ+KCkgPT4ge1xuICByZXR1cm4gY29tcHV0ZU5vZGVJcGNDbGllbnQucmVxdWVzdDxUPignZ2V0VGFza3MnKTtcbn07XG5cbmV4cG9ydCB0eXBlIFByb2dyZXNzU3RlcCA9IHtcbiAgaWQ6IHN0cmluZztcbiAgcHJvZ3Jlc3M6IHtjdXJyZW50U3RlcDogbnVtYmVyOyBmaW5pc2hlZDogYm9vbGVhbjsgbmJTdGVwczogbnVtYmVyfTtcbn07XG5cbmNvbnN0IGdldFRhc2tQcm9ncmVzcyA9IChyZXF1ZXN0SWQ6IHN0cmluZykgPT4ge1xuICByZXR1cm4gY29tcHV0ZU5vZGVJcGNDbGllbnQucmVxdWVzdDxQcm9ncmVzc1N0ZXBbXT4oJ2dldFByb2dyZXNzJywge1xuICAgIHJlcXVlc3RJZCxcbiAgfSk7XG59O1xuXG5jb25zdCBmbHVzaExvZ3MgPSA8VD4oKSA9PiB7XG4gIHJldHVybiBjb21wdXRlTm9kZUlwY0NsaWVudC5yZXF1ZXN0PFQ+KCdmbHVzaExvZ3MnKTtcbn07XG5cbmNvbnN0IGNvbXB1dGVOb2RlSXBjID0ge1xuICBhYm9ydEFsbFJlcXVlc3RzLFxuICBhYm9ydFJlcXVlc3QsXG4gIGNvbm5lY3Q6ICgpID0+IGNvbXB1dGVOb2RlSXBjQ2xpZW50LmNvbm5lY3QoJ2NvbS5hdXRvY3V0LmNvbXB1dGUnKSxcbiAgZmx1c2hMb2dzLFxuICBnZXRUYXNrUHJvZ3Jlc3MsXG4gIGdldFRhc2tzLFxuICBpc0Nvbm5lY3RlZDogKCkgPT4gY29tcHV0ZU5vZGVJcGNDbGllbnQuY29ubmVjdGVkLFxuICBraWxsQWxsVGFza3MsXG4gIGtpbGxUYXNrcyxcbiAgc2V0VmVyYm9zZUxldmVsOiAodmVyYm9zZUxldmVsOiBudW1iZXIpID0+XG4gICAgKGNvbXB1dGVOb2RlSXBjQ2xpZW50LnZlcmJvc2VMZXZlbCA9IHZlcmJvc2VMZXZlbCksXG4gIHN0YXJ0VGFzayxcbn07XG5cbmNvbnN0IGhvc3ROb2RlSXBjQ2xpZW50ID0gbmV3IElwY0NsaWVudCh7XG4gIG1heFJldHJpZXM6IDk5OTk5OTk5OSxcbiAgc29ja2V0Um9vdFBhdGgsXG59KTtcblxuY29uc3QgaG9zdE5vZGVJcGMgPSB7XG4gIGNvbm5lY3Q6ICgpID0+IGhvc3ROb2RlSXBjQ2xpZW50LmNvbm5lY3QoJ2NvbS5hdXRvY3V0Lmhvc3RTZXJ2ZXInKSxcbiAgaXNDb25uZWN0ZWQ6ICgpID0+IGhvc3ROb2RlSXBjQ2xpZW50LmNvbm5lY3RlZCxcbiAgcmVxdWVzdDogPFQ+KHJvdXRlTmFtZTogc3RyaW5nLCBhcmdzOiBhbnkpID0+XG4gICAgaG9zdE5vZGVJcGNDbGllbnQucmVxdWVzdDxUPihyb3V0ZU5hbWUsIGFyZ3MpLFxuICBzZXRWZXJib3NlTGV2ZWw6ICh2ZXJib3NlTGV2ZWw6IG51bWJlcikgPT5cbiAgICAoaG9zdE5vZGVJcGNDbGllbnQudmVyYm9zZUxldmVsID0gdmVyYm9zZUxldmVsKSxcbn07XG5cbmV4cG9ydCB7Y29tcHV0ZU5vZGVJcGMsIGhvc3ROb2RlSXBjfTtcbiIsImltcG9ydCBvcyBmcm9tICdvcyc7XG5cbi8qKlxuICogUXVvdGVzIGEgdmFsdWUgZm9yIHNhZmUgaW50ZXJwb2xhdGlvbiBpbnRvIGEgc2hlbGwgY29tbWFuZCBzdHJpbmcuXG4gKiBQcmVmZXIgZXhlY0ZpbGUoYmluLCBbYXJndl0pIHdoZW4gdGhlIEFQSSBhbGxvd3MgaXQ7IHVzZSB0aGlzIGZvclxuICogc3Vkb1Byb21wdC5leGVjIGFuZCBvdGhlciBzdHJpbmctb25seSBjb21tYW5kIHBhdGhzLlxuICpcbiAqIFdpbmRvd3M6IGRvdWJsZS1xdW90ZSB3cmFwOyBgXCJgIC0+IGBcIlwiYC4gSW5zaWRlIGRvdWJsZSBxdW90ZXMgY21kIHRyZWF0c1xuICogXiAmIHwgPCA+ICggKSBhbmQgc3BhY2VzIGFzIGxpdGVyYWwuIE5vdGU6ICVWQVIlIGV4cGFuc2lvbiBtYXkgc3RpbGxcbiAqIG9jY3VyIGluIHNvbWUgY21kL2JhdGNoIGNvbnRleHRzIOKAlCBhcmd2LWJhc2VkIGludm9jYXRpb24gYXZvaWRzIHRoYXQuXG4gKi9cbmV4cG9ydCBjb25zdCBxdW90ZVNoZWxsQXJnID0gKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBpZiAob3MucGxhdGZvcm0oKSA9PT0gJ3dpbjMyJykge1xuICAgIHJldHVybiBgXCIke3ZhbHVlLnJlcGxhY2UoL1wiL2csICdcIlwiJyl9XCJgO1xuICB9XG4gIHJldHVybiBgJyR7dmFsdWUucmVwbGFjZSgvJy9nLCBgJ1xcXFwnJ2ApfSdgO1xufTtcbiIsImltcG9ydCB7ZXhpc3RzU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBzdWRvUHJvbXB0IGZyb20gJ3N1ZG8tcHJvbXB0JztcbmltcG9ydCB7Z2V0VVRGOENvbW1hbmR9IGZyb20gJy4vbm9kZS9jaGlsZFByb2Nlc3Mubm9kZSc7XG5pbXBvcnQge2V4ZWNTeW5jfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7cXVvdGVTaGVsbEFyZ30gZnJvbSAnLi9zaGVsbFF1b3RlLnV0aWxzJztcblxuY29uc3QgYnVpbGRNa2RpckNvbW1hbmQgPSAoZm9sZGVyUGF0aDogc3RyaW5nKTogc3RyaW5nID0+XG4gIG9zLnBsYXRmb3JtKCkgPT09ICd3aW4zMidcbiAgICA/IGBpZiBub3QgZXhpc3QgJHtxdW90ZVNoZWxsQXJnKGZvbGRlclBhdGgpfSBta2RpciAke3F1b3RlU2hlbGxBcmcoZm9sZGVyUGF0aCl9YFxuICAgIDogYG1rZGlyIC1wICR7cXVvdGVTaGVsbEFyZyhmb2xkZXJQYXRoKX1gO1xuXG5jb25zdCBzdWRvID0ge1xuICBjcmVhdGVGb2xkZXI6IGFzeW5jIChmb2xkZXJQYXRoOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc3Vkb1Byb21wdC5leGVjKFxuICAgICAgICBnZXRVVEY4Q29tbWFuZChidWlsZE1rZGlyQ29tbWFuZChmb2xkZXJQYXRoKSksXG4gICAgICAgIHtuYW1lOiAnQXV0b0N1dCd9LFxuICAgICAgICAoZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycm9yIHx8IChzdGRlcnIgJiYgc3RkZXJyICE9PSAnJykpIHtcbiAgICAgICAgICAgIHJlamVjdChlcnJvciB8fCBzdGRlcnIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSk7XG4gIH0sXG4gIHVuemlwOiBhc3luYyAoZmlsZVBhdGg6IHN0cmluZywgdW56aXBQYXRoPzogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICh1bnppcFBhdGggJiYgIWV4aXN0c1N5bmModW56aXBQYXRoKSkge1xuICAgICAgICBhd2FpdCBzdWRvLmNyZWF0ZUZvbGRlcih1bnppcFBhdGgpO1xuICAgICAgfVxuICAgICAgY29uc3QgdW56aXBDb21tYW5kID1cbiAgICAgICAgb3MucGxhdGZvcm0oKSA9PT0gJ2RhcndpbidcbiAgICAgICAgICA/IGB1bnppcCAtbyAke3F1b3RlU2hlbGxBcmcoZmlsZVBhdGgpfSAtZCAke3F1b3RlU2hlbGxBcmcodW56aXBQYXRoID8/ICcnKX1gXG4gICAgICAgICAgOiBgdGFyIC14dmYgJHtxdW90ZVNoZWxsQXJnKGZpbGVQYXRoKX0gLUMgJHtxdW90ZVNoZWxsQXJnKHVuemlwUGF0aCA/PyAnJyl9YDtcblxuICAgICAgc3Vkb1Byb21wdC5leGVjKFxuICAgICAgICBnZXRVVEY4Q29tbWFuZCh1bnppcENvbW1hbmQpLFxuICAgICAgICB7bmFtZTogJ0F1dG9DdXQnfSxcbiAgICAgICAgKGVycm9yLCBzdGRvdXQsIHN0ZGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnJvciB8fCAoc3RkZXJyICYmIHN0ZGVyciAhPT0gJycpKSB7XG4gICAgICAgICAgICByZWplY3QoZXJyb3IgfHwgc3RkZXJyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICApO1xuICAgIH0pO1xuICB9LFxuICBpc0FkbWluOiBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChvcy5wbGF0Zm9ybSgpID09PSAnd2luMzInKSB7XG4gICAgICAgIGV4ZWNTeW5jKCduZXQgc2Vzc2lvbicsIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAob3MucGxhdGZvcm0oKSA9PT0gJ2RhcndpbicpIHtcbiAgICAgICAgLy8gT24gbWFjT1MsIGNoZWNrIGlmIHJ1bm5pbmcgYXMgcm9vdCAodWlkID09IDApXG4gICAgICAgIHJldHVybiBwcm9jZXNzLmdldHVpZCAmJiBwcm9jZXNzLmdldHVpZCgpID09PSAwO1xuICAgICAgfVxuICAgICAgLy8gTm90IGltcGxlbWVudGVkIGZvciBvdGhlciBwbGF0Zm9ybXMgKExpbnV4LCBldGMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdpc0FkbWluIGNoZWNrIGlzIG9ubHkgaW1wbGVtZW50ZWQgZm9yIFdpbmRvd3MgYW5kIG1hY09TJyxcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9LFxuICBydW5Bc0FkbWluOiBhc3luYyAoY29tbWFuZHM6IHN0cmluZ1tdIHwgc3RyaW5nKSA9PiB7XG4gICAgLy8gVXNlIGEgbm9uLXNob3J0LWNpcmN1aXRpbmcgc2VwYXJhdG9yIHNvIG9uZSBmYWlsaW5nIGNvbW1hbmQgaW4gYSBiYXRjaGVkXG4gICAgLy8gYWRtaW4gcnVuIGRvZXMgbm90IGFib3J0IHRoZSByZXN0LiBjbWQuZXhlIHVzZXMgYSBzaW5nbGUgJyYnIGJldHdlZW5cbiAgICAvLyBzdGF0ZW1lbnRzOyBQT1NJWCBzaGVsbHMgdXNlICc7Jy5cbiAgICBjb25zdCBzZXBhcmF0b3IgPSBvcy5wbGF0Zm9ybSgpID09PSAnd2luMzInID8gJyAmICcgOiAnOyAnO1xuICAgIGNvbnN0IGNvbW1hbmQgPSBBcnJheS5pc0FycmF5KGNvbW1hbmRzKVxuICAgICAgPyBjb21tYW5kcy5qb2luKHNlcGFyYXRvcilcbiAgICAgIDogY29tbWFuZHM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZyB8IEJ1ZmZlcjxBcnJheUJ1ZmZlckxpa2U+IHwgdW5kZWZpbmVkPihcbiAgICAgIGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgc3Vkb1Byb21wdC5leGVjKFxuICAgICAgICAgIGdldFVURjhDb21tYW5kKGNvbW1hbmQpLFxuICAgICAgICAgIHtuYW1lOiAnQXV0b0N1dCd9LFxuICAgICAgICAgIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBzdWRvLXByb21wdCBvY2Nhc2lvbmFsbHkgc3VyZmFjZXMgbm9uLWZhdGFsIHdhcm5pbmdzIG9uIHN0ZGVyclxuICAgICAgICAgICAgLy8gd2hpbGUgdGhlIG9wZXJhdGlvbiBzdWNjZWVkcy4gTG9nIHRoZW0gYXMgd2FybmluZ3MgaW5zdGVhZCBvZlxuICAgICAgICAgICAgLy8gdHJlYXRpbmcgdGhlIHdob2xlIGJhdGNoIGFzIGZhaWxlZC5cbiAgICAgICAgICAgIGlmIChzdGRlcnIgJiYgc3RkZXJyICE9PSAnJykge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tzdWRvLnJ1bkFzQWRtaW5dIHN0ZGVycjonLCBzdGRlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZShzdGRvdXQgYXMgc3RyaW5nKTtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICApO1xuICB9LFxufTtcblxuZXhwb3J0IHtzdWRvfTtcbiIsImltcG9ydCB7aXBjUmVuZGVyZXJ9IGZyb20gJ2VsZWN0cm9uJztcblxuZXhwb3J0IHR5cGUgVXBkYXRlSW5mbyA9IHtcbiAgcHJvZ3Jlc3M/OiBudW1iZXI7XG4gIHN0YXR1czogJ2NoZWNraW5nJyB8ICdkb3dubG9hZGluZycgfCAnZXJyb3InIHwgJ3JlYWR5JyB8ICd1cC10by1kYXRlJztcbn07XG5cbmNvbnN0IHVwZGF0ZXIgPSB7XG4gIGdldEluZm9zOiAoKSA9PiBpcGNSZW5kZXJlci5zZW5kU3luYygndXBkYXRlcjpnZXRJbmZvcycpIGFzIFVwZGF0ZUluZm8sXG4gIHF1aXRBbmRJbnN0YWxsOiAoKSA9PiBpcGNSZW5kZXJlci5zZW5kU3luYygndXBkYXRlcjpyZXN0YXJ0JykgYXMgdm9pZCxcbn07XG5cbmV4cG9ydCB7dXBkYXRlcn07XG4iLCJpbXBvcnQge2lwY1JlbmRlcmVyfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgZ290IGZyb20gJ2dvdCc7XG5cbmltcG9ydCB7bG9nUHJlbG9hZE5ldHdvcmtFcnJvcn0gZnJvbSAnLi90bHNFcnJvci5ub2RlJztcblxuY29uc3Qgb25ib2FyZGluZyA9IHtcbiAgcmVkaXJlY3RUb0Zyb250OiAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1JlZGlyZWN0aW5nIHRvIGZyb250Jyk7XG4gICAgaXBjUmVuZGVyZXIuc2VuZCgnZWxlY3Ryb246b25ib2FyZGluZzpyZWRpcmVjdFRvRnJvbnQnKTtcbiAgICBjb25zb2xlLmxvZygnUmVkaXJlY3RlZCB0byBmcm9udCcpO1xuICB9LFxuICBjb21wbGV0ZTogKCkgPT4ge1xuICAgIGlwY1JlbmRlcmVyLnNlbmQoJ2VsZWN0cm9uOm9uYm9hcmRpbmc6Y29tcGxldGVkJyk7XG4gIH0sXG4gIHBpbmdGcm9udDogKCkgPT4ge1xuICAgIGNvbnN0IHtPTkJPQVJESU5HX1VSTDogdXJsfSA9IGlwY1JlbmRlcmVyLnNlbmRTeW5jKFxuICAgICAgJ2VsZWN0cm9uOmdldFNoYXJlZFZhcmlhYmxlcycsXG4gICAgKSBhcyB7XG4gICAgICBPTkJPQVJESU5HX1VSTDogc3RyaW5nO1xuICAgIH07XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIHJlc29sdmUgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZ290LmdldCh1cmwpO1xuICAgICAgICBjb25zdCBjb2RlID0gcmVzLnN0YXR1c0NvZGUgfHwgMDtcbiAgICAgICAgaWYgKGNvZGUgPj0gMjAwICYmIGNvZGUgPCAzMDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgKCR7dXJsfSkgU2VydmljZSBvbmxpbmUuYCk7XG4gICAgICAgICAgcmVzb2x2ZShbdHJ1ZSwgdXJsXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCgke3VybH0pIFNlcnZpY2Ugb2ZmbGluZS4gKCR7Y29kZX0pYCk7XG4gICAgICAgICAgcmVzb2x2ZShbZmFsc2UsIG51bGxdKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2dQcmVsb2FkTmV0d29ya0Vycm9yKGUsIHVybCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGAoJHt1cmx9KSBTZXJ2aWNlIG9mZmxpbmUuYCwgZSk7XG4gICAgICAgIHJlc29sdmUoW2ZhbHNlLCBudWxsXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG59O1xuXG5leHBvcnQge29uYm9hcmRpbmd9O1xuIiwiaW1wb3J0IHtpcGNSZW5kZXJlcn0gZnJvbSAnZWxlY3Ryb24nO1xuXG5leHBvcnQgdHlwZSBQcmVtaWVyZVRvb2xzSW5zdGFsbFJlc3VsdCA9IHtcbiAgc3RhdHVzOiAnaW5zdGFsbGVkJyB8ICdub3QtbmVlZGVkJyB8ICdlcnJvcic7XG59O1xuXG5jb25zdCBwcmVtaWVyZVRvb2xzID0ge1xuICBpbnN0YWxsOiAob3B0aW9ucz86IHthc3N1bWVQcmVtaWVyZUluc3RhbGxlZD86IGJvb2xlYW59KSA9PlxuICAgIGlwY1JlbmRlcmVyLmludm9rZShcbiAgICAgICdlbGVjdHJvbjpwcmVtaWVyZS10b29sczppbnN0YWxsJyxcbiAgICAgIG9wdGlvbnMgPz8ge30sXG4gICAgKSBhcyBQcm9taXNlPFByZW1pZXJlVG9vbHNJbnN0YWxsUmVzdWx0PixcbiAgaXNJbnN0YWxsTmVlZGVkOiAoKSA9PlxuICAgIGlwY1JlbmRlcmVyLmludm9rZSgnZWxlY3Ryb246cHJlbWllcmUtdG9vbHM6aXMtbmVlZGVkJykgYXMgUHJvbWlzZTxib29sZWFuPixcbn07XG5cbmV4cG9ydCB7cHJlbWllcmVUb29sc307XG4iLCJpbXBvcnQge3dlYlV0aWxzfSBmcm9tICdlbGVjdHJvbic7XG5cbmNvbnN0IGZpbGVVdGlscyA9IHtcbiAgZ2V0UGFodEZvckZpbGU6IChmaWxlOiBGaWxlKSA9PiB7XG4gICAgY29uc3QgcGF0aCA9IHdlYlV0aWxzLmdldFBhdGhGb3JGaWxlKGZpbGUpO1xuICAgIHJldHVybiBwYXRoO1xuICB9LFxufTtcblxuZXhwb3J0IHtmaWxlVXRpbHN9O1xuIiwiLyoqXG4gKiBAbW9kdWxlIHByZWxvYWRcbiAqL1xuXG5jb25zb2xlLmxvZygnW1ByZWxvYWRdIFNjcmlwdCBzdGFydGVkJyk7XG5cbmltcG9ydCB7ZWxlY3Ryb259IGZyb20gJ0AvZWxlY3Ryb24nO1xuaW1wb3J0IHtidWZmZXJ9IGZyb20gJ0Avbm9kZS9idWZmZXIubm9kZSc7XG5pbXBvcnQge2NoaWxkUHJvY2Vzc30gZnJvbSAnQC9ub2RlL2NoaWxkUHJvY2Vzcy5ub2RlJztcbmltcG9ydCB7bm9kZUNyeXB0b30gZnJvbSAnQC9ub2RlL2NyeXB0by5ub2RlJztcbmltcG9ydCB7ZnN9IGZyb20gJ0Avbm9kZS9mcy5ub2RlJztcbmltcG9ydCB7aHR0cHN9IGZyb20gJ0Avbm9kZS9odHRwcy5ub2RlJztcbmltcG9ydCB7b3N9IGZyb20gJ0Avbm9kZS9vcy5ub2RlJztcbmltcG9ydCB7cGF0aH0gZnJvbSAnQC9ub2RlL3BhdGgubm9kZSc7XG5pbXBvcnQge3Jlc291cmNlc30gZnJvbSAnQC9yZXNvdXJjZXMnO1xuaW1wb3J0IHtmZm1wZWdTZXR1cH0gZnJvbSAnQC9zZXR1cC9mZm1wZWcvZmZtcGVnLnNldHVwJztcbmltcG9ydCB7Y29udGV4dEJyaWRnZX0gZnJvbSAnZWxlY3Ryb24nO1xuXG5pbXBvcnQge2Nvb2tpZXN9IGZyb20gJy4vY29va2llcyc7XG5pbXBvcnQge2Zyb250Tm9kZUlwY30gZnJvbSAnLi9mcm9udElwYyc7XG5pbXBvcnQge2NvbXB1dGVOb2RlSXBjLCBob3N0Tm9kZUlwY30gZnJvbSAnLi9ub2RlSXBjJztcbmltcG9ydCB7c3Vkb30gZnJvbSAnLi9zdWRvJztcbmltcG9ydCB7dXBkYXRlcn0gZnJvbSAnLi91cGRhdGVyJztcbmltcG9ydCB7b25ib2FyZGluZ30gZnJvbSAnLi9ub2RlL29uYm9hcmRpbmcubm9kZSc7XG5pbXBvcnQge3ByZW1pZXJlVG9vbHN9IGZyb20gJy4vbm9kZS9wcmVtaWVyZVRvb2xzLm5vZGUnO1xuaW1wb3J0IHtmaWxlVXRpbHN9IGZyb20gJy4vZmlsZSc7XG5cbmV4cG9ydCBjb25zdCBhdXRvY3V0UHJlbG9hZCA9IHtcbiAgY2hpbGRQcm9jZXNzLFxuICBmcyxcbiAgb3MsXG4gIHBhdGgsXG4gIGVsZWN0cm9uLFxuICBvbmJvYXJkaW5nLFxuICBwcmVtaWVyZVRvb2xzLFxuICBodHRwcyxcbiAgY29tcHV0ZU5vZGVJcGMsXG4gIGZyb250Tm9kZUlwYyxcbiAgaG9zdE5vZGVJcGMsXG4gIGZmbXBlZ1NldHVwLFxuICByZXNvdXJjZXMsXG4gIG5vZGVDcnlwdG8sXG4gIHVwZGF0ZXIsXG4gIGJ1ZmZlcixcbiAgc3VkbyxcbiAgY29va2llcyxcbiAgZmlsZTogZmlsZVV0aWxzLFxufTtcblxuLyoqXG4gKiBUaGUgXCJNYWluIFdvcmxkXCIgaXMgdGhlIEphdmFTY3JpcHQgY29udGV4dCB0aGF0IHlvdXIgbWFpbiByZW5kZXJlciBjb2RlIHJ1bnMgaW4uXG4gKiBCeSBkZWZhdWx0LCB0aGUgcGFnZSBsb2FkZWQgaW4geW91ciByZW5kZXJlciBleGVjdXRlcyBpbiB0aGlzIHdvcmxkLlxuICpcbiAqIEBzZWUgaHR0cHM6Ly93d3cuZWxlY3Ryb25qcy5vcmcvZG9jcy9hcGkvY29udGV4dC1icmlkZ2VcbiAqL1xudHJ5IHtcbiAgY29udGV4dEJyaWRnZS5leHBvc2VJbk1haW5Xb3JsZCgnX19hdXRvY3V0X3ByZWxvYWRfXycsIGF1dG9jdXRQcmVsb2FkKTtcbiAgY29udGV4dEJyaWRnZS5leHBvc2VJbk1haW5Xb3JsZCgnX19lbGVjdHJvbl9wcmVsb2FkX18nLCBhdXRvY3V0UHJlbG9hZCk7XG4gIGNvbnNvbGUubG9nKFxuICAgICdbUHJlbG9hZF0gY29udGV4dEJyaWRnZS5leHBvc2VJbk1haW5Xb3JsZCBleGVjdXRlZCBzdWNjZXNzZnVsbHkuJyxcbiAgKTtcbn0gY2F0Y2ggKGVycm9yKSB7XG4gIGNvbnNvbGUuZXJyb3IoXG4gICAgJ1tQcmVsb2FkXSBFcnJvciBleGVjdXRpbmcgY29udGV4dEJyaWRnZS5leHBvc2VJbk1haW5Xb3JsZDonLFxuICAgIGVycm9yLFxuICApO1xufVxuXG5jb25zb2xlLmxvZygnW1ByZWxvYWRdIFNjcmlwdCBmaW5pc2hlZCcpO1xuIl0sIm5hbWVzIjpbImVsZWN0cm9uIiwiaXBjUmVuZGVyZXIiLCJuYW1lIiwic2tpcFNob3J0aWZ5IiwiY2FsbGJhY2siLCJpc05vdGlmaWVkIiwibm90aWZ5IiwiZGV0YWlscyIsImxpc3RlbmVyIiwiX2V2ZW50IiwidXJsIiwic2hlbGwiLCJ0ZXh0IiwiZXhwYW5kZWQiLCJvcHRpb25zIiwiZW5jb2RlVG9CYXNlNjQiLCJidWZmZXIiLCJzdGFydCIsImVuZCIsImNhY2hlZEFyY2giLCJnZXRBcmNoIiwiYXJjaCIsIm9zIiwidG1wZGlyIiwicGxhdGZvcm0iLCJ0eXBlIiwidXNlckluZm8iLCJnZXRVVEY4Q29tbWFuZCIsImNvbW1hbmQiLCJVVEY4X1BPV0VSU0hFTExfUFJFRklYIiwiZXhlY0ZpbGUiLCJmaWxlIiwiYXJncyIsInJlc29sdmUiLCJleGVjRmlsZU5vZGUiLCJlcnIiLCJzdGRvdXQiLCJzdGRlcnIiLCJjaGlsZFByb2Nlc3MiLCJmdWxsQ29tbWFuZCIsInNwYXduIiwidmVyaWZ5U2lnbmF0dXJlIiwic3RyaW5nVG9TaWduIiwicHVibGljS2V5Iiwic2lnbmF0dXJlIiwiYnVmZmVyZWRTdHJpbmciLCJ2ZXJpZmllciIsImNyZWF0ZVZlcmlmeSIsIm5vZGVDcnlwdG8iLCJyYW5kb21VVUlEIiwiaXNGaWxlIiwiZmlsZVBhdGgiLCJzdGF0U3luYyIsImdldE1pbWVUeXBlIiwiZXh0IiwiZ2V0UGF0aEFzRGF0YVVybCIsImZpbGVCdWZmZXIiLCJyZWFkRmlsZVN5bmMiLCJwYXRoIiwibWltZVR5cGUiLCJiYXNlNjREYXRhIiwiZXJyb3IiLCJjcmVhdGVMb2dTdHJlYW0iLCJkaXIiLCJkaXJuYW1lIiwiZXhpc3RzU3luYyIsInN0cmVhbSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiZGF0YSIsImZzIiwiYWNjZXNzIiwiY2xvc2UiLCJjb3B5RmlsZVN5bmMiLCJsc3RhdFN5bmMiLCJta2RpclN5bmMiLCJvcGVuIiwicmVhZCIsInJlYWRkaXIiLCJyZWFkZGlyU3luYyIsInJlYWxwYXRoU3luYyIsInJlbmFtZVN5bmMiLCJybVN5bmMiLCJzeW1saW5rU3luYyIsInVubGlua1N5bmMiLCJ3cml0ZUZpbGVTeW5jIiwic2VyaWFsaXplRXJyb3IiLCJsb2dQcmVsb2FkTmV0d29ya0Vycm9yIiwicGF5bG9hZCIsImh0dHBzIiwiaXNSZWFkeSIsInN0ZXAiLCJhcHBVVUlEIiwic3RhcnR1cE5ldHdvcmtTdGF0ZSIsImlzQ29ubmVjdGl2aXR5QmxvY2tlZCIsImNvZGUiLCJnb3QiLCJlIiwiYmFzZW5hbWUiLCJleHRuYW1lIiwiam9pbiIsImJhc2UiLCJiYXNlVXJsIiwicGF0aHMiLCJwb3NpeCIsIldJTkRPV1NfREVGQVVMVF9UQVIiLCJnZXRXaW5kb3dzRGVmYXVsdFRhclBhdGgiLCJzeXN0ZW1Sb290UGF0aCIsIndpbjMyIiwiaXNXaW5kb3dzIiwicGFyc2VUb3BMZXZlbEVudHJpZXMiLCJsaXN0U3Rkb3V0IiwibGluZSIsInNlZ21lbnQiLCJmb3JtYXRFeGVjRmFpbHVyZSIsImxhYmVsIiwiZ2V0V2luZG93c1RhckNhbmRpZGF0ZXMiLCJUQVJfUEFUSCIsImNhbmRpZGF0ZXMiLCJ3aW5kb3dzRGVmYXVsdFRhclBhdGgiLCJydW5XaW5kb3dzVGFyIiwidGFyQXJncyIsImZhaWx1cmVzIiwidGFyQmluYXJ5IiwicnVuVW56aXAiLCJiaW4iLCJleHRyYWN0WmlwV2l0aEZmbGF0ZSIsInVuemlwUGF0aCIsImFyY2hpdmUiLCJ1bnppcFN5bmMiLCJ0b3BMZXZlbEVudHJpZXMiLCJlbnRyeVBhdGgiLCJjb250ZW50Iiwibm9ybWFsaXplZFBhdGgiLCJ0b3BTZWdtZW50IiwiZGVzdGluYXRpb24iLCJ1bnppcE9uV2luZG93cyIsImVudHJ5IiwidGFyRXJyb3IiLCJyZXNvdXJjZXMiLCJ0ZW1wUGF0aCIsImRvd25sb2FkUGF0aCIsImZmbXBlZ1NldHVwIiwiZmZtcGVnUGF0aCIsImZmcHJvYmVQYXRoIiwidmVyc2lvbnMiLCJmZm1wZWdTdGF0IiwiZmZwcm9iZVN0YXQiLCJzZXRDb29raWUiLCJ2YWx1ZSIsImdldENvb2tpZSIsImNvb2tpZVZhbHVlIiwiZ2V0QWxsQ29va2llcyIsImFsbENvb2tpZXMiLCJwYXJzZWRDb29raWVzIiwia2V5IiwiY2xlYXJBbGxDb29raWVzIiwiY29va2llcyIsIkNBTkNFTF9SRVFVRVNURURfUk9VVEUiLCJTVEFUX1JPVVRFIiwiZnJvbnROb2RlSXBjIiwibWVzc2FnZSIsInNvY2tldFJvb3RQYXRoIiwiY29tcHV0ZU5vZGVJcGNDbGllbnQiLCJJcGNDbGllbnQiLCJzdGFydFRhc2siLCJ0YXNrIiwia2lsbFRhc2tzIiwidGFza0lkcyIsImtpbGxBbGxUYXNrcyIsImFib3J0UmVxdWVzdCIsInJlcXVlc3RJZCIsImFib3J0QWxsUmVxdWVzdHMiLCJnZXRUYXNrcyIsImdldFRhc2tQcm9ncmVzcyIsImZsdXNoTG9ncyIsImNvbXB1dGVOb2RlSXBjIiwidmVyYm9zZUxldmVsIiwiaG9zdE5vZGVJcGNDbGllbnQiLCJob3N0Tm9kZUlwYyIsInJvdXRlTmFtZSIsInF1b3RlU2hlbGxBcmciLCJidWlsZE1rZGlyQ29tbWFuZCIsImZvbGRlclBhdGgiLCJzdWRvIiwicmVqZWN0Iiwic3Vkb1Byb21wdCIsInVuemlwQ29tbWFuZCIsImV4ZWNTeW5jIiwiY29tbWFuZHMiLCJzZXBhcmF0b3IiLCJ1cGRhdGVyIiwib25ib2FyZGluZyIsInByZW1pZXJlVG9vbHMiLCJmaWxlVXRpbHMiLCJ3ZWJVdGlscyIsImF1dG9jdXRQcmVsb2FkIiwiY29udGV4dEJyaWRnZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQVVBLE1BQU1BLEtBQVc7QUFBQSxFQUNmLFdBQVcsTUFBTUMsRUFBWSxPQUFPLG9CQUFvQjtBQUFBLEVBQ3hELGNBQWMsTUFBTUEsRUFBWSxTQUFTLHVCQUF1QjtBQUFBLEVBQ2hFLFlBQVksTUFDVkEsRUFBWSxTQUFTLHFCQUFxQjtBQUFBLEVBSzVDLGVBQWUsQ0FBQ0MsTUFDZEQsRUFBWSxTQUFTLDBCQUEwQixFQUFDLE1BQUFDLEdBQUs7QUFBQSxFQUN2RCxTQUFTLENBQUNBLEdBQWNDLE1BQ2ZGLEVBQVksU0FBUyxvQkFBb0I7QUFBQSxJQUM5QyxNQUFBQztBQUFBLElBQ0EsY0FBQUM7QUFBQSxFQUFBLENBQ0Q7QUFBQSxFQUVILG9CQUFvQixNQUNsQkYsRUFBWSxTQUFTLDZCQUE2QjtBQUFBLEVBc0JwRCxZQUFZLE1BQU1BLEVBQVksU0FBUyxxQkFBcUI7QUFBQSxFQUM1RCwyQkFBMkIsQ0FBQ0MsTUFDMUJELEVBQVksU0FBUyxzQ0FBc0M7QUFBQSxJQUN6RCxNQUFBQztBQUFBLEVBQUEsQ0FDRDtBQUFBLEVBQ0gsWUFBWSxNQUFNO0FBQ2hCLFlBQVEsSUFBSSwwQ0FBMEMsR0FDdERELEVBQVksS0FBSyx1QkFBdUI7QUFBQSxFQUMxQztBQUFBLEVBQ0EsVUFBVSxNQUFNQSxFQUFZLEtBQUssdUJBQXVCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTXhELHdCQUF3QixDQUN0QkcsTUFDRztBQUVILFFBQUlDLElBQWE7QUFDWCxVQUFBQyxJQUFTLENBQUNDLE1BQWtDO0FBQ2hELE1BQUlGLE1BQ1NBLElBQUEs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
