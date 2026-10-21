import { UpdateManager as Fr, VelopackApp as $r } from "velopack";
import { app as c, shell as Br, net as L, Menu as ce, BrowserWindow as v, ipcMain as g, screen as yt, clipboard as $t, dialog as ee, systemPreferences as Bt } from "electron";
import { URL as Te } from "node:url";
import w, { join as Oo } from "node:path";
import * as T from "@sentry/electron/main";
import No, { AxiosError as I, AxiosHeaders as ko } from "axios";
import * as Ht from "fs";
import D, { existsSync as _, mkdirSync as V, createWriteStream as xo, readFileSync as Ne, promises as Hr, writeFileSync as Rt, unlinkSync as st, mkdtempSync as Vr } from "fs";
import * as Qe from "path";
import O, { parse as Wr, dirname as St, join as U, win32 as jr } from "path";
import { exec as Do, execFile as qr, fork as Lo } from "child_process";
import $, { tmpdir as _t, arch as Gr, platform as Qr } from "os";
import { promisify as Mo } from "util";
import Vt, { existsSync as C, unlinkSync as Wt, mkdirSync as He, writeFileSync as Fo, renameSync as le, rmSync as ue, statSync as zr, readFileSync as Jr, realpathSync as $o, accessSync as jt, constants as ze, mkdtempSync as Kr } from "node:fs";
import { randomUUID as Pt, createHash as Xr, randomBytes as Yr } from "node:crypto";
import { IpcServer as Bo } from "@kezios/node-ipc";
import { PostHog as Zr } from "posthog-node";
import { exit as Ve } from "process";
import { spawn as Ho } from "node:child_process";
import { unzipSync as en } from "fflate";
const Tt = "production", tn = Tt === "development", Vo = Tt === "staging", ke = Tt === "production", de = /* @__PURE__ */ new Set([]), on = c.isPackaged ? [] : [
  [
    (e) => new RegExp("localhost:\\d*$").test(e),
    de
  ],
  [
    (e) => new RegExp(".*\\.ngrok-free\\.app$").test(e),
    de
  ]
], rn = c.isPackaged ? [] : [
  [
    (e) => new RegExp(".*\\.autostg\\.com$").test(e),
    de
  ]
], nn = [
  (e) => new RegExp("\\.autocut\\.(fr|com|io)$").test(e),
  de
], sn = [
  (e) => e === "https://sysr.static.autocut.com/",
  de
], an = [
  (e, t) => new RegExp("github\\.com$").test(e) && t.startsWith("/kezios"),
  de
], Je = [
  ...on,
  ...rn,
  nn,
  an,
  sn
], cn = /* @__PURE__ */ new Set([]);
c.on("web-contents-created", (e, t) => {
  t.on("will-navigate", (o, r) => {
    const { origin: n, pathname: s } = new Te(r);
    Je.some(
      (a) => a[0](n, s)
    ) || (o.preventDefault(), console.warn(`Blocked navigating to disallowed origin: ${n}`));
  }), t.session.setPermissionRequestHandler(
    (o, r, n) => {
      const { origin: s, pathname: a } = new Te(o.getURL()), l = !!Je.find(
        (u) => u[0](s, a)
      )?.[1]?.has(r);
      n(l), l || console.warn(
        `${s} requested permission for '${r}', but was rejected.`
      );
    }
  ), t.setWindowOpenHandler(({ url: o }) => {
    const { origin: r } = new Te(o);
    return cn.has(r) ? Br.openExternal(o).catch(console.error) : console.warn(`Blocked the opening of a disallowed origin: ${r}`), { action: "deny" };
  }), t.on("will-attach-webview", (o, r, n) => {
    const { origin: s, pathname: a } = new Te(n.src);
    if (!Je.some(
      (i) => i[0](s, a)
    )) {
      console.warn(`A webview tried to attach ${n.src}, but was blocked.`), o.preventDefault();
      return;
    }
    delete r.preload, delete r.preloadURL, r.nodeIntegration = !1, r.contextIsolation = !0;
  });
});
const ln = {
  apiUrl: "autocut-api",
  computeUrl: "compute",
  davinciPluginUrl: "davinci-plugin",
  davinciUrl: "davinci",
  frontUrl: "front",
  hostServerUrl: "host-server",
  onboardingUrl: "onboarding",
  pproUrl: "ppro",
  pproJsxUrl: "ppro-jsx",
  systemReportUrl: "system-report",
  updaterUrl: "aea"
}, un = (e) => {
  const t = Object.entries(ln).map(
    ([r, n]) => [r, e[n]]
  ), o = Object.fromEntries(t);
  return o.apiUrl = e["autocut-api"] ?? e.api, o;
};
let ve;
const dn = (e) => {
  if (!Number.isSafeInteger(e) || e <= 0)
    throw new Error("The QA pull request number must be a positive integer");
  if (ve)
    throw new Error("A QA target has already been selected for this launch");
  return ve = Object.freeze({ prNumber: e, type: "qa-pr" }), ve;
}, We = () => ve, pn = (e, t = "") => `/v2/public/channels/qa/${e.prNumber}${t}`, fn = (e) => e ? "manual" : "follow", qt = (e, t) => {
  if (!t)
    return !0;
  try {
    return new URL(e).protocol === "https:";
  } catch {
    return !1;
  }
}, gn = /* @__PURE__ */ new Set([
  "connection",
  "content-length",
  "cookie2",
  "host",
  "keep-alive",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]), hn = [
  { code: "ENOTFOUND", pattern: "ERR_NAME_NOT_RESOLVED" },
  { code: "ENOTFOUND", pattern: "ERR_NAME_RESOLUTION_FAILED" },
  { code: "ENOTFOUND", pattern: "ERR_DNS_" },
  { code: "EAI_AGAIN", pattern: "ERR_INTERNET_DISCONNECTED" },
  { code: "EAI_AGAIN", pattern: "ERR_NETWORK_CHANGED" },
  { code: "ECONNREFUSED", pattern: "ERR_CONNECTION_REFUSED" },
  { code: "ECONNRESET", pattern: "ERR_CONNECTION_RESET" },
  { code: "ECONNRESET", pattern: "ERR_CONNECTION_CLOSED" },
  { code: "ECONNRESET", pattern: "ERR_CONNECTION_ABORTED" },
  { code: "ECONNRESET", pattern: "ERR_CONNECTION_FAILED" },
  { code: "ETIMEDOUT", pattern: "ERR_CONNECTION_TIMED_OUT" },
  { code: "ETIMEDOUT", pattern: "ERR_TIMED_OUT" },
  { code: "ECONNABORTED", pattern: "ERR_ABORTED" }
], mn = (e) => {
  const t = e.url ?? "", o = e.baseURL ? new URL(t, e.baseURL).toString() : t;
  if (!e.params)
    return o;
  const r = new URL(o);
  for (const [n, s] of Object.entries(
    e.params
  ))
    s != null && r.searchParams.append(n, String(s));
  return r.toString();
}, wn = (e, t) => {
  const o = t.headers instanceof ko ? t.headers.toJSON() : t.headers ?? {};
  for (const [r, n] of Object.entries(o))
    n != null && (gn.has(r.toLowerCase()) || e.setHeader(
      r,
      Array.isArray(n) ? n.join(", ") : String(n)
    ));
}, Ke = (e, t, o) => {
  const r = e.message || "Network request failed", n = hn.find((a) => r.includes(a.pattern))?.code ?? I.ERR_NETWORK, s = new I(r, n, t, o);
  return s.cause = e, s;
}, Wo = async (e) => (await c.whenReady(), new Promise((t, o) => {
  const r = (e.method ?? "get").toUpperCase();
  let n, s, a = !1;
  const i = (u) => {
    a || (a = !0, s && clearTimeout(s), o(u));
  }, l = (u) => {
    if (a)
      return;
    a = !0, s && clearTimeout(s);
    const { validateStatus: h } = e;
    !u.status || !h || h(u.status) ? t(u) : o(
      new I(
        `Request failed with status code ${u.status}`,
        [I.ERR_BAD_REQUEST, I.ERR_BAD_RESPONSE][Math.floor(u.status / 100) - 4],
        e,
        u.request,
        u
      )
    );
  };
  try {
    const u = mn(e), h = e.autocutRequireHttps === !0;
    if (!qt(u, h)) {
      i(
        new I(
          `Refusing non-HTTPS request: ${u}`,
          I.ERR_BAD_REQUEST,
          e
        )
      );
      return;
    }
    n = L.request({
      method: r,
      redirect: fn(h),
      url: u
    }), wn(n, e);
    const d = n;
    if (h) {
      let y = 0;
      d.on("redirect", (M, N, B) => {
        if (!qt(B, !0)) {
          i(
            new I(
              `Refusing redirect to non-HTTPS URL: ${B}`,
              I.ERR_BAD_REQUEST,
              e,
              d
            )
          ), d.abort();
          return;
        }
        try {
          if (y += 1, y > (e.maxRedirects ?? 10))
            throw new Error("Too many redirects");
          e.autocutValidateRedirect?.(B, u);
        } catch (Pe) {
          i(
            new I(
              Pe.message,
              I.ERR_BAD_REQUEST,
              e,
              d
            )
          ), d.abort();
          return;
        }
        d.followRedirect();
      });
    }
    const f = e.timeout ?? 0;
    f > 0 && (s = setTimeout(() => {
      d.abort(), i(
        new I(
          `timeout of ${f}ms exceeded`,
          I.ECONNABORTED,
          e,
          d
        )
      );
    }, f)), d.on(
      "error",
      (y) => i(Ke(y, e, d))
    ), d.on("response", (y) => {
      const M = y.statusCode ?? 0, N = y.statusMessage ?? "", B = new ko(
        y.headers
      );
      if (e.responseType === "stream") {
        l({
          config: e,
          data: y,
          headers: B,
          request: d,
          status: M,
          statusText: N
        });
        return;
      }
      const Pe = [];
      y.on("data", (H) => Pe.push(H)), y.on(
        "error",
        (H) => i(Ke(H, e, d))
      ), y.on("end", () => {
        const H = Buffer.concat(Pe), Mr = e.responseType === "arraybuffer" ? H.buffer.slice(
          H.byteOffset,
          H.byteOffset + H.byteLength
        ) : H.toString("utf-8");
        l({
          config: e,
          data: Mr,
          headers: B,
          request: d,
          status: M,
          statusText: N
        });
      });
    });
    const m = e.data;
    m != null && r !== "GET" && r !== "HEAD" && d.write(
      typeof m == "string" || Buffer.isBuffer(m) ? m : JSON.stringify(m)
    ), d.end();
  } catch (u) {
    i(Ke(u, e, n));
  }
})), En = (e) => typeof e != "object" || e === null ? {} : e, ye = (e) => {
  const t = En(e), o = typeof t.code == "string" ? t.code : void 0, r = typeof t.message == "string" ? t.message : "", n = typeof t.response?.status == "number" ? t.response.status : void 0;
  if (r.includes("net::ERR_INTERNET_DISCONNECTED"))
    return "offline";
  if (o === "ENOTFOUND" || o === "EAI_AGAIN" || r.includes("net::ERR_NAME_NOT_RESOLVED") || r.includes("net::ERR_NAME_RESOLUTION_FAILED") || r.includes("net::ERR_DNS_"))
    return "dns";
  if (o === "ETIMEDOUT" || o === "ECONNABORTED" || r.includes("net::ERR_CONNECTION_TIMED_OUT") || r.includes("net::ERR_TIMED_OUT"))
    return "timeout";
  if (["ECONNREFUSED", "ECONNRESET"].includes(o ?? "") || [
    "net::ERR_CONNECTION_REFUSED",
    "net::ERR_CONNECTION_RESET",
    "net::ERR_CONNECTION_CLOSED",
    "net::ERR_CONNECTION_ABORTED",
    "net::ERR_CONNECTION_FAILED",
    "net::ERR_HTTP2_PING_FAILED",
    "net::ERR_HTTP2_PROTOCOL_ERROR",
    "net::ERR_NETWORK_CHANGED",
    "net::ERR_QUIC_PROTOCOL_ERROR",
    "net::ERR_SSL_PROTOCOL_ERROR"
  ].some((s) => r.includes(s)))
    return "connection";
  if (n !== void 0 && n >= 500)
    return "service";
  if (o === "ERR_NETWORK" || r.includes("net::ERR_FAILED") || r === "Network request failed")
    return "network";
}, yn = (e) => ye(e) === "offline", Gt = (e) => ye(e) !== void 0, Rn = 1e4, Sn = 2e3, _n = 500, Pn = (e) => new Promise((t) => setTimeout(t, e)), Tn = async (e, t) => new Promise((o, r) => {
  let n, s = !1;
  const a = setTimeout(() => {
    n?.abort(), s || (s = !0, r(
      Object.assign(
        new Error(`Endpoint probe timed out for ${new URL(e).origin}`),
        { code: "ETIMEDOUT" }
      )
    ));
  }, t), i = (l) => {
    s || (s = !0, clearTimeout(a), r(l));
  };
  try {
    n = L.request({ method: "HEAD", redirect: "follow", url: e }), n.on("response", (l) => {
      l.on("data", () => {
      }), s || (s = !0, clearTimeout(a), o());
    }), n.on("error", i), n.end();
  } catch (l) {
    i(l);
  }
}), In = async (e, {
  pollMs: t = _n,
  requestTimeoutMs: o = Sn,
  timeoutMs: r = Rn
} = {}) => {
  const n = Date.now() + r;
  let s = new Error(
    `Endpoint probe failed for ${new URL(e).origin}`
  );
  for (; Date.now() < n; )
    try {
      await Tn(e, o);
      return;
    } catch (a) {
      s = a, Date.now() < n && await Pn(t);
    }
  throw s instanceof Error ? s : new Error(`Endpoint probe failed for ${new URL(e).origin}`);
}, Un = 3, jo = 1e4, It = 500, bn = 500, Ut = (e) => new Promise((t) => setTimeout(t, e)), An = async (e = jo, t = It) => {
  const o = Date.now() + e;
  for (; Date.now() < o; ) {
    if (L.isOnline())
      return !0;
    await Ut(t);
  }
  return L.isOnline();
}, vn = async (e = It) => {
  for (; !L.isOnline(); )
    await Ut(e);
}, Re = async (e, t = {}) => {
  const {
    baseBackoffMs: o = bn,
    endpointProbeUrl: r,
    label: n = "network request",
    maxRetries: s = Un,
    networkPollMs: a = It,
    networkWaitTimeoutMs: i = jo
  } = t;
  try {
    return await e();
  } catch (l) {
    if (!Gt(l))
      throw l;
    if (console.log(
      `[NetworkRetry] ${n} failed with a transient error, waiting for network...`
    ), !await An(
      i,
      a
    ))
      throw console.log(
        `[NetworkRetry] ${n}: network is still offline, pausing retries`
      ), l;
    r && (console.log(
      `[NetworkRetry] ${n}: network is online, checking ${new URL(r).origin}`
    ), await In(r, {
      pollMs: a,
      timeoutMs: i
    })), console.log(
      `[NetworkRetry] ${n}: network and endpoint are ready, starting retries`
    );
    let h = l;
    for (let d = 1; d <= s; d++) {
      const f = o * 3 ** (d - 1);
      await Ut(f);
      try {
        return console.log(
          `[NetworkRetry] ${n}: retry ${d}/${s} (after ${f}ms)`
        ), await e();
      } catch (m) {
        if (h = m, !Gt(m) || yn(m) || !L.isOnline())
          throw m;
      }
    }
    throw h;
  }
}, Cn = [
  "CERT_",
  "certificate",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "EPROTO",
  "ERR_CERT_",
  "ERR_SSL_",
  "ERR_TLS_",
  "SELF_SIGNED_CERT",
  "SSL",
  "TLS",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
], qo = [
  "0x80092012",
  "0x80092013",
  "0x800B010C",
  "CERT_REVOKED",
  "CERT_TRUST_IS_REVOKED",
  "CERT_TRUST_REVOCATION_STATUS_UNKNOWN",
  "CRYPT_E_REVOCATION_OFFLINE",
  "ERR_CERT_NO_REVOCATION_MECHANISM",
  "ERR_CERT_REVOKED",
  "ERR_CERT_UNABLE_TO_CHECK_REVOCATION",
  "revocation",
  "revoked",
  "UNABLE_TO_GET_CRL"
], Go = (e) => typeof e == "object" && e !== null, Ie = (e, t) => {
  const o = e[t];
  return typeof o == "string" || typeof o == "number" ? String(o) : void 0;
}, bt = (e) => {
  const t = Go(e) ? e : {};
  return {
    code: Ie(t, "code"),
    errno: Ie(t, "errno"),
    message: Ie(t, "message"),
    name: Ie(t, "name")
  };
}, On = (e) => {
  const t = Go(e) ? e.cause : void 0, o = bt(t);
  return Object.values(o).filter(Boolean);
}, Nn = (e) => {
  const t = bt(e), o = Object.values(t).filter(Boolean), r = typeof e == "string" ? [e] : [];
  return [...o, ...On(e), ...r];
}, at = (e, t) => {
  const o = e.join(`
`).toLowerCase();
  return t.filter((r) => o.includes(r.toLowerCase()));
}, kn = (e) => [
  ...at(e, Cn),
  ...at(e, qo)
], xn = (e, t) => {
  const o = Nn(t), r = bt(t), n = kn(o), s = at(o, qo);
  return {
    ...r,
    isRevocationLikely: s.length > 0,
    isTlsOrCertificateError: n.length > 0,
    isWindows: process.platform === "win32",
    matchedSignals: n,
    stack: e
  };
}, Q = (e, t, o) => {
  const r = xn(e, t);
  return r.isWindows && r.isTlsOrCertificateError && console.error("[Windows TLS] Network stack failure classified", {
    classification: r,
    context: o
  }), r;
}, Qo = (e) => {
  e.webContents.on(
    "did-fail-load",
    (t, o, r, n, s) => {
      Q(
        "chromium-load",
        { code: o, message: r },
        { isMainFrame: s, url: n }
      );
    }
  );
};
No.defaults.adapter = Wo;
const zo = () => {
  if (!p?.PROXY_ORIGIN_MAP)
    return we;
  try {
    return JSON.parse(p?.PROXY_ORIGIN_MAP || "{}");
  } catch (e) {
    return console.error("Error parsing proxy origin map", e), we;
  }
}, Ue = {}, Dn = (e, t) => e.endsWith(t.replace(/^\*/, "")), Ln = (e, t) => e.replace(
  new RegExp(t.replace(/^\*/, "") + "$"),
  ""
), Mn = (e, t, o) => {
  const n = Ln(e, t).replace(/\./g, "---");
  return o.map(
    (s) => s.replace("*", n)
  );
}, Fn = (e) => {
  const t = zo();
  if (e in t)
    return t[e];
  for (const [o, r] of Object.entries(t))
    if (o.includes("*") && Dn(e, o))
      return Mn(e, o, r);
  return console.log(`[Axios] No mapping found for: ${e}`), [];
}, $n = (e) => {
  if (e.response?.status && e.response.status > 501)
    return !0;
  const t = e.code ?? "";
  return ["ECONNREFUSED", "ECONNRESET", "ENOTFOUND"].includes(t);
}, Bn = (e) => typeof e == "object" && e !== null && "pipe" in e, Hn = (e) => {
  const t = e.response?.data;
  return Bn(t) ? "[Readable stream]" : t;
}, Vn = (e, t) => ({
  code: e.code,
  message: e.message,
  method: t.method,
  retryCount: t._retryCount ?? 0,
  status: e.response?.status,
  statusText: e.response?.statusText,
  url: t.url,
  responseData: Hn(e)
}), Wn = (e) => {
  const t = e["content-disposition"];
  return (Array.isArray(t) ? t[0] : t)?.split("filename=")[1]?.split(";")[0]?.replaceAll(/"/g, "");
}, jn = (e, t, o) => {
  const r = Wn(o), n = O.basename(new URL(e).pathname), s = `${Math.random().toString().replace(".", "")}.tmp`;
  return O.join(
    t,
    r || n || s
  );
}, qn = async (e, t) => new Promise((o, r) => {
  let n = !1;
  t.on("error", (s) => {
    n = !0, t.close(), r(s);
  }), t.on("close", () => {
    n || o();
  }), e.on("error", (s) => {
    n = !0, t.close(), r(s);
  }), e.pipe(t);
}), F = No.create({
  adapter: Wo,
  maxRedirects: 10
}), Gn = () => {
  console.log(
    "[Axios] Initializing axios with proxy origin map from shared variables"
  ), console.log(
    `[Axios] Proxy origin map: ${JSON.stringify(zo(), null, 2)}`
  ), F.interceptors.request.use(
    (e) => {
      if (!e.url) return e;
      try {
        const t = new URL(e.url), o = t.hostname;
        if (Ue[o]) {
          const r = Ue[o];
          r && (t.hostname = r, e.url = t.href, console.log(
            `[Axios] Using cached mapping: ${o} -> ${r}`
          ));
        }
      } catch (t) {
        console.error("[Axios] Error in request interceptor:", t);
      }
      return e;
    },
    (e) => Promise.reject(e)
  ), F.interceptors.response.use(
    (e) => e,
    async (e) => {
      const t = e.config;
      if (!t)
        return Q("axios", e), Promise.reject(e);
      if ($n(e) && t.url) {
        const r = new URL(t.url), n = t._originalHostname ?? r.hostname;
        if (!Ue[n]) {
          const s = Fn(n), a = t._proxyIndex ?? 0;
          if (a < s.length) {
            const i = s[a];
            t._originalHostname = n, t._proxyIndex = a + 1;
            try {
              r.hostname = i, t.url = r.href;
              const l = await F.request(t);
              return "_proxyIndex" in l || (l._proxyIndex = a, Ue[n] = i, console.log(
                `[Axios] Proxy fallback ${a + 1}/${s.length}: ${n} -> ${i} : ✅`
              )), l;
            } catch (l) {
              console.error(
                `[Axios] Proxy fallback ${a + 1}/${s.length}: ${n} -> ${i} : ❌`,
                l
              );
            }
          }
        }
      }
      const o = t.autocutRetryMode === "external" ? 0 : 3;
      return (t._retryCount ?? 0) < o ? (console.log(
        "Error response",
        Vn(e, t)
      ), console.log(
        `(${t._retryCount || "initial"}) Retrying request : ${t.url}`
      ), t._retryCount = (t._retryCount || 0) + 1, F.request(t)) : (Q("axios", e, {
        retryCount: t._retryCount ?? 0,
        url: t.url
      }), Promise.reject(e));
    }
  );
};
async function ge(e, t, {
  requireHttps: o = !1,
  withCache: r = !1
} = {}) {
  try {
    _(t) || V(t, { recursive: !0 });
    const n = new URL(e);
    return r || n.searchParams.set("nocache", Date.now().toString()), await Re(
      async () => {
        console.log("Downloading", n.href);
        const s = await F.get(n.href, {
          autocutRequireHttps: o,
          autocutRetryMode: "external",
          headers: r ? void 0 : {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache"
          },
          responseType: "stream"
        }), a = jn(
          e,
          t,
          s.headers
        );
        return await qn(
          s.data,
          xo(a)
        ), a;
      },
      { label: `Download ${e}` }
    );
  } catch (n) {
    throw Q("axios-download", n, {
      outputFolderPath: t,
      url: e
    }), n;
  }
}
const Qn = 403, Jo = async (e) => {
}, Ko = async (e, t) => {
  try {
    const o = await F.get(e, {
      timeout: t.timeout,
      validateStatus: () => !0
    });
    return o.status === Qn ? (t.showStagingWhitelistModal && await Jo(e), !1) : o.status <= 501;
  } catch {
    return !1;
  }
}, zn = async (e, t = 2e3) => {
  if (!(!e || e.length === 0)) {
    for (const o of e) {
      if (console.log(`[URL Selection] Checking URL: ${o}`), await Ko(o, {
        timeout: t,
        showStagingWhitelistModal: !0
      }))
        return console.log(`[URL Selection] Selected URL: ${o}`), o;
      console.log(`[URL Selection] URL not available: ${o}`);
    }
    console.log("[URL Selection] No URLs responded successfully");
  }
};
let q = [], it = !1;
const Se = (e, t) => {
  const o = ye(e);
  if (o === void 0)
    return !1;
  const r = o === "offline" || !L.isOnline() ? "offline" : "online", n = typeof e?.code == "string" ? e.code : void 0;
  let s;
  try {
    s = t.url ? new URL(t.url).hostname : void 0;
  } catch {
    s = "invalid-url";
  }
  return q.push({
    availability: r,
    code: n,
    host: s,
    kind: o,
    operation: t.operation
  }), !0;
}, Jn = () => q.length > 0, Kn = (e) => {
  if (it)
    return;
  it = !0;
  const t = new Set(
    q.map((a) => a.availability)
  ), o = new Set(
    q.map((a) => a.code).filter((a) => a !== void 0)
  ), r = new Set(
    q.map((a) => a.host).filter((a) => a !== void 0)
  ), n = new Set(q.map((a) => a.kind)), s = new Set(
    q.map((a) => a.operation)
  );
  T.withScope((a) => {
    a.setFingerprint(["startup-network", "unresolved-config"]), a.setLevel("warning"), a.setTag(
      "network.availability_at_failure",
      [...t].sort().join(",")
    ), a.setTag("network.endpoint_count", r.size), a.setTag("network.failure_kinds", [...n].sort().join(",")), a.setContext("startup_network", {
      codes: [...o].sort().join(","),
      hosts: [...r].sort().join(","),
      invalidUrlKeys: e.invalidKeys.join(","),
      missingUrlKeys: e.missingKeys.join(","),
      operations: [...s].sort().join(",")
    }), T.captureMessage(
      "Startup configuration remained unresolved after network fallbacks"
    );
  });
}, Xn = () => {
  q = [], it = !1;
}, Xo = [
  "frontUrl",
  "onboardingUrl",
  "computeUrl",
  "hostServerUrl",
  "davinciUrl",
  "davinciPluginUrl",
  "apiUrl",
  "updaterUrl",
  "pproUrl",
  "pproJsxUrl",
  "systemReportUrl"
], Yn = () => c.getVersion(), Zn = ["davinciPluginUrl"], Yo = "https://autotuct-fallback-urls.onrender.com/fallback.json", es = (e) => Xo.every(
  (t) => Zn.includes(t) || e[t] !== void 0
), ts = async () => ({
  frontUrl: void 0,
  onboardingUrl: void 0,
  computeUrl: void 0,
  hostServerUrl: void 0,
  davinciPluginUrl: void 0,
  davinciUrl: void 0,
  apiUrl: void 0
}), os = async () => ({}), Qt = () => O.join(c.getPath("userData"), "channel"), rs = () => {
  try {
    return _(Qt()) ? Ne(Qt(), "utf-8").trim() || void 0 : ke ? void 0 : "stg";
  } catch (e) {
    console.error("Failed to read Cook channel file:", e), T.captureException(e);
    return;
  }
}, Zo = (e, t = "") => `${e ? `/v2/public/channels/${encodeURIComponent(e)}` : "/v2/public/channels"}${t}`, ns = () => {
  const e = Yn();
  return {
    "X-Electron-App-Version": e,
    "AutoCut-Version": e
  };
}, xe = async (e, t = !1, o) => {
  const r = await F.get(e, {
    autocutRetryMode: "external",
    headers: ns(),
    timeout: o,
    validateStatus: (n) => n < 400 || n === 403 || t && n === 404
  });
  return r.status === 403 && await Jo(), r;
}, zt = async (e, t = "") => {
  const o = new URL(Zo(void 0, t), e);
  console.log("Fetching default Cook channel from", o.href);
  const r = await xe(o.href);
  if (r.status !== 200)
    throw new Error(`HTTP error! status: ${r.status}`);
  return { data: r.data, usedDefaultChannel: !0 };
}, At = async (e, t = "") => {
  const o = We();
  if (o) {
    const a = pn(o, t), i = new URL(a, e);
    console.log("Fetching QA Cook channel from", i.href);
    const l = await xe(i.href);
    if (l.status !== 200)
      throw new Error(`HTTP error! status: ${l.status}`);
    return { data: l.data, usedDefaultChannel: !1 };
  }
  const r = rs();
  if (console.log("Cook channel slug:", r), !r) return zt(e, t);
  const n = new URL(Zo(r, t), e);
  console.log("Fetching Cook channel from", n.href);
  const s = await xe(n.href, !0);
  if (s.status === 404)
    return console.log(`Cook channel "${r}" not found, using default channel`), zt(e, t);
  if (s.status !== 200)
    throw new Error(`HTTP error! status: ${s.status}`);
  return { data: s.data, usedDefaultChannel: !1 };
}, ss = async (e) => {
  if (e)
    return zn(Array.isArray(e) ? e : [e]);
}, as = async (e) => {
  const t = un(e), o = await Promise.all(
    Xo.map(async (r) => [r, await ss(t[r])])
  );
  return Object.fromEntries(
    o.filter(([, r]) => !!r)
  );
}, is = async () => {
  console.log("Fetching Cook URLs...");
  const e = {}, t = "https://man.autocut.com/";
  try {
    if (t) {
      const { data: o, usedDefaultChannel: r } = await Re(
        () => At(t),
        { endpointProbeUrl: t, label: "Cook URLs" }
      );
      console.log(
        `Cook URLs (v2) fetched from ${r ? "default" : "configured"} channel, selecting best URLs...`
      ), Object.assign(e, await as(o)), console.log("Cook URLs selected successfully:", e);
    }
  } catch (o) {
    if (console.error("Failed to fetch Cook URLs:", o), Se(o, {
      operation: "cook-urls",
      url: t
    }) || T.captureException(o), We())
      throw o;
  }
  return e;
}, cs = async () => {
  const e = {}, t = "https://man.autocut.com/";
  try {
    const { data: o, usedDefaultChannel: r } = await Re(
      () => At(t, "/versions"),
      { endpointProbeUrl: t, label: "Cook versions" }
    );
    Object.assign(e, o), console.log(
      `Versions fetched successfully from ${r ? "default" : "configured"} channel:`,
      e
    );
  } catch (o) {
    if (console.error("Failed to fetch versions from Cook:", o), Se(o, {
      operation: "cook-versions",
      url: t
    }) || T.captureException(o), We())
      throw o;
  }
  return e;
}, ls = async () => {
  console.log("Fetching fallback URLs from remote source");
  const e = await F.get(Yo, {
    autocutRetryMode: "external"
  });
  if (e.status !== 200 || !e.data)
    throw new Error("Failed to fetch fallback URLs: Invalid response");
  const t = e.data, o = {
    frontUrl: t["autocut-front"],
    computeUrl: t["autocut-compute"],
    hostServerUrl: t["autocut-host-server"],
    davinciPluginUrl: t["autocut-davinci-plugin"],
    davinciUrl: t["autocut-davinci"],
    onboardingUrl: t["autocut-onboarding"],
    apiUrl: t["autocut-api"],
    updaterUrl: t["autocut-updater"],
    pproUrl: t["autocut-ppro-download"],
    pproJsxUrl: "https://ppro-jsx.static.autocut.com/"
  };
  return console.log("Fallback URLs fetched successfully:", t), o;
}, us = async () => {
  try {
    return await Re(ls, {
      label: "fallback URLs"
    });
  } catch (e) {
    return console.error("Failed to fetch fallback URLs:", e), Se(e, {
      operation: "fallback-urls",
      url: Yo
    }) || T.captureException(e), {};
  }
};
let we = {
  "*.autocut.tech": ["*tech.proxy.autocut.com", "*tech.proxy.autocut.tech"]
};
const ds = async () => {
  console.log("[ProxyOriginMap] Fetching proxy origin map from MEP Manager...");
  const e = we, t = "https://man.autocut.com/";
  try {
    const o = new URL("/v2/public/proxy-origin-map", t);
    console.log("[ProxyOriginMap] Fetching from", o.href);
    const r = await Re(
      () => xe(o.href, !1, 5e3),
      { endpointProbeUrl: o.href, label: "proxy origin map" }
    );
    return r.status === 200 && r.data && typeof r.data == "object" ? (console.log(
      `[ProxyOriginMap] Successfully fetched: ${Object.keys(r.data).length} mappings`
    ), we = { ...we, ...r.data }, r.data) : (console.log("[ProxyOriginMap] Invalid response, using default map"), e);
  } catch (o) {
    return console.error(
      "[ProxyOriginMap] Failed to fetch, using default map:",
      o
    ), Se(o, {
      operation: "proxy-origin-map",
      url: t
    }) || T.captureException(o), e;
  }
}, er = Mo(Do), ps = "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment", fs = (e) => {
  for (const t of e.split(/\r?\n/)) {
    const o = /\s+REG(?:_EXPAND)?_SZ\s+(.+)$/i.exec(t);
    if (o)
      return o[1].trim();
  }
}, gs = (e) => {
  if (e === "ARM64")
    return "arm64";
  if (e === "AMD64" || e === "x86_64")
    return "x64";
}, hs = async () => {
  try {
    const { stdout: e } = await er(
      `reg query "${ps}" /v PROCESSOR_ARCHITECTURE`,
      {
        timeout: 2e3,
        windowsHide: !0,
        maxBuffer: 1048576
      }
    ), t = fs(e);
    if (!t)
      return console.warn(
        "[arch] PROCESSOR_ARCHITECTURE registry lookup returned no value"
      ), "x64";
    const o = gs(t);
    return o || (console.warn(
      `[arch] unsupported PROCESSOR_ARCHITECTURE value "${t}", falling back to x64`
    ), "x64");
  } catch (e) {
    return console.warn("[arch] PROCESSOR_ARCHITECTURE registry lookup failed", e), "x64";
  }
}, ms = async () => {
  try {
    const { stdout: e } = await er("sysctl -n sysctl.proc_translated", {
      timeout: 2e3,
      maxBuffer: 1024
    });
    return e.trim() === "1" ? "arm64" : "x64";
  } catch (e) {
    return console.warn("[arch] sysctl.proc_translated lookup failed", e), "x64";
  }
}, ws = async () => {
  if ($.arch() === "arm64")
    return "arm64";
  const t = $.platform();
  return t === "darwin" ? ms() : t === "win32" ? hs() : "x64";
}, Es = Mo(Do), ys = "\\common\\plug-ins\\7.0\\mediacore", Rs = "/Applications", Ss = "Adobe Premiere Pro", _s = (e) => {
  let t = !1;
  const o = e.replace(
    /%([^%]+)%/g,
    (r, n) => {
      const s = Object.keys(process.env).find(
        (i) => i.toLowerCase() === n.toLowerCase()
      ), a = s ? process.env[s] : void 0;
      return typeof a != "string" || a === "" ? (t = !0, r) : a;
    }
  );
  return t ? null : o;
}, Ps = (e) => {
  if (/[\u0000-\u001f]/.test(e))
    return !1;
  const t = /^[a-zA-Z]:[\\/]/.test(e), o = /^\\\\[^\\/]+\\[^\\/]+/.test(e);
  if (!t && !o)
    return !1;
  const r = e.replace(/^[a-zA-Z]:/, "");
  return !/[<>:"|?*]/.test(r);
}, Ts = async () => {
  try {
    return (await Hr.readdir(Rs)).some((t) => t.startsWith(Ss));
  } catch (e) {
    return console.warn(
      "[premierePluginDir] failed to read /Applications while detecting Premiere Pro",
      e
    ), !1;
  }
}, Is = async () => {
  if ($.platform() === "darwin")
    return await Ts() ? O.join(
      c.getPath("appData"),
      "Adobe",
      "Common",
      "Plug-ins",
      "7.0",
      "MediaCore"
    ) : "";
  try {
    const { stdout: t } = await Es(
      'reg query "HKLM\\SOFTWARE\\Adobe\\Premiere Pro\\CurrentVersion" /s /v Plug-InsDir',
      {
        maxBuffer: 1048576,
        timeout: 2e3,
        windowsHide: !0
      }
    );
    for (const o of t.split(/\r?\n/)) {
      const r = /\s+(REG(?:_EXPAND)?_SZ)\s+(.+)$/i.exec(o);
      if (!r)
        continue;
      const n = r[1], s = r[2];
      if (n === void 0 || s === void 0)
        continue;
      const a = s.trim(), i = /^REG_EXPAND_SZ$/i.test(n) ? _s(a) : a;
      if (i === null) {
        console.warn(
          "[premierePluginDir] Plug-InsDir contains an unavailable environment variable",
          a
        );
        continue;
      }
      const l = O.win32.normalize(i);
      if (l.toLowerCase().includes(ys)) {
        if (!Ps(l)) {
          console.warn(
            "[premierePluginDir] registry returned an invalid Plug-InsDir",
            l
          );
          continue;
        }
        return l;
      }
    }
  } catch (t) {
    console.warn(
      "[premierePluginDir] PREMIERE_PLUGIN_DIR registry lookup failed",
      t
    );
  }
  return "";
}, Jt = [
  "frontUrl",
  "onboardingUrl",
  "computeUrl",
  "hostServerUrl",
  "davinciUrl",
  "apiUrl"
];
class vt extends Error {
  invalidKeys;
  missingKeys;
  constructor(t, o) {
    const r = [
      ...t.length > 0 ? [`missing: ${t.sort().join(", ")}`] : [],
      ...o.length > 0 ? [`invalid: ${o.sort().join(", ")}`] : []
    ];
    super(`Invalid startup URL configuration (${r.join("; ")})`), this.name = "StartupUrlValidationError", this.invalidKeys = o, this.missingKeys = t;
  }
}
const Us = (e) => {
  const t = Jt.filter((r) => !e[r]), o = Jt.filter((r) => {
    const n = e[r];
    if (!n)
      return !1;
    try {
      return !["http:", "https:"].includes(new URL(n).protocol);
    } catch {
      return !0;
    }
  });
  if (t.length > 0 || o.length > 0)
    throw new vt(t, o);
}, b = (e) => e.trim().replace(/\/$/, "") + "/", bs = "$OutputEncoding=[Console]::OutputEncoding=[Text.Encoding]::UTF8;", he = (e, t, o) => new Promise((r) => {
  qr(e, t, o ?? {}, (n, s, a) => {
    r({
      error: n,
      stderr: a.toString(),
      stdout: s.toString()
    });
  });
}), As = (e, t) => {
  const o = t?.skipUTF8Encoding ? e : `${bs}${e}`;
  return he("powershell", ["-NoProfile", "-Command", o], {
    env: { ...process.env, ...t?.env }
  });
}, vs = (e) => {
  if (typeof e != "string")
    return !1;
  for (let t = 0; t < e.length; t++)
    if (e.charCodeAt(t) > 127)
      return !1;
  return !0;
}, ie = async (e, t) => {
  if ($.platform() !== "win32") return e;
  const { base: o, ext: r } = Wr(e), n = r === "", s = n ? e : St(e);
  if (!n && !vs(o))
    throw new Error("Non-ASCII characters in file name");
  const a = t?.createFolder !== !1;
  !_(s) && n && a && V(s, { recursive: !0 });
  const i = [
    "/d",
    "/u",
    "/e:on",
    "/v:off",
    "/c",
    'for %A in ("%AC_DIR%") do @echo %~sA'
  ], { error: l, stderr: u, stdout: h } = await he("cmd", i, {
    encoding: "utf16le",
    env: { ...process.env, AC_DIR: s },
    windowsVerbatimArguments: !0
  });
  if (l !== null)
    throw console.error(`>cmd ${i.join(" ")}< failed: ${u}`), new Error(u || l.message);
  const d = h.trim();
  if (!d)
    throw new Error(`CMD returned an empty short path for ${s}`);
  return n ? d : U(d, o);
};
let p;
const tr = async () => {
  const e = We(), t = e ? Promise.resolve({}) : os(), o = ds(), [
    r,
    n,
    s,
    a,
    i,
    l
  ] = await Promise.all([
    o,
    t,
    o.then(() => is()),
    o.then(() => cs()),
    Is(),
    ws()
  ]), u = await ts();
  console.log("Env URLs:", u), console.log("Local URLs:", n);
  const h = e || es(s) ? {} : await us();
  console.log("fallbackUrls", h);
  const d = {
    frontUrl: n.frontUrl || u.frontUrl || s.frontUrl || h.frontUrl,
    onboardingUrl: n.onboardingUrl || u.onboardingUrl || s.onboardingUrl || h.onboardingUrl,
    computeUrl: n.computeUrl || u.computeUrl || s.computeUrl || h.computeUrl,
    hostServerUrl: n.hostServerUrl || u.hostServerUrl || s.hostServerUrl || h.hostServerUrl,
    // Optional: empty until the `davinci-plugin` project has its first release
    // and Cook starts serving it. The resource treats an empty URL as "nothing
    // to install" rather than failing the launch.
    davinciPluginUrl: u.davinciPluginUrl || s.davinciPluginUrl || h.davinciPluginUrl || "",
    davinciUrl: u.davinciUrl || s.davinciUrl || h.davinciUrl,
    apiUrl: n.apiUrl || u.apiUrl || s.apiUrl || h.apiUrl,
    updaterUrl: u.updaterUrl || s.updaterUrl || h.updaterUrl || "",
    pproUrl: u.pproUrl || s.pproUrl || h.pproUrl || "",
    pproJsxUrl: s.pproJsxUrl || h.pproJsxUrl || ""
  }, f = e ? { ...s } : d;
  try {
    Us(f);
  } catch (y) {
    throw y instanceof vt && Kn(y), y;
  }
  Xn();
  const m = i === "" ? "" : await ie(i, { createFolder: !1 });
  p = {
    VERSION: "4.60.33",
    FRONT_URL: b(f.frontUrl),
    ONBOARDING_URL: b(f.onboardingUrl),
    COMPUTE_URL: b(f.computeUrl),
    HOST_SERVER_URL: b(f.hostServerUrl),
    DAVINCI_DOWNLOAD_URL: b(f.davinciUrl),
    // Not `ensureTrailingSlash('')`: that returns '/', which is truthy and
    // which `path.joinUrl` then feeds to `new URL('/')`, throwing. An absent
    // optional URL has to stay absent.
    DAVINCI_PLUGIN_DOWNLOAD_URL: f.davinciPluginUrl ? b(f.davinciPluginUrl) : "",
    UPDATER_URL: b(f.updaterUrl || ""),
    PPRO_DOWNLOAD_URL: b(f.pproUrl || ""),
    PPRO_JSX_DOWNLOAD_URL: f.pproJsxUrl ? b(f.pproJsxUrl) : "",
    API_URL: b(f.apiUrl),
    WEBSITE_URL: b("https://www.autocut.com"),
    WEBAPP_URL: b("https://www.autocut.com/app"),
    RESOURCES_PATH: await ie(c.getPath("userData")),
    HOME_DIR_PATH: await ie($.homedir()),
    PREMIERE_PLUGIN_DIR: m,
    ARCH: l,
    TEMP_FOLDER_PATH: "",
    LOG_FILE_PATH: "",
    PROXY_ORIGIN_MAP: JSON.stringify(r),
    PROJECT_VERSIONS: JSON.stringify(a)
  }, console.log(`
**************************************************

RUNNING IN   PROD  

${JSON.stringify(p, null, 2)}

**************************************************
`);
}, De = () => U(c.getPath("userData"), "starting"), Cs = () => (console.log("Checking starting file exists", De()), _(De())), Os = () => {
  const e = De();
  Rt(e, "");
}, ne = () => {
  const e = De();
  _(e) && st(e);
}, Ct = "--toggle-qa-mode", Ns = ["fail", "in_progress", "success"], ks = new Set(Ns), xs = (e) => e.some((t) => t === Ct), Ds = (e) => e.slice(1).filter((t) => t !== Ct), or = (e, t) => e && t, Ls = ({
  deepLinkPath: e,
  hasToggleArgument: t,
  isPackaged: o,
  isStaging: r,
  qaModeEnabled: n
}) => {
  if (!or(o, r))
    return "ordinary";
  if (t)
    return "toggle";
  const s = e?.replace(/^\//, "").replace(/\/$/, "");
  return n && s !== "system-report" ? "selector" : "ordinary";
}, Ms = (e) => {
  if (!Array.isArray(e))
    throw new Error("The QA list response is not an array");
  return e.map((t, o) => {
    if (!t || typeof t != "object")
      throw new Error(`The QA list item at index ${o} is invalid`);
    const r = t;
    if (!Number.isSafeInteger(r.number) || Number(r.number) <= 0)
      throw new Error(
        `The QA list item at index ${o} has an invalid number`
      );
    if (typeof r.title != "string")
      throw new Error(
        `The QA list item at index ${o} has an invalid title`
      );
    if (typeof r.status != "string" || !ks.has(r.status))
      throw new Error(
        `The QA list item at index ${o} has an invalid status`
      );
    const n = r.status === "fail" && r.unavailableReason === "preview-status-unavailable" ? "unavailable" : r.status;
    return {
      number: Number(r.number),
      status: n,
      title: r.title
    };
  });
}, Fs = (e, t) => {
  if (!Number.isSafeInteger(t) || Number(t) <= 0)
    return "Select a valid pull request";
  const o = e.find((r) => r.number === t);
  if (!o)
    return "This pull request is no longer open. Refresh and try again.";
  if (o.status !== "success")
    return "This pull request is not ready anymore. Refresh and try again.";
}, Xe = (e, t) => !e && !t, $s = (e) => C(e), Bs = (e, t) => {
  if (!t) {
    C(e) && Wt(e);
    return;
  }
  if (C(e))
    return;
  He(w.dirname(e), { recursive: !0 });
  const o = `${e}.${process.pid}.${Pt()}.tmp`;
  try {
    Fo(o, `enabled
`, { flag: "wx" }), le(o, e);
  } finally {
    C(o) && Wt(o);
  }
}, Hs = "qa-mode";
let ct = !1;
const J = () => or(c.isPackaged, Vo), rr = () => w.join(c.getPath("userData"), Hs), Ot = () => J() && $s(rr()), nr = (e) => J() && xs(e), Kt = () => {
  try {
    const e = !Ot();
    Bs(rr(), e), ne();
    const t = Ds(process.argv);
    c.relaunch({ args: t }), c.quit();
  } catch (e) {
    console.error("[QA Mode] Failed to toggle the persisted marker:", e), c.quit();
  }
}, Nt = () => {
  if (!(!J() || ct)) {
    if (ct = !0, c.isReady()) {
      Kt();
      return;
    }
    c.whenReady().then(Kt);
  }
}, Vs = () => ct, Ws = () => ({
  label: "QA",
  submenu: [
    {
      checked: Ot(),
      click: Nt,
      label: "QA Mode",
      type: "checkbox"
    }
  ]
}), kt = (e) => !J() || process.platform !== "darwin" ? e : [...e, Ws()], js = () => {
  if (J()) {
    if (process.platform === "darwin") {
      const t = kt([
        {
          label: "AutoCut",
          submenu: [
            {
              click: () => c.quit(),
              label: "Quit AutoCut"
            }
          ]
        }
      ]);
      ce.setApplicationMenu(ce.buildFromTemplate(t));
      return;
    }
    process.platform === "win32" && (c.setUserTasks([
      {
        arguments: Ct,
        description: "Enable or disable AutoCut Staging QA Mode",
        iconIndex: 0,
        iconPath: process.execPath,
        program: process.execPath,
        title: "QA"
      }
    ]) || console.error("[QA Mode] Failed to install the Windows Jump List task"));
  }
}, sr = (e) => yt.getAllDisplays().reduce((o, r) => {
  const n = r.workArea;
  return o || e.x >= n.x && e.y >= n.y && e.x < n.x + n.width && e.y < n.y + n.height;
}, !1), lt = { width: 600, height: 600 }, pe = { width: 1200, height: 1600 }, ar = { width: 600, height: 800 }, qs = 2, Ce = /* @__PURE__ */ new WeakMap(), ut = (e, t) => {
  const o = Ce.get(e);
  if (t) {
    if (o) return;
    const r = e.getBounds(), { workArea: n } = yt.getDisplayMatching(r), s = Math.min(pe.width, n.width), a = Math.min(pe.height, n.height), i = Math.min(r.x, n.x + n.width - s), l = Math.min(r.y, n.y + n.height - a);
    Ce.set(e, r), e.setBounds({
      height: a,
      width: s,
      x: Math.max(n.x, i),
      y: Math.max(n.y, l)
    });
    return;
  }
  o && (sr(o) ? e.setBounds(o) : (e.setBounds({
    height: o.height,
    width: o.width
  }), e.center()), Ce.delete(e));
}, Gs = (e) => e?.version ?? 1, Qs = (e, t) => {
  const o = t >= 2 ? lt : ar;
  return {
    ...e,
    width: Math.min(
      pe.width,
      Math.max(e.width, o.width)
    ),
    height: Math.min(
      pe.height,
      Math.max(e.height, o.height)
    )
  };
};
async function Oe(e, { size: t, frame: o } = {}) {
  console.log("Creating window...");
  const r = w.join(c.getPath("userData"), "init.json");
  let n;
  try {
    n = JSON.parse(Vt.readFileSync(r, "utf8"));
    const a = Gs(n);
    n.bounds && (n.bounds = Qs(n.bounds, a)), n.bounds && n.bounds.x !== void 0 && n.bounds.y !== void 0 && !sr({ x: n.bounds.x, y: n.bounds.y }) && (console.log("Bounds are not within display bounds"), n.bounds = {
      ...n.bounds,
      x: void 0,
      y: void 0
    });
  } catch {
    console.log("No init file found or with error");
  }
  const s = new v({
    show: !1,
    // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    webPreferences: {
      devTools: !1,
      nodeIntegration: !1,
      contextIsolation: !0,
      sandbox: !1,
      // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: !1,
      // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: Oo(c.getAppPath(), "packages/preload/dist/index.mjs")
    },
    backgroundColor: "#15151c",
    frame: o ?? !1,
    titleBarOverlay: {
      color: "#15151c",
      symbolColor: "#e65019",
      height: 60
    },
    maxWidth: pe.width,
    minWidth: lt.width,
    maxHeight: pe.height,
    minHeight: lt.height,
    ...t || (n && n.bounds ? n.bounds : ar),
    minimizable: !1,
    maximizable: !1,
    fullscreenable: !1
  });
  if (console.log("BrowserWindow created"), Qo(s), s.webContents.on("did-start-navigation", (a) => {
    a.isMainFrame && !a.isSameDocument && ut(s, !1);
  }), s.webContents.on("render-process-gone", () => {
    ut(s, !1);
  }), s.removeMenu(), s.setMenuBarVisibility(!1), s.setFullScreenable(!1), zs(), (!n || n.isPinned === !0) && s.setAlwaysOnTop(!0), s.on("ready-to-show", () => {
    console.log("Window is ready to show", {
      browserWindow: !!s,
      IS_DEV: tn,
      IS_STAGING: Vo,
      IS_PROD: ke
    }), console.log("Showing window"), s?.show();
  }), s.on("show", () => {
    console.log("Window is shown");
  }), s.on("close", function() {
    if (console.log("Window is closed"), t || o) return;
    const a = {
      version: qs,
      bounds: Ce.get(s) ?? s.getBounds(),
      isPinned: s.isAlwaysOnTop()
    };
    Vt.writeFileSync(r, JSON.stringify(a));
  }), e)
    console.log("Loading url : ", e), e.startsWith("file://") ? await s.loadFile(e.replace("file://", "")) : await s.loadURL(e);
  else {
    const a = c.isPackaged ? w.join(process.resourcesPath, "./assets/offline-page/offline.html") : "./buildResources/assets/offline-page/offline.html";
    console.log("Loading file : ", a), await s.loadFile(a, {
      query: { locale: c.getLocale() }
    });
  }
  return s;
}
async function ir() {
  const e = v.getAllWindows().find((t) => !t.isDestroyed());
  e !== void 0 && (e.isMinimized() && (console.log("Restoring window..."), e.restore()), e.focus());
}
const dt = (e, t) => {
  v.getAllWindows().filter((o) => !o.isDestroyed()).forEach((o) => {
    o.webContents.send(e, t);
  });
}, zs = () => {
  const t = kt([
    {
      label: "AutoCut",
      submenu: [
        {
          label: "Quit AutoCut",
          click() {
            c.quit();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { click() {
        }, role: "cut" },
        { click() {
        }, role: "copy" },
        { click() {
        }, role: "paste" },
        { click() {
        }, role: "delete" },
        { click() {
        }, role: "selectAll" }
      ]
    }
  ]);
  ce.setApplicationMenu(ce.buildFromTemplate(t));
}, Js = () => {
  g.on("electron:setWindowExpanded", (e, t) => {
    if (typeof t != "boolean") {
      console.error("Invalid window expansion state:", t);
      return;
    }
    const o = v.fromWebContents(e.sender);
    o && !o.isDestroyed() && ut(o, t);
  }), g.on("electron:restart", async () => {
    console.log("Restarting app..."), c.relaunch(), c.quit();
  }), g.on("electron:load-dev-url", async () => {
    console.log("IPC: Received request to load dev URL");
    const e = v.getAllWindows().find((t) => !t.isDestroyed());
    if (e) {
      const t = "http://localhost:3000";
      console.log(`IPC: Loading URL: ${t}`), await e.loadURL(t);
    } else
      console.error("IPC: Could not find main window to load dev URL.");
  });
}, A = {
  Reset: "\x1B[0m",
  Bold: "\x1B[1m",
  NoBold: "\x1B[21m",
  Dim: "\x1B[2m",
  Italic: "\x1B[3m",
  NoItalic: "\x1B[23m",
  Underscore: "\x1B[4m",
  NoUnderscore: "\x1B[24m",
  Blink: "\x1B[5m",
  Reverse: "\x1B[7m",
  Hidden: "\x1B[8m",
  FgBlack: "\x1B[30m",
  FgRed: "\x1B[31m",
  FgGreen: "\x1B[32m",
  FgYellow: "\x1B[33m",
  FgBlue: "\x1B[34m",
  FgMagenta: "\x1B[35m",
  FgCyan: "\x1B[36m",
  FgWhite: "\x1B[37m",
  FgGray: "\x1B[90m",
  BgBlack: "\x1B[40m",
  BgRed: "\x1B[41m",
  BgGreen: "\x1B[42m",
  BgYellow: "\x1B[43m",
  BgBlue: "\x1B[44m",
  BgMagenta: "\x1B[45m",
  BgCyan: "\x1B[46m",
  BgWhite: "\x1B[47m",
  BgGray: "\x1B[100m"
}, Ks = (e, t = 10) => {
  const o = [];
  let r = 0;
  for (; r < e.length; ) {
    let n = 0, s = 0, a = -1 / 0;
    const i = Math.min(t, Math.floor((e.length - r) / 2));
    for (let l = 1; l <= i; l++) {
      let u = 1, h = r + l;
      for (; h + l <= e.length; ) {
        let d = !0;
        for (let f = 0; f < l; f++)
          if (e[h + f].key !== e[r + f].key) {
            d = !1;
            break;
          }
        if (!d) break;
        u++, h += l;
      }
      if (u > 1) {
        const d = l * (u - 1) - 2;
        (d > a || d === a && l < n) && (n = l, s = u, a = d);
      }
    }
    if (s > 1 && a >= 0) {
      const l = [];
      for (let u = 0; u < n; u++) {
        const h = e[r + u], d = e[r + n * (s - 1) + u];
        l.push({ first: h, last: d, varies: h.msg !== d.msg });
      }
      o.push({ type: "repeat", count: s, entries: l }), r += n * s;
    } else
      o.push({ type: "single", entry: e[r] }), r++;
  }
  return o;
}, Xs = (e) => {
  const t = [];
  for (const o of e)
    if (o.type === "repeat") {
      t.push({ text: `-- x${o.count} --`, level: "log" });
      for (const r of o.entries) {
        const n = r.first.level ?? "log";
        r.varies ? (t.push({ text: `  ${r.first.msg}`, level: n }), t.push({ text: `     ... -> ${r.last.msg}`, level: n })) : t.push({ text: `  ${r.first.msg}`, level: n });
      }
      t.push({ text: "-- - --", level: "log" });
    } else
      t.push({ text: o.entry.msg, level: o.entry.level ?? "log" });
  return t;
}, Xt = 50 * 1024, Yt = (e) => {
  try {
    e();
  } catch (t) {
    if (t?.code !== "EPIPE") throw t;
  }
}, Ys = () => {
  const e = /* @__PURE__ */ new WeakSet();
  return (t, o) => {
    if (typeof o == "bigint") return o.toString();
    if (typeof o == "object" && o !== null) {
      if (e.has(o)) return "[Circular]";
      e.add(o);
    }
    return o;
  };
}, cr = (e) => {
  if (e instanceof Error) return e.stack ?? e.message;
  try {
    return JSON.stringify(e, Ys(), 2) ?? String(e);
  } catch {
    return String(e);
  }
}, be = (e) => e instanceof Error ? e.stack ?? e.message : typeof e == "object" && e !== null ? cr(e) : String(e), Zs = (e, t) => {
  let o = e;
  return t != null && (o = `${e} ${cr(t)}`), o.length > Xt ? o.slice(0, Xt) + " ..." : o;
};
class ea {
  logStream = null;
  levelHeaders = {};
  threshold = 0;
  queue = [];
  quietTimer = null;
  originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  };
  init(t) {
    if (!t) return;
    const o = St(t);
    try {
      _(o) || V(o, { recursive: !0 });
    } catch {
    }
    this.logStream = xo(t, { flags: "w+" }), this.logStream.on("error", () => {
    }), this.originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    };
    const r = `${A.BgCyan}${A.FgWhite}${A.Bold} [ELECTRON]`;
    this.levelHeaders = {
      log: `${r}  ${A.Reset}`,
      info: `${r} ${A.BgBlue} INFO ${A.Reset}`,
      warn: `${r} ${A.BgYellow} WARN ${A.Reset}`,
      error: `${r} ${A.BgRed} ERROR ${A.Reset}`
    }, console.log = (...n) => {
      const s = n.map(be).join(" ");
      this.log(s);
    }, console.info = (...n) => {
      const s = n.map(be).join(" ");
      this.info(s);
    }, console.warn = (...n) => {
      const s = n.map(be).join(" ");
      this.warn(s);
    }, console.error = (...n) => {
      const s = n.map(be).join(" ");
      this.error(s);
    };
  }
  setThreshold(t) {
    this.threshold = t;
  }
  log(t, o, r) {
    this._emit("log", t, o, r);
  }
  info(t, o, r) {
    this._emit("info", t, o, r);
  }
  warn(t, o, r) {
    this._emit("warn", t, o, r);
  }
  error(t, o, r) {
    this._emit("error", t, o, r);
  }
  flush() {
    if (this.queue.length === 0 || !this.logStream) return;
    const t = this.queue;
    this.queue = [], this.quietTimer && (clearTimeout(this.quietTimer), this.quietTimer = null);
    const o = Ks(t), r = Xs(o);
    for (const { text: n, level: s } of r)
      if (n.length > 0) {
        const a = this.levelHeaders[s] ?? this.levelHeaders.log;
        Yt(() => this.logStream.write(`${a} ${n}
`));
      }
  }
  waitForDrain() {
    return this.flush(), new Promise((t) => {
      if (!this.logStream) {
        t();
        return;
      }
      this.logStream.write("", () => t());
    });
  }
  _emit(t, o, r, n) {
    if ((n?.verbose ?? 0) > this.threshold) return;
    const a = Zs(o, r);
    Yt(() => this.originalConsole[t](a));
    const i = n?.compressKey ?? a;
    if (this.queue.push({ msg: a, key: i, level: t }), n?.forceFlush) {
      this.flush();
      return;
    }
    this._scheduleFlush();
  }
  _scheduleFlush() {
    this.quietTimer && clearTimeout(this.quietTimer), this.quietTimer = setTimeout(() => this.flush(), 3e3), this.queue.length >= 500 && this.flush();
  }
}
const je = (e) => {
  if (e instanceof Error) {
    const t = {};
    for (const o of Object.getOwnPropertyNames(e)) {
      const r = e[o];
      t[o] = r instanceof Error ? je(r) : r;
    }
    return t._type = e.constructor.name, t;
  }
  return e;
}, P = new ea(), ta = "electron:subprocess-terminated", oa = "electron:get-terminated-subprocess";
let pt = !1, ft;
c.on("before-quit", () => {
  pt = !0;
});
g.handle(oa, () => ft);
const Zt = (e) => {
  ft || (ft = e, P.error("Subprocess terminated unexpectedly", e, {
    forceFlush: !0
  }), dt(ta, e));
}, lr = (e, t, { ignoredExitCodes: o = [] } = {}) => {
  e.on("exit", (r, n) => {
    pt || e.killed || r !== null && o.includes(r) || Zt({ code: r, name: t, signal: n });
  }), e.on("error", (r) => {
    pt || e.pid !== void 0 || Zt({ code: null, error: r.message, name: t, signal: null });
  });
};
let R = null;
const se = () => R ? {
  connected: R.connected,
  exitCode: R.exitCode,
  hasInstance: !0,
  killed: R.killed,
  pid: R.pid,
  signalCode: R.signalCode,
  spawnfile: R.spawnfile
} : { hasInstance: !1 }, ra = async () => new Promise((e, t) => {
  if (!p?.HOST_SERVER_URL || !p?.TEMP_FOLDER_PATH) return;
  const o = new URL("main.cjs", p.HOST_SERVER_URL).href;
  console.log("Downloading host server script from", o);
  const r = O.join(
    p.TEMP_FOLDER_PATH,
    "com.autocut.hostServer"
  );
  console.log("Writing host server to", r), V(r, { recursive: !0 }), ge(o, r, { withCache: !1 }).then((n) => {
    console.log(`Host server script downloaded to ${n}`), e(n);
  }).catch((n) => {
    console.log(
      `Error occurs while downloading host server script to ${r}`,
      n
    ), t(n);
  });
}), Ye = (e = "unspecified") => {
  P.log(
    "Stopping host server",
    {
      reason: e,
      ...se()
    },
    { forceFlush: !0 }
  ), R?.kill();
}, na = async (e) => {
  console.log("Starting host server");
  try {
    const t = await ra();
    R !== null && (P.warn(
      "Existing host-server instance found before start; killing it",
      {
        ...se()
      },
      { forceFlush: !0 }
    ), R.kill()), R = Lo(t, [], {
      execArgv: ["--inspect=9931"],
      env: {
        ...process.env,
        ...e
      }
    }), console.log("Host server forked", {
      execArgv: ["--inspect=9931"],
      filePath: t,
      pid: R.pid,
      platform: process.platform
    }), R.on("spawn", () => {
      console.log("Host server spawned", se());
    }), R.on("disconnect", () => {
      console.warn("Host server IPC channel disconnected", {
        ...se()
      });
    }), R.on("error", (o) => {
      console.error("Host server child process error", {
        error: o instanceof Error ? o.stack : o,
        ...se()
      });
    }), R.on("exit", (o, r) => {
      P.error(
        "Host server exited",
        {
          code: o,
          signal: r,
          ...se()
        },
        { forceFlush: !0 }
      ), o === 10 && (P.log(
        "Host server exited with code 10, closing AutoCut",
        void 0,
        { forceFlush: !0 }
      ), c.quit());
    }), process.on("SIGINT", () => Ye("electron SIGINT")), process.on("SIGTERM", () => Ye("electron SIGTERM")), process.on("exit", () => Ye("electron exit")), lr(R, "hostServer", {
      ignoredExitCodes: [10]
    }), console.log("Host server started");
  } catch (t) {
    console.error(t);
  }
}, sa = "com.autocut.front", aa = "message", ia = "cancel", ca = "stat", la = "front-ipc:send-message", ua = "front-ipc:cancel-requested", da = "front-ipc:stat", pa = U(_t(), "com.autocut", "com.autocut.aea");
let Z, eo = !1;
const fa = (e) => typeof e == "object" && e !== null && typeof e.stat == "string", to = (e) => {
  try {
    e.close();
  } catch (t) {
    console.warn("[FrontIpc] Failed to close server", t);
  }
  Z === e && (Z = void 0);
}, ga = () => {
  try {
    const e = new Bo(
      { overwriteSocket: !0, socketRootPath: pa },
      (t, o) => {
        if (o.event === ia) {
          dt(ua, void 0), e.respond(t, o.id, {
            acknowledged: !0
          });
          return;
        }
        if (o.event === ca) {
          fa(o.messageData) ? dt(da, o.messageData) : console.warn(
            "[FrontIpc] Ignored malformed stat",
            o.messageData
          ), e.respond(t, o.id, {
            acknowledged: !0
          });
          return;
        }
        console.warn("[FrontIpc] Ignored inbound message", o.event);
      }
    );
    Z = e, e.server.on("error", (t) => {
      console.warn("[FrontIpc] Server error", t), to(e);
    }), e.listen(sa);
  } catch (e) {
    console.warn("[FrontIpc] Failed to listen, pushes will be dropped", e), Z && to(Z);
  }
}, ha = () => {
  Z || ga(), !eo && (eo = !0, g.on(
    la,
    (e, t) => {
      try {
        Z?.broadcast(aa, t);
      } catch (o) {
        console.warn("[FrontIpc] Failed to broadcast message", o);
      }
    }
  ));
}, te = "AutoCut", ma = () => {
  console.log("Setting app name to ", te), c.setName(te);
};
let x = {};
const xt = () => O.join(c.getPath("userData"), "autocut_data.json"), wa = async () => {
  const e = xt();
  D.existsSync(e) || D.writeFileSync(e, "{}", "utf-8");
  try {
    x = JSON.parse(D.readFileSync(e, "utf-8"));
  } catch (n) {
    console.log("initCookies > err :", je(n)), D.writeFileSync(e, "{}", "utf-8");
  }
  const t = Object.keys(x).length, o = x.userKey, r = o === void 0 ? "MISSING" : o === '""' || o === "null" || o === "" ? `EMPTY(${JSON.stringify(o)})` : `PRESENT(${o.substring(0, 30)}...)`;
  console.log(
    `[Cookies] initCookies: userKey=${r}, totalKeys=${t}, path=${e}`
  ), x.appUUID || gt("appUUID", JSON.stringify(crypto.randomUUID())), x.posthogDistinctId || gt("posthogDistinctId", x.appUUID);
}, Ea = async () => x, z = (e) => x[e], ya = () => {
  const e = xt();
  x = {};
  try {
    return D.rmSync(e, { force: !0 }), !0;
  } catch (t) {
    return console.log("clearAllCookies > err :", je(t)), !1;
  }
}, gt = (e, t) => {
  const o = xt();
  x[e] = t;
  try {
    return D.writeFileSync(o, JSON.stringify(x, null, 2)), !0;
  } catch (r) {
    return console.log("setCookie > err :", je(r)), !1;
  }
}, Le = 16 * 1024 * 1024, oo = "@JSXBIN@", Ra = (e) => {
  let t;
  try {
    t = new URL(e);
  } catch {
    throw new Error("Invalid JSXBIN download URL");
  }
  const o = t.hostname === "ppro-jsx.static.autocut.com" || t.hostname === "ppro-jsx.static.autostg.com" || /^ppro-jsx-[1-9]\d*\.qa\.autostg\.com$/.test(t.hostname);
  if (t.protocol !== "https:")
    throw new Error("JSXBIN downloads require HTTPS");
  if (t.username || t.password)
    throw new Error("JSXBIN download URLs cannot contain credentials");
  if (t.port)
    throw new Error("JSXBIN downloads require the standard HTTPS port");
  if (!o)
    throw new Error(`Untrusted JSXBIN download host: ${t.hostname || "<empty>"}`);
  if (!t.pathname.endsWith("/index.jsxbin"))
    throw new Error("JSXBIN download URL must target index.jsxbin");
  if (t.hash)
    throw new Error("JSXBIN download URL cannot contain a fragment");
  return t.href;
}, ur = (e) => {
  if (e.length > Le)
    throw new Error("JSXBIN exceeds the 16 MiB size limit");
  for (let t = 0; t < oo.length; t += 1)
    if (e[t] !== oo.charCodeAt(t))
      throw new Error("Downloaded file is not a valid JSXBIN artifact");
}, Sa = (e, t) => {
  const o = t.statSync(e);
  if (!o.isFile() || o.size > Le)
    throw new Error("Invalid cached JSXBIN file");
  const r = t.readFileSync(e);
  ur(r);
}, Ze = /* @__PURE__ */ new Map(), _a = async (e, t, o, r) => {
  try {
    const n = await r(e);
    ur(n), He(t, { recursive: !0 });
    const s = Yr(16).toString("hex"), a = `${o}.${s}.tmp`;
    try {
      Fo(a, n, { flag: "wx" }), le(a, o);
    } finally {
      ue(a, { force: !0 });
    }
    console.log("[PPro JSX] Prepared client in Electron", { cachePath: o });
  } catch (n) {
    try {
      Sa(o, { readFileSync: Jr, statSync: zr });
    } catch (s) {
      throw new Error(
        "Unable to prepare JSXBIN: download failed and no valid cache is available",
        {
          cause: { cacheError: s, downloadError: n }
        }
      );
    }
    console.warn("[PPro JSX] Download failed; using validated cache", {
      cachePath: o,
      downloadError: n
    });
  }
}, Pa = (e, t, o) => {
  const r = Ra(e), n = Xr("sha256").update(r).digest("hex"), s = Oo(t, `index-${n}.jsxbin`), a = Ze.get(s);
  if (a) return a;
  const i = _a(r, t, s, o).finally(
    () => {
      Ze.delete(s);
    }
  );
  return Ze.set(s, i), i;
}, ro = 3e4, no = (e) => Array.isArray(e) ? e.join(",") : e, Ta = (e, t) => {
  const o = new URL(e), r = new URL(t);
  if (o.origin !== r.origin || o.username || o.password || o.hash || !o.pathname.endsWith("/index.jsxbin"))
    throw new Error("Invalid JSXBIN redirect");
}, Ia = async (e) => {
  const t = new URL(e);
  t.searchParams.set("nocache", Date.now().toString());
  const o = await F.get(t.href, {
    autocutRequireHttps: !0,
    // A validated local cache is the recovery path. Keep proxy fallback, but
    // do not repeat timeouts or rejected redirects through the retry interceptor.
    autocutRetryMode: "external",
    autocutValidateRedirect: Ta,
    headers: {
      "Accept-Encoding": "identity",
      "Cache-Control": "no-cache, no-store"
    },
    maxRedirects: 5,
    responseType: "stream",
    timeout: ro,
    validateStatus: (s) => s === 200
  }), r = o.data, n = o.request;
  return new Promise((s, a) => {
    const i = [];
    let l = 0, u = !1;
    const h = setTimeout(
      () => d(new Error("JSXBIN response timed out")),
      ro
    ), d = (N) => {
      u || (u = !0, clearTimeout(h), a(N), n.abort());
    };
    r.on("error", d), r.on("aborted", () => d(new Error("JSXBIN response was aborted"))), n.on("close", () => {
      u || d(new Error("JSXBIN response closed early"));
    });
    const f = no(r.headers["content-length"]), m = f === void 0 ? void 0 : Number(f), M = no(r.headers["content-encoding"])?.trim().toLowerCase();
    if (M && M !== "identity" || m !== void 0 && (!/^\d+$/.test(String(f)) || !Number.isSafeInteger(m) || m > Le)) {
      d(new Error("Invalid JSXBIN response encoding or size"));
      return;
    }
    r.on("end", () => {
      if (!u) {
        if (m !== void 0 && m !== l) {
          d(
            new Error(
              `Incomplete JSXBIN response: expected ${m} bytes, received ${l}`
            )
          );
          return;
        }
        u = !0, clearTimeout(h), s(Buffer.concat(i, l));
      }
    }), r.on("data", (N) => {
      if (!u) {
        if (l += N.length, l > Le) {
          d(new Error("JSXBIN exceeds the 16 MiB size limit"));
          return;
        }
        i.push(N);
      }
    });
  });
}, Ua = (e, t) => Pa(e, t, Ia), ba = 1e4;
let dr = "checking", Ee;
const Aa = (e) => new Promise((t) => setTimeout(t, e)), va = () => dr, Me = (e) => {
  dr = e;
}, Ca = () => {
  L.isOnline() && Ee && (Ee(), Ee = void 0);
}, so = async (e) => {
  const o = ye(e) === "offline" || !L.isOnline();
  Me(o ? "offline" : "unreachable");
  const r = new Promise((n) => {
    Ee = n;
  });
  try {
    await Promise.race([
      o ? vn() : Aa(ba),
      r
    ]);
  } finally {
    Ee = void 0;
  }
  Me("checking");
}, Oa = [
  "CommonProgramFiles",
  "LOCALAPPDATA",
  "ProgramData",
  "SystemRoot"
], Na = (e) => Oa.some((t) => t === e), pr = (e) => {
  if (process.platform !== "win32")
    throw new Error(`${e} was requested outside Windows`);
  const t = process.env[e];
  if (typeof t != "string" || t.trim() === "")
    throw new Error(`${e} environment variable is not defined`);
  return t;
}, ka = (e) => {
  const t = pr("SystemRoot");
  return jr.join(t, "System32", e);
}, xa = [
  "userData"
], Da = (e) => e === "appData" || e === "exe", ao = (e) => {
  if (!(typeof e != "object" || e === null || !("name" in e)))
    return e.name;
}, La = () => ({
  LOG_FILE_PATH: p?.LOG_FILE_PATH,
  TAR_PATH: p?.TAR_PATH,
  TEMP_FOLDER_PATH: p?.TEMP_FOLDER_PATH
}), Ma = (e) => {
  p && (e.TEMP_FOLDER_PATH && (p.TEMP_FOLDER_PATH = e.TEMP_FOLDER_PATH), e.LOG_FILE_PATH && (p.LOG_FILE_PATH = e.LOG_FILE_PATH), e.TAR_PATH && (p.TAR_PATH = e.TAR_PATH));
}, Fa = async () => {
  console.log(
    "[electron:refreshSharedVariables] sharedVariables empty, retrying initSharedVariables()"
  );
  const e = La();
  return await tr(), Ma(e), console.log(
    "[electron:refreshSharedVariables] sharedVariables refreshed:",
    !!p,
    Object.keys(p || {})
  ), p;
}, $a = () => {
  g.on("electron:getNativePath", (e, t) => {
    const o = ao(t);
    if (!Da(o))
      throw new Error(`Unsupported native Electron path: "${String(o)}"`);
    e.returnValue = c.getPath(o);
  }), g.on(
    "electron:getWindowsEnvironmentPath",
    (e, t) => {
      const o = ao(t);
      if (!Na(o))
        throw new Error(
          `Unsupported Windows environment path: "${String(o)}"`
        );
      e.returnValue = pr(o);
    }
  ), g.on("electron:getPath", async (e, { name: t, skipShortify: o }) => {
    if (["temp", "tempPath"].includes(t)) {
      e.returnValue = p?.TEMP_FOLDER_PATH;
      return;
    }
    const r = c.getPath(t), n = xa.includes(t) ? r : U(r, te);
    e.returnValue = o ? n : await ie(n);
  }), g.on("electron:getClipboard", (e) => {
    e.returnValue = $t.readText();
  }), g.on("electron:setClipboard", (e, { text: t }) => {
    console.log("Setting clipboard", t), $t.writeText(t), e.returnValue = !0;
  }), g.on("electron:getVersion", (e) => {
    e.returnValue = p?.VERSION || c.getVersion();
  }), g.on(
    "electron:showSaveDialog",
    (e, {
      defaultPath: t,
      filters: o
    }) => {
      const r = v.getAllWindows()[0];
      e.returnValue = ee.showSaveDialogSync(r, {
        defaultPath: t,
        filters: o,
        properties: ["showOverwriteConfirmation"]
      });
    }
  ), g.on("electron:reduceWindow", () => {
    v.getAllWindows().forEach((e) => {
      e.minimize();
    });
  }), g.on("electron:redirectToFront", (e) => {
    const t = v.getAllWindows()[0];
    e.returnValue = !0, t ? (console.log("Redirecting to front", p?.FRONT_URL), t.loadURL(p?.FRONT_URL || "").catch((o) => {
      console.error("Error redirecting to front", o);
    })) : console.log("No window found, cannot redirect to front");
  }), g.on("electron:toggleAlwaysOnTop", (e) => {
    const t = v.getAllWindows()[0];
    t.setAlwaysOnTop(!t.isAlwaysOnTop()), e.returnValue = t.isAlwaysOnTop();
  }), g.on("electron:getSharedVariables", (e) => {
    e.returnValue = p;
  }), g.handle("electron:refreshSharedVariables", async () => Fa()), g.handle("electron:flushLogs", async () => {
    await P.waitForDrain();
  }), g.handle("electron:preparePproJsx", async (e, t) => {
    const o = U(c.getPath("appData"), te);
    try {
      await Ua(t, o);
    } catch (r) {
      throw console.error("[PPro JSX] Failed to prepare client", r), r;
    }
  }), g.on("electron:retryStartupNetwork", Ca), g.on("electron:isReady", (e) => {
    e.returnValue = [
      vr,
      Be,
      `${z("appUUID")} - ${c.getVersion()}`,
      va()
    ];
  }), g.on("electron:getIPInfos", async (e) => {
    try {
      const t = await F.get("https://api.myip.com");
      e.returnValue = t.data;
    } catch (t) {
      Q("axios", t, { url: "https://api.myip.com" }), e.returnValue = void 0;
    }
  }), g.on(
    "electron:logNetworkError",
    (e, t) => {
      Q(t?.stack ?? "preload-got", t?.error, {
        url: t?.url
      });
    }
  ), g.on(
    "electron:download",
    async (e, t, o, r) => {
      try {
        const n = await ge(t, o, {
          requireHttps: r?.requireHttps
        });
        e.returnValue = n;
      } catch (n) {
        Q("axios-download", n, { outputFolderPath: o, url: t }), e.returnValue = void 0;
      }
    }
  );
}, Ba = "tar", fr = () => {
  const e = [Ba];
  if (process.platform === "win32") {
    const t = process.env.SystemRoot;
    typeof t == "string" && t.trim() !== "" && e.push(ka("tar.exe"));
  }
  return e;
}, gr = (e, t, o) => `${e} failed (exit ${o.code ?? "unknown"}): ${t || o.message || "no error output"}`, Ha = () => {
  const e = p?.TAR_PATH, t = [];
  return typeof e == "string" && e !== "" && _(e) && t.push(e), t.push(...fr()), t;
}, Va = async (e) => {
  const t = [e, ...fr()], o = [];
  for (const r of t) {
    const { stderr: n, error: s } = await he(r, ["--version"]);
    if (s === null)
      return r;
    o.push(gr(`tar "${r}"`, n, s));
  }
  throw new Error(
    `No working tar candidate found: "${o.join('" | "')}"`
  );
}, Wa = async (e, t) => {
  const o = Ha(), r = [];
  for (const n of o) {
    console.log("Running", n, e.join(" "));
    const { stdout: s, stderr: a, error: i } = await he(n, e);
    if (i === null)
      return s;
    r.push(gr(`tar "${n}"`, a, i));
  }
  throw new Error(
    `${t} failed for all tar candidates: "${r.join('" | "')}"`
  );
}, ja = (e, t) => {
  const o = en(Ne(e)), r = /* @__PURE__ */ new Set();
  for (const [n, s] of Object.entries(o)) {
    const a = n.replace(/\\/g, "/"), i = a.split("/")[0];
    i.length > 0 && r.add(i);
    const l = U(t, a);
    a.endsWith("/") ? V(l, { recursive: !0 }) : (V(St(l), { recursive: !0 }), Rt(l, s));
  }
  return Array.from(r);
}, io = {
  darwin: ["arm64", "x64"],
  win32: ["arm64", "x64"]
}, qa = (e, t) => io[e] ? io[e].includes(t) : !1, Ga = async (e, t) => {
  if (t && !_(t) && V(t, { recursive: !0 }), $.platform() === "darwin") {
    const o = [
      "-o",
      e,
      ...t ? ["-d", t] : []
    ];
    console.log("Running unzip", o.join(" "));
    const { stderr: r, error: n } = await he("unzip", o);
    if (n !== null)
      throw console.error("Error unzipping: ", r), new Error(r);
  } else
    try {
      await Wa(
        ["-xvf", e, ...t ? ["-C", t] : []],
        "tar extract"
      );
    } catch (o) {
      console.warn("tar extraction failed, falling back to fflate", `${o}`), ja(e, t);
    }
}, Qa = async () => {
  const e = p?.TEMP_FOLDER_PATH;
  if (!e)
    throw new Error("Temporary folder path is unavailable");
  const t = p?.ARCH;
  if (!t)
    throw new Error("Host arch is unavailable");
  const o = $.platform();
  if (!qa(o, t))
    throw new Error(`Unsupported arch (${t})`);
  const r = [
    `https://cdn.autocut.tech/0_ressources/ffmpeg/${o}/${t}/ffmpeg.zip`,
    `https://cdn.autocut.tech/0_ressources/ffmpeg/${o}/${t}/ffprobe.zip`
  ];
  console.log("downloadUrls", r), console.log("FFMPEG will be downloaded to", e), V(e, { recursive: !0 });
  const n = await ie(
    U(`${c.getPath("userData")}`, "ffmpeg")
  );
  return await Promise.all(
    r.map(async (s) => {
      console.log("Downloading from", s);
      const a = await ge(s, e);
      console.log(`FFMPEG downloaded to ${a}`), console.log("Unzipping", a), await Ga(a, n);
    })
  ), n;
}, za = () => {
  g.on("electron:downloadFFMPEG", async (e) => {
    e.returnValue = await Qa();
  });
}, Ja = () => ({
  AllowVersionDowngrade: !0,
  MaximumDeltasBeforeFallback: 10
}), co = `${te}.app`, Ka = /* @__PURE__ */ new Set(["EACCES", "EPERM", "EROFS"]), Xa = [
  "operation not permitted",
  "permission denied",
  "read-only file system"
], Ya = () => "4.60.33".startsWith("qa-pr-"), qe = (e) => e instanceof Error ? e : new Error(String(e)), Za = (e) => {
  const t = e;
  return typeof t.code == "string" ? t.code : void 0;
}, hr = (e) => {
  let t = e;
  const o = /* @__PURE__ */ new Set();
  for (; t && !o.has(t); ) {
    o.add(t);
    const r = qe(t), n = Za(r);
    if (n && Ka.has(n))
      return !0;
    const s = r.message.toLowerCase();
    if (Xa.some(
      (a) => s.includes(a)
    ))
      return !0;
    t = r.cause;
  }
  return !1;
}, lo = (e) => C(e) ? $o.native(e) : w.resolve(e), uo = (e, t) => {
  const o = lo(e), r = lo(t);
  return o === r;
}, ei = () => {
  const e = w.join("/Applications", co), t = w.join(c.getPath("home"), "Applications"), o = w.join(t, co);
  return { systemAppPath: e, userAppPath: o };
}, ti = (e = process.execPath) => {
  const t = $o.native(e), o = t.split(w.sep);
  for (let r = 0; r < o.length - 1; r += 1) {
    const n = o[r], s = o[r + 1];
    if (n.endsWith(".app") && s === "Contents")
      return o.slice(0, r + 1).join(w.sep) || w.sep;
  }
  throw new Error(
    `Could not derive the macOS app bundle from executable path: ${t}`
  );
}, oe = (e) => {
  const t = w.join(e, "Contents", "Info.plist"), o = w.join(e, "Contents", "MacOS", te);
  try {
    return jt(t, ze.R_OK), jt(o, ze.R_OK | ze.X_OK), !0;
  } catch {
    return !1;
  }
}, oi = (e) => {
  const t = qe(e);
  return hr(t) ? { availability: "permission-denied", error: t } : { availability: "unavailable", error: t };
}, et = (e) => {
  !e || !C(e) || ue(e, { force: !0, recursive: !0 });
}, re = (e, t) => {
  const o = w.dirname(e);
  let r, n;
  try {
    t && He(o, { recursive: !0 });
    const s = w.join(o, `.${te}.write-test-`);
    return r = Kr(s), n = `${r}-renamed`, le(r, n), r = void 0, et(n), n = void 0, { availability: "replaceable" };
  } catch (s) {
    return oi(s);
  } finally {
    try {
      et(r), et(n);
    } catch (s) {
      console.error("[MacInstall] Failed to remove write probe:", s);
    }
  }
}, tt = async (e, t, o) => {
  const r = await he(e, t);
  if (!r.error)
    return;
  const n = r.stderr.trim() || r.error.message;
  throw new Error(`${o} failed: ${n}`, {
    cause: r.error
  });
}, ri = (e, t) => {
  try {
    C(e) && ue(e, { force: !0, recursive: !0 }), le(t, e);
    return;
  } catch (o) {
    return qe(o);
  }
}, ni = (e, t) => {
  const o = w.dirname(t), r = `.${w.basename(t)}.backup-${Pt()}`, n = w.join(o, r), s = C(t);
  let a = !1;
  try {
    if (s && le(t, n), le(e, t), a = !0, !oe(t))
      throw new Error(`Installed app bundle is invalid: ${t}`);
  } catch (i) {
    if (!s || !C(n))
      throw a && C(t) && ue(t, { force: !0, recursive: !0 }), i;
    const l = ri(t, n);
    throw l ? new Error(
      `Failed to install ${t} and restore backup ${n}: ${l.message}`,
      { cause: i }
    ) : i;
  }
  if (s && C(n))
    try {
      ue(n, { force: !0, recursive: !0 });
    } catch (i) {
      console.warn(
        `[MacInstall] Installed app but could not remove backup ${n}:`,
        i
      );
    }
}, si = async (e, t) => {
  if (!oe(e))
    throw new Error(`Source app bundle is invalid: ${e}`);
  const o = w.dirname(t);
  He(o, { recursive: !0 });
  const r = `.${w.basename(t)}.installing-${Pt()}`, n = w.join(o, r);
  console.log("[MacInstall] Staging app bundle", {
    sourcePath: e,
    stagedPath: n,
    targetPath: t
  });
  try {
    await tt(
      "/usr/bin/ditto",
      ["--rsrc", "--extattr", e, n],
      "App bundle copy"
    ), await tt(
      "/usr/bin/xattr",
      ["-dr", "com.apple.quarantine", n],
      "Quarantine removal"
    ), Ya() ? console.warn(
      "[MacInstall] Skipping code signature verification for an unsigned QA PR build."
    ) : await tt(
      "/usr/bin/codesign",
      ["--verify", "--deep", "--strict", n],
      "Code signature verification"
    ), ni(n, t);
  } finally {
    C(n) && ue(n, { force: !0, recursive: !0 });
  }
}, Dt = (e, t) => ({
  action: "none",
  currentPath: e,
  scope: t,
  status: "ready"
}), Fe = (e, t, o) => ({
  action: "handoff",
  scope: o,
  sourcePath: e,
  status: "relaunching",
  targetPath: t
}), W = (e, t) => ({
  action: e.action,
  error: qe(t),
  scope: e.scope,
  sourcePath: e.sourcePath,
  status: "failed",
  targetPath: e.targetPath
}), Ge = async (e) => {
  try {
    return await si(e.sourcePath, e.targetPath), {
      action: e.action,
      scope: e.scope,
      sourcePath: e.sourcePath,
      status: "relaunching",
      targetPath: e.targetPath
    };
  } catch (t) {
    return W(e, t);
  }
}, fe = (e) => e.error, ai = async (e, t, o) => {
  const r = re(t, !1);
  if (r.availability === "replaceable")
    return Dt(e, "system");
  const n = oe(o), s = re(o, !0);
  if (n && s.availability === "replaceable")
    return Fe(e, o, "user");
  if (r.availability === "permission-denied" && s.availability === "replaceable")
    return Ge({
      action: "migrate",
      scope: "user",
      sourcePath: e,
      targetPath: o
    });
  if (r.availability === "unavailable")
    return W(
      {
        action: "migrate",
        scope: "system",
        sourcePath: e,
        targetPath: t
      },
      fe(r)
    );
  if (s.availability !== "replaceable")
    return W(
      {
        action: "migrate",
        scope: "user",
        sourcePath: e,
        targetPath: o
      },
      fe(s)
    );
  throw new Error("Unexpected macOS user destination state");
}, ii = async (e, t, o) => {
  const r = re(o, !1);
  if (r.availability === "replaceable")
    return Dt(e, "user");
  const n = oe(t), s = re(t, !1);
  if (n && s.availability === "replaceable")
    return Fe(e, t, "system");
  if (r.availability === "permission-denied" && s.availability === "replaceable")
    return Ge({
      action: "migrate",
      scope: "system",
      sourcePath: e,
      targetPath: t
    });
  if (r.availability === "unavailable")
    return W(
      {
        action: "migrate",
        scope: "user",
        sourcePath: e,
        targetPath: o
      },
      fe(r)
    );
  if (s.availability !== "replaceable")
    return W(
      {
        action: "migrate",
        scope: "system",
        sourcePath: e,
        targetPath: t
      },
      fe(s)
    );
  throw new Error("Unexpected macOS system destination state");
}, po = async (e, t) => {
  const o = re(t, !0);
  return o.availability !== "replaceable" ? W(
    {
      action: "install",
      scope: "user",
      sourcePath: e,
      targetPath: t
    },
    fe(o)
  ) : Ge({
    action: "install",
    scope: "user",
    sourcePath: e,
    targetPath: t
  });
}, ci = async (e, t, o) => {
  if (oe(o) && re(o, !1).availability === "replaceable")
    return Fe(e, o, "user");
  const n = oe(t), s = re(t, !1);
  if (n && s.availability === "replaceable")
    return Fe(e, t, "system");
  if (s.availability === "replaceable") {
    const a = await Ge({
      action: "install",
      scope: "system",
      sourcePath: e,
      targetPath: t
    });
    return a.status !== "failed" || !hr(a.error) ? a : (console.log(
      "[MacInstall] System installation lost write access; falling back to the user location."
    ), po(e, o));
  }
  return s.availability === "permission-denied" ? po(e, o) : W(
    {
      action: "install",
      scope: "system",
      sourcePath: e,
      targetPath: t
    },
    fe(s)
  );
}, li = (e, t, o) => uo(e, t) ? "system" : uo(e, o) ? "user" : "external", mr = async (e = {}) => {
  if (!c.isPackaged || process.platform !== "darwin")
    return Dt(process.execPath, "external");
  const t = ei(), o = e.systemAppPath ?? t.systemAppPath, r = e.userAppPath ?? t.userAppPath, n = e.executablePath ?? process.execPath;
  let s;
  try {
    s = ti(n);
  } catch (i) {
    return W(
      {
        action: "install",
        scope: "system",
        sourcePath: n,
        targetPath: o
      },
      i
    );
  }
  if (!oe(s))
    return W(
      {
        action: "install",
        scope: "system",
        sourcePath: s,
        targetPath: o
      },
      new Error(`Running app bundle is invalid: ${s}`)
    );
  const a = li(
    s,
    o,
    r
  );
  return console.log("[MacInstall] Resolving installation location", {
    currentPath: s,
    currentScope: a,
    systemAppPath: o,
    userAppPath: r
  }), a === "system" ? ai(s, o, r) : a === "user" ? ii(s, o, r) : ci(s, o, r);
}, ui = `
parent_pid="$1"
target_app="$2"
deep_link_url="$3"
while kill -0 "$parent_pid" 2>/dev/null; do
  /bin/sleep 0.1
done
if [ -n "$deep_link_url" ]; then
  exec /usr/bin/open -a "$target_app" "$deep_link_url"
fi
exec /usr/bin/open -a "$target_app"
`, wr = (e, t) => {
  const o = Ho(
    "/bin/sh",
    [
      "-c",
      ui,
      "autocut-mac-install-handoff",
      String(process.pid),
      e,
      t ?? ""
    ],
    { cwd: c.getPath("temp"), detached: !0, stdio: "ignore" }
  );
  o.once("error", (r) => {
    console.error("[MacInstall] Failed to start handoff helper:", r);
  }), o.unref();
}, Er = c.isPackaged, ot = c.getVersion(), fo = "aea", go = (e) => e.replace(/^v/, "").replace(/^stg-/, ""), di = () => {
  const e = p?.PROJECT_VERSIONS;
  if (!e) {
    console.log(
      "[initUpdater] PROJECT_VERSIONS not in sharedVariables, will run UpdateManager"
    );
    return;
  }
  try {
    const o = JSON.parse(e)[fo], r = go(ot);
    if (!o) {
      console.log(
        `[initUpdater] No Cook tag for ${fo}, will run UpdateManager`
      ), console.log(
        `[initUpdater] Version check: current="${ot}" (${r}), Cook="none", isLatest=unknown`
      );
      return;
    }
    const n = go(o), s = r === n;
    return console.log(
      `[initUpdater] Version check: current="${ot}" (${r}), Cook="${o}" (${n}), isLatest=${s}`
    ), s;
  } catch (t) {
    console.log(
      "[initUpdater] Failed to parse PROJECT_VERSIONS, will run UpdateManager",
      t
    );
    return;
  }
};
let K = null;
const j = {
  status: Er ? "checking" : "up-to-date"
};
let X = null;
const Lt = () => {
  v.getAllWindows().forEach((e) => {
    e.isDestroyed() || e.close();
  });
}, pi = (e) => [
  `Source: ${e.sourcePath}`,
  `Destination: ${e.targetPath}`,
  "",
  e.error.message
].join(`
`), fi = async (e) => {
  console.error("[Updater] macOS install location check failed", {
    action: e.action,
    error: e.error,
    sourcePath: e.sourcePath,
    targetPath: e.targetPath
  }), T.withScope((t) => {
    t.setContext("mac_install_location", {
      action: e.action,
      sourcePath: e.sourcePath,
      targetPath: e.targetPath
    }), T.captureException(e.error);
  }), await ee.showMessageBox({
    buttons: ["Quit AutoCut"],
    defaultId: 0,
    detail: pi(e),
    message: "AutoCut could not prepare a writable Applications folder for the update.",
    title: "AutoCut update could not start",
    type: "error"
  }), ne(), await P.waitForDrain(), Lt(), c.quit(), Ve(41);
}, gi = async (e) => {
  console.log("[Updater] Handing off update to writable macOS install", {
    action: e.action,
    sourcePath: e.sourcePath,
    targetPath: e.targetPath
  }), ne(), wr(e.targetPath), await P.waitForDrain(), Lt(), c.quit(), Ve(42);
}, hi = async () => {
  if (process.platform !== "darwin")
    return !0;
  const e = await mr();
  return e.status === "ready" ? (console.log("[Updater] macOS install is replaceable", {
    currentPath: e.currentPath,
    scope: e.scope
  }), !0) : e.status === "relaunching" ? (await gi(e), !1) : (await fi(e), !1);
}, mi = async () => {
  if (Er) {
    const e = di();
    if (e) {
      console.log(
        "[initUpdater] Current version matches Cook, skipping UpdateManager"
      ), j.status = "up-to-date";
      return;
    }
    console.log(
      "[initUpdater] Version mismatch or unavailable, running UpdateManager..."
    ), console.log("App is packaged, setting up auto updater...");
    const t = p?.UPDATER_URL || "", o = Ja();
    console.log("Auto updater feed URL:", t);
    try {
      K = new Fr(t, o), console.log("UpdateManager created successfully"), console.log(
        "[initUpdater] updateManager",
        K.getAppId(),
        K.getCurrentVersion(),
        K.getUpdatePendingRestart()
      ), X = await K.checkForUpdatesAsync(), console.log("[initUpdater] updateInfo", X), X ? (j.status = "downloading", console.log("[initUpdater] downloading update", X), await K.downloadUpdateAsync(X, (r) => {
        console.log("[initUpdater] downloading update", r), j.status = "downloading", j.progress = r;
      }), console.log("[initUpdater] update downloaded", X), j.status = "ready") : (j.status = e === !1 ? "error" : "up-to-date", e === !1 && console.error(
        "[initUpdater] Cook targets another version but Velopack returned no update"
      )), console.log("[initUpdater] end");
    } catch (r) {
      j.status = "error", Q("velopack-updater", r, { url: t }), console.error(`Failed to check for updates from ${t}:`), console.error(r), console.error((r || {}).stack), console.error((r || {}).message), console.error((r || {}).name), T.captureException(r);
    }
  }
}, wi = () => {
  g.on("updater:getInfos", async (e) => {
    e.returnValue = j;
  }), g.on("updater:restart", async () => {
    const e = K, t = X;
    if (!e || !t || !await hi())
      return !1;
    console.log("restarting app", t);
    const r = process.platform === "darwin";
    e.waitExitThenApplyUpdate(
      t,
      r
    ), console.log("updater launched", t), Lt(), console.log("all windows closed", t), c.quit(), console.log("app quitted, exiting...", t), Ve(40);
  });
}, Ei = async () => {
  g.on("cookies:getAll", async (e) => {
    e.returnValue = Ea();
  }), g.on("cookies:get", async (e, t) => {
    e.returnValue = z(t);
  }), g.on("cookies:set", async (e, t, o) => {
    e.returnValue = gt(t, o);
  }), g.on("cookies:clearAll", async (e) => {
    e.returnValue = ya();
  }), await wa();
}, yi = (e) => {
  const t = e.trim();
  if (!t)
    throw new Error("AutoCut tools installer URL is empty");
  const r = /^[a-z][a-z\d+.-]*:/i.test(t) ? t : `https://${t}`, n = new URL(r);
  if (n.protocol !== "https:")
    throw new Error("AutoCut tools installer URLs must use HTTPS");
  return n.href;
}, Ri = (e) => e === void 0 ? [] : (Array.isArray(e) ? e : [e]).map(yi), Si = (e, t) => e.map((o) => {
  const r = new URL(o);
  return r.pathname.endsWith("/") || (r.pathname += "/"), new URL(t, r).href;
}), _i = async (e, t) => {
  const o = [];
  for (const r of e)
    try {
      return await t(r);
    } catch (n) {
      o.push(n);
    }
  throw new AggregateError(
    o,
    "AutoCut tools installer download failed from every configured mirror"
  );
}, Pi = "AutoCut", Ti = "win-x64/AutoCut_Tools_Installer.exe", Ii = "autocut-premiere-tool-installer", yr = "AUTOCUT_PREMIERE_TOOLS_INSTALLER_PATH", Ui = [
  "$ErrorActionPreference = 'Stop'",
  `$installer = Start-Process -FilePath $env:${yr} -Verb RunAs -Wait -PassThru`,
  "exit $installer.ExitCode"
].join("; "), Rr = () => p?.PREMIERE_PLUGIN_DIR ?? "", Sr = (e) => O.join(e, Pi), _r = (e) => {
  if (!_(e))
    return !1;
  const t = O.join(
    e,
    `.autocut-write-probe-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  try {
    return Rt(t, ""), _(t) && st(t), !0;
  } catch {
    try {
      _(t) && st(t);
    } catch (r) {
      console.warn(
        "[PremiereTools] Failed to remove write probe",
        t,
        r
      );
    }
    return !1;
  }
}, bi = () => {
  if ($.platform() !== "win32")
    return !1;
  const e = Rr();
  if (e === "")
    return !1;
  const t = Sr(e);
  return !(_(t) && _r(t));
}, Ai = (e) => {
  const t = e[Ii];
  return Ri(t);
}, vi = async () => {
  const e = "https://man.autocut.com/", { data: t } = await At(e);
  return Ai(t);
}, Ci = async (e) => {
  const { error: t, stderr: o } = await As(Ui, {
    env: { [yr]: e }
  });
  if (t)
    throw new Error(o || t.message);
}, Oi = async (e = {}) => {
  const { assumePremiereInstalled: t = !1 } = e;
  try {
    if ($.platform() !== "win32")
      return { status: "not-needed" };
    const o = Rr(), r = o !== "";
    if (!r && !t)
      return { status: "not-needed" };
    const n = await vi();
    if (n.length === 0)
      throw new Error("AutoCut tools installer project is missing");
    const s = Si(
      n,
      Ti
    ), a = Vr(
      O.join($.tmpdir(), "autocut-tools-")
    ), i = await _i(
      s,
      (l) => ge(l, a, { requireHttps: !0 })
    );
    if (!_(i))
      throw new Error("AutoCut tools installer download failed");
    if (await Ci(i), r) {
      const l = Sr(o);
      if (!_r(l))
        throw new Error(
          "AutoCut tools installer did not prepare a writable folder"
        );
    }
    return { status: "installed" };
  } catch (o) {
    return console.warn("[PremiereTools] install failed", o), { status: "error" };
  }
}, Ni = () => {
  g.handle(
    "electron:premiere-tools:install",
    async (e, t) => Oi(t ?? {})
  ), g.handle(
    "electron:premiere-tools:is-needed",
    async () => bi()
  );
}, Pr = async () => {
  console.log("Init IPC handlers"), Js(), console.log("Main window IPC handler initialized"), za(), console.log("Setup IPC handler initialized"), wi(), console.log("Updater IPC handler initialized"), $a(), console.log("Electron IPC handler initialized"), Ni(), console.log("Premiere tools IPC handler initialized"), await Ei(), console.log("Cookies IPC handler initialized"), ha(), console.log("Front IPC handler initialized");
}, Tr = (e) => {
  const t = Date.now(), o = e || p?.TEMP_FOLDER_PATH;
  if (!o) {
    console.error("Temp folder path is not set");
    return;
  }
  const r = o.split(/[\\/]/g).pop(), n = o.replace(/[^\\/]*?$/, ""), s = o + `-${t}`;
  console.log(`Renaming temp folder to ${s}`);
  try {
    D.renameSync(o, s), console.log("Temp folder renamed successfully");
  } catch (u) {
    console.error("Failed to rename temp folder:", u);
  }
  console.log("Cleaning up old temp folders...");
  const a = `${r}-`;
  let i = [];
  try {
    i = D.readdirSync(n);
  } catch (u) {
    console.error("Error reading temp directory:", u);
  }
  const l = i.filter((u) => u.startsWith(a)).map((u) => ({
    name: u,
    path: O.join(n, u),
    timestamp: parseInt(u.slice(a.length))
  })).sort((u, h) => h.timestamp - u.timestamp);
  l.length > 3 && l.slice(2).forEach((u) => {
    try {
      D.rmSync(u.path, { recursive: !0, force: !0 }), console.log(`Old temp folder ${u.name} deleted`);
    } catch (h) {
      console.error(`Failed to delete folder ${u.name}:`, h);
    }
  });
}, ho = (e = 0) => {
  console.log("Stopping electron app..."), Tr(), console.log(`Exiting with code ${e}...`), c.quit();
}, Ir = (e) => {
  console.log("Ensure single instance"), c.requestSingleInstanceLock() || (console.log(
    `Another instance is running, quitting this one. (args: ${process.argv.join(" ")})`
  ), c.exit(), process.exit(0)), console.log("Single instance lock acquired"), c.on("second-instance", (o, r) => {
    e?.(r) || (console.log(
      `Another instance tried to run (args: ${r.join(" ")}), restoring window...`
    ), ir());
  });
}, ki = () => {
  let e = "NOT_SET";
  const t = U(_t(), "com.autocut", "com.autocut.aea");
  D.existsSync(t) && Tr(t), D.mkdirSync(t, {
    recursive: !0
  }), console.log("Temp folder created");
  try {
    e = (c.isPackaged, U(t, "autocut.aea.log")), P.init(e), e = e?.replace(/\.aea\.log$/, ".log");
  } catch (o) {
    T.captureException(o);
  }
  return { tempFolderPath: t, logFilePath: e };
}, xi = () => {
  process.platform === "darwin" && (Bt.setUserDefault(
    "NSDisabledDictationMenuItem",
    "boolean",
    !0
  ), Bt.setUserDefault(
    "NSDisabledCharacterPaletteMenuItem",
    "boolean",
    !0
  ));
}, Di = "phc_BVd2MnQE5vlEoWQiSonbRrDBGb2pZrywnFpP5opYwO6", Li = "https://photo.autocut.com", Mi = "posthogDistinctId", Fi = "appUUID";
let $e;
const $i = () => c.isPackaged ? "production" : "development", mo = (e) => {
  if (e)
    try {
      const t = JSON.parse(e);
      return typeof t == "string" ? t : void 0;
    } catch {
      return e;
    }
}, Ur = () => {
  try {
    return mo(z(Mi)) ?? mo(z(Fi));
  } catch {
    return;
  }
}, Bi = () => {
  try {
    $e = new Zr(Di, {
      host: Li,
      // Send events promptly so nothing is lost on a quick quit, while keeping
      // every network call in the background.
      flushAt: 1,
      flushInterval: 1e4,
      // Bound network work so a slow/offline endpoint can never pile up retries.
      requestTimeout: 3e3,
      fetchRetryCount: 0,
      // This client only captures events: never touch feature flags, surveys or
      // remote config, which would otherwise fire requests on init/identify.
      preloadFeatureFlags: !1,
      disableSurveys: !0
    });
  } catch (e) {
    console.warn("[PostHog] Failed to initialize client", e);
  }
}, Y = (e, t = {}) => {
  try {
    const o = Ur();
    if (!$e || !o)
      return;
    $e.capture({
      distinctId: o,
      event: e,
      properties: {
        app: "autocut_aea",
        environment: $i(),
        "electron-version": c.getVersion(),
        ...t
      }
    });
  } catch (o) {
    console.warn("[PostHog] Failed to capture main event", o);
  }
}, Hi = async () => {
  try {
    await $e?.shutdown(2e3);
  } catch (e) {
    console.warn("[PostHog] Failed to shutdown client", e);
  }
}, Vi = [
  "autocut.aea.log",
  "autocut.compute.log",
  "autocut.front.log",
  "autocut.host.log",
  "autocut.hostServer.log"
], Wi = () => {
  c.isPackaged && console.log("ENV : " + JSON.stringify(process.env, null, 2)), T.init({
    dsn: "https://325e1f958a57b0024aab4e49117820cf@o4504764662087680.ingest.us.sentry.io/4507865700564992",
    environment: c.isPackaged ? "production" : "development",
    beforeSend(e, t) {
      e.tags = {
        ...e.tags,
        "AutoCut Version": c.getVersion(),
        key: z("userKey"),
        UUID: z("appUUID"),
        country: z("countryInfos"),
        posthogDistinctId: Ur()
      };
      try {
        const o = JSON.parse(
          Ne(
            U(c.getPath("userData"), "autocut_data.json"),
            "utf-8"
          )
        ), r = JSON.parse(o.appUUID);
        if (typeof r != "string")
          throw new Error("Invalid appUUID cookie");
        e.user = { ...e.user, id: r }, e.tags.UUID = r;
      } catch {
      }
      try {
        const o = U(_t(), "com.autocut", "com.autocut.aea");
        for (const r of Vi) {
          const n = U(o, r);
          _(n) && (t.attachments ??= [], t.attachments.push({
            filename: r,
            data: Ne(n, "utf-8")
          }));
        }
      } catch {
      }
      return e;
    }
  });
}, E = (e, t) => {
  try {
    return console.log(
      `Step ${A.Bold}${e}${A.Reset} ongoing ...`
    ), ac(e), t();
  } catch (o) {
    throw console.log(`${e} failed`), ee.showErrorBox("Error", o.message), T.withScope((r) => {
      r.setFingerprint([e]), r.setTag("appUUID", z("appUUID")), T.captureException(o);
    }), o;
  }
};
let S = null;
const ae = () => S ? {
  connected: S.connected,
  exitCode: S.exitCode,
  hasInstance: !0,
  killed: S.killed,
  pid: S.pid,
  signalCode: S.signalCode,
  spawnfile: S.spawnfile
} : { hasInstance: !1 }, br = async (e, { withCache: t = !1 } = {}) => {
  if (!p?.COMPUTE_URL) throw new Error("COMPUTE_URL is not set");
  if (!p?.TEMP_FOLDER_PATH)
    throw new Error("TEMP_FOLDER_PATH is not set");
  const o = new URL(e, p.COMPUTE_URL).href;
  console.log("Downloading script from", o);
  const r = e.split("/"), n = r.length > 1 ? r.slice(0, -1).join("/") : "", s = r[r.length - 1], a = O.join(
    p.TEMP_FOLDER_PATH,
    "com.autocut.compute",
    n
  );
  console.log(
    `Writing ${s} compute script to ${a} folder`
  ), V(a, { recursive: !0 });
  const i = await ge(o, a, { withCache: t });
  return console.log(`Script ${e} downloaded to ${i}`), i;
}, rt = (e = "unspecified") => {
  P.log(
    "Stopping compute",
    {
      reason: e,
      ...ae()
    },
    { forceFlush: !0 }
  ), S?.kill();
}, ji = async (e) => {
  try {
    const t = await br("main.cjs", { withCache: !1 });
    S !== null && (P.warn(
      "Existing compute instance found before start; killing it",
      {
        ...ae()
      },
      { forceFlush: !0 }
    ), S.kill()), S = Lo(t, [], {
      execArgv: ke ? [] : ["--inspect=9231"],
      env: {
        ...process.env,
        ...e
      }
    }), console.log("Compute forked", {
      execArgv: ke ? [] : ["--inspect=9231"],
      filePath: t,
      pid: S.pid,
      platform: process.platform
    }), S.on("spawn", () => {
      console.log("Compute spawned", ae());
    }), S.on("disconnect", () => {
      console.warn("Compute IPC channel disconnected", {
        ...ae()
      });
    }), S.on("error", (o) => {
      console.error("Compute child process error", {
        error: o instanceof Error ? o.stack : o,
        ...ae()
      });
    }), S.on("exit", (o, r) => {
      P.error(
        "Compute exited",
        {
          code: o,
          signal: r,
          ...ae()
        },
        { forceFlush: !0 }
      );
    }), process.on("SIGINT", () => rt("electron SIGINT")), process.on("SIGTERM", () => rt("electron SIGTERM")), process.on("exit", () => rt("electron exit")), lr(S, "compute"), console.log("Compute started");
  } catch (t) {
    console.error(t);
  }
};
let me;
const nt = () => {
  console.log("Stopping  Ipc server"), me.close();
}, qi = () => {
  me = new Bo(
    {
      socketRootPath: p?.TEMP_FOLDER_PATH
    },
    async (e, t) => {
      try {
        switch (t.event) {
          case "downloadScript": {
            const o = t.messageData, r = await br(o.data);
            me.respond(e, t.id, r);
            break;
          }
        }
      } catch (o) {
        const r = {
          message: o.message,
          name: o.name,
          stack: o.stack,
          from: "ipc"
        };
        me.error(e, t.id, r);
      }
    }
  ), me.listen("com.autocut.main"), process.on("SIGINT", () => nt()), process.on("SIGTERM", () => nt()), process.on("exit", () => nt());
}, wo = "qa-selector:list", Eo = "qa-selector:start", yo = "qa-selector:start-staging", Gi = "/v2/public/qa-list", Qi = 1e4, zi = () => {
  const e = "https://man.autocut.com/", t = e.length > 0 ? e : "https://man.autocut.com/";
  return new URL(Gi, t);
}, Ro = async (e) => {
  if (!J())
    throw new Error("The QA selector is unavailable in this build");
  const t = new AbortController(), o = setTimeout(() => t.abort(), Qi), r = () => t.abort();
  e?.addEventListener("abort", r, { once: !0 }), e?.aborted && t.abort();
  try {
    const n = await L.fetch(zi().href, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache"
      },
      method: "GET",
      signal: t.signal
    });
    if (!n.ok)
      throw new Error(`QA list request failed with HTTP ${n.status}`);
    const s = await n.json();
    return Ms(s);
  } finally {
    clearTimeout(o), e?.removeEventListener("abort", r);
  }
}, So = (e) => (console.error("[QA Selector] Request failed:", e), e instanceof Error ? e.message : "The QA service is temporarily unavailable"), Ji = async (e) => {
  if (!J())
    throw new Error("The QA selector can only open in packaged staging builds");
  let t = !1, o = !1, r = !1;
  const n = new AbortController(), s = w.join(
    process.resourcesPath,
    "assets",
    "qa-selector"
  ), a = new v({
    autoHideMenuBar: !0,
    backgroundColor: "#101015",
    center: !0,
    height: 760,
    minHeight: 560,
    minWidth: 640,
    show: !1,
    title: "AutoCut QA",
    webPreferences: {
      contextIsolation: !0,
      devTools: !1,
      nodeIntegration: !1,
      preload: w.join(s, "preload.cjs"),
      sandbox: !0,
      webviewTag: !1
    },
    width: 760
  }), i = (f) => !a.isDestroyed() && a.webContents.id === f, l = () => {
    if (o)
      return "AutoCut startup has already resumed";
    if (!Xe(
      r,
      a.isDestroyed()
    ))
      return "AutoCut is closing";
  }, u = async () => {
    if (Xe(
      r,
      a.isDestroyed()
    )) {
      a.hide();
      try {
        await e();
      } catch (f) {
        console.error(
          "[QA Selector] Ordinary bootstrap failed after selector:",
          f
        ), c.quit();
        return;
      }
      Xe(
        r,
        a.isDestroyed()
      ) && (t = !0, a.close());
    }
  }, h = () => (o = !0, setImmediate(() => void u()), { ok: !0 });
  g.handle(wo, async (f) => {
    if (!i(f.sender.id))
      return { error: "Unauthorized QA selector request", ok: !1 };
    try {
      return { items: await Ro(n.signal), ok: !0 };
    } catch (m) {
      return { error: So(m), ok: !1 };
    }
  }), g.handle(
    Eo,
    async (f, m) => {
      if (!i(f.sender.id))
        return { error: "Unauthorized QA selector request", ok: !1 };
      const y = l();
      if (y)
        return { error: y, ok: !1 };
      try {
        const M = await Ro(n.signal), N = Fs(M, m);
        if (N)
          return { error: N, ok: !1 };
        const B = l();
        return B ? { error: B, ok: !1 } : (dn(Number(m)), h());
      } catch (M) {
        return { error: So(M), ok: !1 };
      }
    }
  ), g.handle(yo, (f) => {
    if (!i(f.sender.id))
      return { error: "Unauthorized QA selector request", ok: !1 };
    const m = l();
    return m ? { error: m, ok: !1 } : h();
  });
  const d = () => {
    g.removeHandler(wo), g.removeHandler(Eo), g.removeHandler(yo);
  };
  c.once("before-quit", () => {
    r = !0, n.abort();
  }), a.once("ready-to-show", () => a.show()), a.on("close", () => {
    n.abort(), !t && !r && c.quit();
  }), a.once("closed", () => {
    n.abort(), d();
  });
  try {
    await a.loadFile(w.join(s, "index.html"));
  } catch (f) {
    throw d(), a.isDestroyed() || (t = !0, a.destroy()), f;
  }
  return a;
}, Ki = "autocut", Xi = () => {
  process.platform !== "darwin" && c.setAsDefaultProtocolClient(Ki);
}, _o = "AUTOCUT_DETACHED", Yi = "--no-detached", Zi = () => {
  if (process.platform !== "win32") return;
  if (process.argv.includes(Yi))
    return console.log("[Process] Skipping detached re-spawn (--no-detached)");
  if (process.env[_o] === "1")
    return console.log("[Process] Already detached");
  console.log("[Process] Re-spawning as detached process"), Ho(process.execPath, process.argv.slice(1), {
    detached: !0,
    stdio: "ignore",
    env: { ...process.env, [_o]: "1" }
  }).unref(), process.exit(0);
}, ec = () => {
  c.on("window-all-closed", () => {
    console.log("All windows are closed, quitting..."), Ve(50);
  }), c.on("activate", () => {
    console.log("activate event triggered, restoring window..."), ir();
  });
}, Po = 1136, To = 639, tc = () => new Promise(async (e) => {
  const t = c.getPath("userData"), o = Qe.join(t, "onboarding.json");
  if (Ht.existsSync(o)) {
    e(!0);
    return;
  }
  const r = yt.getPrimaryDisplay(), { width: n, height: s } = r.workAreaSize, a = new v({
    width: Po,
    height: To,
    maxWidth: Math.min(Po, n * 0.8),
    maxHeight: Math.min(To, s * 0.8),
    center: !0,
    alwaysOnTop: !0,
    resizable: !1,
    movable: !1,
    minimizable: !1,
    maximizable: !1,
    fullscreenable: !1,
    backgroundColor: "#15151c",
    frame: !1,
    webPreferences: {
      devTools: !1,
      nodeIntegration: !1,
      contextIsolation: !0,
      sandbox: !1,
      webviewTag: !1,
      preload: Qe.join(c.getAppPath(), "packages/preload/dist/index.mjs")
    }
  });
  Qo(a), a.removeMenu(), a.setMenuBarVisibility(!1), a.setFullScreenable(!1), oc(), a.on("show", () => {
  }), g.on("electron:onboarding:redirectToFront", (l) => {
    console.log("Redirecting to front"), l.returnValue = !0, a.loadURL(p?.ONBOARDING_URL || "").catch((u) => {
      console.error("Error redirecting to onboarding front", u);
    });
  }), g.on("electron:onboarding:completed", (l) => {
    l.returnValue = !0, a.close(), Ht.writeFileSync(o, JSON.stringify({ onboarded: !0 })), e(!0);
  });
  const i = c.isPackaged ? Qe.join(
    process.resourcesPath,
    "./assets/offline-page/offline.onboarding.html"
  ) : "./buildResources/assets/offline-page/offline.onboarding.html";
  console.log("Loading file : ", i), await a.loadFile(i), a.on("closed", () => {
    e(!1);
  });
}), oc = () => {
  const t = kt([
    {
      label: "AutoCut",
      submenu: [
        {
          label: "Quit AutoCut",
          click() {
            c.quit();
          }
        }
      ]
    }
  ]);
  ce.setApplicationMenu(ce.buildFromTemplate(t));
}, rc = {
  win32: ["arm64", "x64"]
}, nc = async () => {
  const e = Gr(), t = Qr();
  if (!(rc?.[t] || []).includes(e))
    return;
  const o = `https://cdn.autocut.tech/0_ressources/tar/${t}/${e}/tar.exe`;
  console.log("Downloading tar...");
  try {
    const r = U(`${c.getPath("userData")}`), n = await ge(o, r), s = await Va(n);
    p && (p.TAR_PATH = s === n ? await ie(n) : s);
  } catch (r) {
    console.error("Failed to download tar:", r);
  }
}, sc = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !0, VITE_COOK_URL: "https://man.autocut.com/", VITE_ENV: "production", VITE_VERSION: "4.60.33", VITE_WEBAPP_URL: "https://www.autocut.com/app", VITE_WEBSITE_URL: "https://www.autocut.com" }, Ar = (e) => {
  if (e.code !== "EPIPE") throw e;
};
process.stdout?.on?.("error", Ar);
process.stderr?.on?.("error", Ar);
console.log(`[Startup] argv: ${process.argv.join(" ")}`);
const Ae = (e, t) => console.log(`[Velopack] hook=${e} version=${t}`);
$r.build().setLogger((e, t) => console.log(`[Velopack] [${e}] ${t}`)).setAutoApplyOnStartup(!1).onAfterInstallFastCallback((e) => Ae("after-install", e)).onBeforeUpdateFastCallback((e) => Ae("before-update", e)).onAfterUpdateFastCallback((e) => Ae("after-update", e)).onBeforeUninstallFastCallback((e) => Ae("before-uninstall", e)).onFirstRun((e) => console.log(`[Velopack] first-run version=${e}`)).onRestarted((e) => console.log(`[Velopack] restarted version=${e}`)).run();
let vr = !1, Be = "";
const ac = (e) => {
  Be = e;
};
let G, Mt;
const Cr = (e) => {
  const t = e.indexOf("://");
  t !== -1 && (Mt = e, G = e.slice(t + 3));
}, Io = () => {
  Mt = void 0, G = void 0;
};
if (process.platform !== "darwin") {
  const e = process.argv.find(
    (t) => /^autocut(?:stg)?:\/\//.test(t)
  );
  e && Cr(e);
}
c.on("open-url", (e, t) => {
  e.preventDefault(), Cr(t);
});
ma();
const ht = J(), ic = Ot(), Or = nr(process.argv), Nr = () => Ls({
  deepLinkPath: G,
  hasToggleArgument: Or,
  isPackaged: c.isPackaged,
  isStaging: ht,
  qaModeEnabled: ic
}), kr = Nr();
console.log("appName", sc);
Zi();
const xr = (e) => nr(e) ? (console.log("[QA Mode] Toggle requested by a second instance"), Nt(), !0) : !1;
let mt = !1, Uo = !1, bo = !1, wt, Et = !1;
const cc = () => {
  bo || (E("initSentry", Wi), bo = !0);
}, Dr = (e) => {
  mt || (E("initPostHog", Bi), E("initAxios", Gn), e && E(
    "ensureSingleInstance",
    () => Ir(xr)
  ), wt = E("initLogger", ki), mt = !0, console.log("Running electron version", c.getVersion()), console.log("Launch args:", process.argv.join(" ")), console.log(`[Process] pid=${process.pid} ppid=${process.ppid}`));
}, Lr = () => {
  if (!Uo) {
    if (!mt)
      throw new Error("Ordinary core must initialize before crash tracking");
    E("initProcessExitListeners", () => {
      process.on("SIGINT", () => ho(100)), process.on("SIGTERM", () => ho(101));
    }), Cs() && (console.log("Starting file exists, asking user for action"), Et = !0), Os(), E("initMacSpecificSettings", xi), Uo = !0;
  }
};
cc();
kr === "ordinary" ? Dr(!0) : Ir(xr);
c.on("before-quit", () => {
  console.log("[App] before-quit"), Hi();
});
c.on("will-quit", () => console.log("[App] will-quit"));
c.on("quit", (e, t) => console.log(`[App] quit with code=${t}`));
c.on(
  "render-process-gone",
  (e, t, o) => console.error("[App] render-process-gone:", o)
);
c.on(
  "child-process-gone",
  (e, t) => console.error("[App] child-process-gone:", t)
);
process.on("exit", (e) => console.log(`[Process] exit with code=${e}`));
process.on(
  "beforeExit",
  (e) => console.log(`[Process] beforeExit with code=${e}`)
);
process.on("disconnect", () => console.log("[Process] disconnect"));
process.on(
  "uncaughtException",
  (e) => console.error("[Process] uncaughtException:", e?.stack ?? e)
);
process.on(
  "uncaughtExceptionMonitor",
  (e) => console.error("[Process] uncaughtExceptionMonitor:", e?.stack ?? e)
);
process.on(
  "unhandledRejection",
  (e, t) => console.error("[Process] unhandledRejection:", e)
);
process.on(
  "warning",
  (e) => console.warn(`[Process] warning: ${e.name}: ${e.message}`)
);
const _e = (e) => () => console.log(`[Process] Received signal: ${e}`);
process.on("SIGINT", _e("SIGINT"));
process.on("SIGTERM", _e("SIGTERM"));
process.on("SIGHUP", _e("SIGHUP"));
process.on("SIGPIPE", _e("SIGPIPE"));
process.platform === "win32" && process.on("SIGBREAK", _e("SIGBREAK"));
kr === "ordinary" && Lr();
const lc = async () => {
  const e = c.isPackaged ? void 0 : "http://localhost:5573";
  return e && (console.log("Checking dev system report availability..."), await Ko(e, {
    timeout: 5e3
  })) ? (console.log("Using online system report"), e) : `file://${c.isPackaged ? w.join(process.resourcesPath, "./assets/sysr/index.html") : "./buildResources/assets/sysr/index.html"}`;
}, Ao = async (e) => {
  console.log(`Opening system report from ${e || "unknown"}...`);
  const t = await lc();
  await E("initIPCHandlers", Pr), Y("aea_system_report_opened", { from: e ?? "unknown" }), Oe(t, {
    size: { width: 600, height: 800 },
    frame: !0
  }), ne();
};
let k;
const Ft = (e) => ({
  installAction: e.action,
  installScope: e.scope,
  installStatus: e.status
}), uc = async (e) => {
  console.error("[MacInstall] Installation failed", {
    action: e.action,
    error: e.error,
    sourcePath: e.sourcePath,
    targetPath: e.targetPath
  }), Y("aea_installation_failed", {
    ...Ft(e),
    error: e.error.message
  }), await ee.showMessageBox({
    buttons: ["Quit AutoCut"],
    defaultId: 0,
    detail: [
      `Source: ${e.sourcePath}`,
      `Destination: ${e.targetPath}`,
      "",
      e.error.message
    ].join(`
`),
    message: "AutoCut could not be installed in a writable Applications folder.",
    title: "AutoCut installation failed",
    type: "error"
  }), ne(), await P.waitForDrain(), c.quit();
}, dc = async (e) => {
  console.log("[MacInstall] Handing off to installed app", {
    action: e.action,
    sourcePath: e.sourcePath,
    targetPath: e.targetPath
  }), Y(
    "aea_installation_handoff",
    Ft(e)
  ), ne(), wr(
    e.targetPath,
    Mt
  ), await P.waitForDrain(), c.quit();
}, pc = async () => k?.status === "ready" || (k = await mr(), console.log(
  "[MacInstall] Location result",
  Ft(k)
), k.status === "ready") ? !0 : k.status === "relaunching" ? (await dc(k), !1) : (await uc(k), !1), fc = async () => {
  if (Dr(!1), Lr(), !wt)
    throw new Error("Ordinary startup paths are unavailable");
  const { logFilePath: e, tempFolderPath: t } = wt;
  if (console.log("AEA is ready"), console.log("Running from", c.getAppPath()), !k || k.status !== "ready")
    throw new Error("macOS install location was not resolved before startup");
  if (console.log("shouldDisplayErrorDialog", Et), Et && ((await ee.showMessageBox({
    type: "question",
    buttons: ["Show AutoCut System Report", "Launch AutoCut Normally"],
    title: "AutoCut",
    message: "An error occured during last session launch.",
    detail: "Would you like to show the system report or launch AutoCut normally?",
    defaultId: 0
  })).response === 0 ? G = "system-report" : Io()), G)
    switch (console.log("Deep link path", G), G.replace(/^\//, "").replace(/\/$/, "")) {
      case "system-report":
        await Ao("deep-link");
        return;
      default:
        console.log("Unknown deep link path", G), Io();
    }
  try {
    await E("initDeepLink", Xi), await E("initIPCHandlers", Pr);
    let o;
    if (!L.isOnline()) {
      const i = new Error("net::ERR_INTERNET_DISCONNECTED");
      Se(i, {
        operation: "startup-preflight"
      }), Me("offline"), o = await E("createWindow", () => Oe()), await so(i);
    }
    let r = !1;
    for (; !r; )
      try {
        await E("initSharedVariables", tr), r = !0;
      } catch (i) {
        if (!(ye(i) !== void 0 || i instanceof vt && i.invalidKeys.length === 0 && Jn()))
          throw i;
        (!o || o.isDestroyed()) && (o = await E(
          "createWindow",
          () => Oe()
        )), await so(i);
      }
    if (Me("ready"), o && !o.isDestroyed() && o.close(), Y("aea_app_started", { packaged: c.isPackaged }), !await E(
      "initOnboarding",
      tc
    )) {
      Y("aea_onboarding_incomplete");
      return;
    }
    if (E("createWindow", () => Oe()), E("initUpdater", mi), await E("initTar", nc), !p)
      throw new Error("Shared variables are unavailable after initialization");
    p.TEMP_FOLDER_PATH = t, p.LOG_FILE_PATH = e, console.log("Starting IPC server..."), E("startIpcServer", qi), console.log("Starting compute AI...");
    const s = E(
      "startCompute",
      () => ji(p || {})
    );
    console.log("Starting host server...");
    const a = E(
      "startHostServer",
      () => na(p || {})
    );
    await Promise.all([s, a]), vr = !0, Y("aea_initialization_completed", {
      copiedToApplications: !0,
      installAction: k.action,
      installScope: k.scope
    }), c.isPackaged && setTimeout(() => {
      E("initEvents", ec);
    }, 1e4);
  } catch (o) {
    console.error("Error during initialization:", o), Y("aea_initialization_failed", {
      step: Be,
      error: o instanceof Error ? o.message : String(o)
    });
    const { response: r } = await ee.showMessageBox({
      type: "error",
      title: "AutoCut Initialization Error",
      message: "An error occurred during AutoCut initialization.",
      detail: `Error during step : ${Be}

Would you like to open the AutoCut system report or close AutoCut?`,
      buttons: ["Open AutoCut System Report", "Close AutoCut"],
      defaultId: 0,
      cancelId: 1
    });
    if (r === 0) {
      Ao("error");
      return;
    } else {
      c.quit();
      return;
    }
  }
  ne(), console.log("Initialization complete");
};
let vo;
const Co = () => (vo ??= fc(), vo), gc = async () => {
  if (ht && Or) {
    console.log("[QA Mode] Toggle requested by this launch"), Nt();
    return;
  }
  if (await pc()) {
    if (ht) {
      if (js(), Vs())
        return;
      if (Nr() === "selector") {
        await Ji(Co);
        return;
      }
    }
    await Co();
  }
};
c.on("ready", () => {
  gc().catch((e) => {
    console.error("Error before AutoCut bootstrap:", e), ee.showErrorBox(
      "AutoCut Initialization Error",
      e instanceof Error ? e.message : String(e)
    ), c.quit();
  });
});
export {
  vr as isElectronInitialized,
  ac as setStep,
  Be as step
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9lbnYudHMiLCIuLi9zcmMvc2VjdXJpdHktcmVzdHJpY3Rpb25zLnRzIiwiLi4vc3JjL3FhL3FhQ29va0NvbnRyYWN0LnRzIiwiLi4vc3JjL3FhL3FhVGFyZ2V0LnRzIiwiLi4vc3JjL3V0aWxzL2VsZWN0cm9uTmV0QWRhcHRlci5jb250cmFjdHMudHMiLCIuLi9zcmMvdXRpbHMvZWxlY3Ryb25OZXRBZGFwdGVyLnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL25ldHdvcmtFcnJvci5zdGFydC51dGlscy50cyIsIi4uL3NyYy91dGlscy9zdGFydEZ1bmN0aW9ucy9uZXR3b3JrUHJvYmUuc3RhcnQudXRpbHMudHMiLCIuLi9zcmMvdXRpbHMvc3RhcnRGdW5jdGlvbnMvbmV0d29ya1JldHJ5LnN0YXJ0LnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL3Rsc0Vycm9yLnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL2F4aW9zLnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL2ZldGNoLnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3N0YXJ0dXBOZXR3b3JrTW9uaXRvci5zdGFydC51dGlscy50cyIsIi4uL3NyYy91dGlscy9zdGFydEZ1bmN0aW9ucy91cmxzLnN0YXJ0LnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL2FyY2guc3RhcnQudXRpbHMudHMiLCIuLi9zcmMvdXRpbHMvc3RhcnRGdW5jdGlvbnMvcHJlbWllcmVQbHVnaW5EaXIuc3RhcnQudXRpbHMudHMiLCIuLi9zcmMvdXRpbHMvc3RhcnRGdW5jdGlvbnMvc2hhcmVkVmFyaWFibGVzQXNzZXJ0LnN0YXJ0LnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL3VybEZvcm1hdC51dGlscy50cyIsIi4uL3NyYy91dGlscy9jaGlsZFByb2Nlc3MudXRpbHMudHMiLCIuLi9zcmMvdXRpbHMvcGF0aC51dGlscy50cyIsIi4uL3NyYy91dGlscy9zdGFydEZ1bmN0aW9ucy9zaGFyZWRWYXJpYWJsZXMuc3RhcnQudXRpbHMudHMiLCIuLi9zcmMvdXRpbHMvc3RhcnRpbmdGaWxlLnV0aWxzLnRzIiwiLi4vc3JjL3FhL3FhQ29udHJhY3RzLnRzIiwiLi4vc3JjL3FhL3FhTWFya2VyLnRzIiwiLi4vc3JjL3FhL3FhTW9kZS50cyIsIi4uL3NyYy9tYWluV2luZG93LnRzIiwiLi4vc3JjL3V0aWxzL2xvZ2dlci51dGlscy50cyIsIi4uL3NyYy9zdWJwcm9jZXNzVGVybWluYXRpb24udHMiLCIuLi9zcmMvaG9zdFNlcnZlci50cyIsIi4uL3NyYy9mcm9udElwYy50cyIsIi4uL3NyYy91dGlscy9zdGFydEZ1bmN0aW9ucy9hcHBOYW1lLnN0YXJ0LnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL2Nvb2tpZXMudXRpbHMudHMiLCIuLi8uLi8uLi8uLi9zaGFyZWQvcHByby1qc3gvcHByb0pzeEFydGlmYWN0LnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL3Bwcm9Kc3hDYWNoZS51dGlscy50cyIsIi4uL3NyYy91dGlscy9wcHJvSnN4LnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3N0YXJ0dXBOZXR3b3JrU3RhdGUuc3RhcnQudXRpbHMudHMiLCIuLi9zcmMvdXRpbHMvd2luZG93c0Vudmlyb25tZW50LnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL2VsZWN0cm9uLnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL3Rhci51dGlscy50cyIsIi4uL3NyYy91dGlscy9zZXR1cC51dGlscy50cyIsIi4uL3NyYy9xYS9xYVVwZGF0ZXIudHMiLCIuLi9zcmMvdXRpbHMvc3RhcnRGdW5jdGlvbnMvbWFjSW5zdGFsbExvY2F0aW9uLnN0YXJ0LnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3VwZGF0ZXIuc3RhcnQudXRpbHMudHMiLCIuLi9zcmMvdXRpbHMvc3RhcnRGdW5jdGlvbnMvY29va2llcy5zdGFydC51dGlscy50cyIsIi4uL3NyYy91dGlscy9zdGFydEZ1bmN0aW9ucy9wcmVtaWVyZVRvb2xzSW5zdGFsbGVyLmNvbnRyYWN0cy50cyIsIi4uL3NyYy91dGlscy9zdGFydEZ1bmN0aW9ucy9wcmVtaWVyZVRvb2xzLnN0YXJ0LnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL2lwYy51dGlscy50cyIsIi4uL3NyYy91dGlscy9yZW5hbWVGb2xkZXIudXRpbHMudHMiLCIuLi9zcmMvdXRpbHMvcHJvY2Vzcy51dGlscy50cyIsIi4uL3NyYy91dGlscy9zdGFydEZ1bmN0aW9ucy9lbnN1cmVTaW5nbGVJbnN0YW5jZS5zdGFydC51dGlscy50cyIsIi4uL3NyYy91dGlscy9zdGFydEZ1bmN0aW9ucy9sb2dnZXIuc3RhcnQudXRpbHMudHMiLCIuLi9zcmMvdXRpbHMvc3RhcnRGdW5jdGlvbnMvbWFjLnN0YXJ0LnV0aWxzLnRzIiwiLi4vc3JjL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3Bvc3Rob2cuc3RhcnQudXRpbHMudHMiLCIuLi9zcmMvdXRpbHMvc3RhcnRGdW5jdGlvbnMvc2VudHJ5LnN0YXJ0LnV0aWxzLnRzIiwiLi4vc3JjL2NvbXB1dGUudHMiLCIuLi9zcmMvaXBjLnRzIiwiLi4vc3JjL3FhL3FhU2VsZWN0b3IudHMiLCIuLi9zcmMvdXRpbHMvc3RhcnRGdW5jdGlvbnMvZGVlcGxpbmsuc3RhcnQudXRpbHMudHMiLCIuLi9zcmMvdXRpbHMvc3RhcnRGdW5jdGlvbnMvZGV0YWNoRnJvbVBhcmVudC5zdGFydC51dGlscy50cyIsIi4uL3NyYy91dGlscy9zdGFydEZ1bmN0aW9ucy9ldmVudHMuc3RhcnQudXRpbHMudHMiLCIuLi9zcmMvdXRpbHMvc3RhcnRGdW5jdGlvbnMvb25ib2FyZGluZy5zdGFydC51dGlscy50cyIsIi4uL3NyYy91dGlscy9zdGFydEZ1bmN0aW9ucy90YXIuc3RhcnQudXRpbHMudHMiLCIuLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy9AdHMtaWdub3JlXG5jb25zdCBDVVJSRU5UX0VOViA9XG4gIGltcG9ydC5tZXRhLmVudi5WSVRFX0VOViB8fCBpbXBvcnQubWV0YS5lbnYuTU9ERSB8fCAncHJvZHVjdGlvbic7XG5cbmV4cG9ydCBjb25zdCBJU19ERVYgPSBDVVJSRU5UX0VOViA9PT0gJ2RldmVsb3BtZW50JztcbmV4cG9ydCBjb25zdCBJU19TVEFHSU5HID0gQ1VSUkVOVF9FTlYgPT09ICdzdGFnaW5nJztcbmV4cG9ydCBjb25zdCBJU19QUk9EID0gQ1VSUkVOVF9FTlYgPT09ICdwcm9kdWN0aW9uJztcbiIsImltcG9ydCB0eXBlIHtTZXNzaW9ufSBmcm9tICdlbGVjdHJvbic7XG5cbmltcG9ydCB7SVNfU1RBR0lOR30gZnJvbSAnQC9lbnYnO1xuaW1wb3J0IHthcHAsIHNoZWxsfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQge1VSTH0gZnJvbSAnbm9kZTp1cmwnO1xuXG4vKipcbiAqIFVuaW9uIGZvciBhbGwgZXhpc3RpbmcgcGVybWlzc2lvbnMgaW4gZWxlY3Ryb25cbiAqL1xudHlwZSBQZXJtaXNzaW9uID0gUGFyYW1ldGVyczxcbiAgRXhjbHVkZTxQYXJhbWV0ZXJzPFNlc3Npb25bJ3NldFBlcm1pc3Npb25SZXF1ZXN0SGFuZGxlciddPlswXSwgbnVsbD5cbj5bMV07XG5cbnR5cGUgT3JpZ2luUGVybWlzc2lvbkNvbmZpZyA9IFtcbiAgKG9yaWdpbjogc3RyaW5nLCBwYXRoOiBzdHJpbmcpID0+IGJvb2xlYW4sXG4gIFNldDxQZXJtaXNzaW9uPixcbl07XG5cbmNvbnN0IEFVVE9DVVRfTkVFREVEX1BFUk1JU1NJT05TOiBTZXQ8UGVybWlzc2lvbj4gPSBuZXcgU2V0PFBlcm1pc3Npb24+KFtdKTtcblxuY29uc3QgREVWX09SSUdJTlNfQU5EX1BFUk1JU1NJT05TOiBPcmlnaW5QZXJtaXNzaW9uQ29uZmlnW10gPSAhYXBwLmlzUGFja2FnZWRcbiAgPyBbXG4gICAgICBbXG4gICAgICAgIChvcmlnaW46IHN0cmluZykgPT4gbmV3IFJlZ0V4cCgnbG9jYWxob3N0OlxcXFxkKiQnKS50ZXN0KG9yaWdpbiksXG4gICAgICAgIEFVVE9DVVRfTkVFREVEX1BFUk1JU1NJT05TLFxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgKG9yaWdpbjogc3RyaW5nKSA9PiBuZXcgUmVnRXhwKCcuKlxcXFwubmdyb2stZnJlZVxcXFwuYXBwJCcpLnRlc3Qob3JpZ2luKSxcbiAgICAgICAgQVVUT0NVVF9ORUVERURfUEVSTUlTU0lPTlMsXG4gICAgICBdLFxuICAgIF1cbiAgOiBbXTtcbmNvbnN0IFNUQUdJTkdfT1JJR0lOU19BTkRfUEVSTUlTU0lPTlM6IE9yaWdpblBlcm1pc3Npb25Db25maWdbXSA9XG4gIElTX1NUQUdJTkcgfHwgIWFwcC5pc1BhY2thZ2VkXG4gICAgPyBbXG4gICAgICAgIFtcbiAgICAgICAgICAob3JpZ2luOiBzdHJpbmcpID0+XG4gICAgICAgICAgICBuZXcgUmVnRXhwKCcuKlxcXFwuYXV0b3N0Z1xcXFwuY29tJCcpLnRlc3Qob3JpZ2luKSxcbiAgICAgICAgICBBVVRPQ1VUX05FRURFRF9QRVJNSVNTSU9OUyxcbiAgICAgICAgXSxcbiAgICAgIF1cbiAgICA6IFtdO1xuY29uc3QgQVVUT0NVVF9PUklHSU5TX0FORF9QRVJNSVNTSU9OUzogT3JpZ2luUGVybWlzc2lvbkNvbmZpZyA9IFtcbiAgKG9yaWdpbjogc3RyaW5nKSA9PiBuZXcgUmVnRXhwKCdcXFxcLmF1dG9jdXRcXFxcLihmcnxjb218aW8pJCcpLnRlc3Qob3JpZ2luKSxcbiAgQVVUT0NVVF9ORUVERURfUEVSTUlTU0lPTlMsXG5dO1xuY29uc3QgQVVUT0NVVF9TWVNURU1fUkVQT1JUX09SSUdJTlNfQU5EX1BFUk1JU1NJT05TOiBPcmlnaW5QZXJtaXNzaW9uQ29uZmlnID0gW1xuICAob3JpZ2luOiBzdHJpbmcpID0+IG9yaWdpbiA9PT0gJ2h0dHBzOi8vc3lzci5zdGF0aWMuYXV0b2N1dC5jb20vJyxcbiAgQVVUT0NVVF9ORUVERURfUEVSTUlTU0lPTlMsXG5dO1xuY29uc3QgR0lUSFVCX09SSUdJTlNfQU5EX1BFUk1JU1NJT05TOiBPcmlnaW5QZXJtaXNzaW9uQ29uZmlnID0gW1xuICAob3JpZ2luOiBzdHJpbmcsIHBhdGg6IHN0cmluZykgPT5cbiAgICBuZXcgUmVnRXhwKCdnaXRodWJcXFxcLmNvbSQnKS50ZXN0KG9yaWdpbikgJiYgcGF0aC5zdGFydHNXaXRoKCcva2V6aW9zJyksXG4gIEFVVE9DVVRfTkVFREVEX1BFUk1JU1NJT05TLFxuXTtcblxuLyoqXG4gKiBBIGxpc3Qgb2Ygb3JpZ2lucyB0aGF0IHlvdSBhbGxvdyBvcGVuIElOU0lERSB0aGUgYXBwbGljYXRpb24gYW5kIHBlcm1pc3Npb25zIGZvciB0aGVtLlxuICpcbiAqIEluIGRldmVsb3BtZW50IG1vZGUgeW91IG5lZWQgYWxsb3cgb3BlbiBgVklURV9ERVZfU0VSVkVSX1VSTGAuXG4gKi9cbmNvbnN0IEFMTE9XRURfT1JJR0lOU19BTkRfUEVSTUlTU0lPTlM6IE9yaWdpblBlcm1pc3Npb25Db25maWdbXSA9IFtcbiAgLi4uREVWX09SSUdJTlNfQU5EX1BFUk1JU1NJT05TLFxuICAuLi5TVEFHSU5HX09SSUdJTlNfQU5EX1BFUk1JU1NJT05TLFxuICBBVVRPQ1VUX09SSUdJTlNfQU5EX1BFUk1JU1NJT05TLFxuICBHSVRIVUJfT1JJR0lOU19BTkRfUEVSTUlTU0lPTlMsXG4gIEFVVE9DVVRfU1lTVEVNX1JFUE9SVF9PUklHSU5TX0FORF9QRVJNSVNTSU9OUyxcbl07XG5cbi8qKlxuICogQSBsaXN0IG9mIG9yaWdpbnMgdGhhdCB5b3UgYWxsb3cgb3BlbiBJTiBCUk9XU0VSLlxuICogTmF2aWdhdGlvbiB0byB0aGUgb3JpZ2lucyBiZWxvdyBpcyBvbmx5IHBvc3NpYmxlIGlmIHRoZSBsaW5rIG9wZW5zIGluIGEgbmV3IHdpbmRvdy5cbiAqXG4gKiBAZXhhbXBsZVxuICogPGFcbiAqICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAqICAgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9cIlxuICogPlxuICovXG5jb25zdCBBTExPV0VEX0VYVEVSTkFMX09SSUdJTlMgPSBuZXcgU2V0PGBodHRwczovLyR7c3RyaW5nfWA+KFtdKTtcblxuYXBwLm9uKCd3ZWItY29udGVudHMtY3JlYXRlZCcsIChfLCBjb250ZW50cykgPT4ge1xuICAvKipcbiAgICogQmxvY2sgbmF2aWdhdGlvbiB0byBvcmlnaW5zIG5vdCBvbiB0aGUgYWxsb3dsaXN0LlxuICAgKlxuICAgKiBOYXZpZ2F0aW9uIGV4cGxvaXRzIGFyZSBxdWl0ZSBjb21tb24uIElmIGFuIGF0dGFja2VyIGNhbiBjb252aW5jZSB0aGUgYXBwIHRvIG5hdmlnYXRlIGF3YXkgZnJvbSBpdHMgY3VycmVudCBwYWdlLFxuICAgKiB0aGV5IGNhbiBwb3NzaWJseSBmb3JjZSB0aGUgYXBwIHRvIG9wZW4gYXJiaXRyYXJ5IHdlYiByZXNvdXJjZXMvd2Vic2l0ZXMgb24gdGhlIHdlYi5cbiAgICpcbiAgICogQHNlZSBodHRwczovL3d3dy5lbGVjdHJvbmpzLm9yZy9kb2NzL2xhdGVzdC90dXRvcmlhbC9zZWN1cml0eSMxMy1kaXNhYmxlLW9yLWxpbWl0LW5hdmlnYXRpb25cbiAgICovXG4gIGNvbnRlbnRzLm9uKCd3aWxsLW5hdmlnYXRlJywgKGV2ZW50LCB1cmwpID0+IHtcbiAgICBjb25zdCB7b3JpZ2luLCBwYXRobmFtZX0gPSBuZXcgVVJMKHVybCk7XG4gICAgaWYgKFxuICAgICAgQUxMT1dFRF9PUklHSU5TX0FORF9QRVJNSVNTSU9OUy5zb21lKGRvbWFpbiA9PlxuICAgICAgICBkb21haW5bMF0ob3JpZ2luLCBwYXRobmFtZSksXG4gICAgICApXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHJldmVudCBuYXZpZ2F0aW9uXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnNvbGUud2FybihgQmxvY2tlZCBuYXZpZ2F0aW5nIHRvIGRpc2FsbG93ZWQgb3JpZ2luOiAke29yaWdpbn1gKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqIEJsb2NrIHJlcXVlc3RzIGZvciBkaXNhbGxvd2VkIHBlcm1pc3Npb25zLlxuICAgKiBCeSBkZWZhdWx0LCBFbGVjdHJvbiB3aWxsIGF1dG9tYXRpY2FsbHkgYXBwcm92ZSBhbGwgcGVybWlzc2lvbiByZXF1ZXN0cy5cbiAgICpcbiAgICogQHNlZSBodHRwczovL3d3dy5lbGVjdHJvbmpzLm9yZy9kb2NzL2xhdGVzdC90dXRvcmlhbC9zZWN1cml0eSM1LWhhbmRsZS1zZXNzaW9uLXBlcm1pc3Npb24tcmVxdWVzdHMtZnJvbS1yZW1vdGUtY29udGVudFxuICAgKi9cbiAgY29udGVudHMuc2Vzc2lvbi5zZXRQZXJtaXNzaW9uUmVxdWVzdEhhbmRsZXIoXG4gICAgKHdlYkNvbnRlbnRzLCBwZXJtaXNzaW9uLCBjYWxsYmFjaykgPT4ge1xuICAgICAgY29uc3Qge29yaWdpbiwgcGF0aG5hbWV9ID0gbmV3IFVSTCh3ZWJDb250ZW50cy5nZXRVUkwoKSk7XG5cbiAgICAgIGNvbnN0IHBlcm1pc3Npb25TZXQgPSBBTExPV0VEX09SSUdJTlNfQU5EX1BFUk1JU1NJT05TLmZpbmQoZG9tYWluID0+XG4gICAgICAgIGRvbWFpblswXShvcmlnaW4sIHBhdGhuYW1lKSxcbiAgICAgICk/LlsxXTtcbiAgICAgIGNvbnN0IHBlcm1pc3Npb25HcmFudGVkID0gISFwZXJtaXNzaW9uU2V0Py5oYXMocGVybWlzc2lvbik7XG4gICAgICBjYWxsYmFjayhwZXJtaXNzaW9uR3JhbnRlZCk7XG5cbiAgICAgIGlmICghcGVybWlzc2lvbkdyYW50ZWQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGAke29yaWdpbn0gcmVxdWVzdGVkIHBlcm1pc3Npb24gZm9yICcke3Blcm1pc3Npb259JywgYnV0IHdhcyByZWplY3RlZC5gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0sXG4gICk7XG5cbiAgLyoqXG4gICAqIEh5cGVybGlua3MgbGVhZGluZyB0byBhbGxvd2VkIHNpdGVzIGFyZSBvcGVuZWQgaW4gdGhlIGRlZmF1bHQgYnJvd3Nlci5cbiAgICpcbiAgICogVGhlIGNyZWF0aW9uIG9mIG5ldyBgd2ViQ29udGVudHNgIGlzIGEgY29tbW9uIGF0dGFjayB2ZWN0b3IuIEF0dGFja2VycyBhdHRlbXB0IHRvIGNvbnZpbmNlIHRoZSBhcHAgdG8gY3JlYXRlIG5ldyB3aW5kb3dzLFxuICAgKiBmcmFtZXMsIG9yIG90aGVyIHJlbmRlcmVyIHByb2Nlc3NlcyB3aXRoIG1vcmUgcHJpdmlsZWdlcyB0aGFuIHRoZXkgaGFkIGJlZm9yZTsgb3Igd2l0aCBwYWdlcyBvcGVuZWQgdGhhdCB0aGV5IGNvdWxkbid0IG9wZW4gYmVmb3JlLlxuICAgKiBZb3Ugc2hvdWxkIGRlbnkgYW55IHVuZXhwZWN0ZWQgd2luZG93IGNyZWF0aW9uLlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmVsZWN0cm9uanMub3JnL2RvY3MvbGF0ZXN0L3R1dG9yaWFsL3NlY3VyaXR5IzE0LWRpc2FibGUtb3ItbGltaXQtY3JlYXRpb24tb2YtbmV3LXdpbmRvd3NcbiAgICogQHNlZSBodHRwczovL3d3dy5lbGVjdHJvbmpzLm9yZy9kb2NzL2xhdGVzdC90dXRvcmlhbC9zZWN1cml0eSMxNS1kby1ub3QtdXNlLW9wZW5leHRlcm5hbC13aXRoLXVudHJ1c3RlZC1jb250ZW50XG4gICAqL1xuICBjb250ZW50cy5zZXRXaW5kb3dPcGVuSGFuZGxlcigoe3VybH0pID0+IHtcbiAgICBjb25zdCB7b3JpZ2lufSA9IG5ldyBVUkwodXJsKTtcblxuICAgIGlmIChBTExPV0VEX0VYVEVSTkFMX09SSUdJTlMuaGFzKG9yaWdpbiBhcyBgaHR0cHM6Ly8ke3N0cmluZ31gKSkge1xuICAgICAgLy8gT3BlbiB1cmwgaW4gZGVmYXVsdCBicm93c2VyLlxuICAgICAgc2hlbGwub3BlbkV4dGVybmFsKHVybCkuY2F0Y2goY29uc29sZS5lcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihgQmxvY2tlZCB0aGUgb3BlbmluZyBvZiBhIGRpc2FsbG93ZWQgb3JpZ2luOiAke29yaWdpbn1gKTtcbiAgICB9XG5cbiAgICAvLyBQcmV2ZW50IGNyZWF0aW5nIGEgbmV3IHdpbmRvdy5cbiAgICByZXR1cm4ge2FjdGlvbjogJ2RlbnknfTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqIFZlcmlmeSB3ZWJ2aWV3IG9wdGlvbnMgYmVmb3JlIGNyZWF0aW9uLlxuICAgKlxuICAgKiBTdHJpcCBhd2F5IHByZWxvYWQgc2NyaXB0cywgZGlzYWJsZSBOb2RlLmpzIGludGVncmF0aW9uLCBhbmQgZW5zdXJlIG9yaWdpbnMgYXJlIG9uIHRoZSBhbGxvd2xpc3QuXG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly93d3cuZWxlY3Ryb25qcy5vcmcvZG9jcy9sYXRlc3QvdHV0b3JpYWwvc2VjdXJpdHkjMTItdmVyaWZ5LXdlYnZpZXctb3B0aW9ucy1iZWZvcmUtY3JlYXRpb25cbiAgICovXG4gIGNvbnRlbnRzLm9uKCd3aWxsLWF0dGFjaC13ZWJ2aWV3JywgKGV2ZW50LCB3ZWJQcmVmZXJlbmNlcywgcGFyYW1zKSA9PiB7XG4gICAgY29uc3Qge29yaWdpbiwgcGF0aG5hbWV9ID0gbmV3IFVSTChwYXJhbXMuc3JjKTtcbiAgICBpZiAoXG4gICAgICAhQUxMT1dFRF9PUklHSU5TX0FORF9QRVJNSVNTSU9OUy5zb21lKGRvbWFpbiA9PlxuICAgICAgICBkb21haW5bMF0ob3JpZ2luLCBwYXRobmFtZSksXG4gICAgICApXG4gICAgKSB7XG4gICAgICBjb25zb2xlLndhcm4oYEEgd2VidmlldyB0cmllZCB0byBhdHRhY2ggJHtwYXJhbXMuc3JjfSwgYnV0IHdhcyBibG9ja2VkLmApO1xuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFN0cmlwIGF3YXkgcHJlbG9hZCBzY3JpcHRzIGlmIHVudXNlZCBvciB2ZXJpZnkgdGhlaXIgbG9jYXRpb24gaXMgbGVnaXRpbWF0ZS5cbiAgICBkZWxldGUgd2ViUHJlZmVyZW5jZXMucHJlbG9hZDtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGBwcmVsb2FkVVJMYCBleGlzdHMuIC0gQHNlZSBodHRwczovL3d3dy5lbGVjdHJvbmpzLm9yZy9kb2NzL2xhdGVzdC9hcGkvd2ViLWNvbnRlbnRzI2V2ZW50LXdpbGwtYXR0YWNoLXdlYnZpZXdcbiAgICBkZWxldGUgd2ViUHJlZmVyZW5jZXMucHJlbG9hZFVSTDtcblxuICAgIC8vIERpc2FibGUgTm9kZS5qcyBpbnRlZ3JhdGlvblxuICAgIHdlYlByZWZlcmVuY2VzLm5vZGVJbnRlZ3JhdGlvbiA9IGZhbHNlO1xuXG4gICAgLy8gRW5hYmxlIGNvbnRleHRJc29sYXRpb25cbiAgICB3ZWJQcmVmZXJlbmNlcy5jb250ZXh0SXNvbGF0aW9uID0gdHJ1ZTtcbiAgfSk7XG59KTtcbiIsImV4cG9ydCBjb25zdCBDT09LX1BST0pFQ1RfQllfVVJMX0tFWSA9IHtcbiAgYXBpVXJsOiAnYXV0b2N1dC1hcGknLFxuICBjb21wdXRlVXJsOiAnY29tcHV0ZScsXG4gIGRhdmluY2lQbHVnaW5Vcmw6ICdkYXZpbmNpLXBsdWdpbicsXG4gIGRhdmluY2lVcmw6ICdkYXZpbmNpJyxcbiAgZnJvbnRVcmw6ICdmcm9udCcsXG4gIGhvc3RTZXJ2ZXJVcmw6ICdob3N0LXNlcnZlcicsXG4gIG9uYm9hcmRpbmdVcmw6ICdvbmJvYXJkaW5nJyxcbiAgcHByb1VybDogJ3Bwcm8nLFxuICBwcHJvSnN4VXJsOiAncHByby1qc3gnLFxuICBzeXN0ZW1SZXBvcnRVcmw6ICdzeXN0ZW0tcmVwb3J0JyxcbiAgdXBkYXRlclVybDogJ2FlYScsXG59IGFzIGNvbnN0O1xuXG50eXBlIENvb2tQcm9qZWN0UmVzcG9uc2UgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBzdHJpbmdbXT47XG5cbnR5cGUgQ29va1VybENhbmRpZGF0ZVNldCA9IFJlY29yZDxcbiAga2V5b2YgdHlwZW9mIENPT0tfUFJPSkVDVF9CWV9VUkxfS0VZLFxuICBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZFxuPjtcblxuZXhwb3J0IGNvbnN0IG1hcENvb2tSZXNwb25zZVRvVXJsQ2FuZGlkYXRlcyA9IChcbiAgcmVzcG9uc2U6IENvb2tQcm9qZWN0UmVzcG9uc2UsXG4pOiBDb29rVXJsQ2FuZGlkYXRlU2V0ID0+IHtcbiAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKENPT0tfUFJPSkVDVF9CWV9VUkxfS0VZKS5tYXAoXG4gICAgKFt1cmxLZXksIHByb2plY3RTbHVnXSkgPT4gW3VybEtleSwgcmVzcG9uc2VbcHJvamVjdFNsdWddXSxcbiAgKTtcbiAgY29uc3QgY2FuZGlkYXRlcyA9IE9iamVjdC5mcm9tRW50cmllcyhlbnRyaWVzKSBhcyBDb29rVXJsQ2FuZGlkYXRlU2V0O1xuICBjYW5kaWRhdGVzLmFwaVVybCA9IHJlc3BvbnNlWydhdXRvY3V0LWFwaSddID8/IHJlc3BvbnNlLmFwaTtcbiAgcmV0dXJuIGNhbmRpZGF0ZXM7XG59O1xuIiwiZXhwb3J0IHR5cGUgUWFUYXJnZXQgPSBSZWFkb25seTx7XG4gIHByTnVtYmVyOiBudW1iZXI7XG4gIHR5cGU6ICdxYS1wcic7XG59PjtcblxubGV0IHFhVGFyZ2V0OiBRYVRhcmdldCB8IHVuZGVmaW5lZDtcblxuZXhwb3J0IGNvbnN0IHNldFFhVGFyZ2V0ID0gKHByTnVtYmVyOiBudW1iZXIpOiBRYVRhcmdldCA9PiB7XG4gIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIocHJOdW1iZXIpIHx8IHByTnVtYmVyIDw9IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBRQSBwdWxsIHJlcXVlc3QgbnVtYmVyIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyJyk7XG4gIH1cbiAgaWYgKHFhVGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBIFFBIHRhcmdldCBoYXMgYWxyZWFkeSBiZWVuIHNlbGVjdGVkIGZvciB0aGlzIGxhdW5jaCcpO1xuICB9XG5cbiAgcWFUYXJnZXQgPSBPYmplY3QuZnJlZXplKHtwck51bWJlciwgdHlwZTogJ3FhLXByJ30pO1xuICByZXR1cm4gcWFUYXJnZXQ7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0UWFUYXJnZXQgPSAoKTogUWFUYXJnZXQgfCB1bmRlZmluZWQgPT4gcWFUYXJnZXQ7XG5cbmV4cG9ydCBjb25zdCBidWlsZFFhQ29va1B1YmxpY0NoYW5uZWxQYXRoID0gKFxuICB0YXJnZXQ6IFFhVGFyZ2V0LFxuICBzdWZmaXggPSAnJyxcbik6IHN0cmluZyA9PiBgL3YyL3B1YmxpYy9jaGFubmVscy9xYS8ke3RhcmdldC5wck51bWJlcn0ke3N1ZmZpeH1gO1xuIiwiZXhwb3J0IGNvbnN0IGdldFJlcXVlc3RSZWRpcmVjdE1vZGUgPSAoXG4gIHJlcXVpcmVIdHRwczogYm9vbGVhbixcbik6ICdmb2xsb3cnIHwgJ21hbnVhbCcgPT4gKHJlcXVpcmVIdHRwcyA/ICdtYW51YWwnIDogJ2ZvbGxvdycpO1xuXG5leHBvcnQgY29uc3QgaXNSZXF1ZXN0VXJsQWxsb3dlZCA9IChcbiAgcmVxdWVzdFVybDogc3RyaW5nLFxuICByZXF1aXJlSHR0cHM6IGJvb2xlYW4sXG4pOiBib29sZWFuID0+IHtcbiAgaWYgKCFyZXF1aXJlSHR0cHMpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBVUkwocmVxdWVzdFVybCkucHJvdG9jb2wgPT09ICdodHRwczonO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7XG4gIEF4aW9zQWRhcHRlcixcbiAgQXhpb3NSZXNwb25zZSxcbiAgSW50ZXJuYWxBeGlvc1JlcXVlc3RDb25maWcsXG59IGZyb20gJ2F4aW9zJztcbmltcG9ydCB0eXBlIHtDbGllbnRSZXF1ZXN0LCBJbmNvbWluZ01lc3NhZ2V9IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IHtBeGlvc0Vycm9yLCBBeGlvc0hlYWRlcnN9IGZyb20gJ2F4aW9zJztcbmltcG9ydCB7YXBwLCBuZXR9IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IHtcbiAgZ2V0UmVxdWVzdFJlZGlyZWN0TW9kZSxcbiAgaXNSZXF1ZXN0VXJsQWxsb3dlZCxcbn0gZnJvbSAnLi9lbGVjdHJvbk5ldEFkYXB0ZXIuY29udHJhY3RzJztcblxuLy8gQ2hyb21pdW0gc2V0cyB0aGVzZSBpdHNlbGY7IGByZXF1ZXN0LnNldEhlYWRlcmAgdGhyb3dzIGlmIHdlIHRvdWNoIHRoZW0uXG5jb25zdCBSRVNUUklDVEVEX1JFUVVFU1RfSEVBREVSUyA9IG5ldyBTZXQoW1xuICAnY29ubmVjdGlvbicsXG4gICdjb250ZW50LWxlbmd0aCcsXG4gICdjb29raWUyJyxcbiAgJ2hvc3QnLFxuICAna2VlcC1hbGl2ZScsXG4gICd0ZScsXG4gICd0cmFpbGVyJyxcbiAgJ3RyYW5zZmVyLWVuY29kaW5nJyxcbiAgJ3VwZ3JhZGUnLFxuXSk7XG5cbi8vIEVsZWN0cm9uJ3MgYG5ldGAgcmVwb3J0cyBmYWlsdXJlcyBhcyBDaHJvbWl1bSBgbmV0OjpFUlJfKmAgc3RyaW5ncy4gVGhlIHJlc3Rcbi8vIG9mIHRoZSBhcHAgKG5ldHdvcmsgcmV0cnksIHByb3h5IGZhbGxiYWNrLCBUTFMgZGlhZ25vc3RpY3MpIGJyYW5jaGVzIG9uXG4vLyBOb2RlJ3MgZXJybm8gY29kZXMsIHNvIHdlIHRyYW5zbGF0ZSB0aGUgY29tbW9uIG9uZXMgYmFjayB0byBrZWVwIHRoYXQgbG9naWNcbi8vIHdvcmtpbmcgdW5jaGFuZ2VkIGFmdGVyIHRoZSB0cmFuc3BvcnQgc3dpdGNoLlxuY29uc3QgQ0hST01JVU1fRVJST1JfQ09ERV9NQVA6IHtjb2RlOiBzdHJpbmc7IHBhdHRlcm46IHN0cmluZ31bXSA9IFtcbiAge2NvZGU6ICdFTk9URk9VTkQnLCBwYXR0ZXJuOiAnRVJSX05BTUVfTk9UX1JFU09MVkVEJ30sXG4gIHtjb2RlOiAnRU5PVEZPVU5EJywgcGF0dGVybjogJ0VSUl9OQU1FX1JFU09MVVRJT05fRkFJTEVEJ30sXG4gIHtjb2RlOiAnRU5PVEZPVU5EJywgcGF0dGVybjogJ0VSUl9ETlNfJ30sXG4gIHtjb2RlOiAnRUFJX0FHQUlOJywgcGF0dGVybjogJ0VSUl9JTlRFUk5FVF9ESVNDT05ORUNURUQnfSxcbiAge2NvZGU6ICdFQUlfQUdBSU4nLCBwYXR0ZXJuOiAnRVJSX05FVFdPUktfQ0hBTkdFRCd9LFxuICB7Y29kZTogJ0VDT05OUkVGVVNFRCcsIHBhdHRlcm46ICdFUlJfQ09OTkVDVElPTl9SRUZVU0VEJ30sXG4gIHtjb2RlOiAnRUNPTk5SRVNFVCcsIHBhdHRlcm46ICdFUlJfQ09OTkVDVElPTl9SRVNFVCd9LFxuICB7Y29kZTogJ0VDT05OUkVTRVQnLCBwYXR0ZXJuOiAnRVJSX0NPTk5FQ1RJT05fQ0xPU0VEJ30sXG4gIHtjb2RlOiAnRUNPTk5SRVNFVCcsIHBhdHRlcm46ICdFUlJfQ09OTkVDVElPTl9BQk9SVEVEJ30sXG4gIHtjb2RlOiAnRUNPTk5SRVNFVCcsIHBhdHRlcm46ICdFUlJfQ09OTkVDVElPTl9GQUlMRUQnfSxcbiAge2NvZGU6ICdFVElNRURPVVQnLCBwYXR0ZXJuOiAnRVJSX0NPTk5FQ1RJT05fVElNRURfT1VUJ30sXG4gIHtjb2RlOiAnRVRJTUVET1VUJywgcGF0dGVybjogJ0VSUl9USU1FRF9PVVQnfSxcbiAge2NvZGU6ICdFQ09OTkFCT1JURUQnLCBwYXR0ZXJuOiAnRVJSX0FCT1JURUQnfSxcbl07XG5cbmNvbnN0IGJ1aWxkRnVsbFVybCA9IChjb25maWc6IEludGVybmFsQXhpb3NSZXF1ZXN0Q29uZmlnKTogc3RyaW5nID0+IHtcbiAgY29uc3QgcmVxdWVzdGVkID0gY29uZmlnLnVybCA/PyAnJztcbiAgY29uc3QgYWJzb2x1dGUgPSBjb25maWcuYmFzZVVSTFxuICAgID8gbmV3IFVSTChyZXF1ZXN0ZWQsIGNvbmZpZy5iYXNlVVJMKS50b1N0cmluZygpXG4gICAgOiByZXF1ZXN0ZWQ7XG5cbiAgaWYgKCFjb25maWcucGFyYW1zKSB7XG4gICAgcmV0dXJuIGFic29sdXRlO1xuICB9XG5cbiAgY29uc3QgdXJsID0gbmV3IFVSTChhYnNvbHV0ZSk7XG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKFxuICAgIGNvbmZpZy5wYXJhbXMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gICkpIHtcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoa2V5LCBTdHJpbmcodmFsdWUpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHVybC50b1N0cmluZygpO1xufTtcblxuY29uc3QgYXBwbHlIZWFkZXJzID0gKFxuICByZXF1ZXN0OiBDbGllbnRSZXF1ZXN0LFxuICBjb25maWc6IEludGVybmFsQXhpb3NSZXF1ZXN0Q29uZmlnLFxuKTogdm9pZCA9PiB7XG4gIGNvbnN0IGhlYWRlcnMgPVxuICAgIGNvbmZpZy5oZWFkZXJzIGluc3RhbmNlb2YgQXhpb3NIZWFkZXJzXG4gICAgICA/IGNvbmZpZy5oZWFkZXJzLnRvSlNPTigpXG4gICAgICA6ICgoY29uZmlnLmhlYWRlcnMgPz8ge30pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcblxuICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoaGVhZGVycykpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChSRVNUUklDVEVEX1JFUVVFU1RfSEVBREVSUy5oYXMobmFtZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHJlcXVlc3Quc2V0SGVhZGVyKFxuICAgICAgbmFtZSxcbiAgICAgIEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUuam9pbignLCAnKSA6IFN0cmluZyh2YWx1ZSksXG4gICAgKTtcbiAgfVxufTtcblxuY29uc3QgdG9BeGlvc0Vycm9yID0gKFxuICBlcnJvcjogRXJyb3IsXG4gIGNvbmZpZzogSW50ZXJuYWxBeGlvc1JlcXVlc3RDb25maWcsXG4gIHJlcXVlc3Q/OiBDbGllbnRSZXF1ZXN0LFxuKTogQXhpb3NFcnJvciA9PiB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlIHx8ICdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJztcbiAgY29uc3QgY29kZSA9XG4gICAgQ0hST01JVU1fRVJST1JfQ09ERV9NQVAuZmluZChlbnRyeSA9PiBtZXNzYWdlLmluY2x1ZGVzKGVudHJ5LnBhdHRlcm4pKVxuICAgICAgPy5jb2RlID8/IEF4aW9zRXJyb3IuRVJSX05FVFdPUks7XG4gIGNvbnN0IGF4aW9zRXJyb3IgPSBuZXcgQXhpb3NFcnJvcihtZXNzYWdlLCBjb2RlLCBjb25maWcsIHJlcXVlc3QpO1xuICBheGlvc0Vycm9yLmNhdXNlID0gZXJyb3I7XG4gIHJldHVybiBheGlvc0Vycm9yO1xufTtcblxuLyoqXG4gKiBBeGlvcyBhZGFwdGVyIHRoYXQgc2VuZHMgZXZlcnkgcmVxdWVzdCB0aHJvdWdoIEVsZWN0cm9uJ3MgYG5ldGAgbW9kdWxlXG4gKiAoQ2hyb21pdW0ncyBuZXR3b3JrIHN0YWNrKSBpbnN0ZWFkIG9mIE5vZGUncyBgaHR0cGAvYGh0dHBzYC4gVGhpcyBnaXZlcyB0aGVcbiAqIG1haW4gcHJvY2VzcyB0aGUgc2FtZSByZXNvbHZlciwgRG9ILCBzeXN0ZW0tcHJveHkgYW5kIFZQTiBiZWhhdmlvdXIgQ2hyb21pdW1cbiAqIChhbmQgdGhlIFNlbnRyeSB0cmFuc3BvcnQpIGFscmVhZHkgdXNlLCBmaXhpbmcgY2FzZXMgd2hlcmUgTm9kZSdzXG4gKiBgZ2V0YWRkcmluZm9gIHJldHVybnMgYEVOT1RGT1VORGAgd2hpbGUgQ2hyb21pdW0gY2FuIHN0aWxsIHJlYWNoIHRoZSBob3N0LlxuICovXG5leHBvcnQgY29uc3QgZWxlY3Ryb25OZXRBZGFwdGVyOiBBeGlvc0FkYXB0ZXIgPSBhc3luYyBjb25maWcgPT4ge1xuICBhd2FpdCBhcHAud2hlblJlYWR5KCk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlPEF4aW9zUmVzcG9uc2U+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBtZXRob2QgPSAoY29uZmlnLm1ldGhvZCA/PyAnZ2V0JykudG9VcHBlckNhc2UoKTtcbiAgICBsZXQgcmVxdWVzdDogQ2xpZW50UmVxdWVzdCB8IHVuZGVmaW5lZDtcbiAgICBsZXQgdGltZW91dElkOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IHVuZGVmaW5lZDtcbiAgICBsZXQgc2V0dGxlZCA9IGZhbHNlO1xuXG4gICAgY29uc3QgZmFpbCA9IChlcnJvcjogQXhpb3NFcnJvcik6IHZvaWQgPT4ge1xuICAgICAgaWYgKHNldHRsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICBpZiAodGltZW91dElkKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgc3VjY2VlZCA9IChyZXNwb25zZTogQXhpb3NSZXNwb25zZSk6IHZvaWQgPT4ge1xuICAgICAgaWYgKHNldHRsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICBpZiAodGltZW91dElkKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7dmFsaWRhdGVTdGF0dXN9ID0gY29uZmlnO1xuICAgICAgaWYgKFxuICAgICAgICAhcmVzcG9uc2Uuc3RhdHVzIHx8XG4gICAgICAgICF2YWxpZGF0ZVN0YXR1cyB8fFxuICAgICAgICB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpXG4gICAgICApIHtcbiAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3QoXG4gICAgICAgICAgbmV3IEF4aW9zRXJyb3IoXG4gICAgICAgICAgICBgUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAke3Jlc3BvbnNlLnN0YXR1c31gLFxuICAgICAgICAgICAgW0F4aW9zRXJyb3IuRVJSX0JBRF9SRVFVRVNULCBBeGlvc0Vycm9yLkVSUl9CQURfUkVTUE9OU0VdW1xuICAgICAgICAgICAgICBNYXRoLmZsb29yKHJlc3BvbnNlLnN0YXR1cyAvIDEwMCkgLSA0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgY29uZmlnLFxuICAgICAgICAgICAgcmVzcG9uc2UucmVxdWVzdCxcbiAgICAgICAgICAgIHJlc3BvbnNlLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXF1ZXN0VXJsID0gYnVpbGRGdWxsVXJsKGNvbmZpZyk7XG4gICAgICBjb25zdCByZXF1aXJlSHR0cHMgPSBjb25maWcuYXV0b2N1dFJlcXVpcmVIdHRwcyA9PT0gdHJ1ZTtcbiAgICAgIGlmICghaXNSZXF1ZXN0VXJsQWxsb3dlZChyZXF1ZXN0VXJsLCByZXF1aXJlSHR0cHMpKSB7XG4gICAgICAgIGZhaWwoXG4gICAgICAgICAgbmV3IEF4aW9zRXJyb3IoXG4gICAgICAgICAgICBgUmVmdXNpbmcgbm9uLUhUVFBTIHJlcXVlc3Q6ICR7cmVxdWVzdFVybH1gLFxuICAgICAgICAgICAgQXhpb3NFcnJvci5FUlJfQkFEX1JFUVVFU1QsXG4gICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0ID0gbmV0LnJlcXVlc3Qoe1xuICAgICAgICBtZXRob2QsXG4gICAgICAgIHJlZGlyZWN0OiBnZXRSZXF1ZXN0UmVkaXJlY3RNb2RlKHJlcXVpcmVIdHRwcyksXG4gICAgICAgIHVybDogcmVxdWVzdFVybCxcbiAgICAgIH0pO1xuICAgICAgYXBwbHlIZWFkZXJzKHJlcXVlc3QsIGNvbmZpZyk7XG5cbiAgICAgIGNvbnN0IGFjdGl2ZVJlcXVlc3QgPSByZXF1ZXN0O1xuXG4gICAgICBpZiAocmVxdWlyZUh0dHBzKSB7XG4gICAgICAgIGxldCByZWRpcmVjdHMgPSAwO1xuICAgICAgICBhY3RpdmVSZXF1ZXN0Lm9uKCdyZWRpcmVjdCcsIChfc3RhdHVzQ29kZSwgX21ldGhvZCwgcmVkaXJlY3RVcmwpID0+IHtcbiAgICAgICAgICBpZiAoIWlzUmVxdWVzdFVybEFsbG93ZWQocmVkaXJlY3RVcmwsIHRydWUpKSB7XG4gICAgICAgICAgICBmYWlsKFxuICAgICAgICAgICAgICBuZXcgQXhpb3NFcnJvcihcbiAgICAgICAgICAgICAgICBgUmVmdXNpbmcgcmVkaXJlY3QgdG8gbm9uLUhUVFBTIFVSTDogJHtyZWRpcmVjdFVybH1gLFxuICAgICAgICAgICAgICAgIEF4aW9zRXJyb3IuRVJSX0JBRF9SRVFVRVNULFxuICAgICAgICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICAgICAgICBhY3RpdmVSZXF1ZXN0LFxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGFjdGl2ZVJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVkaXJlY3RzICs9IDE7XG4gICAgICAgICAgICBpZiAocmVkaXJlY3RzID4gKGNvbmZpZy5tYXhSZWRpcmVjdHMgPz8gMTApKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVG9vIG1hbnkgcmVkaXJlY3RzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25maWcuYXV0b2N1dFZhbGlkYXRlUmVkaXJlY3Q/LihyZWRpcmVjdFVybCwgcmVxdWVzdFVybCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGZhaWwoXG4gICAgICAgICAgICAgIG5ldyBBeGlvc0Vycm9yKFxuICAgICAgICAgICAgICAgIChlcnJvciBhcyBFcnJvcikubWVzc2FnZSxcbiAgICAgICAgICAgICAgICBBeGlvc0Vycm9yLkVSUl9CQURfUkVRVUVTVCxcbiAgICAgICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgICAgICAgYWN0aXZlUmVxdWVzdCxcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBhY3RpdmVSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGl2ZVJlcXVlc3QuZm9sbG93UmVkaXJlY3QoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRpbWVvdXRNcyA9IGNvbmZpZy50aW1lb3V0ID8/IDA7XG4gICAgICBpZiAodGltZW91dE1zID4gMCkge1xuICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBhY3RpdmVSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgZmFpbChcbiAgICAgICAgICAgIG5ldyBBeGlvc0Vycm9yKFxuICAgICAgICAgICAgICBgdGltZW91dCBvZiAke3RpbWVvdXRNc31tcyBleGNlZWRlZGAsXG4gICAgICAgICAgICAgIEF4aW9zRXJyb3IuRUNPTk5BQk9SVEVELFxuICAgICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgICAgIGFjdGl2ZVJlcXVlc3QsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICk7XG4gICAgICAgIH0sIHRpbWVvdXRNcyk7XG4gICAgICB9XG5cbiAgICAgIGFjdGl2ZVJlcXVlc3Qub24oJ2Vycm9yJywgKGVycm9yOiBFcnJvcikgPT5cbiAgICAgICAgZmFpbCh0b0F4aW9zRXJyb3IoZXJyb3IsIGNvbmZpZywgYWN0aXZlUmVxdWVzdCkpLFxuICAgICAgKTtcblxuICAgICAgYWN0aXZlUmVxdWVzdC5vbigncmVzcG9uc2UnLCAocmVzcG9uc2U6IEluY29taW5nTWVzc2FnZSkgPT4ge1xuICAgICAgICBjb25zdCBzdGF0dXMgPSByZXNwb25zZS5zdGF0dXNDb2RlID8/IDA7XG4gICAgICAgIGNvbnN0IHN0YXR1c1RleHQgPSByZXNwb25zZS5zdGF0dXNNZXNzYWdlID8/ICcnO1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gbmV3IEF4aW9zSGVhZGVycyhcbiAgICAgICAgICByZXNwb25zZS5oZWFkZXJzIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHN0cmluZ1tdPixcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ3N0cmVhbScpIHtcbiAgICAgICAgICBzdWNjZWVkKHtcbiAgICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlLFxuICAgICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICAgIHJlcXVlc3Q6IGFjdGl2ZVJlcXVlc3QsXG4gICAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcbiAgICAgICAgcmVzcG9uc2Uub24oJ2RhdGEnLCAoY2h1bms6IEJ1ZmZlcikgPT4gY2h1bmtzLnB1c2goY2h1bmspKTtcbiAgICAgICAgcmVzcG9uc2Uub24oJ2Vycm9yJywgKGVycm9yOiBFcnJvcikgPT5cbiAgICAgICAgICBmYWlsKHRvQXhpb3NFcnJvcihlcnJvciwgY29uZmlnLCBhY3RpdmVSZXF1ZXN0KSksXG4gICAgICAgICk7XG4gICAgICAgIHJlc3BvbnNlLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmNvbmNhdChjaHVua3MpO1xuICAgICAgICAgIGNvbnN0IGRhdGEgPVxuICAgICAgICAgICAgY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2FycmF5YnVmZmVyJ1xuICAgICAgICAgICAgICA/IGJ1ZmZlci5idWZmZXIuc2xpY2UoXG4gICAgICAgICAgICAgICAgICBidWZmZXIuYnl0ZU9mZnNldCxcbiAgICAgICAgICAgICAgICAgIGJ1ZmZlci5ieXRlT2Zmc2V0ICsgYnVmZmVyLmJ5dGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICA6IGJ1ZmZlci50b1N0cmluZygndXRmLTgnKTtcbiAgICAgICAgICBzdWNjZWVkKHtcbiAgICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgcmVxdWVzdDogYWN0aXZlUmVxdWVzdCxcbiAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICAgIHN0YXR1c1RleHQsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGJvZHkgPSBjb25maWcuZGF0YTtcbiAgICAgIGlmIChcbiAgICAgICAgYm9keSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgIGJvZHkgIT09IG51bGwgJiZcbiAgICAgICAgbWV0aG9kICE9PSAnR0VUJyAmJlxuICAgICAgICBtZXRob2QgIT09ICdIRUFEJ1xuICAgICAgKSB7XG4gICAgICAgIGFjdGl2ZVJlcXVlc3Qud3JpdGUoXG4gICAgICAgICAgdHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnIHx8IEJ1ZmZlci5pc0J1ZmZlcihib2R5KVxuICAgICAgICAgICAgPyBib2R5XG4gICAgICAgICAgICA6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgYWN0aXZlUmVxdWVzdC5lbmQoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZmFpbCh0b0F4aW9zRXJyb3IoZXJyb3IgYXMgRXJyb3IsIGNvbmZpZywgcmVxdWVzdCkpO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiZXhwb3J0IHR5cGUgTmV0d29ya0ZhaWx1cmVLaW5kID1cbiAgfCAnY29ubmVjdGlvbidcbiAgfCAnZG5zJ1xuICB8ICduZXR3b3JrJ1xuICB8ICdvZmZsaW5lJ1xuICB8ICdzZXJ2aWNlJ1xuICB8ICd0aW1lb3V0JztcblxudHlwZSBOZXR3b3JrRXJyb3JEYXRhID0ge1xuICBjb2RlPzogdW5rbm93bjtcbiAgbWVzc2FnZT86IHVua25vd247XG4gIHJlc3BvbnNlPzoge1xuICAgIHN0YXR1cz86IHVua25vd247XG4gIH07XG59O1xuXG5jb25zdCBnZXROZXR3b3JrRXJyb3JEYXRhID0gKGVycm9yOiB1bmtub3duKTogTmV0d29ya0Vycm9yRGF0YSA9PiB7XG4gIGlmICh0eXBlb2YgZXJyb3IgIT09ICdvYmplY3QnIHx8IGVycm9yID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG4gIHJldHVybiBlcnJvciBhcyBOZXR3b3JrRXJyb3JEYXRhO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldE5ldHdvcmtGYWlsdXJlS2luZCA9IChcbiAgZXJyb3I6IHVua25vd24sXG4pOiBOZXR3b3JrRmFpbHVyZUtpbmQgfCB1bmRlZmluZWQgPT4ge1xuICBjb25zdCBuZXR3b3JrRXJyb3IgPSBnZXROZXR3b3JrRXJyb3JEYXRhKGVycm9yKTtcbiAgY29uc3QgY29kZSA9XG4gICAgdHlwZW9mIG5ldHdvcmtFcnJvci5jb2RlID09PSAnc3RyaW5nJyA/IG5ldHdvcmtFcnJvci5jb2RlIDogdW5kZWZpbmVkO1xuICBjb25zdCBtZXNzYWdlID1cbiAgICB0eXBlb2YgbmV0d29ya0Vycm9yLm1lc3NhZ2UgPT09ICdzdHJpbmcnID8gbmV0d29ya0Vycm9yLm1lc3NhZ2UgOiAnJztcbiAgY29uc3Qgc3RhdHVzID1cbiAgICB0eXBlb2YgbmV0d29ya0Vycm9yLnJlc3BvbnNlPy5zdGF0dXMgPT09ICdudW1iZXInXG4gICAgICA/IG5ldHdvcmtFcnJvci5yZXNwb25zZS5zdGF0dXNcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gIGlmIChtZXNzYWdlLmluY2x1ZGVzKCduZXQ6OkVSUl9JTlRFUk5FVF9ESVNDT05ORUNURUQnKSkge1xuICAgIHJldHVybiAnb2ZmbGluZSc7XG4gIH1cbiAgaWYgKFxuICAgIGNvZGUgPT09ICdFTk9URk9VTkQnIHx8XG4gICAgY29kZSA9PT0gJ0VBSV9BR0FJTicgfHxcbiAgICBtZXNzYWdlLmluY2x1ZGVzKCduZXQ6OkVSUl9OQU1FX05PVF9SRVNPTFZFRCcpIHx8XG4gICAgbWVzc2FnZS5pbmNsdWRlcygnbmV0OjpFUlJfTkFNRV9SRVNPTFVUSU9OX0ZBSUxFRCcpIHx8XG4gICAgbWVzc2FnZS5pbmNsdWRlcygnbmV0OjpFUlJfRE5TXycpXG4gICkge1xuICAgIHJldHVybiAnZG5zJztcbiAgfVxuICBpZiAoXG4gICAgY29kZSA9PT0gJ0VUSU1FRE9VVCcgfHxcbiAgICBjb2RlID09PSAnRUNPTk5BQk9SVEVEJyB8fFxuICAgIG1lc3NhZ2UuaW5jbHVkZXMoJ25ldDo6RVJSX0NPTk5FQ1RJT05fVElNRURfT1VUJykgfHxcbiAgICBtZXNzYWdlLmluY2x1ZGVzKCduZXQ6OkVSUl9USU1FRF9PVVQnKVxuICApIHtcbiAgICByZXR1cm4gJ3RpbWVvdXQnO1xuICB9XG4gIGlmIChcbiAgICBbJ0VDT05OUkVGVVNFRCcsICdFQ09OTlJFU0VUJ10uaW5jbHVkZXMoY29kZSA/PyAnJykgfHxcbiAgICBbXG4gICAgICAnbmV0OjpFUlJfQ09OTkVDVElPTl9SRUZVU0VEJyxcbiAgICAgICduZXQ6OkVSUl9DT05ORUNUSU9OX1JFU0VUJyxcbiAgICAgICduZXQ6OkVSUl9DT05ORUNUSU9OX0NMT1NFRCcsXG4gICAgICAnbmV0OjpFUlJfQ09OTkVDVElPTl9BQk9SVEVEJyxcbiAgICAgICduZXQ6OkVSUl9DT05ORUNUSU9OX0ZBSUxFRCcsXG4gICAgICAnbmV0OjpFUlJfSFRUUDJfUElOR19GQUlMRUQnLFxuICAgICAgJ25ldDo6RVJSX0hUVFAyX1BST1RPQ09MX0VSUk9SJyxcbiAgICAgICduZXQ6OkVSUl9ORVRXT1JLX0NIQU5HRUQnLFxuICAgICAgJ25ldDo6RVJSX1FVSUNfUFJPVE9DT0xfRVJST1InLFxuICAgICAgJ25ldDo6RVJSX1NTTF9QUk9UT0NPTF9FUlJPUicsXG4gICAgXS5zb21lKHBhdHRlcm4gPT4gbWVzc2FnZS5pbmNsdWRlcyhwYXR0ZXJuKSlcbiAgKSB7XG4gICAgcmV0dXJuICdjb25uZWN0aW9uJztcbiAgfVxuICBpZiAoc3RhdHVzICE9PSB1bmRlZmluZWQgJiYgc3RhdHVzID49IDUwMCkge1xuICAgIHJldHVybiAnc2VydmljZSc7XG4gIH1cbiAgaWYgKFxuICAgIGNvZGUgPT09ICdFUlJfTkVUV09SSycgfHxcbiAgICBtZXNzYWdlLmluY2x1ZGVzKCduZXQ6OkVSUl9GQUlMRUQnKSB8fFxuICAgIG1lc3NhZ2UgPT09ICdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJ1xuICApIHtcbiAgICByZXR1cm4gJ25ldHdvcmsnO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgaXNPZmZsaW5lTmV0d29ya0Vycm9yID0gKGVycm9yOiB1bmtub3duKTogYm9vbGVhbiA9PlxuICBnZXROZXR3b3JrRmFpbHVyZUtpbmQoZXJyb3IpID09PSAnb2ZmbGluZSc7XG5cbmV4cG9ydCBjb25zdCBpc1RyYW5zaWVudE5ldHdvcmtFcnJvciA9IChlcnJvcjogdW5rbm93bik6IGJvb2xlYW4gPT5cbiAgZ2V0TmV0d29ya0ZhaWx1cmVLaW5kKGVycm9yKSAhPT0gdW5kZWZpbmVkO1xuIiwiaW1wb3J0IHR5cGUge0NsaWVudFJlcXVlc3R9IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IHtuZXR9IGZyb20gJ2VsZWN0cm9uJztcblxuY29uc3QgREVGQVVMVF9QUk9CRV9USU1FT1VUX01TID0gMTAwMDA7XG5jb25zdCBERUZBVUxUX1JFUVVFU1RfVElNRU9VVF9NUyA9IDIwMDA7XG5jb25zdCBERUZBVUxUX1BST0JFX1BPTExfTVMgPSA1MDA7XG5cbnR5cGUgRW5kcG9pbnRQcm9iZU9wdGlvbnMgPSB7XG4gIHBvbGxNcz86IG51bWJlcjtcbiAgcmVxdWVzdFRpbWVvdXRNcz86IG51bWJlcjtcbiAgdGltZW91dE1zPzogbnVtYmVyO1xufTtcblxuY29uc3Qgc2xlZXAgPSAobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT5cbiAgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG5cbmNvbnN0IHByb2JlRW5kcG9pbnQgPSBhc3luYyAoXG4gIHVybDogc3RyaW5nLFxuICB0aW1lb3V0TXM6IG51bWJlcixcbik6IFByb21pc2U8dm9pZD4gPT5cbiAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCByZXF1ZXN0OiBDbGllbnRSZXF1ZXN0IHwgdW5kZWZpbmVkO1xuICAgIGxldCBzZXR0bGVkID0gZmFsc2U7XG4gICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICByZXF1ZXN0Py5hYm9ydCgpO1xuICAgICAgaWYgKCFzZXR0bGVkKSB7XG4gICAgICAgIHNldHRsZWQgPSB0cnVlO1xuICAgICAgICByZWplY3QoXG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIG5ldyBFcnJvcihgRW5kcG9pbnQgcHJvYmUgdGltZWQgb3V0IGZvciAke25ldyBVUkwodXJsKS5vcmlnaW59YCksXG4gICAgICAgICAgICB7Y29kZTogJ0VUSU1FRE9VVCd9LFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSwgdGltZW91dE1zKTtcblxuICAgIGNvbnN0IGZhaWwgPSAoZXJyb3I6IEVycm9yKTogdm9pZCA9PiB7XG4gICAgICBpZiAoIXNldHRsZWQpIHtcbiAgICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgcmVxdWVzdCA9IG5ldC5yZXF1ZXN0KHttZXRob2Q6ICdIRUFEJywgcmVkaXJlY3Q6ICdmb2xsb3cnLCB1cmx9KTtcbiAgICAgIHJlcXVlc3Qub24oJ3Jlc3BvbnNlJywgcmVzcG9uc2UgPT4ge1xuICAgICAgICByZXNwb25zZS5vbignZGF0YScsICgpID0+IHVuZGVmaW5lZCk7XG4gICAgICAgIGlmICghc2V0dGxlZCkge1xuICAgICAgICAgIHNldHRsZWQgPSB0cnVlO1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXF1ZXN0Lm9uKCdlcnJvcicsIGZhaWwpO1xuICAgICAgcmVxdWVzdC5lbmQoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZmFpbChlcnJvciBhcyBFcnJvcik7XG4gICAgfVxuICB9KTtcblxuZXhwb3J0IGNvbnN0IHdhaXRGb3JFbmRwb2ludFJlYWNoYWJsZSA9IGFzeW5jIChcbiAgdXJsOiBzdHJpbmcsXG4gIHtcbiAgICBwb2xsTXMgPSBERUZBVUxUX1BST0JFX1BPTExfTVMsXG4gICAgcmVxdWVzdFRpbWVvdXRNcyA9IERFRkFVTFRfUkVRVUVTVF9USU1FT1VUX01TLFxuICAgIHRpbWVvdXRNcyA9IERFRkFVTFRfUFJPQkVfVElNRU9VVF9NUyxcbiAgfTogRW5kcG9pbnRQcm9iZU9wdGlvbnMgPSB7fSxcbik6IFByb21pc2U8dm9pZD4gPT4ge1xuICBjb25zdCBkZWFkbGluZSA9IERhdGUubm93KCkgKyB0aW1lb3V0TXM7XG4gIGxldCBsYXN0RXJyb3I6IHVua25vd24gPSBuZXcgRXJyb3IoXG4gICAgYEVuZHBvaW50IHByb2JlIGZhaWxlZCBmb3IgJHtuZXcgVVJMKHVybCkub3JpZ2lufWAsXG4gICk7XG5cbiAgd2hpbGUgKERhdGUubm93KCkgPCBkZWFkbGluZSkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBwcm9iZUVuZHBvaW50KHVybCwgcmVxdWVzdFRpbWVvdXRNcyk7XG4gICAgICByZXR1cm47XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxhc3RFcnJvciA9IGVycm9yO1xuICAgICAgaWYgKERhdGUubm93KCkgPCBkZWFkbGluZSkge1xuICAgICAgICBhd2FpdCBzbGVlcChwb2xsTXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChsYXN0RXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIHRocm93IGxhc3RFcnJvcjtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoYEVuZHBvaW50IHByb2JlIGZhaWxlZCBmb3IgJHtuZXcgVVJMKHVybCkub3JpZ2lufWApO1xufTtcbiIsImltcG9ydCB7bmV0fSBmcm9tICdlbGVjdHJvbic7XG5cbmltcG9ydCB7XG4gIGlzT2ZmbGluZU5ldHdvcmtFcnJvcixcbiAgaXNUcmFuc2llbnROZXR3b3JrRXJyb3IsXG59IGZyb20gJy4vbmV0d29ya0Vycm9yLnN0YXJ0LnV0aWxzJztcbmltcG9ydCB7d2FpdEZvckVuZHBvaW50UmVhY2hhYmxlfSBmcm9tICcuL25ldHdvcmtQcm9iZS5zdGFydC51dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfTUFYX1JFVFJJRVMgPSAzO1xuY29uc3QgREVGQVVMVF9ORVRXT1JLX1dBSVRfVElNRU9VVF9NUyA9IDEwMDAwO1xuY29uc3QgREVGQVVMVF9ORVRXT1JLX1BPTExfTVMgPSA1MDA7XG5jb25zdCBERUZBVUxUX0JBU0VfQkFDS09GRl9NUyA9IDUwMDtcblxudHlwZSBOZXR3b3JrUmV0cnlPcHRpb25zID0ge1xuICBiYXNlQmFja29mZk1zPzogbnVtYmVyO1xuICBlbmRwb2ludFByb2JlVXJsPzogc3RyaW5nO1xuICBsYWJlbD86IHN0cmluZztcbiAgbWF4UmV0cmllcz86IG51bWJlcjtcbiAgbmV0d29ya1BvbGxNcz86IG51bWJlcjtcbiAgbmV0d29ya1dhaXRUaW1lb3V0TXM/OiBudW1iZXI7XG59O1xuXG5jb25zdCBzbGVlcCA9IChtczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PlxuICBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcblxuLyoqXG4gKiBQb2xscyBFbGVjdHJvbidzIGBuZXQuaXNPbmxpbmUoKWAgdW50aWwgaXQgcmV0dXJucyB0cnVlIG9yIHRoZSB0aW1lb3V0XG4gKiBlbGFwc2VzLiBSZXR1cm5zIHdoZXRoZXIgdGhlIG5ldHdvcmsgY2FtZSBvbmxpbmUgd2l0aGluIHRoZSB0aW1lb3V0LlxuICovXG5leHBvcnQgY29uc3Qgd2FpdEZvck5ldHdvcmtPbmxpbmUgPSBhc3luYyAoXG4gIHRpbWVvdXRNcyA9IERFRkFVTFRfTkVUV09SS19XQUlUX1RJTUVPVVRfTVMsXG4gIHBvbGxNcyA9IERFRkFVTFRfTkVUV09SS19QT0xMX01TLFxuKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gIGNvbnN0IGRlYWRsaW5lID0gRGF0ZS5ub3coKSArIHRpbWVvdXRNcztcblxuICB3aGlsZSAoRGF0ZS5ub3coKSA8IGRlYWRsaW5lKSB7XG4gICAgaWYgKG5ldC5pc09ubGluZSgpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgYXdhaXQgc2xlZXAocG9sbE1zKTtcbiAgfVxuXG4gIHJldHVybiBuZXQuaXNPbmxpbmUoKTtcbn07XG5cbmV4cG9ydCBjb25zdCB3YWl0VW50aWxOZXR3b3JrT25saW5lID0gYXN5bmMgKFxuICBwb2xsTXMgPSBERUZBVUxUX05FVFdPUktfUE9MTF9NUyxcbik6IFByb21pc2U8dm9pZD4gPT4ge1xuICB3aGlsZSAoIW5ldC5pc09ubGluZSgpKSB7XG4gICAgYXdhaXQgc2xlZXAocG9sbE1zKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSdW5zIGBmbmAgaW1tZWRpYXRlbHkgb25jZS4gSWYgaXQgZmFpbHMgd2l0aCBhIHRyYW5zaWVudCBuZXR3b3JrIGVycm9yLFxuICogd2FpdHMgKGJvdW5kZWQpIGZvciB0aGUgbmV0d29yayB0byBjb21lIG9ubGluZSwgdGhlbiByZXRyaWVzIHdpdGhcbiAqIGV4cG9uZW50aWFsIGJhY2tvZmYuIE5vbi10cmFuc2llbnQgZXJyb3JzIGFyZSByZXRocm93biBpbW1lZGlhdGVseS5cbiAqL1xuZXhwb3J0IGNvbnN0IHJ1bldpdGhOZXR3b3JrUmV0cnkgPSBhc3luYyA8VD4oXG4gIGZuOiAoKSA9PiBQcm9taXNlPFQ+LFxuICBvcHRpb25zOiBOZXR3b3JrUmV0cnlPcHRpb25zID0ge30sXG4pOiBQcm9taXNlPFQ+ID0+IHtcbiAgY29uc3Qge1xuICAgIGJhc2VCYWNrb2ZmTXMgPSBERUZBVUxUX0JBU0VfQkFDS09GRl9NUyxcbiAgICBlbmRwb2ludFByb2JlVXJsLFxuICAgIGxhYmVsID0gJ25ldHdvcmsgcmVxdWVzdCcsXG4gICAgbWF4UmV0cmllcyA9IERFRkFVTFRfTUFYX1JFVFJJRVMsXG4gICAgbmV0d29ya1BvbGxNcyA9IERFRkFVTFRfTkVUV09SS19QT0xMX01TLFxuICAgIG5ldHdvcmtXYWl0VGltZW91dE1zID0gREVGQVVMVF9ORVRXT1JLX1dBSVRfVElNRU9VVF9NUyxcbiAgfSA9IG9wdGlvbnM7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgZm4oKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoIWlzVHJhbnNpZW50TmV0d29ya0Vycm9yKGVycm9yKSkge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXG4gICAgICBgW05ldHdvcmtSZXRyeV0gJHtsYWJlbH0gZmFpbGVkIHdpdGggYSB0cmFuc2llbnQgZXJyb3IsIHdhaXRpbmcgZm9yIG5ldHdvcmsuLi5gLFxuICAgICk7XG4gICAgY29uc3QgaXNPbmxpbmUgPSBhd2FpdCB3YWl0Rm9yTmV0d29ya09ubGluZShcbiAgICAgIG5ldHdvcmtXYWl0VGltZW91dE1zLFxuICAgICAgbmV0d29ya1BvbGxNcyxcbiAgICApO1xuICAgIGlmICghaXNPbmxpbmUpIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgW05ldHdvcmtSZXRyeV0gJHtsYWJlbH06IG5ldHdvcmsgaXMgc3RpbGwgb2ZmbGluZSwgcGF1c2luZyByZXRyaWVzYCxcbiAgICAgICk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgaWYgKGVuZHBvaW50UHJvYmVVcmwpIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgW05ldHdvcmtSZXRyeV0gJHtsYWJlbH06IG5ldHdvcmsgaXMgb25saW5lLCBjaGVja2luZyAke25ldyBVUkwoZW5kcG9pbnRQcm9iZVVybCkub3JpZ2lufWAsXG4gICAgICApO1xuICAgICAgYXdhaXQgd2FpdEZvckVuZHBvaW50UmVhY2hhYmxlKGVuZHBvaW50UHJvYmVVcmwsIHtcbiAgICAgICAgcG9sbE1zOiBuZXR3b3JrUG9sbE1zLFxuICAgICAgICB0aW1lb3V0TXM6IG5ldHdvcmtXYWl0VGltZW91dE1zLFxuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgYFtOZXR3b3JrUmV0cnldICR7bGFiZWx9OiBuZXR3b3JrIGFuZCBlbmRwb2ludCBhcmUgcmVhZHksIHN0YXJ0aW5nIHJldHJpZXNgLFxuICAgICk7XG5cbiAgICBsZXQgbGFzdEVycm9yID0gZXJyb3I7XG4gICAgZm9yIChsZXQgYXR0ZW1wdCA9IDE7IGF0dGVtcHQgPD0gbWF4UmV0cmllczsgYXR0ZW1wdCsrKSB7XG4gICAgICBjb25zdCBiYWNrb2ZmTXMgPSBiYXNlQmFja29mZk1zICogMyAqKiAoYXR0ZW1wdCAtIDEpO1xuICAgICAgYXdhaXQgc2xlZXAoYmFja29mZk1zKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgYFtOZXR3b3JrUmV0cnldICR7bGFiZWx9OiByZXRyeSAke2F0dGVtcHR9LyR7bWF4UmV0cmllc30gKGFmdGVyICR7YmFja29mZk1zfW1zKWAsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBhd2FpdCBmbigpO1xuICAgICAgfSBjYXRjaCAocmV0cnlFcnJvcikge1xuICAgICAgICBsYXN0RXJyb3IgPSByZXRyeUVycm9yO1xuICAgICAgICBpZiAoIWlzVHJhbnNpZW50TmV0d29ya0Vycm9yKHJldHJ5RXJyb3IpKSB7XG4gICAgICAgICAgdGhyb3cgcmV0cnlFcnJvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNPZmZsaW5lTmV0d29ya0Vycm9yKHJldHJ5RXJyb3IpIHx8ICFuZXQuaXNPbmxpbmUoKSkge1xuICAgICAgICAgIHRocm93IHJldHJ5RXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBsYXN0RXJyb3I7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7QnJvd3NlcldpbmRvd30gZnJvbSAnZWxlY3Ryb24nO1xuXG5leHBvcnQgdHlwZSBOZXR3b3JrU3RhY2tOYW1lID1cbiAgfCAnYXhpb3MnXG4gIHwgJ2F4aW9zLWRvd25sb2FkJ1xuICB8ICdjaHJvbWl1bS1sb2FkJ1xuICB8ICdwcmVsb2FkLWdvdCdcbiAgfCAndmVsb3BhY2stdXBkYXRlcic7XG5cbmV4cG9ydCB0eXBlIFdpbmRvd3NUbHNFcnJvckNsYXNzaWZpY2F0aW9uID0ge1xuICBjb2RlPzogc3RyaW5nO1xuICBlcnJubz86IHN0cmluZztcbiAgaXNSZXZvY2F0aW9uTGlrZWx5OiBib29sZWFuO1xuICBpc1Rsc09yQ2VydGlmaWNhdGVFcnJvcjogYm9vbGVhbjtcbiAgaXNXaW5kb3dzOiBib29sZWFuO1xuICBtYXRjaGVkU2lnbmFsczogc3RyaW5nW107XG4gIG1lc3NhZ2U/OiBzdHJpbmc7XG4gIG5hbWU/OiBzdHJpbmc7XG4gIHN0YWNrOiBOZXR3b3JrU3RhY2tOYW1lO1xufTtcblxuY29uc3QgVExTX0VSUk9SX1NJR05BTFMgPSBbXG4gICdDRVJUXycsXG4gICdjZXJ0aWZpY2F0ZScsXG4gICdERVBUSF9aRVJPX1NFTEZfU0lHTkVEX0NFUlQnLFxuICAnRVBST1RPJyxcbiAgJ0VSUl9DRVJUXycsXG4gICdFUlJfU1NMXycsXG4gICdFUlJfVExTXycsXG4gICdTRUxGX1NJR05FRF9DRVJUJyxcbiAgJ1NTTCcsXG4gICdUTFMnLFxuICAnVU5BQkxFX1RPX1ZFUklGWV9MRUFGX1NJR05BVFVSRScsXG5dIGFzIGNvbnN0O1xuXG5jb25zdCBSRVZPQ0FUSU9OX0VSUk9SX1NJR05BTFMgPSBbXG4gICcweDgwMDkyMDEyJyxcbiAgJzB4ODAwOTIwMTMnLFxuICAnMHg4MDBCMDEwQycsXG4gICdDRVJUX1JFVk9LRUQnLFxuICAnQ0VSVF9UUlVTVF9JU19SRVZPS0VEJyxcbiAgJ0NFUlRfVFJVU1RfUkVWT0NBVElPTl9TVEFUVVNfVU5LTk9XTicsXG4gICdDUllQVF9FX1JFVk9DQVRJT05fT0ZGTElORScsXG4gICdFUlJfQ0VSVF9OT19SRVZPQ0FUSU9OX01FQ0hBTklTTScsXG4gICdFUlJfQ0VSVF9SRVZPS0VEJyxcbiAgJ0VSUl9DRVJUX1VOQUJMRV9UT19DSEVDS19SRVZPQ0FUSU9OJyxcbiAgJ3Jldm9jYXRpb24nLFxuICAncmV2b2tlZCcsXG4gICdVTkFCTEVfVE9fR0VUX0NSTCcsXG5dIGFzIGNvbnN0O1xuXG5jb25zdCBpc1JlY29yZCA9ICh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0+XG4gIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGw7XG5cbmNvbnN0IGdldFN0cmluZ1ZhbHVlID0gKFxuICB2YWx1ZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gIGtleTogc3RyaW5nLFxuKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgY29uc3QgZW50cnkgPSB2YWx1ZVtrZXldO1xuICByZXR1cm4gdHlwZW9mIGVudHJ5ID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgZW50cnkgPT09ICdudW1iZXInXG4gICAgPyBTdHJpbmcoZW50cnkpXG4gICAgOiB1bmRlZmluZWQ7XG59O1xuXG5jb25zdCBnZXRFcnJvckZpZWxkcyA9IChlcnJvcjogdW5rbm93bikgPT4ge1xuICBjb25zdCByZWNvcmQgPSBpc1JlY29yZChlcnJvcikgPyBlcnJvciA6IHt9O1xuICByZXR1cm4ge1xuICAgIGNvZGU6IGdldFN0cmluZ1ZhbHVlKHJlY29yZCwgJ2NvZGUnKSxcbiAgICBlcnJubzogZ2V0U3RyaW5nVmFsdWUocmVjb3JkLCAnZXJybm8nKSxcbiAgICBtZXNzYWdlOiBnZXRTdHJpbmdWYWx1ZShyZWNvcmQsICdtZXNzYWdlJyksXG4gICAgbmFtZTogZ2V0U3RyaW5nVmFsdWUocmVjb3JkLCAnbmFtZScpLFxuICB9O1xufTtcblxuY29uc3QgZ2V0Q2F1c2VQYXJ0cyA9IChlcnJvcjogdW5rbm93bik6IHN0cmluZ1tdID0+IHtcbiAgY29uc3QgY2F1c2UgPSBpc1JlY29yZChlcnJvcikgPyBlcnJvci5jYXVzZSA6IHVuZGVmaW5lZDtcbiAgY29uc3QgY2F1c2VGaWVsZHMgPSBnZXRFcnJvckZpZWxkcyhjYXVzZSk7XG4gIHJldHVybiBPYmplY3QudmFsdWVzKGNhdXNlRmllbGRzKS5maWx0ZXIoQm9vbGVhbikgYXMgc3RyaW5nW107XG59O1xuXG5jb25zdCBjb2xsZWN0RXJyb3JQYXJ0cyA9IChlcnJvcjogdW5rbm93bik6IHN0cmluZ1tdID0+IHtcbiAgY29uc3QgZmllbGRzID0gZ2V0RXJyb3JGaWVsZHMoZXJyb3IpO1xuICBjb25zdCBkaXJlY3RQYXJ0cyA9IE9iamVjdC52YWx1ZXMoZmllbGRzKS5maWx0ZXIoQm9vbGVhbikgYXMgc3RyaW5nW107XG4gIGNvbnN0IGZhbGxiYWNrUGFydCA9IHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycgPyBbZXJyb3JdIDogW107XG4gIHJldHVybiBbLi4uZGlyZWN0UGFydHMsIC4uLmdldENhdXNlUGFydHMoZXJyb3IpLCAuLi5mYWxsYmFja1BhcnRdO1xufTtcblxuY29uc3QgZ2V0TWF0Y2hlZFNpZ25hbHMgPSAoXG4gIHBhcnRzOiBzdHJpbmdbXSxcbiAgc2lnbmFsczogcmVhZG9ubHkgc3RyaW5nW10sXG4pOiBzdHJpbmdbXSA9PiB7XG4gIGNvbnN0IHRleHQgPSBwYXJ0cy5qb2luKCdcXG4nKS50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4gc2lnbmFscy5maWx0ZXIoc2lnbmFsID0+IHRleHQuaW5jbHVkZXMoc2lnbmFsLnRvTG93ZXJDYXNlKCkpKTtcbn07XG5cbmNvbnN0IGdldEFsbE1hdGNoZWRTaWduYWxzID0gKHBhcnRzOiBzdHJpbmdbXSk6IHN0cmluZ1tdID0+IFtcbiAgLi4uZ2V0TWF0Y2hlZFNpZ25hbHMocGFydHMsIFRMU19FUlJPUl9TSUdOQUxTKSxcbiAgLi4uZ2V0TWF0Y2hlZFNpZ25hbHMocGFydHMsIFJFVk9DQVRJT05fRVJST1JfU0lHTkFMUyksXG5dO1xuXG5leHBvcnQgY29uc3QgY2xhc3NpZnlXaW5kb3dzVGxzRXJyb3IgPSAoXG4gIHN0YWNrOiBOZXR3b3JrU3RhY2tOYW1lLFxuICBlcnJvcjogdW5rbm93bixcbik6IFdpbmRvd3NUbHNFcnJvckNsYXNzaWZpY2F0aW9uID0+IHtcbiAgY29uc3QgcGFydHMgPSBjb2xsZWN0RXJyb3JQYXJ0cyhlcnJvcik7XG4gIGNvbnN0IGZpZWxkcyA9IGdldEVycm9yRmllbGRzKGVycm9yKTtcbiAgY29uc3QgbWF0Y2hlZFNpZ25hbHMgPSBnZXRBbGxNYXRjaGVkU2lnbmFscyhwYXJ0cyk7XG4gIGNvbnN0IHJldm9jYXRpb25TaWduYWxzID0gZ2V0TWF0Y2hlZFNpZ25hbHMocGFydHMsIFJFVk9DQVRJT05fRVJST1JfU0lHTkFMUyk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5maWVsZHMsXG4gICAgaXNSZXZvY2F0aW9uTGlrZWx5OiByZXZvY2F0aW9uU2lnbmFscy5sZW5ndGggPiAwLFxuICAgIGlzVGxzT3JDZXJ0aWZpY2F0ZUVycm9yOiBtYXRjaGVkU2lnbmFscy5sZW5ndGggPiAwLFxuICAgIGlzV2luZG93czogcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyxcbiAgICBtYXRjaGVkU2lnbmFscyxcbiAgICBzdGFjayxcbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBsb2dXaW5kb3dzVGxzRXJyb3IgPSAoXG4gIHN0YWNrOiBOZXR3b3JrU3RhY2tOYW1lLFxuICBlcnJvcjogdW5rbm93bixcbiAgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogV2luZG93c1Rsc0Vycm9yQ2xhc3NpZmljYXRpb24gPT4ge1xuICBjb25zdCBjbGFzc2lmaWNhdGlvbiA9IGNsYXNzaWZ5V2luZG93c1Rsc0Vycm9yKHN0YWNrLCBlcnJvcik7XG4gIGlmIChjbGFzc2lmaWNhdGlvbi5pc1dpbmRvd3MgJiYgY2xhc3NpZmljYXRpb24uaXNUbHNPckNlcnRpZmljYXRlRXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdbV2luZG93cyBUTFNdIE5ldHdvcmsgc3RhY2sgZmFpbHVyZSBjbGFzc2lmaWVkJywge1xuICAgICAgY2xhc3NpZmljYXRpb24sXG4gICAgICBjb250ZXh0LFxuICAgIH0pO1xuICB9XG4gIHJldHVybiBjbGFzc2lmaWNhdGlvbjtcbn07XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlckJyb3dzZXJXaW5kb3dUbHNEaWFnbm9zdGljcyA9IChcbiAgYnJvd3NlcldpbmRvdzogQnJvd3NlcldpbmRvdyxcbik6IHZvaWQgPT4ge1xuICBicm93c2VyV2luZG93LndlYkNvbnRlbnRzLm9uKFxuICAgICdkaWQtZmFpbC1sb2FkJyxcbiAgICAoX2V2ZW50LCBlcnJvckNvZGUsIGVycm9yRGVzY3JpcHRpb24sIHZhbGlkYXRlZFVybCwgaXNNYWluRnJhbWUpID0+IHtcbiAgICAgIGxvZ1dpbmRvd3NUbHNFcnJvcihcbiAgICAgICAgJ2Nocm9taXVtLWxvYWQnLFxuICAgICAgICB7Y29kZTogZXJyb3JDb2RlLCBtZXNzYWdlOiBlcnJvckRlc2NyaXB0aW9ufSxcbiAgICAgICAge2lzTWFpbkZyYW1lLCB1cmw6IHZhbGlkYXRlZFVybH0sXG4gICAgICApO1xuICAgIH0sXG4gICk7XG59O1xuIiwiaW1wb3J0IHR5cGUge1xuICBBeGlvc0Vycm9yLFxuICBBeGlvc1Jlc3BvbnNlSGVhZGVycyxcbiAgSW50ZXJuYWxBeGlvc1JlcXVlc3RDb25maWcsXG4gIFJhd0F4aW9zUmVzcG9uc2VIZWFkZXJzLFxufSBmcm9tICdheGlvcyc7XG5pbXBvcnQgdHlwZSB7V3JpdGVTdHJlYW19IGZyb20gJ2ZzJztcbmltcG9ydCB0eXBlIHtSZWFkYWJsZX0gZnJvbSAnc3RyZWFtJztcblxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7Y3JlYXRlV3JpdGVTdHJlYW0sIGV4aXN0c1N5bmMsIG1rZGlyU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7ZWxlY3Ryb25OZXRBZGFwdGVyfSBmcm9tICcuL2VsZWN0cm9uTmV0QWRhcHRlci51dGlscyc7XG5pbXBvcnQge3J1bldpdGhOZXR3b3JrUmV0cnl9IGZyb20gJy4vc3RhcnRGdW5jdGlvbnMvbmV0d29ya1JldHJ5LnN0YXJ0LnV0aWxzJztcbmltcG9ydCB7c2hhcmVkVmFyaWFibGVzfSBmcm9tICcuL3N0YXJ0RnVuY3Rpb25zL3NoYXJlZFZhcmlhYmxlcy5zdGFydC51dGlscyc7XG5pbXBvcnQge09SSUdJTl9NQVB9IGZyb20gJy4vc3RhcnRGdW5jdGlvbnMvdXJscy5zdGFydC51dGlscyc7XG5pbXBvcnQge2xvZ1dpbmRvd3NUbHNFcnJvcn0gZnJvbSAnLi90bHNFcnJvci51dGlscyc7XG5cbmV4cG9ydCB0eXBlIEF4aW9zUmV0cnlNb2RlID0gJ2RlZmF1bHQnIHwgJ2V4dGVybmFsJztcblxuZGVjbGFyZSBtb2R1bGUgJ2F4aW9zJyB7XG4gIGludGVyZmFjZSBBeGlvc1JlcXVlc3RDb25maWcge1xuICAgIGF1dG9jdXRSZXF1aXJlSHR0cHM/OiBib29sZWFuO1xuICAgIGF1dG9jdXRSZXRyeU1vZGU/OiBBeGlvc1JldHJ5TW9kZTtcbiAgICBhdXRvY3V0VmFsaWRhdGVSZWRpcmVjdD86IChyZWRpcmVjdFVybDogc3RyaW5nLCByZXF1ZXN0VXJsOiBzdHJpbmcpID0+IHZvaWQ7XG4gIH1cbn1cblxuLy8gUm91dGUgZXZlcnkgbWFpbi1wcm9jZXNzIHJlcXVlc3QgdGhyb3VnaCBFbGVjdHJvbidzIGBuZXRgIG1vZHVsZSAoQ2hyb21pdW0nc1xuLy8gbmV0d29yayBzdGFjaykgaW5zdGVhZCBvZiBOb2RlJ3MgaHR0cC9odHRwcyArIGdldGFkZHJpbmZvLiBTZWVcbi8vIGBlbGVjdHJvbk5ldEFkYXB0ZXIudXRpbHMudHNgIGZvciB0aGUgcmF0aW9uYWxlLlxuYXhpb3MuZGVmYXVsdHMuYWRhcHRlciA9IGVsZWN0cm9uTmV0QWRhcHRlcjtcblxudHlwZSBSZXRyaWFibGVBeGlvc1JlcXVlc3RDb25maWcgPSBJbnRlcm5hbEF4aW9zUmVxdWVzdENvbmZpZyAmIHtcbiAgX29yaWdpbmFsSG9zdG5hbWU/OiBzdHJpbmc7XG4gIF9wcm94eUluZGV4PzogbnVtYmVyO1xuICBfcmV0cnlDb3VudD86IG51bWJlcjtcbn07XG5cbi8vIEdldCBvcmlnaW4gbWFwIGZyb20gc2hhcmVkIHZhcmlhYmxlc1xuY29uc3QgZ2V0T3JpZ2luTWFwID0gKCk6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9PiB7XG4gIGlmICghc2hhcmVkVmFyaWFibGVzPy5QUk9YWV9PUklHSU5fTUFQKSB7XG4gICAgcmV0dXJuIE9SSUdJTl9NQVA7XG4gIH1cbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShzaGFyZWRWYXJpYWJsZXM/LlBST1hZX09SSUdJTl9NQVAgfHwgJ3t9JykgYXMgUmVjb3JkPFxuICAgICAgc3RyaW5nLFxuICAgICAgc3RyaW5nW11cbiAgICA+O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHBhcnNpbmcgcHJveHkgb3JpZ2luIG1hcCcsIGVycm9yKTtcbiAgICByZXR1cm4gT1JJR0lOX01BUDtcbiAgfVxufTtcblxuLy8gQ2FjaGUgZm9yIGRvbWFpbnMgdGhhdCBuZWVkIHRvIGJlIG1hcHBlZCAocGVyc2lzdHMgdW50aWwgcmVzdGFydClcbmNvbnN0IG1hcHBlZERvbWFpbnNDYWNoZTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXG4vLyBDaGVjayBpZiBob3N0IG1hdGNoZXMgd2lsZGNhcmQgdGVtcGxhdGVcbmNvbnN0IGlzTWF0Y2hpbmdXaWxkY2FyZCA9IChob3N0OiBzdHJpbmcsIHRlbXBsYXRlOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgY29uc3QgbWF0Y2ggPSBob3N0LmVuZHNXaXRoKHRlbXBsYXRlLnJlcGxhY2UoL15cXCovLCAnJykpO1xuICAvLyBjb25zb2xlLmxvZyhcbiAgLy8gICBgW0F4aW9zXSBXaWxkY2FyZCBtYXRjaCBjaGVjazogJHtob3N0fSB2cyAke3RlbXBsYXRlfSA9ICR7bWF0Y2h9YCxcbiAgLy8gKTtcbiAgcmV0dXJuIG1hdGNoO1xufTtcblxuLy8gRXh0cmFjdCBzdWJkb21haW4gZnJvbSBob3N0IHVzaW5nIHRlbXBsYXRlXG5jb25zdCBleHRyYWN0U3ViZG9tYWluID0gKGhvc3Q6IHN0cmluZywgdGVtcGxhdGU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHN1YmRvbWFpbiA9IGhvc3QucmVwbGFjZShcbiAgICBuZXcgUmVnRXhwKHRlbXBsYXRlLnJlcGxhY2UoL15cXCovLCAnJykgKyAnJCcpLFxuICAgICcnLFxuICApO1xuICAvLyBjb25zb2xlLmxvZyhgW0F4aW9zXSBFeHRyYWN0ZWQgc3ViZG9tYWluIGZyb20gJHtob3N0fTogXCIke3N1YmRvbWFpbn1cImApO1xuICByZXR1cm4gc3ViZG9tYWluO1xufTtcblxuLy8gTWFwIHdpbGRjYXJkIGhvc3QgdG8gcHJveHkgZG9tYWluXG5jb25zdCBnZXRNYXBwZWRXaWxkY2FyZCA9IChcbiAgaG9zdDogc3RyaW5nLFxuICBwcm94eURvbWFpbjogc3RyaW5nLFxuICB0YXJnZXRUZW1wbGF0ZXM6IHN0cmluZ1tdLFxuKTogc3RyaW5nW10gPT4ge1xuICBjb25zdCBzdWJkb21haW4gPSBleHRyYWN0U3ViZG9tYWluKGhvc3QsIHByb3h5RG9tYWluKTtcbiAgY29uc3Qgc2FuaXRpemVkU3ViZG9tYWluID0gc3ViZG9tYWluLnJlcGxhY2UoL1xcLi9nLCAnLS0tJyk7XG4gIHJldHVybiB0YXJnZXRUZW1wbGF0ZXMubWFwKHRlbXBsYXRlID0+XG4gICAgdGVtcGxhdGUucmVwbGFjZSgnKicsIHNhbml0aXplZFN1YmRvbWFpbiksXG4gICk7XG59O1xuXG4vLyBGaW5kIG1hcHBlZCBob3N0bmFtZXMgZnJvbSBvcmlnaW4gbWFwIChyZXR1cm5zIGFycmF5IGZvciBmYWxsYmFjayBzdXBwb3J0KVxuY29uc3QgZmluZE1hcHBlZEhvc3RuYW1lcyA9IChob3N0bmFtZTogc3RyaW5nKTogc3RyaW5nW10gPT4ge1xuICBjb25zdCBvcmlnaW5NYXAgPSBnZXRPcmlnaW5NYXAoKTtcbiAgLy8gY29uc29sZS5sb2coYFtBeGlvc10gRmluZGluZyBtYXBwZWQgaG9zdG5hbWVzIGZvcjogJHtob3N0bmFtZX1gKTtcblxuICAvLyBUcnkgZXhhY3QgbWF0Y2ggZmlyc3RcbiAgaWYgKGhvc3RuYW1lIGluIG9yaWdpbk1hcCkge1xuICAgIGNvbnN0IG1hcHBlZCA9IG9yaWdpbk1hcFtob3N0bmFtZV07XG4gICAgLy8gY29uc29sZS5sb2coYFtBeGlvc10gRXhhY3QgbWF0Y2ggZm91bmQ6ICR7aG9zdG5hbWV9IC0+ICR7bWFwcGVkfWApO1xuICAgIHJldHVybiBtYXBwZWQ7XG4gIH1cblxuICAvLyBUcnkgd2lsZGNhcmQgbWF0Y2hlc1xuICBmb3IgKGNvbnN0IFt0ZW1wbGF0ZSwgdGFyZ2V0c10gb2YgT2JqZWN0LmVudHJpZXMob3JpZ2luTWFwKSkge1xuICAgIGlmICh0ZW1wbGF0ZS5pbmNsdWRlcygnKicpICYmIGlzTWF0Y2hpbmdXaWxkY2FyZChob3N0bmFtZSwgdGVtcGxhdGUpKSB7XG4gICAgICBjb25zdCBtYXBwZWQgPSBnZXRNYXBwZWRXaWxkY2FyZChob3N0bmFtZSwgdGVtcGxhdGUsIHRhcmdldHMpO1xuICAgICAgLy8gY29uc29sZS5sb2coYFtBeGlvc10gV2lsZGNhcmQgbWF0Y2ggZm91bmQ6ICR7aG9zdG5hbWV9IC0+ICR7bWFwcGVkfWApO1xuICAgICAgcmV0dXJuIG1hcHBlZDtcbiAgICB9XG4gIH1cblxuICBjb25zb2xlLmxvZyhgW0F4aW9zXSBObyBtYXBwaW5nIGZvdW5kIGZvcjogJHtob3N0bmFtZX1gKTtcbiAgcmV0dXJuIFtdO1xufTtcblxuLy8gQ2hlY2sgaWYgZXJyb3Igc2hvdWxkIHRyaWdnZXIgcHJveHkgZmFsbGJhY2tcbmNvbnN0IHNob3VsZFVzZVByb3h5RmFsbGJhY2sgPSAoZXJyb3I6IEF4aW9zRXJyb3IpOiBib29sZWFuID0+IHtcbiAgaWYgKGVycm9yLnJlc3BvbnNlPy5zdGF0dXMgJiYgZXJyb3IucmVzcG9uc2Uuc3RhdHVzID4gNTAxKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdCBlcnJvckNvZGUgPSBlcnJvci5jb2RlID8/ICcnO1xuICByZXR1cm4gWydFQ09OTlJFRlVTRUQnLCAnRUNPTk5SRVNFVCcsICdFTk9URk9VTkQnXS5pbmNsdWRlcyhlcnJvckNvZGUpO1xufTtcblxuY29uc3QgaXNSZWFkYWJsZVN0cmVhbSA9IChkYXRhOiB1bmtub3duKTogZGF0YSBpcyBSZWFkYWJsZSA9PlxuICB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiYgZGF0YSAhPT0gbnVsbCAmJiAncGlwZScgaW4gZGF0YTtcblxuY29uc3QgZ2V0QXhpb3NSZXNwb25zZURhdGEgPSAoZXJyb3I6IEF4aW9zRXJyb3IpOiB1bmtub3duID0+IHtcbiAgY29uc3QgZGF0YSA9IGVycm9yLnJlc3BvbnNlPy5kYXRhO1xuICBpZiAoaXNSZWFkYWJsZVN0cmVhbShkYXRhKSkgcmV0dXJuICdbUmVhZGFibGUgc3RyZWFtXSc7XG4gIHJldHVybiBkYXRhO1xufTtcblxuY29uc3QgZ2V0QXhpb3NFcnJvclN1bW1hcnkgPSAoXG4gIGVycm9yOiBBeGlvc0Vycm9yLFxuICByZXF1ZXN0OiBSZXRyaWFibGVBeGlvc1JlcXVlc3RDb25maWcsXG4pID0+ICh7XG4gIGNvZGU6IGVycm9yLmNvZGUsXG4gIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gIG1ldGhvZDogcmVxdWVzdC5tZXRob2QsXG4gIHJldHJ5Q291bnQ6IHJlcXVlc3QuX3JldHJ5Q291bnQgPz8gMCxcbiAgc3RhdHVzOiBlcnJvci5yZXNwb25zZT8uc3RhdHVzLFxuICBzdGF0dXNUZXh0OiBlcnJvci5yZXNwb25zZT8uc3RhdHVzVGV4dCxcbiAgdXJsOiByZXF1ZXN0LnVybCxcbiAgcmVzcG9uc2VEYXRhOiBnZXRBeGlvc1Jlc3BvbnNlRGF0YShlcnJvciksXG59KTtcblxuY29uc3QgZ2V0SGVhZGVyRmlsZW5hbWUgPSAoXG4gIGhlYWRlcnM6IFJhd0F4aW9zUmVzcG9uc2VIZWFkZXJzIHwgQXhpb3NSZXNwb25zZUhlYWRlcnMsXG4pOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICBjb25zdCBjb250ZW50RGlzcG9zaXRpb24gPSBoZWFkZXJzWydjb250ZW50LWRpc3Bvc2l0aW9uJ107XG4gIGNvbnN0IGhlYWRlclZhbHVlID0gQXJyYXkuaXNBcnJheShjb250ZW50RGlzcG9zaXRpb24pXG4gICAgPyBjb250ZW50RGlzcG9zaXRpb25bMF1cbiAgICA6IGNvbnRlbnREaXNwb3NpdGlvbjtcbiAgY29uc3QgZmlsZW5hbWUgPSBoZWFkZXJWYWx1ZT8uc3BsaXQoJ2ZpbGVuYW1lPScpWzFdPy5zcGxpdCgnOycpWzBdO1xuICByZXR1cm4gZmlsZW5hbWU/LnJlcGxhY2VBbGwoL1wiL2csICcnKTtcbn07XG5cbmNvbnN0IGdldERvd25sb2FkT3V0cHV0UGF0aCA9IChcbiAgZmlsZVVybDogc3RyaW5nLFxuICBvdXRwdXRGb2xkZXJQYXRoOiBzdHJpbmcsXG4gIGhlYWRlcnM6IFJhd0F4aW9zUmVzcG9uc2VIZWFkZXJzIHwgQXhpb3NSZXNwb25zZUhlYWRlcnMsXG4pOiBzdHJpbmcgPT4ge1xuICBjb25zdCBmaWxlbmFtZSA9IGdldEhlYWRlckZpbGVuYW1lKGhlYWRlcnMpO1xuICBjb25zdCB1cmxGaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUobmV3IFVSTChmaWxlVXJsKS5wYXRobmFtZSk7XG4gIGNvbnN0IGRlZmF1bHRGaWxlbmFtZSA9IGAke01hdGgucmFuZG9tKCkudG9TdHJpbmcoKS5yZXBsYWNlKCcuJywgJycpfS50bXBgO1xuICByZXR1cm4gcGF0aC5qb2luKFxuICAgIG91dHB1dEZvbGRlclBhdGgsXG4gICAgZmlsZW5hbWUgfHwgdXJsRmlsZW5hbWUgfHwgZGVmYXVsdEZpbGVuYW1lLFxuICApO1xufTtcblxuY29uc3QgcGlwZURvd25sb2FkVG9Xcml0ZXIgPSBhc3luYyAoXG4gIHN0cmVhbTogUmVhZGFibGUsXG4gIHdyaXRlcjogV3JpdGVTdHJlYW0sXG4pOiBQcm9taXNlPHZvaWQ+ID0+XG4gIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgaGFzRXJyb3IgPSBmYWxzZTtcbiAgICB3cml0ZXIub24oJ2Vycm9yJywgZXJyID0+IHtcbiAgICAgIGhhc0Vycm9yID0gdHJ1ZTtcbiAgICAgIHdyaXRlci5jbG9zZSgpO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfSk7XG4gICAgd3JpdGVyLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgIGlmICghaGFzRXJyb3IpIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgICBzdHJlYW0ub24oJ2Vycm9yJywgZXJyID0+IHtcbiAgICAgIGhhc0Vycm9yID0gdHJ1ZTtcbiAgICAgIHdyaXRlci5jbG9zZSgpO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfSk7XG4gICAgc3RyZWFtLnBpcGUod3JpdGVyKTtcbiAgfSk7XG5cbmV4cG9ydCBjb25zdCB2ZXJib3NlQXhpb3MgPSBheGlvcy5jcmVhdGUoe1xuICBhZGFwdGVyOiBlbGVjdHJvbk5ldEFkYXB0ZXIsXG4gIG1heFJlZGlyZWN0czogMTAsXG59KTtcblxuZXhwb3J0IGNvbnN0IGluaXRBeGlvcyA9ICgpOiB2b2lkID0+IHtcbiAgY29uc29sZS5sb2coXG4gICAgJ1tBeGlvc10gSW5pdGlhbGl6aW5nIGF4aW9zIHdpdGggcHJveHkgb3JpZ2luIG1hcCBmcm9tIHNoYXJlZCB2YXJpYWJsZXMnLFxuICApO1xuICBjb25zb2xlLmxvZyhcbiAgICBgW0F4aW9zXSBQcm94eSBvcmlnaW4gbWFwOiAke0pTT04uc3RyaW5naWZ5KGdldE9yaWdpbk1hcCgpLCBudWxsLCAyKX1gLFxuICApO1xuXG4gIHZlcmJvc2VBeGlvcy5pbnRlcmNlcHRvcnMucmVxdWVzdC51c2UoXG4gICAgKGNvbmZpZzogSW50ZXJuYWxBeGlvc1JlcXVlc3RDb25maWcpID0+IHtcbiAgICAgIGlmICghY29uZmlnLnVybCkgcmV0dXJuIGNvbmZpZztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVxdWVzdFVybCA9IG5ldyBVUkwoY29uZmlnLnVybCk7XG4gICAgICAgIGNvbnN0IGhvc3RuYW1lID0gcmVxdWVzdFVybC5ob3N0bmFtZTtcblxuICAgICAgICAvLyBJZiBkb21haW4gaXMgaW4gY2FjaGUsIG1hcCBpdCBpbW1lZGlhdGVseSAodXNlIGZpcnN0IGF2YWlsYWJsZSlcbiAgICAgICAgaWYgKG1hcHBlZERvbWFpbnNDYWNoZVtob3N0bmFtZV0pIHtcbiAgICAgICAgICBjb25zdCBtYXBwZWRIb3N0bmFtZSA9IG1hcHBlZERvbWFpbnNDYWNoZVtob3N0bmFtZV07XG4gICAgICAgICAgaWYgKG1hcHBlZEhvc3RuYW1lKSB7XG4gICAgICAgICAgICByZXF1ZXN0VXJsLmhvc3RuYW1lID0gbWFwcGVkSG9zdG5hbWU7XG4gICAgICAgICAgICBjb25maWcudXJsID0gcmVxdWVzdFVybC5ocmVmO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgIGBbQXhpb3NdIFVzaW5nIGNhY2hlZCBtYXBwaW5nOiAke2hvc3RuYW1lfSAtPiAke21hcHBlZEhvc3RuYW1lfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0F4aW9zXSBFcnJvciBpbiByZXF1ZXN0IGludGVyY2VwdG9yOicsIGVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9LFxuICAgIGVycm9yID0+IFByb21pc2UucmVqZWN0KGVycm9yKSxcbiAgKTtcblxuICAvLyBSZXNwb25zZSBpbnRlcmNlcHRvciBmb3IgcHJveHkgZmFsbGJhY2sgYW5kIHJldHJ5IGxvZ2ljXG4gIHZlcmJvc2VBeGlvcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UudXNlKFxuICAgIHJlc3BvbnNlID0+IHJlc3BvbnNlLFxuICAgIGFzeW5jIChlcnJvcjogQXhpb3NFcnJvcikgPT4ge1xuICAgICAgY29uc3Qgb3JpZ2luYWxSZXF1ZXN0ID0gZXJyb3IuY29uZmlnIGFzXG4gICAgICAgIHwgUmV0cmlhYmxlQXhpb3NSZXF1ZXN0Q29uZmlnXG4gICAgICAgIHwgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoIW9yaWdpbmFsUmVxdWVzdCkge1xuICAgICAgICBsb2dXaW5kb3dzVGxzRXJyb3IoJ2F4aW9zJywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiB3ZSBzaG91bGQgdHJ5IHByb3h5IGZhbGxiYWNrIChiZWZvcmUgcmV0cnkgbG9naWMpXG4gICAgICBpZiAoc2hvdWxkVXNlUHJveHlGYWxsYmFjayhlcnJvcikgJiYgb3JpZ2luYWxSZXF1ZXN0LnVybCkge1xuICAgICAgICBjb25zdCByZXF1ZXN0VXJsID0gbmV3IFVSTChvcmlnaW5hbFJlcXVlc3QudXJsKTtcblxuICAgICAgICAvLyBTdG9yZSBvcmlnaW5hbCBob3N0bmFtZSBvbiBmaXJzdCBwcm94eSBhdHRlbXB0XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsSG9zdG5hbWUgPVxuICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdC5fb3JpZ2luYWxIb3N0bmFtZSA/PyByZXF1ZXN0VXJsLmhvc3RuYW1lO1xuXG4gICAgICAgIC8vIFNraXAgaWYgYWxyZWFkeSBpbiBjYWNoZSAoYWxyZWFkeSB1c2luZyBwcm94eSlcbiAgICAgICAgaWYgKCFtYXBwZWREb21haW5zQ2FjaGVbb3JpZ2luYWxIb3N0bmFtZV0pIHtcbiAgICAgICAgICBjb25zdCBtYXBwZWRIb3N0bmFtZXMgPSBmaW5kTWFwcGVkSG9zdG5hbWVzKG9yaWdpbmFsSG9zdG5hbWUpO1xuICAgICAgICAgIGNvbnN0IHByb3h5SW5kZXggPSBvcmlnaW5hbFJlcXVlc3QuX3Byb3h5SW5kZXggPz8gMDtcblxuICAgICAgICAgIGlmIChwcm94eUluZGV4IDwgbWFwcGVkSG9zdG5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgbWFwcGVkSG9zdG5hbWUgPSBtYXBwZWRIb3N0bmFtZXNbcHJveHlJbmRleF07XG4gICAgICAgICAgICBvcmlnaW5hbFJlcXVlc3QuX29yaWdpbmFsSG9zdG5hbWUgPSBvcmlnaW5hbEhvc3RuYW1lO1xuICAgICAgICAgICAgb3JpZ2luYWxSZXF1ZXN0Ll9wcm94eUluZGV4ID0gcHJveHlJbmRleCArIDE7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vIFVwZGF0ZSBVUkwgd2l0aCBtYXBwZWQgaG9zdG5hbWVcbiAgICAgICAgICAgICAgcmVxdWVzdFVybC5ob3N0bmFtZSA9IG1hcHBlZEhvc3RuYW1lO1xuICAgICAgICAgICAgICBvcmlnaW5hbFJlcXVlc3QudXJsID0gcmVxdWVzdFVybC5ocmVmO1xuXG4gICAgICAgICAgICAgIC8vIFRyeSB0aGUgcmVxdWVzdCB3aXRoIG1hcHBlZCBkb21haW5cbiAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB2ZXJib3NlQXhpb3MucmVxdWVzdChvcmlnaW5hbFJlcXVlc3QpO1xuXG4gICAgICAgICAgICAgIC8vIFN1Y2Nlc3MhIEFkZCB0byBjYWNoZSBmb3IgZnV0dXJlIHJlcXVlc3RzXG4gICAgICAgICAgICAgIGlmICghKCdfcHJveHlJbmRleCcgaW4gcmVzcG9uc2UpKSB7XG4gICAgICAgICAgICAgICAgKHJlc3BvbnNlIGFzIGFueSkuX3Byb3h5SW5kZXggPSBwcm94eUluZGV4O1xuICAgICAgICAgICAgICAgIG1hcHBlZERvbWFpbnNDYWNoZVtvcmlnaW5hbEhvc3RuYW1lXSA9IG1hcHBlZEhvc3RuYW1lO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgYFtBeGlvc10gUHJveHkgZmFsbGJhY2sgJHtwcm94eUluZGV4ICsgMX0vJHttYXBwZWRIb3N0bmFtZXMubGVuZ3RofTogJHtvcmlnaW5hbEhvc3RuYW1lfSAtPiAke21hcHBlZEhvc3RuYW1lfSA6IOKchWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKHByb3h5RXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgICBgW0F4aW9zXSBQcm94eSBmYWxsYmFjayAke3Byb3h5SW5kZXggKyAxfS8ke21hcHBlZEhvc3RuYW1lcy5sZW5ndGh9OiAke29yaWdpbmFsSG9zdG5hbWV9IC0+ICR7bWFwcGVkSG9zdG5hbWV9IDog4p2MYCxcbiAgICAgICAgICAgICAgICBwcm94eUVycm9yLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAvLyBXaWxsIGNvbnRpbnVlIHRvIHRyeSBuZXh0IHByb3h5IG9yIHJldHJ5IGxvZ2ljIGJlbG93XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJlZ3VsYXIgcmV0cnkgbG9naWMgKGFmdGVyIGFsbCBwcm94eSBmYWxsYmFjayBhdHRlbXB0cylcbiAgICAgIGNvbnN0IHJldHJ5TGltaXQgPVxuICAgICAgICBvcmlnaW5hbFJlcXVlc3QuYXV0b2N1dFJldHJ5TW9kZSA9PT0gJ2V4dGVybmFsJyA/IDAgOiAzO1xuICAgICAgaWYgKChvcmlnaW5hbFJlcXVlc3QuX3JldHJ5Q291bnQgPz8gMCkgPCByZXRyeUxpbWl0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICdFcnJvciByZXNwb25zZScsXG4gICAgICAgICAgZ2V0QXhpb3NFcnJvclN1bW1hcnkoZXJyb3IsIG9yaWdpbmFsUmVxdWVzdCksXG4gICAgICAgICk7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIGAoJHtvcmlnaW5hbFJlcXVlc3QuX3JldHJ5Q291bnQgfHwgJ2luaXRpYWwnfSkgUmV0cnlpbmcgcmVxdWVzdCA6ICR7b3JpZ2luYWxSZXF1ZXN0LnVybH1gLFxuICAgICAgICApO1xuICAgICAgICBvcmlnaW5hbFJlcXVlc3QuX3JldHJ5Q291bnQgPSAob3JpZ2luYWxSZXF1ZXN0Ll9yZXRyeUNvdW50IHx8IDApICsgMTtcblxuICAgICAgICByZXR1cm4gdmVyYm9zZUF4aW9zLnJlcXVlc3Qob3JpZ2luYWxSZXF1ZXN0KTtcbiAgICAgIH1cblxuICAgICAgbG9nV2luZG93c1Rsc0Vycm9yKCdheGlvcycsIGVycm9yLCB7XG4gICAgICAgIHJldHJ5Q291bnQ6IG9yaWdpbmFsUmVxdWVzdC5fcmV0cnlDb3VudCA/PyAwLFxuICAgICAgICB1cmw6IG9yaWdpbmFsUmVxdWVzdC51cmwsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgfSxcbiAgKTtcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3dubG9hZEZpbGUoXG4gIGZpbGVVcmw6IHN0cmluZyxcbiAgb3V0cHV0Rm9sZGVyUGF0aDogc3RyaW5nLFxuICB7XG4gICAgcmVxdWlyZUh0dHBzID0gZmFsc2UsXG4gICAgd2l0aENhY2hlID0gZmFsc2UsXG4gIH06IHtcbiAgICByZXF1aXJlSHR0cHM/OiBib29sZWFuO1xuICAgIHdpdGhDYWNoZT86IGJvb2xlYW47XG4gIH0gPSB7fSxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgaWYgKCFleGlzdHNTeW5jKG91dHB1dEZvbGRlclBhdGgpKSB7XG4gICAgICBta2RpclN5bmMob3V0cHV0Rm9sZGVyUGF0aCwge3JlY3Vyc2l2ZTogdHJ1ZX0pO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcXVlc3RVcmwgPSBuZXcgVVJMKGZpbGVVcmwpO1xuICAgIGlmICghd2l0aENhY2hlKSB7XG4gICAgICAvLyBBIHVuaXF1ZSBxdWVyeSBwYXJhbSBjaGFuZ2VzIHRoZSBjYWNoZSBrZXksIHNvIGl0IGRlZmVhdHMgZXZlcnlcbiAgICAgIC8vIGxheWVyIChDaHJvbWl1bSdzIGRpc2sgY2FjaGUgYmVoaW5kIEVsZWN0cm9uJ3MgYG5ldGAgbW9kdWxlLCBDRE5zLFxuICAgICAgLy8gY29ycG9yYXRlIHByb3hpZXMpIGV2ZW4gd2hlbiBvbmUgb2YgdGhlbSBpZ25vcmVzIENhY2hlLUNvbnRyb2wuXG4gICAgICByZXF1ZXN0VXJsLnNlYXJjaFBhcmFtcy5zZXQoJ25vY2FjaGUnLCBEYXRlLm5vdygpLnRvU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIC8vIFRoZSBheGlvcyBpbnRlcmNlcHRvciBvbmx5IHNlZXMgZXJyb3JzIHJhaXNlZCBiZWZvcmUgdGhlIHJlc3BvbnNlXG4gICAgLy8gaGVhZGVycyBhcnJpdmU7IGEgY29ubmVjdGlvbiBkcm9wcGVkIHdoaWxlIHRoZSBib2R5IHN0cmVhbXMgdG8gZGlza1xuICAgIC8vIHN1cmZhY2VzIGZyb20gdGhlIHBpcGUsIHNvIHRoZSByZXRyeSBoYXMgdG8gd3JhcCBib3RoLlxuICAgIHJldHVybiBhd2FpdCBydW5XaXRoTmV0d29ya1JldHJ5KFxuICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnRG93bmxvYWRpbmcnLCByZXF1ZXN0VXJsLmhyZWYpO1xuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdmVyYm9zZUF4aW9zLmdldDxSZWFkYWJsZT4ocmVxdWVzdFVybC5ocmVmLCB7XG4gICAgICAgICAgYXV0b2N1dFJlcXVpcmVIdHRwczogcmVxdWlyZUh0dHBzLFxuICAgICAgICAgIGF1dG9jdXRSZXRyeU1vZGU6ICdleHRlcm5hbCcsXG4gICAgICAgICAgaGVhZGVyczogIXdpdGhDYWNoZVxuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUsIG5vLXN0b3JlLCBtdXN0LXJldmFsaWRhdGUnLFxuICAgICAgICAgICAgICAgIFByYWdtYTogJ25vLWNhY2hlJyxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgcmVzcG9uc2VUeXBlOiAnc3RyZWFtJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IG91dHB1dEZpbGVQYXRoID0gZ2V0RG93bmxvYWRPdXRwdXRQYXRoKFxuICAgICAgICAgIGZpbGVVcmwsXG4gICAgICAgICAgb3V0cHV0Rm9sZGVyUGF0aCxcbiAgICAgICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICApO1xuXG4gICAgICAgIGF3YWl0IHBpcGVEb3dubG9hZFRvV3JpdGVyKFxuICAgICAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgY3JlYXRlV3JpdGVTdHJlYW0ob3V0cHV0RmlsZVBhdGgpLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gb3V0cHV0RmlsZVBhdGg7XG4gICAgICB9LFxuICAgICAge2xhYmVsOiBgRG93bmxvYWQgJHtmaWxlVXJsfWB9LFxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nV2luZG93c1Rsc0Vycm9yKCdheGlvcy1kb3dubG9hZCcsIGVycm9yLCB7XG4gICAgICBvdXRwdXRGb2xkZXJQYXRoLFxuICAgICAgdXJsOiBmaWxlVXJsLFxuICAgIH0pO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG4iLCJpbXBvcnQge0lTX1NUQUdJTkd9IGZyb20gJ0AvZW52JztcbmltcG9ydCB7ZGlhbG9nfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQge3ZlcmJvc2VBeGlvc30gZnJvbSAnLi9heGlvcy51dGlscyc7XG5cbnR5cGUgRmV0Y2hXaXRoVGltZW91dE9wdGlvbnMgPSB7XG4gIHRpbWVvdXQ6IG51bWJlcjtcbiAgc2hvd1N0YWdpbmdXaGl0ZWxpc3RNb2RhbD86IGJvb2xlYW47XG59O1xuXG5jb25zdCBGT1JCSURERU5fU1RBVFVTX0NPREUgPSA0MDM7XG5cbmxldCBoYXNTaG93blN0YWdpbmdXaGl0ZWxpc3RNb2RhbCA9IGZhbHNlO1xuXG5leHBvcnQgY29uc3Qgc2hvd1N0YWdpbmdJcFdoaXRlbGlzdE1vZGFsID0gYXN5bmMgKFxuICB1cmw6IHN0cmluZyxcbik6IFByb21pc2U8dm9pZD4gPT4ge1xuICBpZiAoIUlTX1NUQUdJTkcgfHwgaGFzU2hvd25TdGFnaW5nV2hpdGVsaXN0TW9kYWwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBoYXNTaG93blN0YWdpbmdXaGl0ZWxpc3RNb2RhbCA9IHRydWU7XG4gIGNvbnN0IGhvc3RuYW1lID0gbmV3IFVSTCh1cmwpLmhvc3RuYW1lO1xuXG4gIGF3YWl0IGRpYWxvZy5zaG93TWVzc2FnZUJveCh7XG4gICAgdHlwZTogJ3dhcm5pbmcnLFxuICAgIHRpdGxlOiAnSVAgbm90IHdoaXRlbGlzdGVkJyxcbiAgICBtZXNzYWdlOiAnWW91ciBJUCBpcyBub3Qgd2hpdGVsaXN0ZWQgZm9yIHRoZSBzdGFnaW5nIGVudmlyb25tZW50LicsXG4gICAgZGV0YWlsOiBgQXV0b0N1dCByZWNlaXZlZCBhIDQwMyB3aGlsZSBjaGVja2luZyBhY2Nlc3MgdG8gJHtob3N0bmFtZX0uIEFzayBhbiBhZG1pbiB0byB3aGl0ZWxpc3QgeW91ciBjdXJyZW50IElQLCB0aGVuIHJlc3RhcnQgQXV0b0N1dC5gLFxuICAgIGJ1dHRvbnM6IFsnT0snXSxcbiAgICBkZWZhdWx0SWQ6IDAsXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrVXJsQXZhaWxhYmlsaXR5ID0gYXN5bmMgKFxuICB1cmw6IHN0cmluZyxcbiAgb3B0aW9uczogRmV0Y2hXaXRoVGltZW91dE9wdGlvbnMsXG4pOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHZlcmJvc2VBeGlvcy5nZXQodXJsLCB7XG4gICAgICB0aW1lb3V0OiBvcHRpb25zLnRpbWVvdXQsXG4gICAgICB2YWxpZGF0ZVN0YXR1czogKCkgPT4gdHJ1ZSxcbiAgICB9KTtcblxuICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IEZPUkJJRERFTl9TVEFUVVNfQ09ERSkge1xuICAgICAgaWYgKG9wdGlvbnMuc2hvd1N0YWdpbmdXaGl0ZWxpc3RNb2RhbCkge1xuICAgICAgICBhd2FpdCBzaG93U3RhZ2luZ0lwV2hpdGVsaXN0TW9kYWwodXJsKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiByZXNwb25zZS5zdGF0dXMgPD0gNTAxO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuLyoqXG4gKiBQaW5ncyBtdWx0aXBsZSBVUkxzIGluIG9yZGVyIGFuZCByZXR1cm5zIHRoZSBmaXJzdCBvbmUgdG8gcmVzcG9uZCBzdWNjZXNzZnVsbHlcbiAqIEBwYXJhbSB1cmxzIC0gQXJyYXkgb2YgVVJMcyB0byBwaW5nIGluIG9yZGVyXG4gKiBAcGFyYW0gdGltZW91dCAtIFRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIGZvciBlYWNoIFVSTCBjaGVjayAoZGVmYXVsdDogMjAwMG1zKVxuICogQHJldHVybnMgVGhlIGZpcnN0IFVSTCB0aGF0IHJlc3BvbmRzIHN1Y2Nlc3NmdWxseSwgb3IgdW5kZWZpbmVkIGlmIG5vbmUgcmVzcG9uZFxuICovXG5leHBvcnQgY29uc3Qgc2VsZWN0Rmlyc3RSZXNwb25kaW5nVXJsID0gYXN5bmMgKFxuICB1cmxzOiBzdHJpbmdbXSxcbiAgdGltZW91dCA9IDIwMDAsXG4pOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4gPT4ge1xuICBpZiAoIXVybHMgfHwgdXJscy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgZm9yIChjb25zdCB1cmwgb2YgdXJscykge1xuICAgIGNvbnNvbGUubG9nKGBbVVJMIFNlbGVjdGlvbl0gQ2hlY2tpbmcgVVJMOiAke3VybH1gKTtcbiAgICBjb25zdCBpc0F2YWlsYWJsZSA9IGF3YWl0IGNoZWNrVXJsQXZhaWxhYmlsaXR5KHVybCwge1xuICAgICAgdGltZW91dCxcbiAgICAgIHNob3dTdGFnaW5nV2hpdGVsaXN0TW9kYWw6IHRydWUsXG4gICAgfSk7XG4gICAgaWYgKGlzQXZhaWxhYmxlKSB7XG4gICAgICBjb25zb2xlLmxvZyhgW1VSTCBTZWxlY3Rpb25dIFNlbGVjdGVkIFVSTDogJHt1cmx9YCk7XG4gICAgICByZXR1cm4gdXJsO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhgW1VSTCBTZWxlY3Rpb25dIFVSTCBub3QgYXZhaWxhYmxlOiAke3VybH1gKTtcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdbVVJMIFNlbGVjdGlvbl0gTm8gVVJMcyByZXNwb25kZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xuIiwiaW1wb3J0ICogYXMgU2VudHJ5IGZyb20gJ0BzZW50cnkvZWxlY3Ryb24vbWFpbic7XG5pbXBvcnQge25ldH0gZnJvbSAnZWxlY3Ryb24nO1xuXG5pbXBvcnQgdHlwZSB7TmV0d29ya0ZhaWx1cmVLaW5kfSBmcm9tICcuL25ldHdvcmtFcnJvci5zdGFydC51dGlscyc7XG5pbXBvcnQgdHlwZSB7U3RhcnR1cFVybFZhbGlkYXRpb25FcnJvcn0gZnJvbSAnLi9zaGFyZWRWYXJpYWJsZXNBc3NlcnQuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHtnZXROZXR3b3JrRmFpbHVyZUtpbmR9IGZyb20gJy4vbmV0d29ya0Vycm9yLnN0YXJ0LnV0aWxzJztcblxudHlwZSBGYWlsdXJlQXZhaWxhYmlsaXR5ID0gJ29mZmxpbmUnIHwgJ29ubGluZSc7XG5cbnR5cGUgU3RhcnR1cEZhaWx1cmVDb250ZXh0ID0ge1xuICBvcGVyYXRpb246IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xufTtcblxudHlwZSBTdGFydHVwRmFpbHVyZSA9IHtcbiAgYXZhaWxhYmlsaXR5OiBGYWlsdXJlQXZhaWxhYmlsaXR5O1xuICBjb2RlPzogc3RyaW5nO1xuICBob3N0Pzogc3RyaW5nO1xuICBraW5kOiBOZXR3b3JrRmFpbHVyZUtpbmQ7XG4gIG9wZXJhdGlvbjogc3RyaW5nO1xufTtcblxubGV0IHN0YXJ0dXBGYWlsdXJlczogU3RhcnR1cEZhaWx1cmVbXSA9IFtdO1xubGV0IGhhc1JlcG9ydGVkRmFpbHVyZSA9IGZhbHNlO1xuXG5leHBvcnQgY29uc3QgdHJhY2tTdGFydHVwRmFpbHVyZSA9IChcbiAgZXJyb3I6IHVua25vd24sXG4gIGNvbnRleHQ6IFN0YXJ0dXBGYWlsdXJlQ29udGV4dCxcbik6IGJvb2xlYW4gPT4ge1xuICBjb25zdCBraW5kID0gZ2V0TmV0d29ya0ZhaWx1cmVLaW5kKGVycm9yKTtcbiAgaWYgKGtpbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IGF2YWlsYWJpbGl0eTogRmFpbHVyZUF2YWlsYWJpbGl0eSA9XG4gICAga2luZCA9PT0gJ29mZmxpbmUnIHx8ICFuZXQuaXNPbmxpbmUoKSA/ICdvZmZsaW5lJyA6ICdvbmxpbmUnO1xuICBjb25zdCBjb2RlID1cbiAgICB0eXBlb2YgKGVycm9yIGFzIHtjb2RlPzogdW5rbm93bn0pPy5jb2RlID09PSAnc3RyaW5nJ1xuICAgICAgPyAoZXJyb3IgYXMge2NvZGU6IHN0cmluZ30pLmNvZGVcbiAgICAgIDogdW5kZWZpbmVkO1xuICBsZXQgaG9zdDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICB0cnkge1xuICAgIGhvc3QgPSBjb250ZXh0LnVybCA/IG5ldyBVUkwoY29udGV4dC51cmwpLmhvc3RuYW1lIDogdW5kZWZpbmVkO1xuICB9IGNhdGNoIHtcbiAgICBob3N0ID0gJ2ludmFsaWQtdXJsJztcbiAgfVxuXG4gIHN0YXJ0dXBGYWlsdXJlcy5wdXNoKHtcbiAgICBhdmFpbGFiaWxpdHksXG4gICAgY29kZSxcbiAgICBob3N0LFxuICAgIGtpbmQsXG4gICAgb3BlcmF0aW9uOiBjb250ZXh0Lm9wZXJhdGlvbixcbiAgfSk7XG4gIHJldHVybiB0cnVlO1xufTtcblxuZXhwb3J0IGNvbnN0IGhhc1N0YXJ0dXBGYWlsdXJlcyA9ICgpOiBib29sZWFuID0+XG4gIHN0YXJ0dXBGYWlsdXJlcy5sZW5ndGggPiAwO1xuXG5leHBvcnQgY29uc3QgcmVwb3J0U3RhcnR1cEZhaWx1cmVzID0gKFxuICBlcnJvcjogU3RhcnR1cFVybFZhbGlkYXRpb25FcnJvcixcbik6IHZvaWQgPT4ge1xuICBpZiAoaGFzUmVwb3J0ZWRGYWlsdXJlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaGFzUmVwb3J0ZWRGYWlsdXJlID0gdHJ1ZTtcbiAgY29uc3QgYXZhaWxhYmlsaXRpZXMgPSBuZXcgU2V0KFxuICAgIHN0YXJ0dXBGYWlsdXJlcy5tYXAoZmFpbHVyZSA9PiBmYWlsdXJlLmF2YWlsYWJpbGl0eSksXG4gICk7XG4gIGNvbnN0IGNvZGVzID0gbmV3IFNldChcbiAgICBzdGFydHVwRmFpbHVyZXNcbiAgICAgIC5tYXAoZmFpbHVyZSA9PiBmYWlsdXJlLmNvZGUpXG4gICAgICAuZmlsdGVyKChjb2RlKTogY29kZSBpcyBzdHJpbmcgPT4gY29kZSAhPT0gdW5kZWZpbmVkKSxcbiAgKTtcbiAgY29uc3QgaG9zdHMgPSBuZXcgU2V0KFxuICAgIHN0YXJ0dXBGYWlsdXJlc1xuICAgICAgLm1hcChmYWlsdXJlID0+IGZhaWx1cmUuaG9zdClcbiAgICAgIC5maWx0ZXIoKGhvc3QpOiBob3N0IGlzIHN0cmluZyA9PiBob3N0ICE9PSB1bmRlZmluZWQpLFxuICApO1xuICBjb25zdCBraW5kcyA9IG5ldyBTZXQoc3RhcnR1cEZhaWx1cmVzLm1hcChmYWlsdXJlID0+IGZhaWx1cmUua2luZCkpO1xuICBjb25zdCBvcGVyYXRpb25zID0gbmV3IFNldChcbiAgICBzdGFydHVwRmFpbHVyZXMubWFwKGZhaWx1cmUgPT4gZmFpbHVyZS5vcGVyYXRpb24pLFxuICApO1xuXG4gIFNlbnRyeS53aXRoU2NvcGUoc2NvcGUgPT4ge1xuICAgIHNjb3BlLnNldEZpbmdlcnByaW50KFsnc3RhcnR1cC1uZXR3b3JrJywgJ3VucmVzb2x2ZWQtY29uZmlnJ10pO1xuICAgIHNjb3BlLnNldExldmVsKCd3YXJuaW5nJyk7XG4gICAgc2NvcGUuc2V0VGFnKFxuICAgICAgJ25ldHdvcmsuYXZhaWxhYmlsaXR5X2F0X2ZhaWx1cmUnLFxuICAgICAgWy4uLmF2YWlsYWJpbGl0aWVzXS5zb3J0KCkuam9pbignLCcpLFxuICAgICk7XG4gICAgc2NvcGUuc2V0VGFnKCduZXR3b3JrLmVuZHBvaW50X2NvdW50JywgaG9zdHMuc2l6ZSk7XG4gICAgc2NvcGUuc2V0VGFnKCduZXR3b3JrLmZhaWx1cmVfa2luZHMnLCBbLi4ua2luZHNdLnNvcnQoKS5qb2luKCcsJykpO1xuICAgIHNjb3BlLnNldENvbnRleHQoJ3N0YXJ0dXBfbmV0d29yaycsIHtcbiAgICAgIGNvZGVzOiBbLi4uY29kZXNdLnNvcnQoKS5qb2luKCcsJyksXG4gICAgICBob3N0czogWy4uLmhvc3RzXS5zb3J0KCkuam9pbignLCcpLFxuICAgICAgaW52YWxpZFVybEtleXM6IGVycm9yLmludmFsaWRLZXlzLmpvaW4oJywnKSxcbiAgICAgIG1pc3NpbmdVcmxLZXlzOiBlcnJvci5taXNzaW5nS2V5cy5qb2luKCcsJyksXG4gICAgICBvcGVyYXRpb25zOiBbLi4ub3BlcmF0aW9uc10uc29ydCgpLmpvaW4oJywnKSxcbiAgICB9KTtcbiAgICBTZW50cnkuY2FwdHVyZU1lc3NhZ2UoXG4gICAgICAnU3RhcnR1cCBjb25maWd1cmF0aW9uIHJlbWFpbmVkIHVucmVzb2x2ZWQgYWZ0ZXIgbmV0d29yayBmYWxsYmFja3MnLFxuICAgICk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGNsZWFyU3RhcnR1cEZhaWx1cmVzID0gKCk6IHZvaWQgPT4ge1xuICBzdGFydHVwRmFpbHVyZXMgPSBbXTtcbiAgaGFzUmVwb3J0ZWRGYWlsdXJlID0gZmFsc2U7XG59O1xuIiwiaW1wb3J0IHtJU19QUk9ELCBJU19TVEFHSU5HfSBmcm9tICdAL2Vudic7XG5pbXBvcnQgKiBhcyBTZW50cnkgZnJvbSAnQHNlbnRyeS9lbGVjdHJvbi9tYWluJztcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQge2FwcCwgZGlhbG9nfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQge2V4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtuZXR3b3JrSW50ZXJmYWNlc30gZnJvbSAnb3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7bWFwQ29va1Jlc3BvbnNlVG9VcmxDYW5kaWRhdGVzfSBmcm9tICcuLi8uLi9xYS9xYUNvb2tDb250cmFjdCc7XG5pbXBvcnQge2J1aWxkUWFDb29rUHVibGljQ2hhbm5lbFBhdGgsIGdldFFhVGFyZ2V0fSBmcm9tICcuLi8uLi9xYS9xYVRhcmdldCc7XG5pbXBvcnQge3ZlcmJvc2VBeGlvc30gZnJvbSAnLi4vYXhpb3MudXRpbHMnO1xuaW1wb3J0IHtcbiAgc2VsZWN0Rmlyc3RSZXNwb25kaW5nVXJsLFxuICBzaG93U3RhZ2luZ0lwV2hpdGVsaXN0TW9kYWwsXG59IGZyb20gJy4uL2ZldGNoLnV0aWxzJztcbmltcG9ydCB7cnVuV2l0aE5ldHdvcmtSZXRyeX0gZnJvbSAnLi9uZXR3b3JrUmV0cnkuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHt0cmFja1N0YXJ0dXBGYWlsdXJlfSBmcm9tICcuL3N0YXJ0dXBOZXR3b3JrTW9uaXRvci5zdGFydC51dGlscyc7XG5cbmV4cG9ydCBjb25zdCBBVVRPX0NVVF9VUkxfU0VUX0tFWVMgPSBbXG4gICdmcm9udFVybCcsXG4gICdvbmJvYXJkaW5nVXJsJyxcbiAgJ2NvbXB1dGVVcmwnLFxuICAnaG9zdFNlcnZlclVybCcsXG4gICdkYXZpbmNpVXJsJyxcbiAgJ2RhdmluY2lQbHVnaW5VcmwnLFxuICAnYXBpVXJsJyxcbiAgJ3VwZGF0ZXJVcmwnLFxuICAncHByb1VybCcsXG4gICdwcHJvSnN4VXJsJyxcbiAgJ3N5c3RlbVJlcG9ydFVybCcsXG5dIGFzIGNvbnN0O1xuXG5jb25zdCBnZXRFbGVjdHJvbkFwcFZlcnNpb24gPSAoKTogc3RyaW5nID0+XG4gIElTX1BST0QgfHwgIWltcG9ydC5tZXRhLmVudi5WSVRFX1ZFUlNJT05cbiAgICA/IGFwcC5nZXRWZXJzaW9uKClcbiAgICA6IChpbXBvcnQubWV0YS5lbnYuVklURV9WRVJTSU9OIGFzIHN0cmluZyk7XG5cbmV4cG9ydCB0eXBlIEF1dG9DdXRVcmxTZXRLZXkgPSAodHlwZW9mIEFVVE9fQ1VUX1VSTF9TRVRfS0VZUylbbnVtYmVyXTtcblxuLy8gS2V5cyB3aG9zZSBhYnNlbmNlIGRvZXMgbm90IG1ha2UgdGhlIFVSTCBzZXQgaW5jb21wbGV0ZS4gYGRhdmluY2lQbHVnaW5VcmxgIGlzXG4vLyBoZXJlIGJlY2F1c2UgQ29vayBvbmx5IHN0YXJ0cyBzZXJ2aW5nIGBkYXZpbmNpLXBsdWdpbmAgb25jZSBpdHMgZmlyc3QgcmVsZWFzZVxuLy8gc2hpcHM6IHVudGlsIHRoZW4gZXZlcnkgbGF1bmNoIHdvdWxkIG90aGVyd2lzZSBmZXRjaCB0aGUgZmFsbGJhY2sgZmlsZSwgd2hpY2hcbi8vIGRvZXMgbm90IGNhcnJ5IGl0IGVpdGhlci5cbmNvbnN0IE9QVElPTkFMX1VSTF9TRVRfS0VZUzogcmVhZG9ubHkgQXV0b0N1dFVybFNldEtleVtdID0gWydkYXZpbmNpUGx1Z2luVXJsJ107XG5cbmV4cG9ydCB0eXBlIEF1dG9DdXRVcmxTZXQgPSB7XG4gIFtrZXkgaW4gQXV0b0N1dFVybFNldEtleV0/OiBzdHJpbmc7XG59O1xuXG5jb25zdCBGQUxMQkFDS19VUkxTX1VSTCA9XG4gICdodHRwczovL2F1dG90dWN0LWZhbGxiYWNrLXVybHMub25yZW5kZXIuY29tL2ZhbGxiYWNrLmpzb24nO1xuXG50eXBlIENvb2tVcmxSZXNwb25zZSA9IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHN0cmluZ1tdPjtcbnR5cGUgQ29va1ZlcnNpb25zUmVzcG9uc2UgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xudHlwZSBDb29rRmV0Y2hSZXN1bHQ8VD4gPSB7XG4gIGRhdGE6IFQ7XG4gIHVzZWREZWZhdWx0Q2hhbm5lbDogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCBjb25zdCBpc0F1dG9DdXRVcmxTZXRDb21wbGV0ZSA9IChcbiAgdXJsU2V0OiBBdXRvQ3V0VXJsU2V0LFxuKTogdXJsU2V0IGlzIEF1dG9DdXRVcmxTZXQgPT4ge1xuICByZXR1cm4gQVVUT19DVVRfVVJMX1NFVF9LRVlTLmV2ZXJ5KFxuICAgIGtleSA9PlxuICAgICAgT1BUSU9OQUxfVVJMX1NFVF9LRVlTLmluY2x1ZGVzKGtleSkgfHxcbiAgICAgIHVybFNldFtrZXkgYXMga2V5b2YgQXV0b0N1dFVybFNldF0gIT09IHVuZGVmaW5lZCxcbiAgKTtcbn07XG5cbmNvbnN0IERFVl9UQVJHRVRTX1BPUlRTID0ge1xuICBmcm9udFVybDogaW1wb3J0Lm1ldGEuZW52LlZJVEVfRlJPTlRfREVWX1BPUlQgfHwgMzAwMCxcbiAgb25ib2FyZGluZ1VybDogaW1wb3J0Lm1ldGEuZW52LlZJVEVfT05CT0FSRElOR19GUk9OVF9ERVZfUE9SVCB8fCA3MjkwLFxuICBjb21wdXRlVXJsOiBpbXBvcnQubWV0YS5lbnYuVklURV9DT01QVVRFX0RFVl9QT1JUIHx8IDkwMDEsXG4gIGhvc3RTZXJ2ZXJVcmw6IGltcG9ydC5tZXRhLmVudi5WSVRFX0hPU1RfU0VSVkVSX0RFVl9QT1JUIHx8IDkwOTAsXG4gIGFwaVVybDogaW1wb3J0Lm1ldGEuZW52LlZJVEVfQVBJX0RFVl9QT1JUIHx8IDgwMDAsXG4gIHVwZGF0ZXJVcmw6IDAsIC8vIE5vIGRldlxuICBwcHJvVXJsOiAwLCAvLyBObyBkZXZcbiAgcHByb0pzeFVybDogMCwgLy8gTm8gZGV2XG4gIGRhdmluY2lQbHVnaW5Vcmw6IDAsIC8vIE5vIGRldlxuICBkYXZpbmNpVXJsOiAwLCAvLyBObyBkZXZcbiAgc3lzdGVtUmVwb3J0VXJsOiAwLCAvLyBObyBkZXZcbn0gYXMgY29uc3Qgc2F0aXNmaWVzIFJlY29yZDxrZXlvZiBBdXRvQ3V0VXJsU2V0LCBudW1iZXI+O1xuXG5leHBvcnQgY29uc3QgZ2V0RW52VXJscyA9IGFzeW5jICgpOiBQcm9taXNlPEF1dG9DdXRVcmxTZXQ+ID0+IHtcbiAgcmV0dXJuIHtcbiAgICBmcm9udFVybDogaW1wb3J0Lm1ldGEuZW52LlZJVEVfRlJPTlRfREVWX1VSTCxcbiAgICBvbmJvYXJkaW5nVXJsOiBpbXBvcnQubWV0YS5lbnYuVklURV9PTkJPQVJESU5HX0ZST05UX0RFVl9VUkwsXG4gICAgY29tcHV0ZVVybDogaW1wb3J0Lm1ldGEuZW52LlZJVEVfQ09NUFVURV9ERVZfVVJMLFxuICAgIGhvc3RTZXJ2ZXJVcmw6IGltcG9ydC5tZXRhLmVudi5WSVRFX0hPU1RfU0VSVkVSX0RFVl9VUkwsXG4gICAgZGF2aW5jaVBsdWdpblVybDogaW1wb3J0Lm1ldGEuZW52LlZJVEVfREFWSU5DSV9QTFVHSU5fREVWX1VSTCxcbiAgICBkYXZpbmNpVXJsOiBpbXBvcnQubWV0YS5lbnYuVklURV9EQVZJTkNJX0RFVl9VUkwsXG4gICAgYXBpVXJsOiBpbXBvcnQubWV0YS5lbnYuVklURV9BUElfVVJMLFxuICB9O1xufTtcblxuY29uc3QgUFJPQkVfVElNRU9VVF9NUyA9IDUwMDtcblxuY29uc3QgcHJvYmVMb2NhbFVybCA9IGFzeW5jICh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gIC8vIEVsZWN0cm9uJ3MgSFRUUCBjYWNoZSBjYW4gb3V0bGl2ZSBhIGRldiBzZXJ2ZXIgYW5kIHJlcG9ydCBpdCBhcyBhdmFpbGFibGUuXG4gIGNvbnN0IHJlcXVlc3RVcmwgPSBuZXcgVVJMKHVybCk7XG4gIHJlcXVlc3RVcmwuc2VhcmNoUGFyYW1zLnNldCgnbm9jYWNoZScsIERhdGUubm93KCkudG9TdHJpbmcoKSk7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHJlcXVlc3RVcmwuaHJlZiwge1xuICAgIGhlYWRlcnM6IHtcbiAgICAgICdDYWNoZS1Db250cm9sJzogJ25vLWNhY2hlLCBuby1zdG9yZSwgbXVzdC1yZXZhbGlkYXRlJyxcbiAgICAgIFByYWdtYTogJ25vLWNhY2hlJyxcbiAgICB9LFxuICAgIHRpbWVvdXQ6IFBST0JFX1RJTUVPVVRfTVMsXG4gIH0pO1xuICBpZiAocmVzcG9uc2Uuc3RhdHVzICE9PSAyMDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5vbi0yMDAgZnJvbSAke3VybH06ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICB9XG4gIHJldHVybiB1cmw7XG59O1xuXG4vKipcbiAqIFByZWZlcnMgbG9jYWxob3N0IHNvIGEgZmFzdGVyIExBTiByZXNwb25zZSBjYW5ub3Qgc2VsZWN0IGFuIG9yaWdpbiBibG9ja2VkIGJ5XG4gKiB0aGUgZnJvbnRlbmQncyBkZXZlbG9wbWVudCBDU1AuIExBTiBhZGRyZXNzZXMgYXJlIHByb2JlZCBjb25jdXJyZW50bHkgb25seVxuICogd2hlbiBsb2NhbGhvc3QgaXMgdW5hdmFpbGFibGUuIGB1bmRlZmluZWRgIG1lYW5zIG5vIGRldiBzZXJ2ZXIgYW5zd2VyZWQuXG4gKi9cbmNvbnN0IGZpbmRMb2NhbFVybEZvclRhcmdldCA9IGFzeW5jIChcbiAgcG9ydDogbnVtYmVyLFxuICBsb2NhbElQczogc3RyaW5nW10sXG4pOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4gPT4ge1xuICBpZiAoIXBvcnQpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgY29uc3QgbG9jYWxob3N0VXJsID0gYXdhaXQgcHJvYmVMb2NhbFVybChgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9YCkuY2F0Y2goXG4gICAgKCkgPT4gdW5kZWZpbmVkLFxuICApO1xuICBpZiAobG9jYWxob3N0VXJsKSByZXR1cm4gbG9jYWxob3N0VXJsO1xuXG4gIGNvbnN0IGZhbGxiYWNrSVBzID0gbG9jYWxJUHMuZmlsdGVyKGlwID0+IGlwICE9PSAnbG9jYWxob3N0Jyk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYW55KFxuICAgICAgZmFsbGJhY2tJUHMubWFwKGlwID0+IHByb2JlTG9jYWxVcmwoYGh0dHA6Ly8ke2lwfToke3BvcnR9YCkpLFxuICAgICk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRMb2NhbFVybHMgPSBhc3luYyAoKTogUHJvbWlzZTxcbiAgT21pdDxBdXRvQ3V0VXJsU2V0LCAnZGF2aW5jaVBsdWdpblVybCcgfCAnZGF2aW5jaVVybCc+XG4+ID0+IHtcbiAgaWYgKElTX1BST0QpIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICBjb25zdCBpbnRlcmZhY2VzID0gbmV0d29ya0ludGVyZmFjZXMoKTtcbiAgY29uc3QgbG9jYWxJUHMgPSBPYmplY3QudmFsdWVzKGludGVyZmFjZXMpXG4gICAgLmZsYXQoKVxuICAgIC5maWx0ZXIoZGV0YWlscyA9PiBkZXRhaWxzPy5mYW1pbHkgPT09ICdJUHY0JyAmJiAhZGV0YWlscy5pbnRlcm5hbClcbiAgICAubWFwKGRldGFpbHMgPT4gZGV0YWlscz8uYWRkcmVzcylcbiAgICAuZmlsdGVyKChhZGRyZXNzKTogYWRkcmVzcyBpcyBzdHJpbmcgPT4gQm9vbGVhbihhZGRyZXNzKSk7XG5cbiAgbG9jYWxJUHMudW5zaGlmdCgnbG9jYWxob3N0Jyk7XG5cbiAgY29uc29sZS5sb2coJ0xvY2FsIElQczonLCBsb2NhbElQcyk7XG5cbiAgY29uc3QgcmVzOiBPbWl0PEF1dG9DdXRVcmxTZXQsICdkYXZpbmNpUGx1Z2luVXJsJyB8ICdkYXZpbmNpVXJsJz4gPSB7fTtcblxuICBjb25zdCB0YXJnZXRFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoREVWX1RBUkdFVFNfUE9SVFMpIGFzIFtcbiAgICBrZXlvZiBPbWl0PEF1dG9DdXRVcmxTZXQsICdkYXZpbmNpUGx1Z2luVXJsJyB8ICdkYXZpbmNpVXJsJz4sXG4gICAgbnVtYmVyLFxuICBdW107XG5cbiAgY29uc3QgcmVzb2x2ZWRUYXJnZXRzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgdGFyZ2V0RW50cmllcy5tYXAoYXN5bmMgKFt0YXJnZXQsIHBvcnRdKSA9PiB7XG4gICAgICBjb25zdCB1cmwgPSBhd2FpdCBmaW5kTG9jYWxVcmxGb3JUYXJnZXQocG9ydCwgbG9jYWxJUHMpO1xuICAgICAgcmV0dXJuIFt0YXJnZXQsIHVybF0gYXMgY29uc3Q7XG4gICAgfSksXG4gICk7XG5cbiAgZm9yIChjb25zdCBbdGFyZ2V0LCB1cmxdIG9mIHJlc29sdmVkVGFyZ2V0cykge1xuICAgIGlmICh1cmwpIHtcbiAgICAgIHJlc1t0YXJnZXRdID0gdXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhgTm8gVVJMIGZvdW5kIGZvciAke3RhcmdldH0uLi4gd2lsbCB1c2Ugc3RhZ2luZ2ApO1xuICAgIH1cbiAgfVxuXG4gIGlmIChJU19TVEFHSU5HICYmIE9iamVjdC5rZXlzKHJlcykuc29tZSh2ID0+ICEhdikpIHtcbiAgICBjb25zdCBhcHBEYXRhUGF0aCA9IGFwcC5nZXRQYXRoKCd0ZW1wJyk7XG4gICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oXG4gICAgICBhcHBEYXRhUGF0aCxcbiAgICAgICdjb20uYXV0b2N1dCcsXG4gICAgICAnYXV0b2N1dC1sb2NhbC1kZXYudHh0JyxcbiAgICApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGlmIChleGlzdHNTeW5jKGZpbGVQYXRoKSkge1xuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBwYXJzZUludChyZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpKTtcbiAgICAgICAgaWYgKHRpbWVzdGFtcCA+IERhdGUubm93KCkpIHtcbiAgICAgICAgICByZXR1cm4gcmVzOyAvL1VzZSBsb2NhbCBuZXR3b3JrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgcmVhZGluZyBsb2NhbCBkZXYgdGltZXN0YW1wOicsIGVycm9yKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGRpYWxvZy5zaG93TWVzc2FnZUJveCh7XG4gICAgICB0eXBlOiAncXVlc3Rpb24nLFxuICAgICAgYnV0dG9uczogWydZZXMnLCAnTm8nLCAnWWVzIGZvciA1IG1pbnV0ZXMnXSxcbiAgICAgIHRpdGxlOiAnTG9jYWwgRGV0ZWN0aW9uJyxcbiAgICAgIG1lc3NhZ2U6IGBMb2NhbCBJUHMgZGV0ZWN0ZWQgZm9yIHByb2plY3RzIDogXFxuJHtPYmplY3Qua2V5cyhyZXMpLmpvaW4oJ1xcbicpfS4gV291bGQgeW91IGxpa2UgdG8gdXNlIGxvY2FsIG5ldHdvcmsgZm9yIGRldmVsb3BtZW50P2AsXG4gICAgfSk7XG5cbiAgICBpZiAocmVzcG9uc2UucmVzcG9uc2UgPT09IDEpIHtcbiAgICAgIC8vIE5vIHdhcyBjbGlja2VkXG4gICAgICByZXR1cm4ge307IC8vRG8gbm90IHVzZSBsb2NhbCBuZXR3b3JrXG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS5yZXNwb25zZSA9PT0gMikge1xuICAgICAgd3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgKERhdGUubm93KCkgKyA1ICogNjAgKiAxMDAwKS50b1N0cmluZygpKTtcbiAgICB9XG4gIH1cblxuICBjb25zb2xlLmxvZygnTG9jYWwgVVJMczonLCByZXMpO1xuXG4gIHJldHVybiByZXM7IC8vVXNlIGxvY2FsIG5ldHdvcmtcbn07XG5cbmNvbnN0IGdldENvb2tDaGFubmVsRmlsZVBhdGggPSAoKTogc3RyaW5nID0+IHtcbiAgcmV0dXJuIHBhdGguam9pbihhcHAuZ2V0UGF0aCgndXNlckRhdGEnKSwgJ2NoYW5uZWwnKTtcbn07XG5cbmNvbnN0IGdldENvb2tDaGFubmVsU2x1ZyA9ICgpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICB0cnkge1xuICAgIGlmICghZXhpc3RzU3luYyhnZXRDb29rQ2hhbm5lbEZpbGVQYXRoKCkpKVxuICAgICAgcmV0dXJuIElTX1BST0QgPyB1bmRlZmluZWQgOiAnc3RnJztcbiAgICBjb25zdCBzbHVnID0gcmVhZEZpbGVTeW5jKGdldENvb2tDaGFubmVsRmlsZVBhdGgoKSwgJ3V0Zi04JykudHJpbSgpO1xuICAgIHJldHVybiBzbHVnIHx8IHVuZGVmaW5lZDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcmVhZCBDb29rIGNoYW5uZWwgZmlsZTonLCBlcnJvcik7XG4gICAgU2VudHJ5LmNhcHR1cmVFeGNlcHRpb24oZXJyb3IpO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn07XG5cbmNvbnN0IGJ1aWxkQ29va1B1YmxpY0NoYW5uZWxQYXRoID0gKFxuICBzbHVnOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIHN1ZmZpeCA9ICcnLFxuKTogc3RyaW5nID0+IHtcbiAgY29uc3QgYmFzZVBhdGggPSBzbHVnXG4gICAgPyBgL3YyL3B1YmxpYy9jaGFubmVscy8ke2VuY29kZVVSSUNvbXBvbmVudChzbHVnKX1gXG4gICAgOiAnL3YyL3B1YmxpYy9jaGFubmVscyc7XG4gIHJldHVybiBgJHtiYXNlUGF0aH0ke3N1ZmZpeH1gO1xufTtcblxuY29uc3QgZ2V0Q29va1JlcXVlc3RIZWFkZXJzID0gKCk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPT4ge1xuICBjb25zdCB2ZXJzaW9uID0gZ2V0RWxlY3Ryb25BcHBWZXJzaW9uKCk7XG4gIHJldHVybiB7XG4gICAgJ1gtRWxlY3Ryb24tQXBwLVZlcnNpb24nOiB2ZXJzaW9uLFxuICAgICdBdXRvQ3V0LVZlcnNpb24nOiB2ZXJzaW9uLFxuICB9O1xufTtcblxuY29uc3QgZmV0Y2hDb29rQ2hhbm5lbERhdGEgPSBhc3luYyA8VD4oXG4gIHVybDogc3RyaW5nLFxuICBhY2NlcHRNaXNzaW5nID0gZmFsc2UsXG4gIHRpbWVvdXQ/OiBudW1iZXIsXG4pID0+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB2ZXJib3NlQXhpb3MuZ2V0PFQ+KHVybCwge1xuICAgIGF1dG9jdXRSZXRyeU1vZGU6ICdleHRlcm5hbCcsXG4gICAgaGVhZGVyczogZ2V0Q29va1JlcXVlc3RIZWFkZXJzKCksXG4gICAgdGltZW91dCxcbiAgICB2YWxpZGF0ZVN0YXR1czogc3RhdHVzID0+XG4gICAgICBzdGF0dXMgPCA0MDAgfHwgc3RhdHVzID09PSA0MDMgfHwgKGFjY2VwdE1pc3NpbmcgJiYgc3RhdHVzID09PSA0MDQpLFxuICB9KTtcblxuICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDMpIHtcbiAgICBhd2FpdCBzaG93U3RhZ2luZ0lwV2hpdGVsaXN0TW9kYWwodXJsKTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZTtcbn07XG5cbmNvbnN0IGZldGNoRGVmYXVsdENvb2tQdWJsaWNDaGFubmVsID0gYXN5bmMgPFQ+KFxuICBjb29rVXJsOiBzdHJpbmcsXG4gIHN1ZmZpeCA9ICcnLFxuKTogUHJvbWlzZTxDb29rRmV0Y2hSZXN1bHQ8VD4+ID0+IHtcbiAgY29uc3QgdXJsID0gbmV3IFVSTChidWlsZENvb2tQdWJsaWNDaGFubmVsUGF0aCh1bmRlZmluZWQsIHN1ZmZpeCksIGNvb2tVcmwpO1xuICBjb25zb2xlLmxvZygnRmV0Y2hpbmcgZGVmYXVsdCBDb29rIGNoYW5uZWwgZnJvbScsIHVybC5ocmVmKTtcblxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoQ29va0NoYW5uZWxEYXRhPFQ+KHVybC5ocmVmKTtcbiAgaWYgKHJlc3BvbnNlLnN0YXR1cyAhPT0gMjAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQIGVycm9yISBzdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICB9XG5cbiAgcmV0dXJuIHtkYXRhOiByZXNwb25zZS5kYXRhLCB1c2VkRGVmYXVsdENoYW5uZWw6IHRydWV9O1xufTtcblxuZXhwb3J0IGNvbnN0IGZldGNoQ29va1B1YmxpY0NoYW5uZWwgPSBhc3luYyA8VD4oXG4gIGNvb2tVcmw6IHN0cmluZyxcbiAgc3VmZml4ID0gJycsXG4pOiBQcm9taXNlPENvb2tGZXRjaFJlc3VsdDxUPj4gPT4ge1xuICBjb25zdCBxYVRhcmdldCA9IGdldFFhVGFyZ2V0KCk7XG4gIGlmIChxYVRhcmdldCkge1xuICAgIGNvbnN0IHFhUGF0aCA9IGJ1aWxkUWFDb29rUHVibGljQ2hhbm5lbFBhdGgocWFUYXJnZXQsIHN1ZmZpeCk7XG4gICAgY29uc3QgcWFVcmwgPSBuZXcgVVJMKHFhUGF0aCwgY29va1VybCk7XG4gICAgY29uc29sZS5sb2coJ0ZldGNoaW5nIFFBIENvb2sgY2hhbm5lbCBmcm9tJywgcWFVcmwuaHJlZik7XG5cbiAgICBjb25zdCBxYVJlc3BvbnNlID0gYXdhaXQgZmV0Y2hDb29rQ2hhbm5lbERhdGE8VD4ocWFVcmwuaHJlZik7XG4gICAgaWYgKHFhUmVzcG9uc2Uuc3RhdHVzICE9PSAyMDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvciEgc3RhdHVzOiAke3FhUmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgIH1cblxuICAgIHJldHVybiB7ZGF0YTogcWFSZXNwb25zZS5kYXRhLCB1c2VkRGVmYXVsdENoYW5uZWw6IGZhbHNlfTtcbiAgfVxuXG4gIGNvbnN0IHNsdWcgPSBnZXRDb29rQ2hhbm5lbFNsdWcoKTtcbiAgY29uc29sZS5sb2coJ0Nvb2sgY2hhbm5lbCBzbHVnOicsIHNsdWcpO1xuICBpZiAoIXNsdWcpIHJldHVybiBmZXRjaERlZmF1bHRDb29rUHVibGljQ2hhbm5lbDxUPihjb29rVXJsLCBzdWZmaXgpO1xuXG4gIGNvbnN0IHVybCA9IG5ldyBVUkwoYnVpbGRDb29rUHVibGljQ2hhbm5lbFBhdGgoc2x1Zywgc3VmZml4KSwgY29va1VybCk7XG4gIGNvbnNvbGUubG9nKCdGZXRjaGluZyBDb29rIGNoYW5uZWwgZnJvbScsIHVybC5ocmVmKTtcblxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoQ29va0NoYW5uZWxEYXRhPFQ+KHVybC5ocmVmLCB0cnVlKTtcblxuICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICBjb25zb2xlLmxvZyhgQ29vayBjaGFubmVsIFwiJHtzbHVnfVwiIG5vdCBmb3VuZCwgdXNpbmcgZGVmYXVsdCBjaGFubmVsYCk7XG4gICAgcmV0dXJuIGZldGNoRGVmYXVsdENvb2tQdWJsaWNDaGFubmVsPFQ+KGNvb2tVcmwsIHN1ZmZpeCk7XG4gIH1cbiAgaWYgKHJlc3BvbnNlLnN0YXR1cyAhPT0gMjAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQIGVycm9yISBzdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICB9XG5cbiAgcmV0dXJuIHtkYXRhOiByZXNwb25zZS5kYXRhLCB1c2VkRGVmYXVsdENoYW5uZWw6IGZhbHNlfTtcbn07XG5cbmNvbnN0IHNlbGVjdENvb2tVcmwgPSBhc3luYyAoXG4gIHVybHM6IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkLFxuKTogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+ID0+IHtcbiAgaWYgKCF1cmxzKSByZXR1cm4gdW5kZWZpbmVkO1xuICByZXR1cm4gc2VsZWN0Rmlyc3RSZXNwb25kaW5nVXJsKEFycmF5LmlzQXJyYXkodXJscykgPyB1cmxzIDogW3VybHNdKTtcbn07XG5cbmNvbnN0IHNlbGVjdENvb2tVcmxTZXQgPSBhc3luYyAoXG4gIGZldGNoZWRDb29rVXJsczogQ29va1VybFJlc3BvbnNlLFxuKTogUHJvbWlzZTxBdXRvQ3V0VXJsU2V0PiA9PiB7XG4gIGNvbnN0IHVybENhbmRpZGF0ZXMgPSBtYXBDb29rUmVzcG9uc2VUb1VybENhbmRpZGF0ZXMoZmV0Y2hlZENvb2tVcmxzKTtcbiAgY29uc3QgZW50cmllcyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgIEFVVE9fQ1VUX1VSTF9TRVRfS0VZUy5tYXAoYXN5bmMga2V5ID0+IHtcbiAgICAgIHJldHVybiBba2V5LCBhd2FpdCBzZWxlY3RDb29rVXJsKHVybENhbmRpZGF0ZXNba2V5XSldIGFzIGNvbnN0O1xuICAgIH0pLFxuICApO1xuXG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgZW50cmllcy5maWx0ZXIoKFssIHVybF0pID0+ICEhdXJsKSxcbiAgKSBhcyBBdXRvQ3V0VXJsU2V0O1xufTtcblxuLyoqXG4gKiBNdXN0IGJlIGNhbGxlZCBhZnRlciB0aGUgYXBwIGlzIHJlYWR5XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRVcmxzRnJvbUNvb2sgPSBhc3luYyAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKCdGZXRjaGluZyBDb29rIFVSTHMuLi4nKTtcbiAgY29uc3QgY29va1VybHM6IEF1dG9DdXRVcmxTZXQgPSB7fTtcbiAgY29uc3QgY29va1VybCA9IGltcG9ydC5tZXRhLmVudi5WSVRFX0NPT0tfVVJMO1xuICB0cnkge1xuICAgIGlmIChjb29rVXJsKSB7XG4gICAgICBjb25zdCB7ZGF0YTogZmV0Y2hlZENvb2tVcmxzLCB1c2VkRGVmYXVsdENoYW5uZWx9ID1cbiAgICAgICAgYXdhaXQgcnVuV2l0aE5ldHdvcmtSZXRyeShcbiAgICAgICAgICAoKSA9PiBmZXRjaENvb2tQdWJsaWNDaGFubmVsPENvb2tVcmxSZXNwb25zZT4oY29va1VybCksXG4gICAgICAgICAge2VuZHBvaW50UHJvYmVVcmw6IGNvb2tVcmwsIGxhYmVsOiAnQ29vayBVUkxzJ30sXG4gICAgICAgICk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgQ29vayBVUkxzICh2MikgZmV0Y2hlZCBmcm9tICR7dXNlZERlZmF1bHRDaGFubmVsID8gJ2RlZmF1bHQnIDogJ2NvbmZpZ3VyZWQnfSBjaGFubmVsLCBzZWxlY3RpbmcgYmVzdCBVUkxzLi4uYCxcbiAgICAgICk7XG5cbiAgICAgIE9iamVjdC5hc3NpZ24oY29va1VybHMsIGF3YWl0IHNlbGVjdENvb2tVcmxTZXQoZmV0Y2hlZENvb2tVcmxzKSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdDb29rIFVSTHMgc2VsZWN0ZWQgc3VjY2Vzc2Z1bGx5OicsIGNvb2tVcmxzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0Nvb2sgVVJMIG5vdCBjb25maWd1cmVkLCBza2lwcGluZyBmZXRjaCcpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZmV0Y2ggQ29vayBVUkxzOicsIGVycm9yKTtcbiAgICBjb25zdCBpc1RyYWNrZWRGYWlsdXJlID0gdHJhY2tTdGFydHVwRmFpbHVyZShlcnJvciwge1xuICAgICAgb3BlcmF0aW9uOiAnY29vay11cmxzJyxcbiAgICAgIHVybDogY29va1VybCxcbiAgICB9KTtcbiAgICBpZiAoIWlzVHJhY2tlZEZhaWx1cmUpIHtcbiAgICAgIFNlbnRyeS5jYXB0dXJlRXhjZXB0aW9uKGVycm9yKTtcbiAgICB9XG4gICAgaWYgKGdldFFhVGFyZ2V0KCkpIHtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb29rVXJscztcbn07XG5cbmV4cG9ydCB0eXBlIFByb2plY3RWZXJzaW9ucyA9IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbmV4cG9ydCBjb25zdCBnZXRWZXJzaW9uc0Zyb21Db29rID0gYXN5bmMgKCk6IFByb21pc2U8UHJvamVjdFZlcnNpb25zPiA9PiB7XG4gIGNvbnN0IHZlcnNpb25zOiBQcm9qZWN0VmVyc2lvbnMgPSB7fTtcbiAgY29uc3QgY29va1VybCA9IGltcG9ydC5tZXRhLmVudi5WSVRFX0NPT0tfVVJMO1xuXG4gIHRyeSB7XG4gICAgaWYgKCFjb29rVXJsKSB7XG4gICAgICBjb25zb2xlLmxvZygnQ29vayBVUkwgbm90IGNvbmZpZ3VyZWQsIHNraXBwaW5nIHZlcnNpb25zIGZldGNoJyk7XG4gICAgICByZXR1cm4gdmVyc2lvbnM7XG4gICAgfVxuXG4gICAgY29uc3Qge2RhdGE6IGZldGNoZWRWZXJzaW9ucywgdXNlZERlZmF1bHRDaGFubmVsfSA9XG4gICAgICBhd2FpdCBydW5XaXRoTmV0d29ya1JldHJ5KFxuICAgICAgICAoKSA9PlxuICAgICAgICAgIGZldGNoQ29va1B1YmxpY0NoYW5uZWw8Q29va1ZlcnNpb25zUmVzcG9uc2U+KGNvb2tVcmwsICcvdmVyc2lvbnMnKSxcbiAgICAgICAge2VuZHBvaW50UHJvYmVVcmw6IGNvb2tVcmwsIGxhYmVsOiAnQ29vayB2ZXJzaW9ucyd9LFxuICAgICAgKTtcblxuICAgIE9iamVjdC5hc3NpZ24odmVyc2lvbnMsIGZldGNoZWRWZXJzaW9ucyk7XG4gICAgY29uc29sZS5sb2coXG4gICAgICBgVmVyc2lvbnMgZmV0Y2hlZCBzdWNjZXNzZnVsbHkgZnJvbSAke3VzZWREZWZhdWx0Q2hhbm5lbCA/ICdkZWZhdWx0JyA6ICdjb25maWd1cmVkJ30gY2hhbm5lbDpgLFxuICAgICAgdmVyc2lvbnMsXG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZmV0Y2ggdmVyc2lvbnMgZnJvbSBDb29rOicsIGVycm9yKTtcbiAgICBjb25zdCBpc1RyYWNrZWRGYWlsdXJlID0gdHJhY2tTdGFydHVwRmFpbHVyZShlcnJvciwge1xuICAgICAgb3BlcmF0aW9uOiAnY29vay12ZXJzaW9ucycsXG4gICAgICB1cmw6IGNvb2tVcmwsXG4gICAgfSk7XG4gICAgaWYgKCFpc1RyYWNrZWRGYWlsdXJlKSB7XG4gICAgICBTZW50cnkuY2FwdHVyZUV4Y2VwdGlvbihlcnJvcik7XG4gICAgfVxuICAgIGlmIChnZXRRYVRhcmdldCgpKSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmVyc2lvbnM7XG59O1xuXG5jb25zdCBmZXRjaEZhbGxiYWNrVXJscyA9IGFzeW5jICgpOiBQcm9taXNlPEF1dG9DdXRVcmxTZXQ+ID0+IHtcbiAgY29uc29sZS5sb2coJ0ZldGNoaW5nIGZhbGxiYWNrIFVSTHMgZnJvbSByZW1vdGUgc291cmNlJyk7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdmVyYm9zZUF4aW9zLmdldChGQUxMQkFDS19VUkxTX1VSTCwge1xuICAgIGF1dG9jdXRSZXRyeU1vZGU6ICdleHRlcm5hbCcsXG4gIH0pO1xuXG4gIGlmIChyZXNwb25zZS5zdGF0dXMgIT09IDIwMCB8fCAhcmVzcG9uc2UuZGF0YSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGZldGNoIGZhbGxiYWNrIFVSTHM6IEludmFsaWQgcmVzcG9uc2UnKTtcbiAgfVxuXG4gIGNvbnN0IGZldGNoZWRVcmxzID0gcmVzcG9uc2UuZGF0YTtcbiAgY29uc3QgZmFsbGJhY2tVcmxzOiBBdXRvQ3V0VXJsU2V0ID0ge1xuICAgIGZyb250VXJsOiBmZXRjaGVkVXJsc1snYXV0b2N1dC1mcm9udCddLFxuICAgIGNvbXB1dGVVcmw6IGZldGNoZWRVcmxzWydhdXRvY3V0LWNvbXB1dGUnXSxcbiAgICBob3N0U2VydmVyVXJsOiBmZXRjaGVkVXJsc1snYXV0b2N1dC1ob3N0LXNlcnZlciddLFxuICAgIGRhdmluY2lQbHVnaW5Vcmw6IGZldGNoZWRVcmxzWydhdXRvY3V0LWRhdmluY2ktcGx1Z2luJ10sXG4gICAgZGF2aW5jaVVybDogZmV0Y2hlZFVybHNbJ2F1dG9jdXQtZGF2aW5jaSddLFxuICAgIG9uYm9hcmRpbmdVcmw6IGZldGNoZWRVcmxzWydhdXRvY3V0LW9uYm9hcmRpbmcnXSxcbiAgICBhcGlVcmw6IGZldGNoZWRVcmxzWydhdXRvY3V0LWFwaSddLFxuICAgIHVwZGF0ZXJVcmw6IGZldGNoZWRVcmxzWydhdXRvY3V0LXVwZGF0ZXInXSxcbiAgICBwcHJvVXJsOiBmZXRjaGVkVXJsc1snYXV0b2N1dC1wcHJvLWRvd25sb2FkJ10sXG4gICAgcHByb0pzeFVybDogSVNfUFJPRFxuICAgICAgPyAnaHR0cHM6Ly9wcHJvLWpzeC5zdGF0aWMuYXV0b2N1dC5jb20vJ1xuICAgICAgOiAnaHR0cHM6Ly9wcHJvLWpzeC5zdGF0aWMuYXV0b3N0Zy5jb20vJyxcbiAgfTtcblxuICBjb25zb2xlLmxvZygnRmFsbGJhY2sgVVJMcyBmZXRjaGVkIHN1Y2Nlc3NmdWxseTonLCBmZXRjaGVkVXJscyk7XG4gIHJldHVybiBmYWxsYmFja1VybHM7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0VXJsc0Zyb21GaWxlID0gYXN5bmMgKCk6IFByb21pc2U8QXV0b0N1dFVybFNldD4gPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGZhbGxiYWNrVXJscyA9IGF3YWl0IHJ1bldpdGhOZXR3b3JrUmV0cnkoZmV0Y2hGYWxsYmFja1VybHMsIHtcbiAgICAgIGxhYmVsOiAnZmFsbGJhY2sgVVJMcycsXG4gICAgfSk7XG4gICAgcmV0dXJuIGZhbGxiYWNrVXJscztcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZmV0Y2ggZmFsbGJhY2sgVVJMczonLCBlcnJvcik7XG4gICAgY29uc3QgaXNUcmFja2VkRmFpbHVyZSA9IHRyYWNrU3RhcnR1cEZhaWx1cmUoZXJyb3IsIHtcbiAgICAgIG9wZXJhdGlvbjogJ2ZhbGxiYWNrLXVybHMnLFxuICAgICAgdXJsOiBGQUxMQkFDS19VUkxTX1VSTCxcbiAgICB9KTtcbiAgICBpZiAoIWlzVHJhY2tlZEZhaWx1cmUpIHtcbiAgICAgIFNlbnRyeS5jYXB0dXJlRXhjZXB0aW9uKGVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xuICB9XG59O1xuXG5leHBvcnQgbGV0IE9SSUdJTl9NQVA6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHtcbiAgJyouYXV0b2N1dC50ZWNoJzogWycqdGVjaC5wcm94eS5hdXRvY3V0LmNvbScsICcqdGVjaC5wcm94eS5hdXRvY3V0LnRlY2gnXSxcbn07XG5leHBvcnQgY29uc3QgZ2V0UHJveHlPcmlnaW5NYXAgPSBhc3luYyAoKTogUHJvbWlzZTxcbiAgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+XG4+ID0+IHtcbiAgY29uc29sZS5sb2coJ1tQcm94eU9yaWdpbk1hcF0gRmV0Y2hpbmcgcHJveHkgb3JpZ2luIG1hcCBmcm9tIE1FUCBNYW5hZ2VyLi4uJyk7XG5cbiAgY29uc3QgZGVmYXVsdE1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0gT1JJR0lOX01BUDtcbiAgY29uc3QgY29va1VybCA9IGltcG9ydC5tZXRhLmVudi5WSVRFX0NPT0tfVVJMO1xuXG4gIHRyeSB7XG4gICAgaWYgKCFjb29rVXJsKSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgJ1tQcm94eU9yaWdpbk1hcF0gQ29vayBVUkwgbm90IGNvbmZpZ3VyZWQsIHVzaW5nIGRlZmF1bHQgbWFwJyxcbiAgICAgICk7XG4gICAgICByZXR1cm4gZGVmYXVsdE1hcDtcbiAgICB9XG5cbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKCcvdjIvcHVibGljL3Byb3h5LW9yaWdpbi1tYXAnLCBjb29rVXJsKTtcbiAgICBjb25zb2xlLmxvZygnW1Byb3h5T3JpZ2luTWFwXSBGZXRjaGluZyBmcm9tJywgdXJsLmhyZWYpO1xuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBydW5XaXRoTmV0d29ya1JldHJ5KFxuICAgICAgKCkgPT5cbiAgICAgICAgZmV0Y2hDb29rQ2hhbm5lbERhdGE8UmVjb3JkPHN0cmluZywgc3RyaW5nW10+Pih1cmwuaHJlZiwgZmFsc2UsIDUwMDApLFxuICAgICAge2VuZHBvaW50UHJvYmVVcmw6IHVybC5ocmVmLCBsYWJlbDogJ3Byb3h5IG9yaWdpbiBtYXAnfSxcbiAgICApO1xuXG4gICAgaWYgKFxuICAgICAgcmVzcG9uc2Uuc3RhdHVzID09PSAyMDAgJiZcbiAgICAgIHJlc3BvbnNlLmRhdGEgJiZcbiAgICAgIHR5cGVvZiByZXNwb25zZS5kYXRhID09PSAnb2JqZWN0J1xuICAgICkge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIGBbUHJveHlPcmlnaW5NYXBdIFN1Y2Nlc3NmdWxseSBmZXRjaGVkOiAke09iamVjdC5rZXlzKHJlc3BvbnNlLmRhdGEpLmxlbmd0aH0gbWFwcGluZ3NgLFxuICAgICAgKTtcbiAgICAgIE9SSUdJTl9NQVAgPSB7Li4uT1JJR0lOX01BUCwgLi4ucmVzcG9uc2UuZGF0YX07XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnW1Byb3h5T3JpZ2luTWFwXSBJbnZhbGlkIHJlc3BvbnNlLCB1c2luZyBkZWZhdWx0IG1hcCcpO1xuICAgIHJldHVybiBkZWZhdWx0TWFwO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAnW1Byb3h5T3JpZ2luTWFwXSBGYWlsZWQgdG8gZmV0Y2gsIHVzaW5nIGRlZmF1bHQgbWFwOicsXG4gICAgICBlcnJvcixcbiAgICApO1xuICAgIGNvbnN0IGlzVHJhY2tlZEZhaWx1cmUgPSB0cmFja1N0YXJ0dXBGYWlsdXJlKGVycm9yLCB7XG4gICAgICBvcGVyYXRpb246ICdwcm94eS1vcmlnaW4tbWFwJyxcbiAgICAgIHVybDogY29va1VybCxcbiAgICB9KTtcbiAgICBpZiAoIWlzVHJhY2tlZEZhaWx1cmUpIHtcbiAgICAgIFNlbnRyeS5jYXB0dXJlRXhjZXB0aW9uKGVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRNYXA7XG4gIH1cbn07XG4iLCJpbXBvcnQge2V4ZWN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCB7cHJvbWlzaWZ5fSBmcm9tICd1dGlsJztcblxuY29uc3QgZXhlY0FzeW5jID0gcHJvbWlzaWZ5KGV4ZWMpO1xuXG4vLyBOb3JtYWxpemVkIGhvc3QgQ1BVIGFyY2ggZXhwb3NlZCB0byB0aGUgcmVuZGVyZXIgdmlhIHNoYXJlZFZhcmlhYmxlcy5BUkNILlxuLy8gV2Ugb25seSBldmVyIHJldHVybiAnYXJtNjQnIG9yICd4NjQnIGJlY2F1c2UgZG93bmxvYWQgbWFwcyAoUHJlbWllcmUgcGx1Z2lucyxcbi8vIGZmbXBlZywgZXRjLikgYXJlIGtleWVkIG9uIHRob3NlIHR3byB2YWx1ZXMuXG5leHBvcnQgdHlwZSBSZXNvbHZlZEFyY2ggPSAnYXJtNjQnIHwgJ3g2NCc7XG5cbmNvbnN0IHdpbmRvd3NQcm9jZXNzb3JBcmNoaXRlY3R1cmVSZWdpc3RyeUtleSA9XG4gICdIS0xNXFxcXFNZU1RFTVxcXFxDdXJyZW50Q29udHJvbFNldFxcXFxDb250cm9sXFxcXFNlc3Npb24gTWFuYWdlclxcXFxFbnZpcm9ubWVudCc7XG5cbmNvbnN0IHBhcnNlV2luZG93c1JlZ2lzdHJ5U3RyaW5nVmFsdWUgPSAoc3Rkb3V0OiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICBmb3IgKGNvbnN0IGxpbmUgb2Ygc3Rkb3V0LnNwbGl0KC9cXHI/XFxuLykpIHtcbiAgICBjb25zdCBtYXRjaCA9IC9cXHMrUkVHKD86X0VYUEFORCk/X1NaXFxzKyguKykkL2kuZXhlYyhsaW5lKTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoWzFdLnRyaW0oKTtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuY29uc3Qgbm9ybWFsaXplV2luZG93c1Byb2Nlc3NvckFyY2hpdGVjdHVyZSA9IChcbiAgdmFsdWU6IHN0cmluZyxcbik6IFJlc29sdmVkQXJjaCB8IHVuZGVmaW5lZCA9PiB7XG4gIGlmICh2YWx1ZSA9PT0gJ0FSTTY0Jykge1xuICAgIHJldHVybiAnYXJtNjQnO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gJ0FNRDY0JyB8fCB2YWx1ZSA9PT0gJ3g4Nl82NCcpIHtcbiAgICByZXR1cm4gJ3g2NCc7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbi8vIE9uIFdpbmRvd3Mtb24tQVJNLCBhbiB4NjQgRWxlY3Ryb24gYnVpbGQgcnVucyB0aHJvdWdoIHRoZSB4VEFKSVQ2NCBlbXVsYXRvcixcbi8vIHNvIG9zLmFyY2goKSByZXBvcnRzIHRoZSBlbXVsYXRlZCBwcm9jZXNzIGFyY2ggKCd4NjQnKSwgbm90IHRoZSBuYXRpdmUgaG9zdFxuLy8gKCdhcm02NCcpLiBQUk9DRVNTT1JfQVJDSElURUNUVVJFIGluIHRoZSBzeXN0ZW0gZW52aXJvbm1lbnQgcmVnaXN0cnkgaG9sZHNcbi8vIHRoZSBtYWNoaW5lJ3MgcmVhbCBDUFUgYXJjaGl0ZWN0dXJlIHJlZ2FyZGxlc3Mgb2YgZW11bGF0aW9uLlxuY29uc3QgcmVzb2x2ZVdpbmRvd3NBcmNoID0gYXN5bmMgKCk6IFByb21pc2U8UmVzb2x2ZWRBcmNoPiA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBleGVjQXN5bmMoXG4gICAgICBgcmVnIHF1ZXJ5IFwiJHt3aW5kb3dzUHJvY2Vzc29yQXJjaGl0ZWN0dXJlUmVnaXN0cnlLZXl9XCIgL3YgUFJPQ0VTU09SX0FSQ0hJVEVDVFVSRWAsXG4gICAgICB7XG4gICAgICAgIHRpbWVvdXQ6IDIwMDAsXG4gICAgICAgIHdpbmRvd3NIaWRlOiB0cnVlLFxuICAgICAgICBtYXhCdWZmZXI6IDEwMjQgKiAxMDI0LFxuICAgICAgfSxcbiAgICApO1xuICAgIGNvbnN0IHJlZ2lzdHJ5VmFsdWUgPSBwYXJzZVdpbmRvd3NSZWdpc3RyeVN0cmluZ1ZhbHVlKHN0ZG91dCk7XG4gICAgaWYgKCFyZWdpc3RyeVZhbHVlKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdbYXJjaF0gUFJPQ0VTU09SX0FSQ0hJVEVDVFVSRSByZWdpc3RyeSBsb29rdXAgcmV0dXJuZWQgbm8gdmFsdWUnLFxuICAgICAgKTtcbiAgICAgIHJldHVybiAneDY0JztcbiAgICB9XG5cbiAgICBjb25zdCBub3JtYWxpemVkQXJjaCA9IG5vcm1hbGl6ZVdpbmRvd3NQcm9jZXNzb3JBcmNoaXRlY3R1cmUocmVnaXN0cnlWYWx1ZSk7XG4gICAgaWYgKCFub3JtYWxpemVkQXJjaCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBgW2FyY2hdIHVuc3VwcG9ydGVkIFBST0NFU1NPUl9BUkNISVRFQ1RVUkUgdmFsdWUgXCIke3JlZ2lzdHJ5VmFsdWV9XCIsIGZhbGxpbmcgYmFjayB0byB4NjRgLFxuICAgICAgKTtcbiAgICAgIHJldHVybiAneDY0JztcbiAgICB9XG5cbiAgICByZXR1cm4gbm9ybWFsaXplZEFyY2g7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS53YXJuKCdbYXJjaF0gUFJPQ0VTU09SX0FSQ0hJVEVDVFVSRSByZWdpc3RyeSBsb29rdXAgZmFpbGVkJywgZXJyb3IpO1xuICAgIHJldHVybiAneDY0JztcbiAgfVxufTtcblxuLy8gT24gQXBwbGUgU2lsaWNvbiwgYW4geDY0IEVsZWN0cm9uIGJ1aWxkIHJ1bnMgdW5kZXIgUm9zZXR0YSwgc28gb3MuYXJjaCgpXG4vLyBzdGlsbCByZXBvcnRzICd4NjQnLiBzeXNjdGwucHJvY190cmFuc2xhdGVkIGlzIDEgd2hlbiB0aGUgY3VycmVudCBwcm9jZXNzXG4vLyBpcyB0cmFuc2xhdGVkIChob3N0IGlzIGFybTY0KSBhbmQgMCBvbiBhIHJlYWwgSW50ZWwgTWFjOyB0aGUga2V5IGlzIGFic2VudFxuLy8gb24gb2xkZXIgSW50ZWwgc3lzdGVtcywgd2hpY2ggd2UgdHJlYXQgYXMgeDY0LlxuY29uc3QgcmVzb2x2ZURhcndpbkFyY2ggPSBhc3luYyAoKTogUHJvbWlzZTxSZXNvbHZlZEFyY2g+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7c3Rkb3V0fSA9IGF3YWl0IGV4ZWNBc3luYygnc3lzY3RsIC1uIHN5c2N0bC5wcm9jX3RyYW5zbGF0ZWQnLCB7XG4gICAgICB0aW1lb3V0OiAyMDAwLFxuICAgICAgbWF4QnVmZmVyOiAxMDI0LFxuICAgIH0pO1xuICAgIGlmIChzdGRvdXQudHJpbSgpID09PSAnMScpIHtcbiAgICAgIHJldHVybiAnYXJtNjQnO1xuICAgIH1cbiAgICByZXR1cm4gJ3g2NCc7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS53YXJuKCdbYXJjaF0gc3lzY3RsLnByb2NfdHJhbnNsYXRlZCBsb29rdXAgZmFpbGVkJywgZXJyb3IpO1xuICAgIHJldHVybiAneDY0JztcbiAgfVxufTtcblxuLy8gb3MuYXJjaCgpIGlzIHRoZSBwcm9jZXNzIGFyY2gsIG5vdCBhbHdheXMgdGhlIGhvc3QgYXJjaC4gUmVzb2x2ZSBvbmNlIGF0XG4vLyBzdGFydHVwIGluIHRoZSBtYWluIHByb2Nlc3MgKHdoZXJlIHN5c2N0bC9yZWcgYXJlIGF2YWlsYWJsZSkgYW5kIGNhY2hlIHRoZVxuLy8gcmVzdWx0IGluIHNoYXJlZFZhcmlhYmxlcyBzbyB0aGUgcHJlbG9hZCBjYW4gcmVhZCBpdCB3aXRob3V0IHJlLXByb2JpbmcuXG5leHBvcnQgY29uc3QgcmVzb2x2ZUFyY2ggPSBhc3luYyAoKTogUHJvbWlzZTxSZXNvbHZlZEFyY2g+ID0+IHtcbiAgY29uc3QgcHJvY2Vzc0FyY2ggPSBvcy5hcmNoKCk7XG4gIGlmIChwcm9jZXNzQXJjaCA9PT0gJ2FybTY0Jykge1xuICAgIHJldHVybiAnYXJtNjQnO1xuICB9XG5cbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBpZiAocGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgcmV0dXJuIHJlc29sdmVEYXJ3aW5BcmNoKCk7XG4gIH1cbiAgaWYgKHBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgcmV0dXJuIHJlc29sdmVXaW5kb3dzQXJjaCgpO1xuICB9XG5cbiAgcmV0dXJuICd4NjQnO1xufTtcbiIsImltcG9ydCB7ZXhlY30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQge2FwcH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHtwcm9taXNlcyBhcyBmc30gZnJvbSAnZnMnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtwcm9taXNpZnl9IGZyb20gJ3V0aWwnO1xuXG5jb25zdCBleGVjQXN5bmMgPSBwcm9taXNpZnkoZXhlYyk7XG5cbmNvbnN0IHdpbmRvd3NNZWRpYUNvcmVQYXRoTmVlZGxlID0gJ1xcXFxjb21tb25cXFxccGx1Zy1pbnNcXFxcNy4wXFxcXG1lZGlhY29yZSc7XG5jb25zdCBtYWNBcHBsaWNhdGlvbnNEaXIgPSAnL0FwcGxpY2F0aW9ucyc7XG5jb25zdCBtYWNQcmVtaWVyZUFwcFByZWZpeCA9ICdBZG9iZSBQcmVtaWVyZSBQcm8nO1xuXG5jb25zdCBleHBhbmRXaW5kb3dzRW52aXJvbm1lbnRWYXJpYWJsZXMgPSAodmFsdWU6IHN0cmluZyk6IG51bGwgfCBzdHJpbmcgPT4ge1xuICBsZXQgbWlzc2luZ0Vudmlyb25tZW50VmFyaWFibGUgPSBmYWxzZTtcbiAgY29uc3QgZXhwYW5kZWRWYWx1ZSA9IHZhbHVlLnJlcGxhY2UoXG4gICAgLyUoW14lXSspJS9nLFxuICAgIChwbGFjZWhvbGRlcjogc3RyaW5nLCBuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IG1hdGNoaW5nRW52aXJvbm1lbnROYW1lID0gT2JqZWN0LmtleXMocHJvY2Vzcy5lbnYpLmZpbmQoXG4gICAgICAgIGVudmlyb25tZW50TmFtZSA9PiBlbnZpcm9ubWVudE5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGVudmlyb25tZW50VmFsdWUgPSBtYXRjaGluZ0Vudmlyb25tZW50TmFtZVxuICAgICAgICA/IHByb2Nlc3MuZW52W21hdGNoaW5nRW52aXJvbm1lbnROYW1lXVxuICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICAgIGlmICh0eXBlb2YgZW52aXJvbm1lbnRWYWx1ZSAhPT0gJ3N0cmluZycgfHwgZW52aXJvbm1lbnRWYWx1ZSA9PT0gJycpIHtcbiAgICAgICAgbWlzc2luZ0Vudmlyb25tZW50VmFyaWFibGUgPSB0cnVlO1xuICAgICAgICByZXR1cm4gcGxhY2Vob2xkZXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gZW52aXJvbm1lbnRWYWx1ZTtcbiAgICB9LFxuICApO1xuXG4gIHJldHVybiBtaXNzaW5nRW52aXJvbm1lbnRWYXJpYWJsZSA/IG51bGwgOiBleHBhbmRlZFZhbHVlO1xufTtcblxuY29uc3QgaXNWYWxpZFdpbmRvd3NQbHVnaW5EaXIgPSAoZm9sZGVyUGF0aDogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250cm9sLXJlZ2V4XG4gIGlmICgvW1xcdTAwMDAtXFx1MDAxZl0vLnRlc3QoZm9sZGVyUGF0aCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBpc0RyaXZlQWJzb2x1dGUgPSAvXlthLXpBLVpdOltcXFxcL10vLnRlc3QoZm9sZGVyUGF0aCk7XG4gIGNvbnN0IGlzVW5jQWJzb2x1dGUgPSAvXlxcXFxcXFxcW15cXFxcL10rXFxcXFteXFxcXC9dKy8udGVzdChmb2xkZXJQYXRoKTtcbiAgaWYgKCFpc0RyaXZlQWJzb2x1dGUgJiYgIWlzVW5jQWJzb2x1dGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBwYXRoV2l0aG91dERyaXZlID0gZm9sZGVyUGF0aC5yZXBsYWNlKC9eW2EtekEtWl06LywgJycpO1xuICByZXR1cm4gIS9bPD46XCJ8PypdLy50ZXN0KHBhdGhXaXRob3V0RHJpdmUpO1xufTtcblxuY29uc3QgaXNQcmVtaWVyZUluc3RhbGxlZE9uTWFjID0gYXN5bmMgKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBmcy5yZWFkZGlyKG1hY0FwcGxpY2F0aW9uc0Rpcik7XG4gICAgcmV0dXJuIGVudHJpZXMuc29tZShlbnRyeSA9PiBlbnRyeS5zdGFydHNXaXRoKG1hY1ByZW1pZXJlQXBwUHJlZml4KSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ1twcmVtaWVyZVBsdWdpbkRpcl0gZmFpbGVkIHRvIHJlYWQgL0FwcGxpY2F0aW9ucyB3aGlsZSBkZXRlY3RpbmcgUHJlbWllcmUgUHJvJyxcbiAgICAgIGVycm9yLFxuICAgICk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgcmVzb2x2ZVByZW1pZXJlUGx1Z2luRGlyID0gYXN5bmMgKCk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKSBhcyAnZGFyd2luJyB8ICd3aW4zMic7XG5cbiAgaWYgKHBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgIGlmICghKGF3YWl0IGlzUHJlbWllcmVJbnN0YWxsZWRPbk1hYygpKSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aC5qb2luKFxuICAgICAgYXBwLmdldFBhdGgoJ2FwcERhdGEnKSxcbiAgICAgICdBZG9iZScsXG4gICAgICAnQ29tbW9uJyxcbiAgICAgICdQbHVnLWlucycsXG4gICAgICAnNy4wJyxcbiAgICAgICdNZWRpYUNvcmUnLFxuICAgICk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHtzdGRvdXR9ID0gYXdhaXQgZXhlY0FzeW5jKFxuICAgICAgJ3JlZyBxdWVyeSBcIkhLTE1cXFxcU09GVFdBUkVcXFxcQWRvYmVcXFxcUHJlbWllcmUgUHJvXFxcXEN1cnJlbnRWZXJzaW9uXCIgL3MgL3YgUGx1Zy1JbnNEaXInLFxuICAgICAge1xuICAgICAgICBtYXhCdWZmZXI6IDEwMjQgKiAxMDI0LFxuICAgICAgICB0aW1lb3V0OiAyMDAwLFxuICAgICAgICB3aW5kb3dzSGlkZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgKTtcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2Ygc3Rkb3V0LnNwbGl0KC9cXHI/XFxuLykpIHtcbiAgICAgIGNvbnN0IG1hdGNoID0gL1xccysoUkVHKD86X0VYUEFORCk/X1NaKVxccysoLispJC9pLmV4ZWMobGluZSk7XG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVnaXN0cnlUeXBlID0gbWF0Y2hbMV07XG4gICAgICBjb25zdCByYXdWYWx1ZSA9IG1hdGNoWzJdO1xuICAgICAgaWYgKHJlZ2lzdHJ5VHlwZSA9PT0gdW5kZWZpbmVkIHx8IHJhd1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRyaW1tZWRWYWx1ZSA9IHJhd1ZhbHVlLnRyaW0oKTtcbiAgICAgIGNvbnN0IGV4cGFuZGVkVmFsdWUgPSAvXlJFR19FWFBBTkRfU1okL2kudGVzdChyZWdpc3RyeVR5cGUpXG4gICAgICAgID8gZXhwYW5kV2luZG93c0Vudmlyb25tZW50VmFyaWFibGVzKHRyaW1tZWRWYWx1ZSlcbiAgICAgICAgOiB0cmltbWVkVmFsdWU7XG4gICAgICBpZiAoZXhwYW5kZWRWYWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgJ1twcmVtaWVyZVBsdWdpbkRpcl0gUGx1Zy1JbnNEaXIgY29udGFpbnMgYW4gdW5hdmFpbGFibGUgZW52aXJvbm1lbnQgdmFyaWFibGUnLFxuICAgICAgICAgIHRyaW1tZWRWYWx1ZSxcbiAgICAgICAgKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRWYWx1ZSA9IHBhdGgud2luMzIubm9ybWFsaXplKGV4cGFuZGVkVmFsdWUpO1xuICAgICAgY29uc3QgaXNNZWRpYUNvcmVQYXRoID0gbm9ybWFsaXplZFZhbHVlXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIC5pbmNsdWRlcyh3aW5kb3dzTWVkaWFDb3JlUGF0aE5lZWRsZSk7XG4gICAgICBpZiAoIWlzTWVkaWFDb3JlUGF0aCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICghaXNWYWxpZFdpbmRvd3NQbHVnaW5EaXIobm9ybWFsaXplZFZhbHVlKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgJ1twcmVtaWVyZVBsdWdpbkRpcl0gcmVnaXN0cnkgcmV0dXJuZWQgYW4gaW52YWxpZCBQbHVnLUluc0RpcicsXG4gICAgICAgICAgbm9ybWFsaXplZFZhbHVlLFxuICAgICAgICApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRWYWx1ZTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ1twcmVtaWVyZVBsdWdpbkRpcl0gUFJFTUlFUkVfUExVR0lOX0RJUiByZWdpc3RyeSBsb29rdXAgZmFpbGVkJyxcbiAgICAgIGVycm9yLFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gJyc7XG59O1xuIiwiaW1wb3J0IHR5cGUge0F1dG9DdXRVcmxTZXR9IGZyb20gJy4vdXJscy5zdGFydC51dGlscyc7XG5cbmNvbnN0IFJFUVVJUkVEX1NUQVJUVVBfVVJMX0tFWVMgPSBbXG4gICdmcm9udFVybCcsXG4gICdvbmJvYXJkaW5nVXJsJyxcbiAgJ2NvbXB1dGVVcmwnLFxuICAnaG9zdFNlcnZlclVybCcsXG4gICdkYXZpbmNpVXJsJyxcbiAgJ2FwaVVybCcsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBDb21wbGV0ZVN0YXJ0dXBVcmxzID0gQXV0b0N1dFVybFNldCAmXG4gIFJlY29yZDwodHlwZW9mIFJFUVVJUkVEX1NUQVJUVVBfVVJMX0tFWVMpW251bWJlcl0sIHN0cmluZz47XG5cbmV4cG9ydCBjbGFzcyBTdGFydHVwVXJsVmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBpbnZhbGlkS2V5czogc3RyaW5nW107XG4gIG1pc3NpbmdLZXlzOiBzdHJpbmdbXTtcblxuICBjb25zdHJ1Y3RvcihtaXNzaW5nS2V5czogc3RyaW5nW10sIGludmFsaWRLZXlzOiBzdHJpbmdbXSkge1xuICAgIGNvbnN0IHByb2JsZW1zID0gW1xuICAgICAgLi4uKG1pc3NpbmdLZXlzLmxlbmd0aCA+IDBcbiAgICAgICAgPyBbYG1pc3Npbmc6ICR7bWlzc2luZ0tleXMuc29ydCgpLmpvaW4oJywgJyl9YF1cbiAgICAgICAgOiBbXSksXG4gICAgICAuLi4oaW52YWxpZEtleXMubGVuZ3RoID4gMFxuICAgICAgICA/IFtgaW52YWxpZDogJHtpbnZhbGlkS2V5cy5zb3J0KCkuam9pbignLCAnKX1gXVxuICAgICAgICA6IFtdKSxcbiAgICBdO1xuICAgIHN1cGVyKGBJbnZhbGlkIHN0YXJ0dXAgVVJMIGNvbmZpZ3VyYXRpb24gKCR7cHJvYmxlbXMuam9pbignOyAnKX0pYCk7XG4gICAgdGhpcy5uYW1lID0gJ1N0YXJ0dXBVcmxWYWxpZGF0aW9uRXJyb3InO1xuICAgIHRoaXMuaW52YWxpZEtleXMgPSBpbnZhbGlkS2V5cztcbiAgICB0aGlzLm1pc3NpbmdLZXlzID0gbWlzc2luZ0tleXM7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGFzc2VydFN0YXJ0dXBVcmxzOiAoXG4gIHVybHM6IEF1dG9DdXRVcmxTZXQsXG4pID0+IGFzc2VydHMgdXJscyBpcyBDb21wbGV0ZVN0YXJ0dXBVcmxzID0gdXJscyA9PiB7XG4gIGNvbnN0IG1pc3NpbmdLZXlzID0gUkVRVUlSRURfU1RBUlRVUF9VUkxfS0VZUy5maWx0ZXIoa2V5ID0+ICF1cmxzW2tleV0pO1xuICBjb25zdCBpbnZhbGlkS2V5cyA9IFJFUVVJUkVEX1NUQVJUVVBfVVJMX0tFWVMuZmlsdGVyKGtleSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSB1cmxzW2tleV07XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuICFbJ2h0dHA6JywgJ2h0dHBzOiddLmluY2x1ZGVzKG5ldyBVUkwodmFsdWUpLnByb3RvY29sKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSk7XG4gIGlmIChtaXNzaW5nS2V5cy5sZW5ndGggPiAwIHx8IGludmFsaWRLZXlzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgU3RhcnR1cFVybFZhbGlkYXRpb25FcnJvcihtaXNzaW5nS2V5cywgaW52YWxpZEtleXMpO1xuICB9XG59O1xuIiwiZXhwb3J0IGNvbnN0IGVuc3VyZVRyYWlsaW5nU2xhc2ggPSAodXJsOiBzdHJpbmcpID0+XG4gIHVybC50cmltKCkucmVwbGFjZSgvXFwvJC8sICcnKSArICcvJztcbiIsImltcG9ydCB0eXBlIHtFeGVjRXhjZXB0aW9uLCBFeGVjRmlsZU9wdGlvbnN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5pbXBvcnQge2V4ZWNGaWxlIGFzIGV4ZWNGaWxlTm9kZX0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IFVURjhfUE9XRVJTSEVMTF9QUkVGSVggPVxuICAnJE91dHB1dEVuY29kaW5nPVtDb25zb2xlXTo6T3V0cHV0RW5jb2Rpbmc9W1RleHQuRW5jb2RpbmddOjpVVEY4Oyc7XG5cbmV4cG9ydCBjb25zdCBleGVjRmlsZSA9IChcbiAgZmlsZTogc3RyaW5nLFxuICBhcmdzOiBzdHJpbmdbXSxcbiAgb3B0aW9ucz86IEV4ZWNGaWxlT3B0aW9ucyxcbik6IFByb21pc2U8e2Vycm9yOiBFeGVjRXhjZXB0aW9uIHwgbnVsbDsgc3RkZXJyOiBzdHJpbmc7IHN0ZG91dDogc3RyaW5nfT4gPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgZXhlY0ZpbGVOb2RlKGZpbGUsIGFyZ3MsIG9wdGlvbnMgPz8ge30sIChlcnIsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgZXJyb3I6IGVyciBhcyBFeGVjRXhjZXB0aW9uIHwgbnVsbCxcbiAgICAgICAgc3RkZXJyOiBzdGRlcnIudG9TdHJpbmcoKSxcbiAgICAgICAgc3Rkb3V0OiBzdGRvdXQudG9TdHJpbmcoKSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3dlcnNoZWxsID0gKFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiB7ZW52PzogTm9kZUpTLlByb2Nlc3NFbnY7IHNraXBVVEY4RW5jb2Rpbmc/OiBib29sZWFufSxcbikgPT4ge1xuICBjb25zdCBmdWxsQ29tbWFuZCA9IG9wdGlvbnM/LnNraXBVVEY4RW5jb2RpbmdcbiAgICA/IGNvbW1hbmRcbiAgICA6IGAke1VURjhfUE9XRVJTSEVMTF9QUkVGSVh9JHtjb21tYW5kfWA7XG4gIHJldHVybiBleGVjRmlsZSgncG93ZXJzaGVsbCcsIFsnLU5vUHJvZmlsZScsICctQ29tbWFuZCcsIGZ1bGxDb21tYW5kXSwge1xuICAgIGVudjogey4uLnByb2Nlc3MuZW52LCAuLi5vcHRpb25zPy5lbnZ9LFxuICB9KTtcbn07XG4iLCJpbXBvcnQge2V4aXN0c1N5bmMsIG1rZGlyU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCB7ZGlybmFtZSwgam9pbiwgcGFyc2V9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2V4ZWNGaWxlfSBmcm9tICcuL2NoaWxkUHJvY2Vzcy51dGlscyc7XG5cbmNvbnN0IGlzQXNjaWkgPSAoc3RyOiBzdHJpbmcpID0+IHtcbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0ci5jaGFyQ29kZUF0KGkpID4gMTI3KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuLyogVXNpbmcgdGhpczogaHR0cHM6Ly9sZWFybi5taWNyb3NvZnQuY29tL2VuLXVzL3dpbmRvd3Mvd2luMzIvYXBpL0ZpbGVBUEkvbmYtZmlsZWFwaS1nZXRzaG9ydHBhdGhuYW1ldyAqL1xuZXhwb3J0IGNvbnN0IHNob3J0aWZ5UGF0aCA9IGFzeW5jIChcbiAgcGF0aDogc3RyaW5nLFxuICBvcHRpb25zPzoge2NyZWF0ZUZvbGRlcj86IGJvb2xlYW59LFxuKSA9PiB7XG4gIGlmIChvcy5wbGF0Zm9ybSgpICE9PSAnd2luMzInKSByZXR1cm4gcGF0aDtcblxuICBjb25zdCB7YmFzZSwgZXh0fSA9IHBhcnNlKHBhdGgpO1xuXG4gIGNvbnN0IGlzRm9sZGVyID0gZXh0ID09PSAnJztcbiAgY29uc3QgZGlyID0gaXNGb2xkZXIgPyBwYXRoIDogZGlybmFtZShwYXRoKTtcblxuICBpZiAoIWlzRm9sZGVyICYmICFpc0FzY2lpKGJhc2UpKVxuICAgIHRocm93IG5ldyBFcnJvcignTm9uLUFTQ0lJIGNoYXJhY3RlcnMgaW4gZmlsZSBuYW1lJyk7XG5cbiAgY29uc3Qgc2hvdWxkQ3JlYXRlRm9sZGVyID0gb3B0aW9ucz8uY3JlYXRlRm9sZGVyICE9PSBmYWxzZTsgLy8gRGVmYXVsdCB0byB0cnVlXG5cbiAgaWYgKCFleGlzdHNTeW5jKGRpcikgJiYgaXNGb2xkZXIgJiYgc2hvdWxkQ3JlYXRlRm9sZGVyKSB7XG4gICAgbWtkaXJTeW5jKGRpciwge3JlY3Vyc2l2ZTogdHJ1ZX0pO1xuICB9XG5cbiAgLy8gS2VlcCB0aGUgcGF0aCBpbiB0aGUgZW52aXJvbm1lbnQgc28gQ01EIG5ldmVyIHBhcnNlcyBpdHMgc3BlY2lhbCBjaGFyYWN0ZXJzLlxuICAvLyBDTUQncyBpbnRlcm5hbCBlY2hvIG11c3QgdXNlIFVuaWNvZGUgb3V0cHV0OiBjb25zb2xlIGNvZGUgcGFnZXMgY2FuIG90aGVyd2lzZVxuICAvLyBjb3JydXB0IG5vbi1BU0NJSSBwcm9maWxlIG5hbWVzIHdoZW4gdGhlIHN1YnByb2Nlc3Mgb3V0cHV0IGlzIGRlY29kZWQuXG4gIGNvbnN0IGNtZEFyZ3MgPSBbXG4gICAgJy9kJyxcbiAgICAnL3UnLFxuICAgICcvZTpvbicsXG4gICAgJy92Om9mZicsXG4gICAgJy9jJyxcbiAgICAnZm9yICVBIGluIChcIiVBQ19ESVIlXCIpIGRvIEBlY2hvICV+c0EnLFxuICBdO1xuXG4gIGNvbnN0IHtlcnJvciwgc3RkZXJyLCBzdGRvdXR9ID0gYXdhaXQgZXhlY0ZpbGUoJ2NtZCcsIGNtZEFyZ3MsIHtcbiAgICBlbmNvZGluZzogJ3V0ZjE2bGUnLFxuICAgIGVudjogey4uLnByb2Nlc3MuZW52LCBBQ19ESVI6IGRpcn0sXG4gICAgd2luZG93c1ZlcmJhdGltQXJndW1lbnRzOiB0cnVlLFxuICB9KTtcblxuICBpZiAoZXJyb3IgIT09IG51bGwpIHtcbiAgICBjb25zb2xlLmVycm9yKGA+Y21kICR7Y21kQXJncy5qb2luKCcgJyl9PCBmYWlsZWQ6ICR7c3RkZXJyfWApO1xuICAgIHRocm93IG5ldyBFcnJvcihzdGRlcnIgfHwgZXJyb3IubWVzc2FnZSk7XG4gIH1cblxuICBjb25zdCBzaG9ydFBhdGggPSBzdGRvdXQudHJpbSgpO1xuICBpZiAoIXNob3J0UGF0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ01EIHJldHVybmVkIGFuIGVtcHR5IHNob3J0IHBhdGggZm9yICR7ZGlyfWApO1xuICB9XG5cbiAgcmV0dXJuICFpc0ZvbGRlciA/IGpvaW4oc2hvcnRQYXRoLCBiYXNlKSA6IHNob3J0UGF0aDtcbn07XG4iLCJpbXBvcnQge0lTX0RFViwgSVNfU1RBR0lOR30gZnJvbSAnQC9lbnYnO1xuaW1wb3J0IHtcbiAgQXV0b0N1dFVybFNldCxcbiAgZ2V0RW52VXJscyxcbiAgZ2V0TG9jYWxVcmxzLFxuICBnZXRVcmxzRnJvbUNvb2ssXG4gIGdldFVybHNGcm9tRmlsZSxcbiAgZ2V0VmVyc2lvbnNGcm9tQ29vayxcbiAgZ2V0UHJveHlPcmlnaW5NYXAsXG4gIGlzQXV0b0N1dFVybFNldENvbXBsZXRlLFxufSBmcm9tICdAL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3VybHMuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHtyZXNvbHZlQXJjaH0gZnJvbSAnQC91dGlscy9zdGFydEZ1bmN0aW9ucy9hcmNoLnN0YXJ0LnV0aWxzJztcbmltcG9ydCB7cmVzb2x2ZVByZW1pZXJlUGx1Z2luRGlyfSBmcm9tICdAL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3ByZW1pZXJlUGx1Z2luRGlyLnN0YXJ0LnV0aWxzJztcbmltcG9ydCB7XG4gIGFzc2VydFN0YXJ0dXBVcmxzLFxuICBTdGFydHVwVXJsVmFsaWRhdGlvbkVycm9yLFxufSBmcm9tICdAL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3NoYXJlZFZhcmlhYmxlc0Fzc2VydC5zdGFydC51dGlscyc7XG5pbXBvcnQge1xuICBjbGVhclN0YXJ0dXBGYWlsdXJlcyxcbiAgcmVwb3J0U3RhcnR1cEZhaWx1cmVzLFxufSBmcm9tICdAL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3N0YXJ0dXBOZXR3b3JrTW9uaXRvci5zdGFydC51dGlscyc7XG5pbXBvcnQge2Vuc3VyZVRyYWlsaW5nU2xhc2h9IGZyb20gJ0AvdXRpbHMvdXJsRm9ybWF0LnV0aWxzJztcbmltcG9ydCB7YXBwfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuXG5pbXBvcnQge2dldFFhVGFyZ2V0fSBmcm9tICcuLi8uLi9xYS9xYVRhcmdldCc7XG5pbXBvcnQge3Nob3J0aWZ5UGF0aH0gZnJvbSAnLi4vcGF0aC51dGlscyc7XG5cbmV4cG9ydCBsZXQgc2hhcmVkVmFyaWFibGVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWQ+IHwgdW5kZWZpbmVkO1xuXG5leHBvcnQgY29uc3QgaW5pdFNoYXJlZFZhcmlhYmxlcyA9IGFzeW5jICgpID0+IHtcbiAgY29uc3QgcWFUYXJnZXQgPSBnZXRRYVRhcmdldCgpO1xuXG4gIC8vIEEgUUEgdGFyZ2V0IG92ZXJyaWRlcyBldmVyeSByZXNvbHZlZCBVUkwgYmVsb3csIHNvIHRoZSBsb2NhbC1kZXYgcHJvYmUgaXNcbiAgLy8gcG9pbnRsZXNzIGluIHRoYXQgbW9kZToga2VlcCBpdCBvdXQgb2YgdGhlIGNvbmN1cnJlbnQgYmF0Y2ggZW50aXJlbHkuXG4gIGNvbnN0IGxvY2FsVXJsc1Byb21pc2U6IFByb21pc2U8XG4gICAgT21pdDxBdXRvQ3V0VXJsU2V0LCAnZGF2aW5jaVBsdWdpblVybCcgfCAnZGF2aW5jaVVybCc+XG4gID4gPSBxYVRhcmdldFxuICAgID8gUHJvbWlzZS5yZXNvbHZlKHt9KVxuICAgIDogZ2V0TG9jYWxVcmxzKCk7XG5cbiAgLyoqXG4gICAqIGBnZXRQcm94eU9yaWdpbk1hcCgpYCBwb3B1bGF0ZXMgdGhlIG1vZHVsZS1sZXZlbCBPUklHSU5fTUFQIHRoYXQgdGhlIGF4aW9zXG4gICAqIHByb3h5LWZhbGxiYWNrIGludGVyY2VwdG9yIHJlYWRzLCBzbyB0aGUgQ29vayBmZXRjaGVzIG11c3Qgc3RhcnQgYWZ0ZXIgaXRcbiAgICogcmVzb2x2ZXMgb3IgdGhlaXIgZmlyc3QgYXR0ZW1wdCBsb3NlcyBpdHMgcHJveHkgZmFsbGJhY2suIEV2ZXJ5dGhpbmcgd2l0aCBub1xuICAgKiBzdWNoIGRlcGVuZGVuY3kgc3RhcnRzIHJpZ2h0IGF3YXksIHNvIHdhbGwtY2xvY2sgc3RheXMgbWF4KGJyYW5jaCkgaW5zdGVhZFxuICAgKiBvZiB0aGUgc3VtIG9mIGV2ZXJ5IGZldGNoLiBUaGUgZGVwZW5kZW50IHRhaWwgKGZhbGxiYWNrVXJscyAtPiBjb29rVXJscyxcbiAgICogc2hvcnRpZnlQYXRoIC0+IHBsdWdpbiBkaXIpIHN0YXlzIGNoYWluZWQgYmVsb3cuXG4gICAqL1xuICBjb25zdCBwcm94eU9yaWdpbk1hcFByb21pc2UgPSBnZXRQcm94eU9yaWdpbk1hcCgpO1xuICBjb25zdCBbXG4gICAgcHJveHlPcmlnaW5NYXAsXG4gICAgbG9jYWxVcmxzLFxuICAgIGNvb2tVcmxzLFxuICAgIHByb2plY3RWZXJzaW9ucyxcbiAgICBwcmVtaWVyZVBsdWdpbkRpclJhdyxcbiAgICBhcmNoLFxuICBdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgIHByb3h5T3JpZ2luTWFwUHJvbWlzZSxcbiAgICBsb2NhbFVybHNQcm9taXNlLFxuICAgIHByb3h5T3JpZ2luTWFwUHJvbWlzZS50aGVuKCgpID0+IGdldFVybHNGcm9tQ29vaygpKSxcbiAgICBwcm94eU9yaWdpbk1hcFByb21pc2UudGhlbigoKSA9PiBnZXRWZXJzaW9uc0Zyb21Db29rKCkpLFxuICAgIHJlc29sdmVQcmVtaWVyZVBsdWdpbkRpcigpLFxuICAgIHJlc29sdmVBcmNoKCksXG4gIF0pO1xuXG4gIGNvbnN0IGVudlVybHMgPSBhd2FpdCBnZXRFbnZVcmxzKCk7XG4gIGNvbnNvbGUubG9nKCdFbnYgVVJMczonLCBlbnZVcmxzKTtcbiAgY29uc29sZS5sb2coJ0xvY2FsIFVSTHM6JywgbG9jYWxVcmxzKTtcblxuICAvKipcbiAgICogRmV0Y2ggQ29vayBVUkxzIG9ubHkgaWYgY29vayB1cmxzIGFyZSBub3QgY29tcGxldGVcbiAgICovXG4gIGNvbnN0IGZhbGxiYWNrVXJsczogQXV0b0N1dFVybFNldCA9XG4gICAgcWFUYXJnZXQgfHwgaXNBdXRvQ3V0VXJsU2V0Q29tcGxldGUoY29va1VybHMpXG4gICAgICA/IHt9XG4gICAgICA6IGF3YWl0IGdldFVybHNGcm9tRmlsZSgpO1xuXG4gIGNvbnNvbGUubG9nKCdmYWxsYmFja1VybHMnLCBmYWxsYmFja1VybHMpO1xuXG4gIGNvbnN0IG9yZGluYXJ5UmVzb2x2ZWRVcmxzOiBBdXRvQ3V0VXJsU2V0ID0ge1xuICAgIGZyb250VXJsOlxuICAgICAgbG9jYWxVcmxzLmZyb250VXJsIHx8XG4gICAgICBlbnZVcmxzLmZyb250VXJsIHx8XG4gICAgICBjb29rVXJscy5mcm9udFVybCB8fFxuICAgICAgZmFsbGJhY2tVcmxzLmZyb250VXJsLFxuICAgIG9uYm9hcmRpbmdVcmw6XG4gICAgICBsb2NhbFVybHMub25ib2FyZGluZ1VybCB8fFxuICAgICAgZW52VXJscy5vbmJvYXJkaW5nVXJsIHx8XG4gICAgICBjb29rVXJscy5vbmJvYXJkaW5nVXJsIHx8XG4gICAgICBmYWxsYmFja1VybHMub25ib2FyZGluZ1VybCxcbiAgICBjb21wdXRlVXJsOlxuICAgICAgbG9jYWxVcmxzLmNvbXB1dGVVcmwgfHxcbiAgICAgIGVudlVybHMuY29tcHV0ZVVybCB8fFxuICAgICAgY29va1VybHMuY29tcHV0ZVVybCB8fFxuICAgICAgZmFsbGJhY2tVcmxzLmNvbXB1dGVVcmwsXG4gICAgaG9zdFNlcnZlclVybDpcbiAgICAgIGxvY2FsVXJscy5ob3N0U2VydmVyVXJsIHx8XG4gICAgICBlbnZVcmxzLmhvc3RTZXJ2ZXJVcmwgfHxcbiAgICAgIGNvb2tVcmxzLmhvc3RTZXJ2ZXJVcmwgfHxcbiAgICAgIGZhbGxiYWNrVXJscy5ob3N0U2VydmVyVXJsLFxuICAgIC8vIE9wdGlvbmFsOiBlbXB0eSB1bnRpbCB0aGUgYGRhdmluY2ktcGx1Z2luYCBwcm9qZWN0IGhhcyBpdHMgZmlyc3QgcmVsZWFzZVxuICAgIC8vIGFuZCBDb29rIHN0YXJ0cyBzZXJ2aW5nIGl0LiBUaGUgcmVzb3VyY2UgdHJlYXRzIGFuIGVtcHR5IFVSTCBhcyBcIm5vdGhpbmdcbiAgICAvLyB0byBpbnN0YWxsXCIgcmF0aGVyIHRoYW4gZmFpbGluZyB0aGUgbGF1bmNoLlxuICAgIGRhdmluY2lQbHVnaW5Vcmw6XG4gICAgICBlbnZVcmxzLmRhdmluY2lQbHVnaW5VcmwgfHxcbiAgICAgIGNvb2tVcmxzLmRhdmluY2lQbHVnaW5VcmwgfHxcbiAgICAgIGZhbGxiYWNrVXJscy5kYXZpbmNpUGx1Z2luVXJsIHx8XG4gICAgICAnJyxcbiAgICBkYXZpbmNpVXJsOlxuICAgICAgZW52VXJscy5kYXZpbmNpVXJsIHx8IGNvb2tVcmxzLmRhdmluY2lVcmwgfHwgZmFsbGJhY2tVcmxzLmRhdmluY2lVcmwsXG4gICAgYXBpVXJsOlxuICAgICAgbG9jYWxVcmxzLmFwaVVybCB8fFxuICAgICAgZW52VXJscy5hcGlVcmwgfHxcbiAgICAgIGNvb2tVcmxzLmFwaVVybCB8fFxuICAgICAgZmFsbGJhY2tVcmxzLmFwaVVybCxcbiAgICB1cGRhdGVyVXJsOlxuICAgICAgZW52VXJscy51cGRhdGVyVXJsIHx8XG4gICAgICBjb29rVXJscy51cGRhdGVyVXJsIHx8XG4gICAgICBmYWxsYmFja1VybHMudXBkYXRlclVybCB8fFxuICAgICAgJycsXG4gICAgcHByb1VybDogZW52VXJscy5wcHJvVXJsIHx8IGNvb2tVcmxzLnBwcm9VcmwgfHwgZmFsbGJhY2tVcmxzLnBwcm9VcmwgfHwgJycsXG4gICAgcHByb0pzeFVybDogY29va1VybHMucHByb0pzeFVybCB8fCBmYWxsYmFja1VybHMucHByb0pzeFVybCB8fCAnJyxcbiAgfTtcbiAgY29uc3QgcmVzb2x2ZWRVcmxzOiBBdXRvQ3V0VXJsU2V0ID0gcWFUYXJnZXRcbiAgICA/IHsuLi5jb29rVXJsc31cbiAgICA6IG9yZGluYXJ5UmVzb2x2ZWRVcmxzO1xuICB0cnkge1xuICAgIGFzc2VydFN0YXJ0dXBVcmxzKHJlc29sdmVkVXJscyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgU3RhcnR1cFVybFZhbGlkYXRpb25FcnJvcikge1xuICAgICAgcmVwb3J0U3RhcnR1cEZhaWx1cmVzKGVycm9yKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbiAgY2xlYXJTdGFydHVwRmFpbHVyZXMoKTtcblxuICBjb25zdCBwcmVtaWVyZVBsdWdpbkRpciA9XG4gICAgcHJlbWllcmVQbHVnaW5EaXJSYXcgPT09ICcnXG4gICAgICA/ICcnXG4gICAgICA6IGF3YWl0IHNob3J0aWZ5UGF0aChwcmVtaWVyZVBsdWdpbkRpclJhdywge2NyZWF0ZUZvbGRlcjogZmFsc2V9KTtcblxuICAvL0lmIHlvdSBhZGQgYSBuZXcgc2hhcmVkIHZhcmlhYmxlLCB5b3UgbXVzdCBhbHNvIGFkZCBpdCB0byB0aGUgcHJlbG9hZC9lbGVjdHJvbi50cyBmaWxlXG4gIHNoYXJlZFZhcmlhYmxlcyA9IHtcbiAgICBWRVJTSU9OOiBpbXBvcnQubWV0YS5lbnYuVklURV9WRVJTSU9OLFxuXG4gICAgRlJPTlRfVVJMOiBlbnN1cmVUcmFpbGluZ1NsYXNoKHJlc29sdmVkVXJscy5mcm9udFVybCksXG4gICAgT05CT0FSRElOR19VUkw6IGVuc3VyZVRyYWlsaW5nU2xhc2gocmVzb2x2ZWRVcmxzLm9uYm9hcmRpbmdVcmwpLFxuICAgIENPTVBVVEVfVVJMOiBlbnN1cmVUcmFpbGluZ1NsYXNoKHJlc29sdmVkVXJscy5jb21wdXRlVXJsKSxcbiAgICBIT1NUX1NFUlZFUl9VUkw6IGVuc3VyZVRyYWlsaW5nU2xhc2gocmVzb2x2ZWRVcmxzLmhvc3RTZXJ2ZXJVcmwpLFxuICAgIERBVklOQ0lfRE9XTkxPQURfVVJMOiBlbnN1cmVUcmFpbGluZ1NsYXNoKHJlc29sdmVkVXJscy5kYXZpbmNpVXJsKSxcbiAgICAvLyBOb3QgYGVuc3VyZVRyYWlsaW5nU2xhc2goJycpYDogdGhhdCByZXR1cm5zICcvJywgd2hpY2ggaXMgdHJ1dGh5IGFuZFxuICAgIC8vIHdoaWNoIGBwYXRoLmpvaW5VcmxgIHRoZW4gZmVlZHMgdG8gYG5ldyBVUkwoJy8nKWAsIHRocm93aW5nLiBBbiBhYnNlbnRcbiAgICAvLyBvcHRpb25hbCBVUkwgaGFzIHRvIHN0YXkgYWJzZW50LlxuICAgIERBVklOQ0lfUExVR0lOX0RPV05MT0FEX1VSTDogcmVzb2x2ZWRVcmxzLmRhdmluY2lQbHVnaW5VcmxcbiAgICAgID8gZW5zdXJlVHJhaWxpbmdTbGFzaChyZXNvbHZlZFVybHMuZGF2aW5jaVBsdWdpblVybClcbiAgICAgIDogJycsXG4gICAgVVBEQVRFUl9VUkw6IGVuc3VyZVRyYWlsaW5nU2xhc2gocmVzb2x2ZWRVcmxzLnVwZGF0ZXJVcmwgfHwgJycpLFxuICAgIFBQUk9fRE9XTkxPQURfVVJMOiBlbnN1cmVUcmFpbGluZ1NsYXNoKHJlc29sdmVkVXJscy5wcHJvVXJsIHx8ICcnKSxcbiAgICBQUFJPX0pTWF9ET1dOTE9BRF9VUkw6IHJlc29sdmVkVXJscy5wcHJvSnN4VXJsXG4gICAgICA/IGVuc3VyZVRyYWlsaW5nU2xhc2gocmVzb2x2ZWRVcmxzLnBwcm9Kc3hVcmwpXG4gICAgICA6ICcnLFxuICAgIEFQSV9VUkw6IGVuc3VyZVRyYWlsaW5nU2xhc2gocmVzb2x2ZWRVcmxzLmFwaVVybCksXG5cbiAgICBXRUJTSVRFX1VSTDogZW5zdXJlVHJhaWxpbmdTbGFzaChpbXBvcnQubWV0YS5lbnYuVklURV9XRUJTSVRFX1VSTCB8fCAnJyksXG4gICAgV0VCQVBQX1VSTDogZW5zdXJlVHJhaWxpbmdTbGFzaChpbXBvcnQubWV0YS5lbnYuVklURV9XRUJBUFBfVVJMIHx8ICcnKSxcblxuICAgIFJFU09VUkNFU19QQVRIOiBhd2FpdCBzaG9ydGlmeVBhdGgoYXBwLmdldFBhdGgoJ3VzZXJEYXRhJykpLFxuICAgIEhPTUVfRElSX1BBVEg6IGF3YWl0IHNob3J0aWZ5UGF0aChvcy5ob21lZGlyKCkpLFxuICAgIFBSRU1JRVJFX1BMVUdJTl9ESVI6IHByZW1pZXJlUGx1Z2luRGlyLFxuICAgIEFSQ0g6IGFyY2gsXG4gICAgVEVNUF9GT0xERVJfUEFUSDogJycsXG4gICAgTE9HX0ZJTEVfUEFUSDogJycsXG4gICAgUFJPWFlfT1JJR0lOX01BUDogSlNPTi5zdHJpbmdpZnkocHJveHlPcmlnaW5NYXApLFxuICAgIFBST0pFQ1RfVkVSU0lPTlM6IEpTT04uc3RyaW5naWZ5KHByb2plY3RWZXJzaW9ucyksXG4gIH07XG5cbiAgY29uc29sZS5sb2coYFxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuUlVOTklORyBJTiAke0lTX0RFViA/ICcgIERFViAgJyA6IElTX1NUQUdJTkcgPyAnU1RBR0lORycgOiAnICBQUk9EICAnfVxuXG4ke0pTT04uc3RyaW5naWZ5KHNoYXJlZFZhcmlhYmxlcywgbnVsbCwgMil9XG5cbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5gKTtcbn07XG4iLCJpbXBvcnQge2FwcH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHtleGlzdHNTeW5jLCB1bmxpbmtTeW5jLCB3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuXG5jb25zdCBnZXRTdGFydGluZ0ZpbGVQYXRoID0gKCkgPT4ge1xuICByZXR1cm4gam9pbihhcHAuZ2V0UGF0aCgndXNlckRhdGEnKSwgJ3N0YXJ0aW5nJyk7XG59O1xuXG5leHBvcnQgY29uc3QgY2hlY2tTdGFydGluZ0ZpbGVFeGlzdHMgPSAoKTogYm9vbGVhbiA9PiB7XG4gIGNvbnNvbGUubG9nKCdDaGVja2luZyBzdGFydGluZyBmaWxlIGV4aXN0cycsIGdldFN0YXJ0aW5nRmlsZVBhdGgoKSk7XG4gIHJldHVybiBleGlzdHNTeW5jKGdldFN0YXJ0aW5nRmlsZVBhdGgoKSk7XG59O1xuXG5leHBvcnQgY29uc3QgY3JlYXRlU3RhcnRpbmdGaWxlID0gKCk6IHZvaWQgPT4ge1xuICBjb25zdCBmaWxlUGF0aCA9IGdldFN0YXJ0aW5nRmlsZVBhdGgoKTtcbiAgd3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgJycpO1xufTtcblxuZXhwb3J0IGNvbnN0IHJlbW92ZVN0YXJ0aW5nRmlsZSA9ICgpOiB2b2lkID0+IHtcbiAgY29uc3QgZmlsZVBhdGggPSBnZXRTdGFydGluZ0ZpbGVQYXRoKCk7XG4gIGlmIChleGlzdHNTeW5jKGZpbGVQYXRoKSkge1xuICAgIHVubGlua1N5bmMoZmlsZVBhdGgpO1xuICB9XG59O1xuIiwiZXhwb3J0IGNvbnN0IFFBX01PREVfVE9HR0xFX0FSR1VNRU5UID0gJy0tdG9nZ2xlLXFhLW1vZGUnO1xuXG5leHBvcnQgY29uc3QgUUFfU1RBVFVTRVMgPSBbJ2ZhaWwnLCAnaW5fcHJvZ3Jlc3MnLCAnc3VjY2VzcyddIGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBRYUxpc3RJdGVtID0ge1xuICBudW1iZXI6IG51bWJlcjtcbiAgc3RhdHVzOiBRYVN0YXR1cztcbiAgdGl0bGU6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFFhU3RhdHVzID0gKHR5cGVvZiBRQV9TVEFUVVNFUylbbnVtYmVyXSB8ICd1bmF2YWlsYWJsZSc7XG5cbmNvbnN0IFFBX1NUQVRVU19TRVQgPSBuZXcgU2V0PHN0cmluZz4oUUFfU1RBVFVTRVMpO1xuXG5leHBvcnQgY29uc3QgY29udGFpbnNRYU1vZGVUb2dnbGVBcmd1bWVudCA9IChcbiAgYXJndjogcmVhZG9ubHkgc3RyaW5nW10sXG4pOiBib29sZWFuID0+IGFyZ3Yuc29tZShhcmd1bWVudCA9PiBhcmd1bWVudCA9PT0gUUFfTU9ERV9UT0dHTEVfQVJHVU1FTlQpO1xuXG5leHBvcnQgY29uc3QgZ2V0UWFUb2dnbGVSZWxhdW5jaEFyZ3VtZW50cyA9IChcbiAgYXJndjogcmVhZG9ubHkgc3RyaW5nW10sXG4pOiBzdHJpbmdbXSA9PlxuICBhcmd2LnNsaWNlKDEpLmZpbHRlcihhcmd1bWVudCA9PiBhcmd1bWVudCAhPT0gUUFfTU9ERV9UT0dHTEVfQVJHVU1FTlQpO1xuXG5leHBvcnQgY29uc3QgaXNQYWNrYWdlZFN0YWdpbmdJZGVudGl0eSA9IChcbiAgaXNQYWNrYWdlZDogYm9vbGVhbixcbiAgaXNTdGFnaW5nOiBib29sZWFuLFxuKTogYm9vbGVhbiA9PiBpc1BhY2thZ2VkICYmIGlzU3RhZ2luZztcblxudHlwZSBRYVN0YXJ0dXBBY3Rpb24gPSAnb3JkaW5hcnknIHwgJ3NlbGVjdG9yJyB8ICd0b2dnbGUnO1xuXG50eXBlIFFhU3RhcnR1cEFjdGlvbklucHV0ID0ge1xuICBkZWVwTGlua1BhdGg/OiBzdHJpbmc7XG4gIGhhc1RvZ2dsZUFyZ3VtZW50OiBib29sZWFuO1xuICBpc1BhY2thZ2VkOiBib29sZWFuO1xuICBpc1N0YWdpbmc6IGJvb2xlYW47XG4gIHFhTW9kZUVuYWJsZWQ6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0UWFTdGFydHVwQWN0aW9uID0gKHtcbiAgZGVlcExpbmtQYXRoLFxuICBoYXNUb2dnbGVBcmd1bWVudCxcbiAgaXNQYWNrYWdlZCxcbiAgaXNTdGFnaW5nLFxuICBxYU1vZGVFbmFibGVkLFxufTogUWFTdGFydHVwQWN0aW9uSW5wdXQpOiBRYVN0YXJ0dXBBY3Rpb24gPT4ge1xuICBpZiAoIWlzUGFja2FnZWRTdGFnaW5nSWRlbnRpdHkoaXNQYWNrYWdlZCwgaXNTdGFnaW5nKSkge1xuICAgIHJldHVybiAnb3JkaW5hcnknO1xuICB9XG4gIGlmIChoYXNUb2dnbGVBcmd1bWVudCkge1xuICAgIHJldHVybiAndG9nZ2xlJztcbiAgfVxuXG4gIGNvbnN0IG5vcm1hbGl6ZWREZWVwTGlua1BhdGggPSBkZWVwTGlua1BhdGhcbiAgICA/LnJlcGxhY2UoL15cXC8vLCAnJylcbiAgICAucmVwbGFjZSgvXFwvJC8sICcnKTtcbiAgcmV0dXJuIHFhTW9kZUVuYWJsZWQgJiYgbm9ybWFsaXplZERlZXBMaW5rUGF0aCAhPT0gJ3N5c3RlbS1yZXBvcnQnXG4gICAgPyAnc2VsZWN0b3InXG4gICAgOiAnb3JkaW5hcnknO1xufTtcblxuZXhwb3J0IGNvbnN0IHBhcnNlUWFMaXN0ID0gKHZhbHVlOiB1bmtub3duKTogUWFMaXN0SXRlbVtdID0+IHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIFFBIGxpc3QgcmVzcG9uc2UgaXMgbm90IGFuIGFycmF5Jyk7XG4gIH1cblxuICByZXR1cm4gdmFsdWUubWFwKChpdGVtLCBpbmRleCkgPT4ge1xuICAgIGlmICghaXRlbSB8fCB0eXBlb2YgaXRlbSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIFFBIGxpc3QgaXRlbSBhdCBpbmRleCAke2luZGV4fSBpcyBpbnZhbGlkYCk7XG4gICAgfVxuXG4gICAgY29uc3QgY2FuZGlkYXRlID0gaXRlbSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBpZiAoXG4gICAgICAhTnVtYmVyLmlzU2FmZUludGVnZXIoY2FuZGlkYXRlLm51bWJlcikgfHxcbiAgICAgIE51bWJlcihjYW5kaWRhdGUubnVtYmVyKSA8PSAwXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBUaGUgUUEgbGlzdCBpdGVtIGF0IGluZGV4ICR7aW5kZXh9IGhhcyBhbiBpbnZhbGlkIG51bWJlcmAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNhbmRpZGF0ZS50aXRsZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFRoZSBRQSBsaXN0IGl0ZW0gYXQgaW5kZXggJHtpbmRleH0gaGFzIGFuIGludmFsaWQgdGl0bGVgLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGNhbmRpZGF0ZS5zdGF0dXMgIT09ICdzdHJpbmcnIHx8XG4gICAgICAhUUFfU1RBVFVTX1NFVC5oYXMoY2FuZGlkYXRlLnN0YXR1cylcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFRoZSBRQSBsaXN0IGl0ZW0gYXQgaW5kZXggJHtpbmRleH0gaGFzIGFuIGludmFsaWQgc3RhdHVzYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzOiBRYVN0YXR1cyA9XG4gICAgICBjYW5kaWRhdGUuc3RhdHVzID09PSAnZmFpbCcgJiZcbiAgICAgIGNhbmRpZGF0ZS51bmF2YWlsYWJsZVJlYXNvbiA9PT0gJ3ByZXZpZXctc3RhdHVzLXVuYXZhaWxhYmxlJ1xuICAgICAgICA/ICd1bmF2YWlsYWJsZSdcbiAgICAgICAgOiAoY2FuZGlkYXRlLnN0YXR1cyBhcyBRYVN0YXR1cyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbnVtYmVyOiBOdW1iZXIoY2FuZGlkYXRlLm51bWJlciksXG4gICAgICBzdGF0dXMsXG4gICAgICB0aXRsZTogY2FuZGlkYXRlLnRpdGxlLFxuICAgIH07XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFFhU2VsZWN0aW9uRXJyb3IgPSAoXG4gIGl0ZW1zOiByZWFkb25seSBRYUxpc3RJdGVtW10sXG4gIHByTnVtYmVyOiB1bmtub3duLFxuKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihwck51bWJlcikgfHwgTnVtYmVyKHByTnVtYmVyKSA8PSAwKSB7XG4gICAgcmV0dXJuICdTZWxlY3QgYSB2YWxpZCBwdWxsIHJlcXVlc3QnO1xuICB9XG5cbiAgY29uc3Qgc2VsZWN0ZWRQdWxsUmVxdWVzdCA9IGl0ZW1zLmZpbmQoaXRlbSA9PiBpdGVtLm51bWJlciA9PT0gcHJOdW1iZXIpO1xuICBpZiAoIXNlbGVjdGVkUHVsbFJlcXVlc3QpIHtcbiAgICByZXR1cm4gJ1RoaXMgcHVsbCByZXF1ZXN0IGlzIG5vIGxvbmdlciBvcGVuLiBSZWZyZXNoIGFuZCB0cnkgYWdhaW4uJztcbiAgfVxuICBpZiAoc2VsZWN0ZWRQdWxsUmVxdWVzdC5zdGF0dXMgIT09ICdzdWNjZXNzJykge1xuICAgIHJldHVybiAnVGhpcyBwdWxsIHJlcXVlc3QgaXMgbm90IHJlYWR5IGFueW1vcmUuIFJlZnJlc2ggYW5kIHRyeSBhZ2Fpbi4nO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBjb25zdCBjYW5Db250aW51ZVFhU2VsZWN0aW9uID0gKFxuICBhcHBsaWNhdGlvbklzUXVpdHRpbmc6IGJvb2xlYW4sXG4gIHNlbGVjdG9yV2luZG93SXNEZXN0cm95ZWQ6IGJvb2xlYW4sXG4pOiBib29sZWFuID0+ICFhcHBsaWNhdGlvbklzUXVpdHRpbmcgJiYgIXNlbGVjdG9yV2luZG93SXNEZXN0cm95ZWQ7XG4iLCJpbXBvcnQge3JhbmRvbVVVSUR9IGZyb20gJ25vZGU6Y3J5cHRvJztcbmltcG9ydCB7XG4gIGV4aXN0c1N5bmMsXG4gIG1rZGlyU3luYyxcbiAgcmVuYW1lU3luYyxcbiAgdW5saW5rU3luYyxcbiAgd3JpdGVGaWxlU3luYyxcbn0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuXG5leHBvcnQgY29uc3QgaXNRYU1vZGVNYXJrZXJFbmFibGVkID0gKG1hcmtlclBhdGg6IHN0cmluZyk6IGJvb2xlYW4gPT5cbiAgZXhpc3RzU3luYyhtYXJrZXJQYXRoKTtcblxuZXhwb3J0IGNvbnN0IHNldFFhTW9kZU1hcmtlckVuYWJsZWQgPSAoXG4gIG1hcmtlclBhdGg6IHN0cmluZyxcbiAgZW5hYmxlZDogYm9vbGVhbixcbik6IHZvaWQgPT4ge1xuICBpZiAoIWVuYWJsZWQpIHtcbiAgICBpZiAoZXhpc3RzU3luYyhtYXJrZXJQYXRoKSkge1xuICAgICAgdW5saW5rU3luYyhtYXJrZXJQYXRoKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChleGlzdHNTeW5jKG1hcmtlclBhdGgpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbWtkaXJTeW5jKHBhdGguZGlybmFtZShtYXJrZXJQYXRoKSwge3JlY3Vyc2l2ZTogdHJ1ZX0pO1xuICBjb25zdCB0ZW1wb3JhcnlQYXRoID0gYCR7bWFya2VyUGF0aH0uJHtwcm9jZXNzLnBpZH0uJHtyYW5kb21VVUlEKCl9LnRtcGA7XG4gIHRyeSB7XG4gICAgd3JpdGVGaWxlU3luYyh0ZW1wb3JhcnlQYXRoLCAnZW5hYmxlZFxcbicsIHtmbGFnOiAnd3gnfSk7XG4gICAgcmVuYW1lU3luYyh0ZW1wb3JhcnlQYXRoLCBtYXJrZXJQYXRoKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBpZiAoZXhpc3RzU3luYyh0ZW1wb3JhcnlQYXRoKSkge1xuICAgICAgdW5saW5rU3luYyh0ZW1wb3JhcnlQYXRoKTtcbiAgICB9XG4gIH1cbn07XG4iLCJpbXBvcnQge2FwcCwgTWVudSwgdHlwZSBNZW51SXRlbUNvbnN0cnVjdG9yT3B0aW9uc30gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcblxuaW1wb3J0IHtJU19TVEFHSU5HfSBmcm9tICdAL2Vudic7XG5pbXBvcnQge3JlbW92ZVN0YXJ0aW5nRmlsZX0gZnJvbSAnQC91dGlscy9zdGFydGluZ0ZpbGUudXRpbHMnO1xuXG5pbXBvcnQge1xuICBjb250YWluc1FhTW9kZVRvZ2dsZUFyZ3VtZW50LFxuICBnZXRRYVRvZ2dsZVJlbGF1bmNoQXJndW1lbnRzLFxuICBpc1BhY2thZ2VkU3RhZ2luZ0lkZW50aXR5LFxuICBRQV9NT0RFX1RPR0dMRV9BUkdVTUVOVCxcbn0gZnJvbSAnLi9xYUNvbnRyYWN0cyc7XG5pbXBvcnQge2lzUWFNb2RlTWFya2VyRW5hYmxlZCwgc2V0UWFNb2RlTWFya2VyRW5hYmxlZH0gZnJvbSAnLi9xYU1hcmtlcic7XG5cbmV4cG9ydCB7UUFfTU9ERV9UT0dHTEVfQVJHVU1FTlR9IGZyb20gJy4vcWFDb250cmFjdHMnO1xuXG5jb25zdCBRQV9NT0RFX01BUktFUl9GSUxFTkFNRSA9ICdxYS1tb2RlJztcblxubGV0IHFhTW9kZVJlbGF1bmNoUmVxdWVzdGVkID0gZmFsc2U7XG5cbmV4cG9ydCBjb25zdCBpc1BhY2thZ2VkU3RhZ2luZ0J1aWxkID0gKCk6IGJvb2xlYW4gPT5cbiAgaXNQYWNrYWdlZFN0YWdpbmdJZGVudGl0eShhcHAuaXNQYWNrYWdlZCwgSVNfU1RBR0lORyk7XG5cbmNvbnN0IGdldFFhTW9kZU1hcmtlclBhdGggPSAoKTogc3RyaW5nID0+XG4gIHBhdGguam9pbihhcHAuZ2V0UGF0aCgndXNlckRhdGEnKSwgUUFfTU9ERV9NQVJLRVJfRklMRU5BTUUpO1xuXG5leHBvcnQgY29uc3QgaXNRYU1vZGVFbmFibGVkID0gKCk6IGJvb2xlYW4gPT5cbiAgaXNQYWNrYWdlZFN0YWdpbmdCdWlsZCgpICYmIGlzUWFNb2RlTWFya2VyRW5hYmxlZChnZXRRYU1vZGVNYXJrZXJQYXRoKCkpO1xuXG5leHBvcnQgY29uc3QgaGFzUWFNb2RlVG9nZ2xlQXJndW1lbnQgPSAoYXJndjogcmVhZG9ubHkgc3RyaW5nW10pOiBib29sZWFuID0+XG4gIGlzUGFja2FnZWRTdGFnaW5nQnVpbGQoKSAmJiBjb250YWluc1FhTW9kZVRvZ2dsZUFyZ3VtZW50KGFyZ3YpO1xuXG5jb25zdCBwZXJmb3JtUWFNb2RlVG9nZ2xlQW5kUmVsYXVuY2ggPSAoKTogdm9pZCA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2hvdWxkRW5hYmxlUWFNb2RlID0gIWlzUWFNb2RlRW5hYmxlZCgpO1xuICAgIHNldFFhTW9kZU1hcmtlckVuYWJsZWQoZ2V0UWFNb2RlTWFya2VyUGF0aCgpLCBzaG91bGRFbmFibGVRYU1vZGUpO1xuICAgIHJlbW92ZVN0YXJ0aW5nRmlsZSgpO1xuXG4gICAgY29uc3QgcmVsYXVuY2hBcmd1bWVudHMgPSBnZXRRYVRvZ2dsZVJlbGF1bmNoQXJndW1lbnRzKHByb2Nlc3MuYXJndik7XG4gICAgYXBwLnJlbGF1bmNoKHthcmdzOiByZWxhdW5jaEFyZ3VtZW50c30pO1xuICAgIGFwcC5xdWl0KCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignW1FBIE1vZGVdIEZhaWxlZCB0byB0b2dnbGUgdGhlIHBlcnNpc3RlZCBtYXJrZXI6JywgZXJyb3IpO1xuICAgIGFwcC5xdWl0KCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCByZXF1ZXN0UWFNb2RlVG9nZ2xlQW5kUmVsYXVuY2ggPSAoKTogdm9pZCA9PiB7XG4gIGlmICghaXNQYWNrYWdlZFN0YWdpbmdCdWlsZCgpIHx8IHFhTW9kZVJlbGF1bmNoUmVxdWVzdGVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcWFNb2RlUmVsYXVuY2hSZXF1ZXN0ZWQgPSB0cnVlO1xuICBpZiAoYXBwLmlzUmVhZHkoKSkge1xuICAgIHBlcmZvcm1RYU1vZGVUb2dnbGVBbmRSZWxhdW5jaCgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZvaWQgYXBwLndoZW5SZWFkeSgpLnRoZW4ocGVyZm9ybVFhTW9kZVRvZ2dsZUFuZFJlbGF1bmNoKTtcbn07XG5cbmV4cG9ydCBjb25zdCBpc1FhTW9kZVJlbGF1bmNoUGVuZGluZyA9ICgpOiBib29sZWFuID0+IHFhTW9kZVJlbGF1bmNoUmVxdWVzdGVkO1xuXG5jb25zdCBjcmVhdGVRYU1lbnUgPSAoKTogTWVudUl0ZW1Db25zdHJ1Y3Rvck9wdGlvbnMgPT4gKHtcbiAgbGFiZWw6ICdRQScsXG4gIHN1Ym1lbnU6IFtcbiAgICB7XG4gICAgICBjaGVja2VkOiBpc1FhTW9kZUVuYWJsZWQoKSxcbiAgICAgIGNsaWNrOiByZXF1ZXN0UWFNb2RlVG9nZ2xlQW5kUmVsYXVuY2gsXG4gICAgICBsYWJlbDogJ1FBIE1vZGUnLFxuICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICB9LFxuICBdLFxufSk7XG5cbmV4cG9ydCBjb25zdCBhcHBlbmRRYU1vZGVNZW51ID0gKFxuICB0ZW1wbGF0ZTogTWVudUl0ZW1Db25zdHJ1Y3Rvck9wdGlvbnNbXSxcbik6IE1lbnVJdGVtQ29uc3RydWN0b3JPcHRpb25zW10gPT4ge1xuICBpZiAoIWlzUGFja2FnZWRTdGFnaW5nQnVpbGQoKSB8fCBwcm9jZXNzLnBsYXRmb3JtICE9PSAnZGFyd2luJykge1xuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfVxuXG4gIHJldHVybiBbLi4udGVtcGxhdGUsIGNyZWF0ZVFhTWVudSgpXTtcbn07XG5cbmV4cG9ydCBjb25zdCBpbnN0YWxsUWFQbGF0Zm9ybUNvbnRyb2xzID0gKCk6IHZvaWQgPT4ge1xuICBpZiAoIWlzUGFja2FnZWRTdGFnaW5nQnVpbGQoKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgIGNvbnN0IHRlbXBsYXRlOiBNZW51SXRlbUNvbnN0cnVjdG9yT3B0aW9uc1tdID0gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ0F1dG9DdXQnLFxuICAgICAgICBzdWJtZW51OiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xpY2s6ICgpID0+IGFwcC5xdWl0KCksXG4gICAgICAgICAgICBsYWJlbDogJ1F1aXQgQXV0b0N1dCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgXTtcbiAgICBjb25zdCB0ZW1wbGF0ZVdpdGhRYU1vZGUgPSBhcHBlbmRRYU1vZGVNZW51KHRlbXBsYXRlKTtcbiAgICBNZW51LnNldEFwcGxpY2F0aW9uTWVudShNZW51LmJ1aWxkRnJvbVRlbXBsYXRlKHRlbXBsYXRlV2l0aFFhTW9kZSkpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgY29uc3QgZGlkSW5zdGFsbFRhc2sgPSBhcHAuc2V0VXNlclRhc2tzKFtcbiAgICAgIHtcbiAgICAgICAgYXJndW1lbnRzOiBRQV9NT0RFX1RPR0dMRV9BUkdVTUVOVCxcbiAgICAgICAgZGVzY3JpcHRpb246ICdFbmFibGUgb3IgZGlzYWJsZSBBdXRvQ3V0IFN0YWdpbmcgUUEgTW9kZScsXG4gICAgICAgIGljb25JbmRleDogMCxcbiAgICAgICAgaWNvblBhdGg6IHByb2Nlc3MuZXhlY1BhdGgsXG4gICAgICAgIHByb2dyYW06IHByb2Nlc3MuZXhlY1BhdGgsXG4gICAgICAgIHRpdGxlOiAnUUEnLFxuICAgICAgfSxcbiAgICBdKTtcblxuICAgIGlmICghZGlkSW5zdGFsbFRhc2spIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tRQSBNb2RlXSBGYWlsZWQgdG8gaW5zdGFsbCB0aGUgV2luZG93cyBKdW1wIExpc3QgdGFzaycpO1xuICAgIH1cbiAgfVxufTtcbiIsImltcG9ydCB7SVNfREVWLCBJU19QUk9ELCBJU19TVEFHSU5HfSBmcm9tICdAL2Vudic7XG5pbXBvcnQge1xuICBhcHAsXG4gIEJyb3dzZXJXaW5kb3csXG4gIE1lbnUsXG4gIHR5cGUgTWVudUl0ZW1Db25zdHJ1Y3Rvck9wdGlvbnMsXG4gIHR5cGUgUmVjdGFuZ2xlLFxuICBzY3JlZW4sXG59IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7aXBjTWFpbn0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHBhdGgsIHtqb2lufSBmcm9tICdub2RlOnBhdGgnO1xuXG5pbXBvcnQge2FwcGVuZFFhTW9kZU1lbnV9IGZyb20gJy4vcWEvcWFNb2RlJztcbmltcG9ydCB7cmVnaXN0ZXJCcm93c2VyV2luZG93VGxzRGlhZ25vc3RpY3N9IGZyb20gJy4vdXRpbHMvdGxzRXJyb3IudXRpbHMnO1xuXG5jb25zdCBpc1dpdGhpbkRpc3BsYXlCb3VuZHMgPSAocG9zOiB7eDogbnVtYmVyOyB5OiBudW1iZXJ9KSA9PiB7XG4gIGNvbnN0IGRpc3BsYXlzID0gc2NyZWVuLmdldEFsbERpc3BsYXlzKCk7XG4gIHJldHVybiBkaXNwbGF5cy5yZWR1Y2UoKHJlc3VsdCwgZGlzcGxheSkgPT4ge1xuICAgIGNvbnN0IGFyZWEgPSBkaXNwbGF5LndvcmtBcmVhO1xuICAgIHJldHVybiAoXG4gICAgICByZXN1bHQgfHxcbiAgICAgIChwb3MueCA+PSBhcmVhLnggJiZcbiAgICAgICAgcG9zLnkgPj0gYXJlYS55ICYmXG4gICAgICAgIHBvcy54IDwgYXJlYS54ICsgYXJlYS53aWR0aCAmJlxuICAgICAgICBwb3MueSA8IGFyZWEueSArIGFyZWEuaGVpZ2h0KVxuICAgICk7XG4gIH0sIGZhbHNlKTtcbn07XG5cbmNvbnN0IE1JTklNVU1fV0lORE9XX1NJWkUgPSB7d2lkdGg6IDYwMCwgaGVpZ2h0OiA2MDB9O1xuY29uc3QgTUFYSU1VTV9XSU5ET1dfU0laRSA9IHt3aWR0aDogMTIwMCwgaGVpZ2h0OiAxNjAwfTtcbmNvbnN0IERFRkFVTFRfV0lORE9XX1NJWkUgPSB7d2lkdGg6IDYwMCwgaGVpZ2h0OiA4MDB9O1xuY29uc3QgSU5JVF9GSUxFX1ZFUlNJT04gPSAyOyAvLyBVcGRhdGUgaXQgaWYgeW91IGNoYW5nZSBERUZBVUxUX1dJTkRPV19TSVpFXG5cbmNvbnN0IHdpbmRvd0JvdW5kc0JlZm9yZUV4cGFuc2lvbiA9IG5ldyBXZWFrTWFwPEJyb3dzZXJXaW5kb3csIFJlY3RhbmdsZT4oKTtcblxuY29uc3Qgc2V0V2luZG93RXhwYW5kZWQgPSAod2luZG93OiBCcm93c2VyV2luZG93LCBleHBhbmRlZDogYm9vbGVhbikgPT4ge1xuICBjb25zdCBwcmV2aW91c0JvdW5kcyA9IHdpbmRvd0JvdW5kc0JlZm9yZUV4cGFuc2lvbi5nZXQod2luZG93KTtcblxuICBpZiAoZXhwYW5kZWQpIHtcbiAgICBpZiAocHJldmlvdXNCb3VuZHMpIHJldHVybjtcblxuICAgIGNvbnN0IGJvdW5kcyA9IHdpbmRvdy5nZXRCb3VuZHMoKTtcbiAgICBjb25zdCB7d29ya0FyZWF9ID0gc2NyZWVuLmdldERpc3BsYXlNYXRjaGluZyhib3VuZHMpO1xuICAgIGNvbnN0IHdpZHRoID0gTWF0aC5taW4oTUFYSU1VTV9XSU5ET1dfU0laRS53aWR0aCwgd29ya0FyZWEud2lkdGgpO1xuICAgIGNvbnN0IGhlaWdodCA9IE1hdGgubWluKE1BWElNVU1fV0lORE9XX1NJWkUuaGVpZ2h0LCB3b3JrQXJlYS5oZWlnaHQpO1xuICAgIGNvbnN0IHggPSBNYXRoLm1pbihib3VuZHMueCwgd29ya0FyZWEueCArIHdvcmtBcmVhLndpZHRoIC0gd2lkdGgpO1xuICAgIGNvbnN0IHkgPSBNYXRoLm1pbihib3VuZHMueSwgd29ya0FyZWEueSArIHdvcmtBcmVhLmhlaWdodCAtIGhlaWdodCk7XG4gICAgd2luZG93Qm91bmRzQmVmb3JlRXhwYW5zaW9uLnNldCh3aW5kb3csIGJvdW5kcyk7XG5cbiAgICB3aW5kb3cuc2V0Qm91bmRzKHtcbiAgICAgIGhlaWdodCxcbiAgICAgIHdpZHRoLFxuICAgICAgeDogTWF0aC5tYXgod29ya0FyZWEueCwgeCksXG4gICAgICB5OiBNYXRoLm1heCh3b3JrQXJlYS55LCB5KSxcbiAgICB9KTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIXByZXZpb3VzQm91bmRzKSByZXR1cm47XG5cbiAgaWYgKGlzV2l0aGluRGlzcGxheUJvdW5kcyhwcmV2aW91c0JvdW5kcykpIHtcbiAgICB3aW5kb3cuc2V0Qm91bmRzKHByZXZpb3VzQm91bmRzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGUgb3JpZ2luYWwgbW9uaXRvciBtYXkgaGF2ZSBiZWVuIGRpc2Nvbm5lY3RlZCB3aGlsZSBlZGl0aW5nLlxuICAgIHdpbmRvdy5zZXRCb3VuZHMoe1xuICAgICAgaGVpZ2h0OiBwcmV2aW91c0JvdW5kcy5oZWlnaHQsXG4gICAgICB3aWR0aDogcHJldmlvdXNCb3VuZHMud2lkdGgsXG4gICAgfSk7XG4gICAgd2luZG93LmNlbnRlcigpO1xuICB9XG5cbiAgd2luZG93Qm91bmRzQmVmb3JlRXhwYW5zaW9uLmRlbGV0ZSh3aW5kb3cpO1xufTtcblxudHlwZSBJbml0RmlsZURhdGEgPSB7XG4gIHZlcnNpb24/OiBudW1iZXI7XG4gIGJvdW5kcz86IHtcbiAgICB4PzogbnVtYmVyO1xuICAgIHk/OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgfTtcbiAgaXNQaW5uZWQ/OiBib29sZWFuO1xufTtcblxuY29uc3QgZ2V0SW5pdEZpbGVWZXJzaW9uID0gKGluaXREYXRhOiBJbml0RmlsZURhdGEgfCB1bmRlZmluZWQpOiBudW1iZXIgPT4ge1xuICByZXR1cm4gaW5pdERhdGE/LnZlcnNpb24gPz8gMTtcbn07XG5cbmNvbnN0IGVuZm9yY2VNaW5XaW5kb3dTaXplID0gKFxuICBib3VuZHM6IE5vbk51bGxhYmxlPEluaXRGaWxlRGF0YVsnYm91bmRzJ10+LFxuICB2ZXJzaW9uOiBudW1iZXIsXG4pOiBOb25OdWxsYWJsZTxJbml0RmlsZURhdGFbJ2JvdW5kcyddPiA9PiB7XG4gIGNvbnN0IG1pblNpemUgPSB2ZXJzaW9uID49IDIgPyBNSU5JTVVNX1dJTkRPV19TSVpFIDogREVGQVVMVF9XSU5ET1dfU0laRTtcbiAgcmV0dXJuIHtcbiAgICAuLi5ib3VuZHMsXG4gICAgd2lkdGg6IE1hdGgubWluKFxuICAgICAgTUFYSU1VTV9XSU5ET1dfU0laRS53aWR0aCxcbiAgICAgIE1hdGgubWF4KGJvdW5kcy53aWR0aCwgbWluU2l6ZS53aWR0aCksXG4gICAgKSxcbiAgICBoZWlnaHQ6IE1hdGgubWluKFxuICAgICAgTUFYSU1VTV9XSU5ET1dfU0laRS5oZWlnaHQsXG4gICAgICBNYXRoLm1heChib3VuZHMuaGVpZ2h0LCBtaW5TaXplLmhlaWdodCksXG4gICAgKSxcbiAgfTtcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVXaW5kb3coXG4gIHVybD86IHN0cmluZyxcbiAge3NpemUsIGZyYW1lfToge3NpemU/OiB7d2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXJ9OyBmcmFtZT86IGJvb2xlYW59ID0ge30sXG4pIHtcbiAgY29uc29sZS5sb2coJ0NyZWF0aW5nIHdpbmRvdy4uLicpO1xuICBjb25zdCBpbml0UGF0aCA9IHBhdGguam9pbihhcHAuZ2V0UGF0aCgndXNlckRhdGEnKSwgJ2luaXQuanNvbicpO1xuICBsZXQgZGF0YTogSW5pdEZpbGVEYXRhIHwgdW5kZWZpbmVkO1xuICB0cnkge1xuICAgIGRhdGEgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhpbml0UGF0aCwgJ3V0ZjgnKSkgYXMgSW5pdEZpbGVEYXRhO1xuICAgIGNvbnN0IHZlcnNpb24gPSBnZXRJbml0RmlsZVZlcnNpb24oZGF0YSk7XG4gICAgaWYgKGRhdGEuYm91bmRzKSB7XG4gICAgICBkYXRhLmJvdW5kcyA9IGVuZm9yY2VNaW5XaW5kb3dTaXplKGRhdGEuYm91bmRzLCB2ZXJzaW9uKTtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgZGF0YS5ib3VuZHMgJiZcbiAgICAgIGRhdGEuYm91bmRzLnggIT09IHVuZGVmaW5lZCAmJlxuICAgICAgZGF0YS5ib3VuZHMueSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAhaXNXaXRoaW5EaXNwbGF5Qm91bmRzKHt4OiBkYXRhLmJvdW5kcy54LCB5OiBkYXRhLmJvdW5kcy55fSlcbiAgICApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdCb3VuZHMgYXJlIG5vdCB3aXRoaW4gZGlzcGxheSBib3VuZHMnKTtcbiAgICAgIGRhdGEuYm91bmRzID0ge1xuICAgICAgICAuLi5kYXRhLmJvdW5kcyxcbiAgICAgICAgeDogdW5kZWZpbmVkLFxuICAgICAgICB5OiB1bmRlZmluZWQsXG4gICAgICB9O1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIGRvIG5vdGhpbmdcbiAgICBjb25zb2xlLmxvZygnTm8gaW5pdCBmaWxlIGZvdW5kIG9yIHdpdGggZXJyb3InKTtcbiAgfVxuICBjb25zdCBicm93c2VyV2luZG93ID0gbmV3IEJyb3dzZXJXaW5kb3coe1xuICAgIHNob3c6IGZhbHNlLCAvLyBVc2UgdGhlICdyZWFkeS10by1zaG93JyBldmVudCB0byBzaG93IHRoZSBpbnN0YW50aWF0ZWQgQnJvd3NlcldpbmRvdy5cbiAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgZGV2VG9vbHM6ICFJU19QUk9ELFxuICAgICAgbm9kZUludGVncmF0aW9uOiBmYWxzZSxcbiAgICAgIGNvbnRleHRJc29sYXRpb246IHRydWUsXG4gICAgICBzYW5kYm94OiBmYWxzZSwgLy8gU2FuZGJveCBkaXNhYmxlZCBiZWNhdXNlIHRoZSBkZW1vIG9mIHByZWxvYWQgc2NyaXB0IGRlcGVuZCBvbiB0aGUgTm9kZS5qcyBhcGlcbiAgICAgIHdlYnZpZXdUYWc6IGZhbHNlLCAvLyBUaGUgd2VidmlldyB0YWcgaXMgbm90IHJlY29tbWVuZGVkLiBDb25zaWRlciBhbHRlcm5hdGl2ZXMgbGlrZSBhbiBpZnJhbWUgb3IgRWxlY3Ryb24ncyBCcm93c2VyVmlldy4gQHNlZSBodHRwczovL3d3dy5lbGVjdHJvbmpzLm9yZy9kb2NzL2xhdGVzdC9hcGkvd2Vidmlldy10YWcjd2FybmluZ1xuICAgICAgcHJlbG9hZDogam9pbihhcHAuZ2V0QXBwUGF0aCgpLCAncGFja2FnZXMvcHJlbG9hZC9kaXN0L2luZGV4Lm1qcycpLFxuICAgIH0sXG5cbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMTUxNTFjJyxcblxuICAgIGZyYW1lOiBmcmFtZSA/PyBmYWxzZSxcbiAgICB0aXRsZUJhck92ZXJsYXk6IHtcbiAgICAgIGNvbG9yOiAnIzE1MTUxYycsXG4gICAgICBzeW1ib2xDb2xvcjogJyNlNjUwMTknLFxuICAgICAgaGVpZ2h0OiA2MCxcbiAgICB9LFxuXG4gICAgbWF4V2lkdGg6IE1BWElNVU1fV0lORE9XX1NJWkUud2lkdGgsXG4gICAgbWluV2lkdGg6IE1JTklNVU1fV0lORE9XX1NJWkUud2lkdGgsXG4gICAgbWF4SGVpZ2h0OiBNQVhJTVVNX1dJTkRPV19TSVpFLmhlaWdodCxcbiAgICBtaW5IZWlnaHQ6IE1JTklNVU1fV0lORE9XX1NJWkUuaGVpZ2h0LFxuICAgIC4uLihzaXplID8gc2l6ZSA6IGRhdGEgJiYgZGF0YS5ib3VuZHMgPyBkYXRhLmJvdW5kcyA6IERFRkFVTFRfV0lORE9XX1NJWkUpLFxuXG4gICAgbWluaW1pemFibGU6IGZhbHNlLFxuICAgIG1heGltaXphYmxlOiBmYWxzZSxcbiAgICBmdWxsc2NyZWVuYWJsZTogZmFsc2UsXG4gIH0pO1xuICBjb25zb2xlLmxvZygnQnJvd3NlcldpbmRvdyBjcmVhdGVkJyk7XG5cbiAgcmVnaXN0ZXJCcm93c2VyV2luZG93VGxzRGlhZ25vc3RpY3MoYnJvd3NlcldpbmRvdyk7XG5cbiAgYnJvd3NlcldpbmRvdy53ZWJDb250ZW50cy5vbignZGlkLXN0YXJ0LW5hdmlnYXRpb24nLCBkZXRhaWxzID0+IHtcbiAgICBpZiAoZGV0YWlscy5pc01haW5GcmFtZSAmJiAhZGV0YWlscy5pc1NhbWVEb2N1bWVudCkge1xuICAgICAgc2V0V2luZG93RXhwYW5kZWQoYnJvd3NlcldpbmRvdywgZmFsc2UpO1xuICAgIH1cbiAgfSk7XG4gIGJyb3dzZXJXaW5kb3cud2ViQ29udGVudHMub24oJ3JlbmRlci1wcm9jZXNzLWdvbmUnLCAoKSA9PiB7XG4gICAgc2V0V2luZG93RXhwYW5kZWQoYnJvd3NlcldpbmRvdywgZmFsc2UpO1xuICB9KTtcblxuICBicm93c2VyV2luZG93LnJlbW92ZU1lbnUoKTtcbiAgYnJvd3NlcldpbmRvdy5zZXRNZW51QmFyVmlzaWJpbGl0eShmYWxzZSk7XG4gIGJyb3dzZXJXaW5kb3cuc2V0RnVsbFNjcmVlbmFibGUoZmFsc2UpO1xuICBzZXRNYWluTWVudSgpO1xuXG4gIGlmICghZGF0YSB8fCBkYXRhLmlzUGlubmVkID09PSB0cnVlKSB7XG4gICAgYnJvd3NlcldpbmRvdy5zZXRBbHdheXNPblRvcCh0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgJ3Nob3cnIHByb3BlcnR5IG9mIHRoZSBCcm93c2VyV2luZG93J3MgY29uc3RydWN0b3IgaXMgb21pdHRlZCBmcm9tIHRoZSBpbml0aWFsaXphdGlvbiBvcHRpb25zLFxuICAgKiBpdCB0aGVuIGRlZmF1bHRzIHRvICd0cnVlJy4gVGhpcyBjYW4gY2F1c2UgZmxpY2tlcmluZyBhcyB0aGUgd2luZG93IGxvYWRzIHRoZSBodG1sIGNvbnRlbnQsXG4gICAqIGFuZCBpdCBhbHNvIGhhcyBzaG93IHByb2JsZW1hdGljIGJlaGF2aW91ciB3aXRoIHRoZSBjbG9zaW5nIG9mIHRoZSB3aW5kb3cuXG4gICAqIFVzZSBgc2hvdzogZmFsc2VgIGFuZCBsaXN0ZW4gdG8gdGhlICBgcmVhZHktdG8tc2hvd2AgZXZlbnQgdG8gc2hvdyB0aGUgd2luZG93LlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9lbGVjdHJvbi9lbGVjdHJvbi9pc3N1ZXMvMjUwMTIgZm9yIHRoZSBhZmZvcmQgbWVudGlvbmVkIGlzc3VlLlxuICAgKi9cbiAgYnJvd3NlcldpbmRvdy5vbigncmVhZHktdG8tc2hvdycsICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnV2luZG93IGlzIHJlYWR5IHRvIHNob3cnLCB7XG4gICAgICBicm93c2VyV2luZG93OiAhIWJyb3dzZXJXaW5kb3csXG4gICAgICBJU19ERVYsXG4gICAgICBJU19TVEFHSU5HLFxuICAgICAgSVNfUFJPRCxcbiAgICB9KTtcbiAgICBpZiAoSVNfREVWICYmICFhcHAuaXNQYWNrYWdlZCkge1xuICAgICAgY29uc29sZS5sb2coJ1Nob3dpbmcgd2luZG93IGluYWN0aXZlJyk7XG4gICAgICBicm93c2VyV2luZG93Py5zaG93SW5hY3RpdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ1Nob3dpbmcgd2luZG93Jyk7XG4gICAgICBicm93c2VyV2luZG93Py5zaG93KCk7XG4gICAgfVxuICB9KTtcblxuICBicm93c2VyV2luZG93Lm9uKCdzaG93JywgKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdXaW5kb3cgaXMgc2hvd24nKTtcbiAgICBpZiAoIUlTX1BST0QpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdPcGVuaW5nIGRldiB0b29scycpO1xuICAgICAgYnJvd3NlcldpbmRvdz8ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCk7XG4gICAgfVxuICB9KTtcblxuICBicm93c2VyV2luZG93Lm9uKCdjbG9zZScsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnV2luZG93IGlzIGNsb3NlZCcpO1xuICAgIGlmICghIXNpemUgfHwgISFmcmFtZSkgcmV0dXJuO1xuICAgIGNvbnN0IGRhdGE6IEluaXRGaWxlRGF0YSA9IHtcbiAgICAgIHZlcnNpb246IElOSVRfRklMRV9WRVJTSU9OLFxuICAgICAgYm91bmRzOlxuICAgICAgICB3aW5kb3dCb3VuZHNCZWZvcmVFeHBhbnNpb24uZ2V0KGJyb3dzZXJXaW5kb3cpID8/XG4gICAgICAgIGJyb3dzZXJXaW5kb3cuZ2V0Qm91bmRzKCksXG4gICAgICBpc1Bpbm5lZDogYnJvd3NlcldpbmRvdy5pc0Fsd2F5c09uVG9wKCksXG4gICAgfTtcbiAgICBmcy53cml0ZUZpbGVTeW5jKGluaXRQYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gIH0pO1xuXG4gIGlmICh1cmwpIHtcbiAgICBjb25zb2xlLmxvZygnTG9hZGluZyB1cmwgOiAnLCB1cmwpO1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnZmlsZTovLycpKSB7XG4gICAgICBhd2FpdCBicm93c2VyV2luZG93LmxvYWRGaWxlKHVybC5yZXBsYWNlKCdmaWxlOi8vJywgJycpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgYnJvd3NlcldpbmRvdy5sb2FkVVJMKHVybCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8qKlxuICAgICAqIExvYWQgdGhlIG1haW4gcGFnZSBvZiB0aGUgbWFpbiB3aW5kb3cuXG4gICAgICovXG4gICAgY29uc3QgZmlsZVBhdGggPSAhYXBwLmlzUGFja2FnZWRcbiAgICAgID8gJy4vYnVpbGRSZXNvdXJjZXMvYXNzZXRzL29mZmxpbmUtcGFnZS9vZmZsaW5lLmh0bWwnXG4gICAgICA6IHBhdGguam9pbihwcm9jZXNzLnJlc291cmNlc1BhdGgsICcuL2Fzc2V0cy9vZmZsaW5lLXBhZ2Uvb2ZmbGluZS5odG1sJyk7XG4gICAgY29uc29sZS5sb2coJ0xvYWRpbmcgZmlsZSA6ICcsIGZpbGVQYXRoKTtcbiAgICBhd2FpdCBicm93c2VyV2luZG93LmxvYWRGaWxlKGZpbGVQYXRoLCB7XG4gICAgICBxdWVyeToge2xvY2FsZTogYXBwLmdldExvY2FsZSgpfSxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBicm93c2VyV2luZG93O1xufVxuXG4vKipcbiAqIFJlc3RvcmUgYW4gZXhpc3RpbmcgQnJvd3NlcldpbmRvd1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdG9yZVdpbmRvdygpIHtcbiAgY29uc3Qgd2luZG93ID0gQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKCkuZmluZCh3ID0+ICF3LmlzRGVzdHJveWVkKCkpO1xuXG4gIGlmICh3aW5kb3cgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gIGlmICh3aW5kb3cuaXNNaW5pbWl6ZWQoKSkge1xuICAgIGNvbnNvbGUubG9nKCdSZXN0b3Jpbmcgd2luZG93Li4uJyk7XG4gICAgd2luZG93LnJlc3RvcmUoKTtcbiAgfVxuXG4gIHdpbmRvdy5mb2N1cygpO1xufVxuXG5leHBvcnQgY29uc3Qgc2VuZFRvQWxsV2luZG93cyA9IChldmVudDogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcbiAgQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbiAgICAuZmlsdGVyKHcgPT4gIXcuaXNEZXN0cm95ZWQoKSlcbiAgICAuZm9yRWFjaCh3aW5kb3cgPT4ge1xuICAgICAgd2luZG93LndlYkNvbnRlbnRzLnNlbmQoZXZlbnQsIGRhdGEpO1xuICAgIH0pO1xufTtcblxuY29uc3Qgc2V0TWFpbk1lbnUgPSAoKSA9PiB7XG4gIGNvbnN0IHRlbXBsYXRlOiBNZW51SXRlbUNvbnN0cnVjdG9yT3B0aW9uc1tdID0gW1xuICAgIHtcbiAgICAgIGxhYmVsOiAnQXV0b0N1dCcsXG4gICAgICBzdWJtZW51OiBbXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ1F1aXQgQXV0b0N1dCcsXG4gICAgICAgICAgY2xpY2soKSB7XG4gICAgICAgICAgICBhcHAucXVpdCgpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgbGFiZWw6ICdFZGl0JyxcbiAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAge2NsaWNrKCkge30sIHJvbGU6ICdjdXQnfSxcbiAgICAgICAge2NsaWNrKCkge30sIHJvbGU6ICdjb3B5J30sXG4gICAgICAgIHtjbGljaygpIHt9LCByb2xlOiAncGFzdGUnfSxcbiAgICAgICAge2NsaWNrKCkge30sIHJvbGU6ICdkZWxldGUnfSxcbiAgICAgICAge2NsaWNrKCkge30sIHJvbGU6ICdzZWxlY3RBbGwnfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICAuLi4oIUlTX1BST0RcbiAgICAgID8gW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnRGV2ZWxvcGVyJyxcbiAgICAgICAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnU2hvdyBEZXZUb29scycsXG4gICAgICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDbWRPckN0cmwrRCcsXG4gICAgICAgICAgICAgICAgY2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKHcgPT4gIXcuaXNEZXN0cm95ZWQoKSlcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2god2luZG93ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1Nob3cgRGV2VG9vbHMgKGRldGFjaCknLFxuICAgICAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ21kT3JDdHJsK1NoaWZ0K0QnLFxuICAgICAgICAgICAgICAgIGNsaWNrKCkge1xuICAgICAgICAgICAgICAgICAgQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcih3ID0+ICF3LmlzRGVzdHJveWVkKCkpXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKHdpbmRvdyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyh7bW9kZTogJ2RldGFjaCd9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnUmVsb2FkJyxcbiAgICAgICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NtZE9yQ3RybCtSJyxcbiAgICAgICAgICAgICAgICBjbGljaygpIHtcbiAgICAgICAgICAgICAgICAgIEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIodyA9PiAhdy5pc0Rlc3Ryb3llZCgpKVxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCh3aW5kb3cgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJDb250ZW50cy5yZWxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXVxuICAgICAgOiBbXSksXG4gIF07XG4gIGNvbnN0IHRlbXBsYXRlV2l0aFFhTW9kZSA9IGFwcGVuZFFhTW9kZU1lbnUodGVtcGxhdGUpO1xuICBNZW51LnNldEFwcGxpY2F0aW9uTWVudShNZW51LmJ1aWxkRnJvbVRlbXBsYXRlKHRlbXBsYXRlV2l0aFFhTW9kZSkpO1xufTtcblxuZXhwb3J0IGNvbnN0IGluaXRNYWluV2luZG93SVBDSGFuZGxlciA9ICgpID0+IHtcbiAgaXBjTWFpbi5vbignZWxlY3Ryb246c2V0V2luZG93RXhwYW5kZWQnLCAoZXZlbnQsIGV4cGFuZGVkOiB1bmtub3duKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBleHBhbmRlZCAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdJbnZhbGlkIHdpbmRvdyBleHBhbnNpb24gc3RhdGU6JywgZXhwYW5kZWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHdpbmRvdyA9IEJyb3dzZXJXaW5kb3cuZnJvbVdlYkNvbnRlbnRzKGV2ZW50LnNlbmRlcik7XG4gICAgaWYgKHdpbmRvdyAmJiAhd2luZG93LmlzRGVzdHJveWVkKCkpIHtcbiAgICAgIHNldFdpbmRvd0V4cGFuZGVkKHdpbmRvdywgZXhwYW5kZWQpO1xuICAgIH1cbiAgfSk7XG5cbiAgaXBjTWFpbi5vbignZWxlY3Ryb246cmVzdGFydCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnUmVzdGFydGluZyBhcHAuLi4nKTtcbiAgICBhcHAucmVsYXVuY2goKTtcbiAgICBhcHAucXVpdCgpO1xuICB9KTtcblxuICAvLyBOb3V2ZWF1IGdlc3Rpb25uYWlyZSBwb3VyIGNoYXJnZXIgbCdVUkwgZGUgZGV2XG4gIGlwY01haW4ub24oJ2VsZWN0cm9uOmxvYWQtZGV2LXVybCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnSVBDOiBSZWNlaXZlZCByZXF1ZXN0IHRvIGxvYWQgZGV2IFVSTCcpO1xuICAgIGNvbnN0IHdpbmRvdyA9IEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpLmZpbmQodyA9PiAhdy5pc0Rlc3Ryb3llZCgpKTtcbiAgICBpZiAod2luZG93KSB7XG4gICAgICBjb25zdCBkZXZTZXJ2ZXJVcmwgPSAnaHR0cDovL2xvY2FsaG9zdDozMDAwJztcbiAgICAgIGNvbnNvbGUubG9nKGBJUEM6IExvYWRpbmcgVVJMOiAke2RldlNlcnZlclVybH1gKTtcbiAgICAgIGF3YWl0IHdpbmRvdy5sb2FkVVJMKGRldlNlcnZlclVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0lQQzogQ291bGQgbm90IGZpbmQgbWFpbiB3aW5kb3cgdG8gbG9hZCBkZXYgVVJMLicpO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiaW1wb3J0IHR5cGUge1dyaXRlU3RyZWFtfSBmcm9tICdmcyc7XG5cbmltcG9ydCB7Y3JlYXRlV3JpdGVTdHJlYW0sIGV4aXN0c1N5bmMsIG1rZGlyU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtkaXJuYW1lfSBmcm9tICdwYXRoJztcblxuZXhwb3J0IGNvbnN0IHRlcm0gPSB7XG4gIFJlc2V0OiAnXFx4MWJbMG0nLFxuICBCb2xkOiAnXFx4MWJbMW0nLFxuICBOb0JvbGQ6ICdcXHgxYlsyMW0nLFxuICBEaW06ICdcXHgxYlsybScsXG4gIEl0YWxpYzogJ1xceDFiWzNtJyxcbiAgTm9JdGFsaWM6ICdcXHgxYlsyM20nLFxuICBVbmRlcnNjb3JlOiAnXFx4MWJbNG0nLFxuICBOb1VuZGVyc2NvcmU6ICdcXHgxYlsyNG0nLFxuICBCbGluazogJ1xceDFiWzVtJyxcbiAgUmV2ZXJzZTogJ1xceDFiWzdtJyxcbiAgSGlkZGVuOiAnXFx4MWJbOG0nLFxuXG4gIEZnQmxhY2s6ICdcXHgxYlszMG0nLFxuICBGZ1JlZDogJ1xceDFiWzMxbScsXG4gIEZnR3JlZW46ICdcXHgxYlszMm0nLFxuICBGZ1llbGxvdzogJ1xceDFiWzMzbScsXG4gIEZnQmx1ZTogJ1xceDFiWzM0bScsXG4gIEZnTWFnZW50YTogJ1xceDFiWzM1bScsXG4gIEZnQ3lhbjogJ1xceDFiWzM2bScsXG4gIEZnV2hpdGU6ICdcXHgxYlszN20nLFxuICBGZ0dyYXk6ICdcXHgxYls5MG0nLFxuXG4gIEJnQmxhY2s6ICdcXHgxYls0MG0nLFxuICBCZ1JlZDogJ1xceDFiWzQxbScsXG4gIEJnR3JlZW46ICdcXHgxYls0Mm0nLFxuICBCZ1llbGxvdzogJ1xceDFiWzQzbScsXG4gIEJnQmx1ZTogJ1xceDFiWzQ0bScsXG4gIEJnTWFnZW50YTogJ1xceDFiWzQ1bScsXG4gIEJnQ3lhbjogJ1xceDFiWzQ2bScsXG4gIEJnV2hpdGU6ICdcXHgxYls0N20nLFxuICBCZ0dyYXk6ICdcXHgxYlsxMDBtJyxcbn07XG5cbi8vID09PT09PT09PT0gQ29tcHJlc3Npb24gPT09PT09PT09PVxuXG5pbnRlcmZhY2UgQ29tcHJlc3NFbnRyeSB7XG4gIG1zZzogc3RyaW5nO1xuICBrZXk6IHN0cmluZztcbiAgbGV2ZWw/OiBzdHJpbmc7XG59XG5cbnR5cGUgQ29tcHJlc3NlZEl0ZW0gPVxuICB8IHtcbiAgICAgIHR5cGU6ICdyZXBlYXQnO1xuICAgICAgY291bnQ6IG51bWJlcjtcbiAgICAgIGVudHJpZXM6IEFycmF5PHtcbiAgICAgICAgZmlyc3Q6IENvbXByZXNzRW50cnk7XG4gICAgICAgIGxhc3Q6IENvbXByZXNzRW50cnk7XG4gICAgICAgIHZhcmllczogYm9vbGVhbjtcbiAgICAgIH0+O1xuICAgIH1cbiAgfCB7XG4gICAgICB0eXBlOiAnc2luZ2xlJztcbiAgICAgIGVudHJ5OiBDb21wcmVzc0VudHJ5O1xuICAgIH07XG5cbmludGVyZmFjZSBGb3JtYXR0ZWRMaW5lIHtcbiAgdGV4dDogc3RyaW5nO1xuICBsZXZlbDogc3RyaW5nO1xufVxuXG5jb25zdCBjb21wcmVzc1F1ZXVlID0gKFxuICBxdWV1ZTogQ29tcHJlc3NFbnRyeVtdLFxuICBtYXhQYXR0ZXJuTGVuID0gMTAsXG4pOiBDb21wcmVzc2VkSXRlbVtdID0+IHtcbiAgY29uc3QgcmVzdWx0OiBDb21wcmVzc2VkSXRlbVtdID0gW107XG4gIGxldCBpID0gMDtcbiAgd2hpbGUgKGkgPCBxdWV1ZS5sZW5ndGgpIHtcbiAgICBsZXQgYmVzdExlbiA9IDA7XG4gICAgbGV0IGJlc3RDb3VudCA9IDA7XG4gICAgbGV0IGJlc3RTYXZpbmdzID0gLUluZmluaXR5O1xuICAgIGNvbnN0IG1heFBMZW4gPSBNYXRoLm1pbihtYXhQYXR0ZXJuTGVuLCBNYXRoLmZsb29yKChxdWV1ZS5sZW5ndGggLSBpKSAvIDIpKTtcbiAgICBmb3IgKGxldCBwTGVuID0gMTsgcExlbiA8PSBtYXhQTGVuOyBwTGVuKyspIHtcbiAgICAgIGxldCBjb3VudCA9IDE7XG4gICAgICBsZXQgaiA9IGkgKyBwTGVuO1xuICAgICAgd2hpbGUgKGogKyBwTGVuIDw9IHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBsZXQgbWF0Y2ggPSB0cnVlO1xuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHBMZW47IGsrKykge1xuICAgICAgICAgIGlmIChxdWV1ZVtqICsga10ua2V5ICE9PSBxdWV1ZVtpICsga10ua2V5KSB7XG4gICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghbWF0Y2gpIGJyZWFrO1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICBqICs9IHBMZW47XG4gICAgICB9XG4gICAgICBpZiAoY291bnQgPiAxKSB7XG4gICAgICAgIGNvbnN0IHNhdmluZ3MgPSBwTGVuICogKGNvdW50IC0gMSkgLSAyO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgc2F2aW5ncyA+IGJlc3RTYXZpbmdzIHx8XG4gICAgICAgICAgKHNhdmluZ3MgPT09IGJlc3RTYXZpbmdzICYmIHBMZW4gPCBiZXN0TGVuKVxuICAgICAgICApIHtcbiAgICAgICAgICBiZXN0TGVuID0gcExlbjtcbiAgICAgICAgICBiZXN0Q291bnQgPSBjb3VudDtcbiAgICAgICAgICBiZXN0U2F2aW5ncyA9IHNhdmluZ3M7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJlc3RDb3VudCA+IDEgJiYgYmVzdFNhdmluZ3MgPj0gMCkge1xuICAgICAgY29uc3QgZW50cmllczogQXJyYXk8e1xuICAgICAgICBmaXJzdDogQ29tcHJlc3NFbnRyeTtcbiAgICAgICAgbGFzdDogQ29tcHJlc3NFbnRyeTtcbiAgICAgICAgdmFyaWVzOiBib29sZWFuO1xuICAgICAgfT4gPSBbXTtcbiAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgYmVzdExlbjsgaysrKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0ID0gcXVldWVbaSArIGtdO1xuICAgICAgICBjb25zdCBsYXN0ID0gcXVldWVbaSArIGJlc3RMZW4gKiAoYmVzdENvdW50IC0gMSkgKyBrXTtcbiAgICAgICAgZW50cmllcy5wdXNoKHtmaXJzdCwgbGFzdCwgdmFyaWVzOiBmaXJzdC5tc2cgIT09IGxhc3QubXNnfSk7XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaCh7dHlwZTogJ3JlcGVhdCcsIGNvdW50OiBiZXN0Q291bnQsIGVudHJpZXN9KTtcbiAgICAgIGkgKz0gYmVzdExlbiAqIGJlc3RDb3VudDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnB1c2goe3R5cGU6ICdzaW5nbGUnLCBlbnRyeTogcXVldWVbaV19KTtcbiAgICAgIGkrKztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmNvbnN0IGZvcm1hdENvbXByZXNzZWQgPSAoY29tcHJlc3NlZDogQ29tcHJlc3NlZEl0ZW1bXSk6IEZvcm1hdHRlZExpbmVbXSA9PiB7XG4gIGNvbnN0IGxpbmVzOiBGb3JtYXR0ZWRMaW5lW10gPSBbXTtcbiAgZm9yIChjb25zdCBpdGVtIG9mIGNvbXByZXNzZWQpIHtcbiAgICBpZiAoaXRlbS50eXBlID09PSAncmVwZWF0Jykge1xuICAgICAgbGluZXMucHVzaCh7dGV4dDogYC0tIHgke2l0ZW0uY291bnR9IC0tYCwgbGV2ZWw6ICdsb2cnfSk7XG4gICAgICBmb3IgKGNvbnN0IGUgb2YgaXRlbS5lbnRyaWVzKSB7XG4gICAgICAgIGNvbnN0IGxldmVsID0gZS5maXJzdC5sZXZlbCA/PyAnbG9nJztcbiAgICAgICAgaWYgKGUudmFyaWVzKSB7XG4gICAgICAgICAgbGluZXMucHVzaCh7dGV4dDogYCAgJHtlLmZpcnN0Lm1zZ31gLCBsZXZlbH0pO1xuICAgICAgICAgIGxpbmVzLnB1c2goe3RleHQ6IGAgICAgIC4uLiAtPiAke2UubGFzdC5tc2d9YCwgbGV2ZWx9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaW5lcy5wdXNoKHt0ZXh0OiBgICAke2UuZmlyc3QubXNnfWAsIGxldmVsfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpbmVzLnB1c2goe3RleHQ6ICctLSAtIC0tJywgbGV2ZWw6ICdsb2cnfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmVzLnB1c2goe3RleHQ6IGl0ZW0uZW50cnkubXNnLCBsZXZlbDogaXRlbS5lbnRyeS5sZXZlbCA/PyAnbG9nJ30pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbGluZXM7XG59O1xuXG4vLyA9PT09PT09PT09IExvZ2dlciA9PT09PT09PT09XG5cbnR5cGUgTG9nTGV2ZWwgPSAnbG9nJyB8ICdpbmZvJyB8ICd3YXJuJyB8ICdlcnJvcic7XG50eXBlIFZlcmJvc2VMZXZlbCA9IDAgfCAxIHwgMjtcblxuZXhwb3J0IGludGVyZmFjZSBMb2dPcHRpb25zIHtcbiAgdmVyYm9zZT86IFZlcmJvc2VMZXZlbDtcbiAgY29tcHJlc3NLZXk/OiBzdHJpbmc7XG4gIGZvcmNlRmx1c2g/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgUXVldWVFbnRyeSBleHRlbmRzIENvbXByZXNzRW50cnkge1xuICBsZXZlbDogTG9nTGV2ZWw7XG59XG5cbmNvbnN0IE1BWF9MT0dfU0laRSA9IDUwICogMTAyNDtcblxuY29uc3Qgc2FmZVdyaXRlID0gKGZuOiAoKSA9PiB2b2lkKSA9PiB7XG4gIHRyeSB7XG4gICAgZm4oKTtcbiAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICBpZiAoZXJyPy5jb2RlICE9PSAnRVBJUEUnKSB0aHJvdyBlcnI7XG4gIH1cbn07XG5cbmNvbnN0IGNyZWF0ZUNpcmN1bGFyUmVwbGFjZXIgPSAoKSA9PiB7XG4gIGNvbnN0IHNlZW4gPSBuZXcgV2Vha1NldDxvYmplY3Q+KCk7XG4gIHJldHVybiAoX2tleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikgPT4ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnKSByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgaWYgKHNlZW4uaGFzKHZhbHVlKSkgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgIHNlZW4uYWRkKHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufTtcblxuY29uc3Qgc3RyaW5naWZ5TG9nRGF0YSA9IChkYXRhOiB1bmtub3duKTogc3RyaW5nID0+IHtcbiAgaWYgKGRhdGEgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIGRhdGEuc3RhY2sgPz8gZGF0YS5tZXNzYWdlO1xuICB0cnkge1xuICAgIGNvbnN0IHN0cmluZ2lmaWVkID0gSlNPTi5zdHJpbmdpZnkoZGF0YSwgY3JlYXRlQ2lyY3VsYXJSZXBsYWNlcigpLCAyKTtcbiAgICByZXR1cm4gc3RyaW5naWZpZWQgPz8gU3RyaW5nKGRhdGEpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gU3RyaW5nKGRhdGEpO1xuICB9XG59O1xuXG5jb25zdCBmb3JtYXRDb25zb2xlQXJnID0gKGFyZzogdW5rbm93bik6IHN0cmluZyA9PiB7XG4gIGlmIChhcmcgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIGFyZy5zdGFjayA/PyBhcmcubWVzc2FnZTtcbiAgaWYgKHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbCkgcmV0dXJuIHN0cmluZ2lmeUxvZ0RhdGEoYXJnKTtcbiAgcmV0dXJuIFN0cmluZyhhcmcpO1xufTtcblxuY29uc3QgZm9ybWF0QXJncyA9IChtZXNzYWdlOiBzdHJpbmcsIGRhdGE/OiB1bmtub3duKTogc3RyaW5nID0+IHtcbiAgbGV0IHJlc3VsdCA9IG1lc3NhZ2U7XG4gIGlmIChkYXRhICE9PSB1bmRlZmluZWQgJiYgZGF0YSAhPT0gbnVsbCkge1xuICAgIHJlc3VsdCA9IGAke21lc3NhZ2V9ICR7c3RyaW5naWZ5TG9nRGF0YShkYXRhKX1gO1xuICB9XG4gIGlmIChyZXN1bHQubGVuZ3RoID4gTUFYX0xPR19TSVpFKSB7XG4gICAgcmV0dXJuIHJlc3VsdC5zbGljZSgwLCBNQVhfTE9HX1NJWkUpICsgJyAuLi4nO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5jbGFzcyBFbGVjdHJvbkxvZ2dlciB7XG4gIHByaXZhdGUgbG9nU3RyZWFtOiBXcml0ZVN0cmVhbSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGxldmVsSGVhZGVyczogUmVjb3JkPExvZ0xldmVsLCBzdHJpbmc+ID0ge30gYXMgYW55O1xuICBwcml2YXRlIHRocmVzaG9sZDogVmVyYm9zZUxldmVsID0gMDtcbiAgcHJpdmF0ZSBxdWV1ZTogUXVldWVFbnRyeVtdID0gW107XG4gIHByaXZhdGUgcXVpZXRUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBvcmlnaW5hbENvbnNvbGUgPSB7XG4gICAgbG9nOiBjb25zb2xlLmxvZyxcbiAgICBpbmZvOiBjb25zb2xlLmluZm8sXG4gICAgd2FybjogY29uc29sZS53YXJuLFxuICAgIGVycm9yOiBjb25zb2xlLmVycm9yLFxuICB9O1xuXG4gIGluaXQobG9nRmlsZVBhdGg/OiBzdHJpbmcpIHtcbiAgICBpZiAoIWxvZ0ZpbGVQYXRoKSByZXR1cm47XG5cbiAgICBjb25zdCBkaXIgPSBkaXJuYW1lKGxvZ0ZpbGVQYXRoKTtcbiAgICB0cnkge1xuICAgICAgaWYgKCFleGlzdHNTeW5jKGRpcikpIHtcbiAgICAgICAgbWtkaXJTeW5jKGRpciwge3JlY3Vyc2l2ZTogdHJ1ZX0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gVGhlIHN0cmVhbSdzIG93biBvcGVuIHRoZW4gZmFpbHMgdG9vLCBhbmQgaXMgZHJvcHBlZCBiZWxvdy5cbiAgICB9XG4gICAgdGhpcy5sb2dTdHJlYW0gPSBjcmVhdGVXcml0ZVN0cmVhbShsb2dGaWxlUGF0aCwge2ZsYWdzOiAndysnfSk7XG4gICAgLy8gQSBmYWlsZWQgd3JpdGUgKGUuZy4gRU5PU1BDKSBpcyBlbWl0dGVkIGhlcmU7IHdpdGggbm8gbGlzdGVuZXIgaXQgaXMgYW5cbiAgICAvLyB1bmNhdWdodCBleGNlcHRpb24gaW4gdGhlIG1haW4gcHJvY2Vzcy4gRHJvcCBpdDogc3RheWluZyBhbGl2ZSBiZWF0cyB0aGVcbiAgICAvLyBsb2cgbGluZS5cbiAgICB0aGlzLmxvZ1N0cmVhbS5vbignZXJyb3InLCAoKSA9PiB7fSk7XG5cbiAgICB0aGlzLm9yaWdpbmFsQ29uc29sZSA9IHtcbiAgICAgIGxvZzogY29uc29sZS5sb2csXG4gICAgICBpbmZvOiBjb25zb2xlLmluZm8sXG4gICAgICB3YXJuOiBjb25zb2xlLndhcm4sXG4gICAgICBlcnJvcjogY29uc29sZS5lcnJvcixcbiAgICB9O1xuXG4gICAgY29uc3QgYmFzZSA9IGAke3Rlcm0uQmdDeWFufSR7dGVybS5GZ1doaXRlfSR7dGVybS5Cb2xkfSBbRUxFQ1RST05dYDtcbiAgICB0aGlzLmxldmVsSGVhZGVycyA9IHtcbiAgICAgIGxvZzogYCR7YmFzZX0gICR7dGVybS5SZXNldH1gLFxuICAgICAgaW5mbzogYCR7YmFzZX0gJHt0ZXJtLkJnQmx1ZX0gSU5GTyAke3Rlcm0uUmVzZXR9YCxcbiAgICAgIHdhcm46IGAke2Jhc2V9ICR7dGVybS5CZ1llbGxvd30gV0FSTiAke3Rlcm0uUmVzZXR9YCxcbiAgICAgIGVycm9yOiBgJHtiYXNlfSAke3Rlcm0uQmdSZWR9IEVSUk9SICR7dGVybS5SZXNldH1gLFxuICAgIH07XG5cbiAgICBjb25zb2xlLmxvZyA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgY29uc3QgbXNnID0gYXJncy5tYXAoZm9ybWF0Q29uc29sZUFyZykuam9pbignICcpO1xuICAgICAgdGhpcy5sb2cobXNnKTtcbiAgICB9O1xuICAgIGNvbnNvbGUuaW5mbyA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgY29uc3QgbXNnID0gYXJncy5tYXAoZm9ybWF0Q29uc29sZUFyZykuam9pbignICcpO1xuICAgICAgdGhpcy5pbmZvKG1zZyk7XG4gICAgfTtcbiAgICBjb25zb2xlLndhcm4gPSAoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgIGNvbnN0IG1zZyA9IGFyZ3MubWFwKGZvcm1hdENvbnNvbGVBcmcpLmpvaW4oJyAnKTtcbiAgICAgIHRoaXMud2Fybihtc2cpO1xuICAgIH07XG4gICAgY29uc29sZS5lcnJvciA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgY29uc3QgbXNnID0gYXJncy5tYXAoZm9ybWF0Q29uc29sZUFyZykuam9pbignICcpO1xuICAgICAgdGhpcy5lcnJvcihtc2cpO1xuICAgIH07XG4gIH1cblxuICBzZXRUaHJlc2hvbGQobGV2ZWw6IFZlcmJvc2VMZXZlbCkge1xuICAgIHRoaXMudGhyZXNob2xkID0gbGV2ZWw7XG4gIH1cblxuICBsb2cobWVzc2FnZTogc3RyaW5nLCBkYXRhPzogdW5rbm93biwgb3B0cz86IExvZ09wdGlvbnMpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0KCdsb2cnLCBtZXNzYWdlLCBkYXRhLCBvcHRzKTtcbiAgfVxuICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgZGF0YT86IHVua25vd24sIG9wdHM/OiBMb2dPcHRpb25zKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdCgnaW5mbycsIG1lc3NhZ2UsIGRhdGEsIG9wdHMpO1xuICB9XG4gIHdhcm4obWVzc2FnZTogc3RyaW5nLCBkYXRhPzogdW5rbm93biwgb3B0cz86IExvZ09wdGlvbnMpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0KCd3YXJuJywgbWVzc2FnZSwgZGF0YSwgb3B0cyk7XG4gIH1cbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBkYXRhPzogdW5rbm93biwgb3B0cz86IExvZ09wdGlvbnMpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0KCdlcnJvcicsIG1lc3NhZ2UsIGRhdGEsIG9wdHMpO1xuICB9XG5cbiAgZmx1c2goKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucXVldWUubGVuZ3RoID09PSAwIHx8ICF0aGlzLmxvZ1N0cmVhbSkgcmV0dXJuO1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLnF1ZXVlO1xuICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICBpZiAodGhpcy5xdWlldFRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5xdWlldFRpbWVyKTtcbiAgICAgIHRoaXMucXVpZXRUaW1lciA9IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbXByZXNzZWQgPSBjb21wcmVzc1F1ZXVlKGVudHJpZXMpO1xuICAgIGNvbnN0IGxpbmVzID0gZm9ybWF0Q29tcHJlc3NlZChjb21wcmVzc2VkKTtcbiAgICBmb3IgKGNvbnN0IHt0ZXh0LCBsZXZlbH0gb2YgbGluZXMpIHtcbiAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgaGVhZGVyID1cbiAgICAgICAgICB0aGlzLmxldmVsSGVhZGVyc1tsZXZlbCBhcyBMb2dMZXZlbF0gPz8gdGhpcy5sZXZlbEhlYWRlcnMubG9nO1xuICAgICAgICBzYWZlV3JpdGUoKCkgPT4gdGhpcy5sb2dTdHJlYW0hLndyaXRlKGAke2hlYWRlcn0gJHt0ZXh0fVxcbmApKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB3YWl0Rm9yRHJhaW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5mbHVzaCgpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGlmICghdGhpcy5sb2dTdHJlYW0pIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmxvZ1N0cmVhbS53cml0ZSgnJywgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2VtaXQoXG4gICAgbGV2ZWw6IExvZ0xldmVsLFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBkYXRhPzogdW5rbm93bixcbiAgICBvcHRzPzogTG9nT3B0aW9ucyxcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgdmVyYm9zZSA9IG9wdHM/LnZlcmJvc2UgPz8gMDtcbiAgICBpZiAodmVyYm9zZSA+IHRoaXMudGhyZXNob2xkKSByZXR1cm47XG4gICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0QXJncyhtZXNzYWdlLCBkYXRhKTtcbiAgICBzYWZlV3JpdGUoKCkgPT4gdGhpcy5vcmlnaW5hbENvbnNvbGVbbGV2ZWxdKGZvcm1hdHRlZCkpO1xuICAgIGNvbnN0IGtleSA9IG9wdHM/LmNvbXByZXNzS2V5ID8/IGZvcm1hdHRlZDtcbiAgICB0aGlzLnF1ZXVlLnB1c2goe21zZzogZm9ybWF0dGVkLCBrZXksIGxldmVsfSk7XG5cbiAgICBpZiAob3B0cz8uZm9yY2VGbHVzaCkge1xuICAgICAgdGhpcy5mbHVzaCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3NjaGVkdWxlRmx1c2goKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NjaGVkdWxlRmx1c2goKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucXVpZXRUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMucXVpZXRUaW1lcik7XG4gICAgdGhpcy5xdWlldFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLmZsdXNoKCksIDMwMDApO1xuICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA+PSA1MDApIHRoaXMuZmx1c2goKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgc2VyaWFsaXplRm9yTG9nID0gKHZhbHVlOiB1bmtub3duKTogdW5rbm93biA9PiB7XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgY29uc3Qgb2JqOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKSkge1xuICAgICAgY29uc3QgdiA9ICh2YWx1ZSBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtrZXldO1xuICAgICAgb2JqW2tleV0gPSB2IGluc3RhbmNlb2YgRXJyb3IgPyBzZXJpYWxpemVGb3JMb2codikgOiB2O1xuICAgIH1cbiAgICBvYmouX3R5cGUgPSB2YWx1ZS5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIHJldHVybiBvYmo7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufTtcblxuZXhwb3J0IGNvbnN0IGVsZWN0cm9uTG9nZ2VyID0gbmV3IEVsZWN0cm9uTG9nZ2VyKCk7XG4iLCJpbXBvcnQgdHlwZSB7Q2hpbGRQcm9jZXNzfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuaW1wb3J0IHthcHAsIGlwY01haW59IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IHtzZW5kVG9BbGxXaW5kb3dzfSBmcm9tICdAL21haW5XaW5kb3cnO1xuXG5pbXBvcnQgdHlwZSB7VGVybWluYXRlZFN1YnByb2Nlc3N9IGZyb20gJy4uLy4uLy4uL3R5cGVzL3N1YnByb2Nlc3NUZXJtaW5hdGlvbic7XG5cbmltcG9ydCB7ZWxlY3Ryb25Mb2dnZXJ9IGZyb20gJy4vdXRpbHMvbG9nZ2VyLnV0aWxzJztcblxuY29uc3QgU1VCUFJPQ0VTU19URVJNSU5BVEVEX1JPVVRFID0gJ2VsZWN0cm9uOnN1YnByb2Nlc3MtdGVybWluYXRlZCc7XG5jb25zdCBHRVRfVEVSTUlOQVRFRF9TVUJQUk9DRVNTX1JPVVRFID0gJ2VsZWN0cm9uOmdldC10ZXJtaW5hdGVkLXN1YnByb2Nlc3MnO1xuXG5sZXQgaXNBcHBRdWl0dGluZyA9IGZhbHNlO1xubGV0IHRlcm1pbmF0ZWRTdWJwcm9jZXNzOiBUZXJtaW5hdGVkU3VicHJvY2VzcyB8IHVuZGVmaW5lZDtcblxuYXBwLm9uKCdiZWZvcmUtcXVpdCcsICgpID0+IHtcbiAgaXNBcHBRdWl0dGluZyA9IHRydWU7XG59KTtcblxuLy8gVGhlIHJlbmRlcmVyIHVzdWFsbHkgbW91bnRzIGFmdGVyIGEgc3VicHJvY2VzcyBibG9ja2VkIGF0IHNwYXduIGhhcyBhbHJlYWR5XG4vLyBkaWVkLCBzbyB0aGUgcHVzaCBhbG9uZSB3b3VsZCBiZSBsb3N0OiBpdCBwdWxscyB0aGlzIG9uIHN1YnNjcmliZSBhcyB3ZWxsLlxuaXBjTWFpbi5oYW5kbGUoR0VUX1RFUk1JTkFURURfU1VCUFJPQ0VTU19ST1VURSwgKCkgPT4gdGVybWluYXRlZFN1YnByb2Nlc3MpO1xuXG5jb25zdCBub3RpZnlUZXJtaW5hdGVkID0gKGRldGFpbHM6IFRlcm1pbmF0ZWRTdWJwcm9jZXNzKSA9PiB7XG4gIGlmICh0ZXJtaW5hdGVkU3VicHJvY2VzcykgcmV0dXJuO1xuXG4gIHRlcm1pbmF0ZWRTdWJwcm9jZXNzID0gZGV0YWlscztcbiAgZWxlY3Ryb25Mb2dnZXIuZXJyb3IoJ1N1YnByb2Nlc3MgdGVybWluYXRlZCB1bmV4cGVjdGVkbHknLCBkZXRhaWxzLCB7XG4gICAgZm9yY2VGbHVzaDogdHJ1ZSxcbiAgfSk7XG4gIHNlbmRUb0FsbFdpbmRvd3MoU1VCUFJPQ0VTU19URVJNSU5BVEVEX1JPVVRFLCBkZXRhaWxzKTtcbn07XG5cbi8qKlxuICogVGVsbHMgdGhlIGZyb250IHdoZW4gYSBzdWJwcm9jZXNzIEF1dG9DdXQgY2Fubm90IHJ1biB3aXRob3V0IGRpZXMgb24gaXRzIG93blxuICogKGFudGl2aXJ1cywgc2VjdXJpdHkgcG9saWN5LCBjcmFzaCkuIEV4aXRzIGVsZWN0cm9uIGNhdXNlZCBpdHNlbGYg4oCUIGl0cyBvd25cbiAqIGBraWxsKClgIG9yIGFwcCBxdWl0IOKAlCBhcmUgbm9ybWFsIHNodXRkb3duLiBgaWdub3JlZEV4aXRDb2Rlc2AgYXJlIGV4aXRzIHRoZVxuICogY2FsbGVyIGFscmVhZHkgaGFuZGxlcyBieSBxdWl0dGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IHdhdGNoU3VicHJvY2Vzc1Rlcm1pbmF0aW9uID0gKFxuICBpbnN0YW5jZTogQ2hpbGRQcm9jZXNzLFxuICBuYW1lOiBUZXJtaW5hdGVkU3VicHJvY2Vzc1snbmFtZSddLFxuICB7aWdub3JlZEV4aXRDb2RlcyA9IFtdfToge2lnbm9yZWRFeGl0Q29kZXM/OiBudW1iZXJbXX0gPSB7fSxcbikgPT4ge1xuICBpbnN0YW5jZS5vbignZXhpdCcsIChjb2RlLCBzaWduYWwpID0+IHtcbiAgICBpZiAoaXNBcHBRdWl0dGluZyB8fCBpbnN0YW5jZS5raWxsZWQpIHJldHVybjtcbiAgICBpZiAoY29kZSAhPT0gbnVsbCAmJiBpZ25vcmVkRXhpdENvZGVzLmluY2x1ZGVzKGNvZGUpKSByZXR1cm47XG5cbiAgICBub3RpZnlUZXJtaW5hdGVkKHtjb2RlLCBuYW1lLCBzaWduYWx9KTtcbiAgfSk7XG5cbiAgLy8gQSBzcGF3biByZWZ1c2VkIG91dHJpZ2h0IG1heSBlbWl0IGBlcnJvcmAgd2l0aG91dCBhbnkgYGV4aXRgLlxuICBpbnN0YW5jZS5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgaWYgKGlzQXBwUXVpdHRpbmcgfHwgaW5zdGFuY2UucGlkICE9PSB1bmRlZmluZWQpIHJldHVybjtcblxuICAgIG5vdGlmeVRlcm1pbmF0ZWQoe2NvZGU6IG51bGwsIGVycm9yOiBlcnJvci5tZXNzYWdlLCBuYW1lLCBzaWduYWw6IG51bGx9KTtcbiAgfSk7XG59O1xuIiwiaW1wb3J0IHR5cGUge0NoaWxkUHJvY2Vzc30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmltcG9ydCB7c2hhcmVkVmFyaWFibGVzfSBmcm9tICdAL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3NoYXJlZFZhcmlhYmxlcy5zdGFydC51dGlscyc7XG5pbXBvcnQge2Zvcmt9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHthcHB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7bWtkaXJTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHt3YXRjaFN1YnByb2Nlc3NUZXJtaW5hdGlvbn0gZnJvbSAnLi9zdWJwcm9jZXNzVGVybWluYXRpb24nO1xuaW1wb3J0IHtkb3dubG9hZEZpbGV9IGZyb20gJy4vdXRpbHMvYXhpb3MudXRpbHMnO1xuaW1wb3J0IHtlbGVjdHJvbkxvZ2dlcn0gZnJvbSAnLi91dGlscy9sb2dnZXIudXRpbHMnO1xuXG5leHBvcnQgbGV0IGhvc3RTZXJ2ZXJJbnN0YW5jZTogQ2hpbGRQcm9jZXNzIHwgbnVsbCA9IG51bGw7XG5cbmNvbnN0IGdldEhvc3RTZXJ2ZXJJbnN0YW5jZURpYWdub3N0aWNzID0gKCkgPT4ge1xuICBpZiAoIWhvc3RTZXJ2ZXJJbnN0YW5jZSkgcmV0dXJuIHtoYXNJbnN0YW5jZTogZmFsc2V9O1xuXG4gIHJldHVybiB7XG4gICAgY29ubmVjdGVkOiBob3N0U2VydmVySW5zdGFuY2UuY29ubmVjdGVkLFxuICAgIGV4aXRDb2RlOiBob3N0U2VydmVySW5zdGFuY2UuZXhpdENvZGUsXG4gICAgaGFzSW5zdGFuY2U6IHRydWUsXG4gICAga2lsbGVkOiBob3N0U2VydmVySW5zdGFuY2Uua2lsbGVkLFxuICAgIHBpZDogaG9zdFNlcnZlckluc3RhbmNlLnBpZCxcbiAgICBzaWduYWxDb2RlOiBob3N0U2VydmVySW5zdGFuY2Uuc2lnbmFsQ29kZSxcbiAgICBzcGF3bmZpbGU6IGhvc3RTZXJ2ZXJJbnN0YW5jZS5zcGF3bmZpbGUsXG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgZG93bmxvYWRIb3N0U2VydmVyTWFpbiA9IGFzeW5jICgpID0+XG4gIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmICghc2hhcmVkVmFyaWFibGVzPy5IT1NUX1NFUlZFUl9VUkwpIHJldHVybjtcbiAgICBpZiAoIXNoYXJlZFZhcmlhYmxlcz8uVEVNUF9GT0xERVJfUEFUSCkgcmV0dXJuO1xuXG4gICAgY29uc3QgZG93bmxvYWRVcmwgPSBuZXcgVVJMKCdtYWluLmNqcycsIHNoYXJlZFZhcmlhYmxlcy5IT1NUX1NFUlZFUl9VUkwpXG4gICAgICAuaHJlZjtcbiAgICBjb25zb2xlLmxvZygnRG93bmxvYWRpbmcgaG9zdCBzZXJ2ZXIgc2NyaXB0IGZyb20nLCBkb3dubG9hZFVybCk7XG5cbiAgICBjb25zdCB3cml0ZVBhdGggPSBwYXRoLmpvaW4oXG4gICAgICBzaGFyZWRWYXJpYWJsZXMuVEVNUF9GT0xERVJfUEFUSCxcbiAgICAgICdjb20uYXV0b2N1dC5ob3N0U2VydmVyJyxcbiAgICApO1xuICAgIGNvbnNvbGUubG9nKCdXcml0aW5nIGhvc3Qgc2VydmVyIHRvJywgd3JpdGVQYXRoKTtcblxuICAgIG1rZGlyU3luYyh3cml0ZVBhdGgsIHtyZWN1cnNpdmU6IHRydWV9KTtcbiAgICAvLyBtYWluLmNqcyBsaXZlcyBhdCBhIG11dGFibGUgVVJMLCBzbyBhIGNhY2hlZCBjb3B5IG1lYW5zIHJ1bm5pbmcgYVxuICAgIC8vIGRlcHJlY2F0ZWQgYnVpbGQuXG4gICAgZG93bmxvYWRGaWxlKGRvd25sb2FkVXJsLCB3cml0ZVBhdGgsIHt3aXRoQ2FjaGU6IGZhbHNlfSlcbiAgICAgIC50aGVuKGZpbGVQYXRoID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYEhvc3Qgc2VydmVyIHNjcmlwdCBkb3dubG9hZGVkIHRvICR7ZmlsZVBhdGh9YCk7XG4gICAgICAgIHJlc29sdmUoZmlsZVBhdGgpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBgRXJyb3Igb2NjdXJzIHdoaWxlIGRvd25sb2FkaW5nIGhvc3Qgc2VydmVyIHNjcmlwdCB0byAke3dyaXRlUGF0aH1gLFxuICAgICAgICAgIGVycixcbiAgICAgICAgKTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9KTtcbiAgfSk7XG5cbmV4cG9ydCBjb25zdCBzdG9wSG9zdFNlcnZlciA9IChyZWFzb24gPSAndW5zcGVjaWZpZWQnKSA9PiB7XG4gIGVsZWN0cm9uTG9nZ2VyLmxvZyhcbiAgICAnU3RvcHBpbmcgaG9zdCBzZXJ2ZXInLFxuICAgIHtcbiAgICAgIHJlYXNvbixcbiAgICAgIC4uLmdldEhvc3RTZXJ2ZXJJbnN0YW5jZURpYWdub3N0aWNzKCksXG4gICAgfSxcbiAgICB7Zm9yY2VGbHVzaDogdHJ1ZX0sXG4gICk7XG4gIGhvc3RTZXJ2ZXJJbnN0YW5jZT8ua2lsbCgpO1xufTtcblxuZXhwb3J0IGNvbnN0IHN0YXJ0SG9zdFNlcnZlciA9IGFzeW5jIChcbiAgc2hhcmVkVmFyaWFibGVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWQ+LFxuKSA9PiB7XG4gIGNvbnNvbGUubG9nKCdTdGFydGluZyBob3N0IHNlcnZlcicpO1xuICB0cnkge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gYXdhaXQgZG93bmxvYWRIb3N0U2VydmVyTWFpbigpO1xuICAgIGlmIChob3N0U2VydmVySW5zdGFuY2UgIT09IG51bGwpIHtcbiAgICAgIGVsZWN0cm9uTG9nZ2VyLndhcm4oXG4gICAgICAgICdFeGlzdGluZyBob3N0LXNlcnZlciBpbnN0YW5jZSBmb3VuZCBiZWZvcmUgc3RhcnQ7IGtpbGxpbmcgaXQnLFxuICAgICAgICB7XG4gICAgICAgICAgLi4uZ2V0SG9zdFNlcnZlckluc3RhbmNlRGlhZ25vc3RpY3MoKSxcbiAgICAgICAgfSxcbiAgICAgICAge2ZvcmNlRmx1c2g6IHRydWV9LFxuICAgICAgKTtcbiAgICAgIGhvc3RTZXJ2ZXJJbnN0YW5jZS5raWxsKCk7XG4gICAgfVxuICAgIGhvc3RTZXJ2ZXJJbnN0YW5jZSA9IGZvcmsoZmlsZVBhdGgsIFtdLCB7XG4gICAgICBleGVjQXJndjogWyctLWluc3BlY3Q9OTkzMSddLFxuICAgICAgZW52OiB7XG4gICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAuLi5zaGFyZWRWYXJpYWJsZXMsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKCdIb3N0IHNlcnZlciBmb3JrZWQnLCB7XG4gICAgICBleGVjQXJndjogWyctLWluc3BlY3Q9OTkzMSddLFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBwaWQ6IGhvc3RTZXJ2ZXJJbnN0YW5jZS5waWQsXG4gICAgICBwbGF0Zm9ybTogcHJvY2Vzcy5wbGF0Zm9ybSxcbiAgICB9KTtcbiAgICBob3N0U2VydmVySW5zdGFuY2Uub24oJ3NwYXduJywgKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ0hvc3Qgc2VydmVyIHNwYXduZWQnLCBnZXRIb3N0U2VydmVySW5zdGFuY2VEaWFnbm9zdGljcygpKTtcbiAgICB9KTtcbiAgICBob3N0U2VydmVySW5zdGFuY2Uub24oJ2Rpc2Nvbm5lY3QnLCAoKSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oJ0hvc3Qgc2VydmVyIElQQyBjaGFubmVsIGRpc2Nvbm5lY3RlZCcsIHtcbiAgICAgICAgLi4uZ2V0SG9zdFNlcnZlckluc3RhbmNlRGlhZ25vc3RpY3MoKSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGhvc3RTZXJ2ZXJJbnN0YW5jZS5vbignZXJyb3InLCBlcnIgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcignSG9zdCBzZXJ2ZXIgY2hpbGQgcHJvY2VzcyBlcnJvcicsIHtcbiAgICAgICAgZXJyb3I6IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLnN0YWNrIDogZXJyLFxuICAgICAgICAuLi5nZXRIb3N0U2VydmVySW5zdGFuY2VEaWFnbm9zdGljcygpLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaG9zdFNlcnZlckluc3RhbmNlLm9uKCdleGl0JywgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgZWxlY3Ryb25Mb2dnZXIuZXJyb3IoXG4gICAgICAgICdIb3N0IHNlcnZlciBleGl0ZWQnLFxuICAgICAgICB7XG4gICAgICAgICAgY29kZSxcbiAgICAgICAgICBzaWduYWwsXG4gICAgICAgICAgLi4uZ2V0SG9zdFNlcnZlckluc3RhbmNlRGlhZ25vc3RpY3MoKSxcbiAgICAgICAgfSxcbiAgICAgICAge2ZvcmNlRmx1c2g6IHRydWV9LFxuICAgICAgKTtcbiAgICAgIGlmIChjb2RlID09PSAxMCkge1xuICAgICAgICBlbGVjdHJvbkxvZ2dlci5sb2coXG4gICAgICAgICAgJ0hvc3Qgc2VydmVyIGV4aXRlZCB3aXRoIGNvZGUgMTAsIGNsb3NpbmcgQXV0b0N1dCcsXG4gICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgIHtmb3JjZUZsdXNoOiB0cnVlfSxcbiAgICAgICAgKTtcbiAgICAgICAgYXBwLnF1aXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiBzdG9wSG9zdFNlcnZlcignZWxlY3Ryb24gU0lHSU5UJykpO1xuICAgIHByb2Nlc3Mub24oJ1NJR1RFUk0nLCAoKSA9PiBzdG9wSG9zdFNlcnZlcignZWxlY3Ryb24gU0lHVEVSTScpKTtcbiAgICBwcm9jZXNzLm9uKCdleGl0JywgKCkgPT4gc3RvcEhvc3RTZXJ2ZXIoJ2VsZWN0cm9uIGV4aXQnKSk7XG5cbiAgICAvLyBDb2RlIDEwIGlzIGhvc3Qtc2VydmVyIGFza2luZyBBdXRvQ3V0IHRvIGNsb3NlIChob3N0IGNsb3NlZCksIGhhbmRsZWRcbiAgICAvLyBhYm92ZSBieSBxdWl0dGluZy5cbiAgICB3YXRjaFN1YnByb2Nlc3NUZXJtaW5hdGlvbihob3N0U2VydmVySW5zdGFuY2UsICdob3N0U2VydmVyJywge1xuICAgICAgaWdub3JlZEV4aXRDb2RlczogWzEwXSxcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKCdIb3N0IHNlcnZlciBzdGFydGVkJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUpO1xuICB9XG59O1xuIiwiaW1wb3J0IHtJcGNTZXJ2ZXJ9IGZyb20gJ0BrZXppb3Mvbm9kZS1pcGMnO1xuaW1wb3J0IHtpcGNNYWlufSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQge3RtcGRpcn0gZnJvbSAnb3MnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtzZW5kVG9BbGxXaW5kb3dzfSBmcm9tICdAL21haW5XaW5kb3cnO1xuXG5pbXBvcnQgdHlwZSB7RnJvbnRJcGNNZXNzYWdlLCBGcm9udElwY1N0YXRNZXNzYWdlfSBmcm9tICcuLi8uLi8uLi90eXBlcy9mcm9udElwYyc7XG5cbi8qKlxuICogRnJvbnQtb3duZWQgcHVzaCBjaGFubmVsOiB0aGUgUFBybyBidXN5IG1vZGFsIGNvbm5lY3RzIGFzIGEgY2xpZW50IGFuZCBvbmx5XG4gKiBsaXN0ZW5zLCBmcm9udCBvbmx5IHB1c2hlcy4gTWlycm9yZWQgaW5cbiAqIGBhcHBzL2NsaWVudC1zaWRlL3Bwcm8vc3JjL2pzL2J1c3kvZnJvbnRJcGMuY29udHJhY3QudHNgIOKAlCB0aGUgdHdvIGFwcHMgYXJlXG4gKiBpbnN0YWxsZWQgc2VwYXJhdGVseSAobm8gd29ya3NwYWNlLCBubyBzaGFyZWQgcGFja2FnZSksIHNvIGJvdGggY29waWVzIGhhdmUgdG9cbiAqIGNoYW5nZSB0b2dldGhlci5cbiAqL1xuY29uc3QgRlJPTlRfSVBDX0NIQU5ORUwgPSAnY29tLmF1dG9jdXQuZnJvbnQnO1xuY29uc3QgRlJPTlRfSVBDX01FU1NBR0VfRVZFTlQgPSAnbWVzc2FnZSc7XG5jb25zdCBGUk9OVF9JUENfQ0FOQ0VMX0VWRU5UID0gJ2NhbmNlbCc7XG5jb25zdCBGUk9OVF9JUENfU1RBVF9FVkVOVCA9ICdzdGF0JztcblxuZXhwb3J0IGNvbnN0IEZST05UX0lQQ19TRU5EX01FU1NBR0VfUk9VVEUgPSAnZnJvbnQtaXBjOnNlbmQtbWVzc2FnZSc7XG5leHBvcnQgY29uc3QgRlJPTlRfSVBDX0NBTkNFTF9SRVFVRVNURURfUk9VVEUgPSAnZnJvbnQtaXBjOmNhbmNlbC1yZXF1ZXN0ZWQnO1xuZXhwb3J0IGNvbnN0IEZST05UX0lQQ19TVEFUX1JPVVRFID0gJ2Zyb250LWlwYzpzdGF0JztcblxuLyoqXG4gKiBEZXJpdmVkIGhlcmUgcmF0aGVyIHRoYW4gcmVhZCBmcm9tIGBzaGFyZWRWYXJpYWJsZXMuVEVNUF9GT0xERVJfUEFUSGAsIHdoaWNoXG4gKiBpcyBvbmx5IGFzc2lnbmVkIGxhdGUgaW4gdGhlIHN0YXJ0dXAgc2VxdWVuY2Ug4oCUIGFmdGVyIGBpbml0SVBDSGFuZGxlcnNgIHJ1bnMuXG4gKiBUaGlzIGlzIHRoZSBzYW1lIGRlcml2YXRpb24gdGhlIHByZWxvYWQgYW5kIHRoZSBidXN5IHBhbmVsIHVzZSwgYW5kIHRob3NlIGFyZVxuICogdGhlIHR3byBzaWRlcyB0aGF0IG11c3QgYWdyZWUgb24gdGhlIHBhdGguXG4gKi9cbmNvbnN0IHNvY2tldFJvb3RQYXRoID0gam9pbih0bXBkaXIoKSwgJ2NvbS5hdXRvY3V0JywgJ2NvbS5hdXRvY3V0LmFlYScpO1xuXG5sZXQgZnJvbnRJcGNTZXJ2ZXI6IElwY1NlcnZlciB8IHVuZGVmaW5lZDtcbmxldCBmcm9udElwY01lc3NhZ2VSb3V0ZVJlZ2lzdGVyZWQgPSBmYWxzZTtcblxuLyoqXG4gKiBJbmJvdW5kIHBheWxvYWRzIGFyZSBvbmx5IHdoYXQgdGhlIGNvbm5lY3RlZCBwYW5lbCBjbGFpbXMgdGhleSBhcmUg4oCUIGEgcGFuZWxcbiAqIGZyb20gYW5vdGhlciBBdXRvQ3V0IHZlcnNpb24gaXMgYSBzdXBwb3J0ZWQgY2FzZSDigJQgc28gdGhlIHNoYXBlIGlzIGNoZWNrZWRcbiAqIGhlcmUgcmF0aGVyIHRoYW4gY2FzdC4gVGhlIHJlbmRlcmVyIHN0aWxsIG93bnMgd2hldGhlciB0aGUgbmFtZSBpcyBvbmUgaXRcbiAqIGtub3dzLCBidXQgaXRzIGd1YXJkIHJlYWRzIGBzdGF0YCBvZmYgdGhlIG1lc3NhZ2UgYW5kIHdvdWxkIHRocm93IG9uIGFueXRoaW5nXG4gKiB0aGF0IGlzIG5vdCBhbiBvYmplY3QuXG4gKi9cbmNvbnN0IGlzRnJvbnRJcGNTdGF0TWVzc2FnZSA9IChcbiAgbWVzc2FnZURhdGE6IHVua25vd24sXG4pOiBtZXNzYWdlRGF0YSBpcyBGcm9udElwY1N0YXRNZXNzYWdlID0+XG4gIHR5cGVvZiBtZXNzYWdlRGF0YSA9PT0gJ29iamVjdCcgJiZcbiAgbWVzc2FnZURhdGEgIT09IG51bGwgJiZcbiAgdHlwZW9mIChtZXNzYWdlRGF0YSBhcyB7c3RhdD86IHVua25vd259KS5zdGF0ID09PSAnc3RyaW5nJztcblxuLyoqXG4gKiBGcmVlIHRoZSBzZXJ2ZXIgc2xvdCBhZnRlciBhIGZhaWx1cmUsIHNvIHRoZSBzZWNvbmQgYGluaXRJUENIYW5kbGVyc2AgY2FuXG4gKiBidWlsZCBhIGZyZXNoIHNlcnZlciBpbnN0ZWFkIG9mIGZpbmRpbmcgYSBkZWFkIG9uZSBhbmQgZ2l2aW5nIHVwLiBHdWFyZGVkIG9uXG4gKiBpZGVudGl0eSBiZWNhdXNlIHRoZSBhc3luYyBgZXJyb3JgIGhhbmRsZXIgb2YgYW4gYWxyZWFkeS1yZXBsYWNlZCBzZXJ2ZXIgY2FuXG4gKiBzdGlsbCBmaXJlLlxuICovXG5jb25zdCBkaXNjYXJkRnJvbnRJcGNTZXJ2ZXIgPSAoc2VydmVyOiBJcGNTZXJ2ZXIpID0+IHtcbiAgdHJ5IHtcbiAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tGcm9udElwY10gRmFpbGVkIHRvIGNsb3NlIHNlcnZlcicsIGVycm9yKTtcbiAgfVxuXG4gIGlmIChmcm9udElwY1NlcnZlciA9PT0gc2VydmVyKSBmcm9udElwY1NlcnZlciA9IHVuZGVmaW5lZDtcbn07XG5cbmNvbnN0IHN0YXJ0RnJvbnRJcGNTZXJ2ZXIgPSAoKSA9PiB7XG4gIHRyeSB7XG4gICAgLy8gYG9uU29ja2V0RW5kYCAodGhpcmQgY29uc3RydWN0b3IgYXJndW1lbnQpIGlzIG9taXR0ZWQgb24gcHVycG9zZTogdGhhdFxuICAgIC8vIGNhbGxiYWNrIGlzIGhvdyB0aGUgUFBybyBtYWluIHBhbmVsIHRyaWdnZXJzIGBoYXJha2lyaWAsIGFuZCBwYXNzaW5nIG9uZVxuICAgIC8vIGhlcmUgd291bGQgdGVhciB0aGUgc2VydmVyIGRvd24gZXZlcnkgdGltZSB0aGUgbW9kYWwgY2xvc2VzLlxuICAgIGNvbnN0IHNlcnZlciA9IG5ldyBJcGNTZXJ2ZXIoXG4gICAgICB7b3ZlcndyaXRlU29ja2V0OiB0cnVlLCBzb2NrZXRSb290UGF0aH0sXG4gICAgICAoY2xpZW50U29ja2V0LCBtZXNzYWdlKSA9PiB7XG4gICAgICAgIGlmIChtZXNzYWdlLmV2ZW50ID09PSBGUk9OVF9JUENfQ0FOQ0VMX0VWRU5UKSB7XG4gICAgICAgICAgLy8gVGhlIGJ1c3kgbW9kYWwgd2FzIGRpc21pc3NlZCBieSB0aGUgdXNlci4gVGhlIHJlbmRlcmVyIG93bnMgd2hhdFxuICAgICAgICAgIC8vIGNhbmNlbGxpbmcgbWVhbnMsIHNvIHRoaXMgb25seSByZWxheXMuXG4gICAgICAgICAgc2VuZFRvQWxsV2luZG93cyhGUk9OVF9JUENfQ0FOQ0VMX1JFUVVFU1RFRF9ST1VURSwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAvLyBBbnN3ZXJlZCBldmVuIHRob3VnaCB0aGUgcGFuZWwgaXMgYWxyZWFkeSBjbG9zaW5nOiB3aXRob3V0IGFcbiAgICAgICAgICAvLyByZXNwb25zZSBpdHMgcmVxdWVzdCB3b3VsZCBzaXQgcGVuZGluZyB1bnRpbCB0aGUgc29ja2V0IGRpZXMuXG4gICAgICAgICAgc2VydmVyLnJlc3BvbmQoY2xpZW50U29ja2V0LCBtZXNzYWdlLmlkLCB7XG4gICAgICAgICAgICBhY2tub3dsZWRnZWQ6IHRydWUsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1lc3NhZ2UuZXZlbnQgPT09IEZST05UX0lQQ19TVEFUX0VWRU5UKSB7XG4gICAgICAgICAgLy8gTmVhci1wdXJlIHJlbGF5OiB0aGUgcmVuZGVyZXIgb3ducyBQb3N0SG9nLCBhbmQgaXQgaXMgYWxzbyB3aGF0XG4gICAgICAgICAgLy8gY2hlY2tzIHRoYXQgYHN0YXRgIGlzIGEgbmFtZSBpdCBrbm93cy4gT25seSB0aGUgc2hhcGUgaXMgdmVyaWZpZWQsXG4gICAgICAgICAgLy8gYmVjYXVzZSBhIG1hbGZvcm1lZCBwYXlsb2FkIHdvdWxkIGJyZWFrIHRoYXQgY2hlY2sgaXRzZWxmLlxuICAgICAgICAgIGlmIChpc0Zyb250SXBjU3RhdE1lc3NhZ2UobWVzc2FnZS5tZXNzYWdlRGF0YSkpIHtcbiAgICAgICAgICAgIHNlbmRUb0FsbFdpbmRvd3MoRlJPTlRfSVBDX1NUQVRfUk9VVEUsIG1lc3NhZ2UubWVzc2FnZURhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICdbRnJvbnRJcGNdIElnbm9yZWQgbWFsZm9ybWVkIHN0YXQnLFxuICAgICAgICAgICAgICBtZXNzYWdlLm1lc3NhZ2VEYXRhLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBBbnN3ZXJlZCBlaXRoZXIgd2F5OiBhIGRyb3BwZWQgc3RhdCBjb3N0cyBhIGRhdGEgcG9pbnQsIHdoaWxlIGFuXG4gICAgICAgICAgLy8gdW5hbnN3ZXJlZCByZXF1ZXN0IHNpdHMgcGVuZGluZyBvbiB0aGUgcGFuZWwgdW50aWwgdGhlIHNvY2tldCBkaWVzLlxuICAgICAgICAgIHNlcnZlci5yZXNwb25kKGNsaWVudFNvY2tldCwgbWVzc2FnZS5pZCwge1xuICAgICAgICAgICAgYWNrbm93bGVkZ2VkOiB0cnVlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdhcm4gcmF0aGVyIHRoYW4gdGhyb3cgb24gYW55dGhpbmcgZWxzZSwgc28gYW4gdW5rbm93biBldmVudCBjYW5ub3RcbiAgICAgICAgLy8gdGFrZSB0aGUgc2VydmVyIGRvd24uXG4gICAgICAgIGNvbnNvbGUud2FybignW0Zyb250SXBjXSBJZ25vcmVkIGluYm91bmQgbWVzc2FnZScsIG1lc3NhZ2UuZXZlbnQpO1xuICAgICAgfSxcbiAgICApO1xuICAgIGZyb250SXBjU2VydmVyID0gc2VydmVyO1xuXG4gICAgLy8gV2l0aG91dCB0aGlzIGxpc3RlbmVyIGEgbGF0ZSBzZXJ2ZXIgZXJyb3IgaXMgYW4gdW5oYW5kbGVkICdlcnJvcicgZXZlbnQsXG4gICAgLy8gd2hpY2ggd291bGQgdGFrZSB0aGUgbWFpbiBwcm9jZXNzIGRvd24gd2l0aCBpdC5cbiAgICBzZXJ2ZXIuc2VydmVyLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgIGNvbnNvbGUud2FybignW0Zyb250SXBjXSBTZXJ2ZXIgZXJyb3InLCBlcnJvcik7XG4gICAgICAvLyBBbiAnZXJyb3InIGV2ZW50IG1lYW5zIHRoaXMgc2VydmVyIGlzIG5vdCBzZXJ2aW5nIHRoZSBjaGFubmVsIOKAlCBhblxuICAgICAgLy8gYXN5bmNocm9ub3VzIGBsaXN0ZW5gIGZhaWx1cmUgbGFuZHMgaGVyZSDigJQgc28gZnJlZSB0aGUgc2xvdCByYXRoZXIgdGhhblxuICAgICAgLy8ga2VlcCBhIGRlYWQgc2VydmVyIHRoYXQgd291bGQgYmxvY2sgdGhlIHJldHJ5LlxuICAgICAgZGlzY2FyZEZyb250SXBjU2VydmVyKHNlcnZlcik7XG4gICAgfSk7XG5cbiAgICBzZXJ2ZXIubGlzdGVuKEZST05UX0lQQ19DSEFOTkVMKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tGcm9udElwY10gRmFpbGVkIHRvIGxpc3RlbiwgcHVzaGVzIHdpbGwgYmUgZHJvcHBlZCcsIGVycm9yKTtcbiAgICAvLyBgbGlzdGVuYCBkb2VzIHN5bmNocm9ub3VzIGBmc2Agd29yayBvbiB0aGUgc29ja2V0IHBhdGgsIHNvIGl0IGNhbiB0aHJvd1xuICAgIC8vIGFmdGVyIHRoZSBhc3NpZ25tZW50IGFib3ZlLiBXaXRob3V0IHRoaXMgdGhlIGhhbGYtYnVpbHQgc2VydmVyIHdvdWxkIHNpdFxuICAgIC8vIGluIGBmcm9udElwY1NlcnZlcmAgYW5kIG1ha2UgdGhlIGNoYW5uZWwgdW5hdmFpbGFibGUgZm9yIHRoZSByZXN0IG9mIHRoZVxuICAgIC8vIHNlc3Npb24uXG4gICAgaWYgKGZyb250SXBjU2VydmVyKSBkaXNjYXJkRnJvbnRJcGNTZXJ2ZXIoZnJvbnRJcGNTZXJ2ZXIpO1xuICB9XG59O1xuXG4vKipcbiAqIFRoZSBzZXJ2ZXIgbGl2ZXMgaW4gdGhlIG1haW4gcHJvY2VzcyBiZWNhdXNlIGEgcHJlbG9hZCBzY3JpcHQgaXMgaW5zdGFudGlhdGVkXG4gKiBvbmNlIHBlciBCcm93c2VyV2luZG93OiB0aGUgb25ib2FyZGluZyB3aW5kb3cgbG9hZHMgdGhlIHNhbWUgYnVuZGxlIGFzIHRoZVxuICogZnJvbnQgd2luZG93LCBzbyBhIHByZWxvYWQtb3duZWQgc2VydmVyIHdvdWxkIGJpbmQgdGhpcyBjaGFubmVsIHR3aWNlIGFuZCB0aGVcbiAqIHNlY29uZCBvbmUgd291bGQgc3RlYWwgaXQgKGBvdmVyd3JpdGVTb2NrZXRgIHVubGlua3MgdGhlIGZpcnN0IHNvY2tldCkuXG4gKlxuICogRGVsaWJlcmF0ZWx5IGR1bWI6IGl0IG5ldmVyIGNoZWNrcyB3aGV0aGVyIGEgY2xpZW50IGlzIGNvbm5lY3RlZCwgbmV2ZXIgd2FpdHNcbiAqIGZvciBhbiBhbnN3ZXIsIGFuZCBrZWVwcyBsaXN0ZW5pbmcgYWNyb3NzIHRoZSBtb2RhbCdzIG1hbnkgb3Blbi9jbG9zZSBjeWNsZXMuXG4gKiBUaGUgd2hvbGUgY2hhbm5lbCBpcyBvcHRpb25hbCDigJQgZXZlcnkgZmFpbHVyZSBpcyBhIHdhcm5pbmcgYW5kIG5vdGhpbmcgbW9yZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGluaXRGcm9udElwY0hhbmRsZXIgPSAoKSA9PiB7XG4gIC8vIGBpbml0SVBDSGFuZGxlcnNgIGNhbiBydW4gdHdpY2UgaW4gb25lIHNlc3Npb24g4oCUIHN0YXJ0dXAsIHRoZW4gYWdhaW4gd2hlbiBhXG4gIC8vIHN5c3RlbSByZXBvcnQgd2luZG93IGlzIG9wZW5lZCBmcm9tIGFuIGVycm9yLiBUaGUgdHdvIGhhbHZlcyBhcmUgZ3VhcmRlZFxuICAvLyBzZXBhcmF0ZWx5IG9uIHB1cnBvc2U6IGEgc2Vjb25kIHNlcnZlciB3b3VsZCBzdGVhbCB0aGUgc29ja2V0XG4gIC8vIChgb3ZlcndyaXRlU29ja2V0YCB1bmxpbmtzIHRoZSBmaXJzdCBvbmUpIGFuZCBhIHNlY29uZCBgaXBjTWFpbmAgbGlzdGVuZXJcbiAgLy8gd291bGQgYnJvYWRjYXN0IGV2ZXJ5IG1lc3NhZ2UgdHdpY2UsIGJ1dCBhIGZpcnN0IHJ1biB0aGF0IGZhaWxlZCBvbmx5XG4gIC8vIGhhbGZ3YXkgaGFzIHRvIGxlYXZlIHRoZSBzZWNvbmQgb25lIGZyZWUgdG8gcmV0cnkgdGhlIGhhbGYgdGhhdCBmYWlsZWQuXG4gIGlmICghZnJvbnRJcGNTZXJ2ZXIpIHN0YXJ0RnJvbnRJcGNTZXJ2ZXIoKTtcblxuICBpZiAoZnJvbnRJcGNNZXNzYWdlUm91dGVSZWdpc3RlcmVkKSByZXR1cm47XG4gIGZyb250SXBjTWVzc2FnZVJvdXRlUmVnaXN0ZXJlZCA9IHRydWU7XG5cbiAgaXBjTWFpbi5vbihcbiAgICBGUk9OVF9JUENfU0VORF9NRVNTQUdFX1JPVVRFLFxuICAgIChfZXZlbnQsIG1lc3NhZ2U6IEZyb250SXBjTWVzc2FnZSkgPT4ge1xuICAgICAgLy8gRmlyZS1hbmQtZm9yZ2V0LiBIYXZpbmcgbm8gY2xpZW50IGlzIHRoZSBub3JtYWwgY2FzZSDigJQgdGhlIGJ1c3kgbW9kYWxcbiAgICAgIC8vIG9ubHkgZXhpc3RzIHdoaWxlIGEgcHJvY2VzcyBydW5zIOKAlCBhbmQgYGJyb2FkY2FzdGAgaXMgYSBwbGFpbiBuby1vcFxuICAgICAgLy8gdGhlbi4gTm90aGluZyBpcyBidWZmZXJlZDogYSBtZXNzYWdlIHNlbnQgd2hpbGUgdGhlIG1vZGFsIGlzIGNsb3NlZCBpc1xuICAgICAgLy8gZ29uZS5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZyb250SXBjU2VydmVyPy5icm9hZGNhc3QoRlJPTlRfSVBDX01FU1NBR0VfRVZFTlQsIG1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbRnJvbnRJcGNdIEZhaWxlZCB0byBicm9hZGNhc3QgbWVzc2FnZScsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICApO1xufTtcbiIsImltcG9ydCB7SVNfREVWLCBJU19TVEFHSU5HfSBmcm9tICdAL2Vudic7XG5pbXBvcnQge2FwcH0gZnJvbSAnZWxlY3Ryb24nO1xuXG5leHBvcnQgY29uc3QgYXBwTmFtZSA9IElTX0RFVlxuICA/ICdBdXRvQ3V0RGV2J1xuICA6IElTX1NUQUdJTkdcbiAgICA/ICdBdXRvQ3V0U3RhZ2luZydcbiAgICA6ICdBdXRvQ3V0JztcblxuZXhwb3J0IGNvbnN0IGluaXRBcHBOYW1lID0gKCkgPT4ge1xuICBjb25zb2xlLmxvZygnU2V0dGluZyBhcHAgbmFtZSB0byAnLCBhcHBOYW1lKTtcbiAgYXBwLnNldE5hbWUoYXBwTmFtZSk7XG59O1xuIiwiaW1wb3J0IHthcHB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtzZXJpYWxpemVGb3JMb2d9IGZyb20gJy4vbG9nZ2VyLnV0aWxzJztcblxubGV0IGNvb2tpZURhdGE6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbmNvbnN0IGdldENvb2tpZUZpbGVQYXRoID0gKCkgPT5cbiAgcGF0aC5qb2luKGFwcC5nZXRQYXRoKCd1c2VyRGF0YScpLCAnYXV0b2N1dF9kYXRhLmpzb24nKTtcblxuZXhwb3J0IGNvbnN0IGluaXRDb29raWVzID0gYXN5bmMgKCkgPT4ge1xuICBjb25zdCBjb29raWVGaWxlUGF0aCA9IGdldENvb2tpZUZpbGVQYXRoKCk7XG5cbiAgaWYgKCFmcy5leGlzdHNTeW5jKGNvb2tpZUZpbGVQYXRoKSkge1xuICAgIGZzLndyaXRlRmlsZVN5bmMoY29va2llRmlsZVBhdGgsICd7fScsICd1dGYtOCcpO1xuICB9XG4gIHRyeSB7XG4gICAgY29va2llRGF0YSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNvb2tpZUZpbGVQYXRoLCAndXRmLTgnKSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUubG9nKCdpbml0Q29va2llcyA+IGVyciA6Jywgc2VyaWFsaXplRm9yTG9nKGVycikpO1xuICAgIGZzLndyaXRlRmlsZVN5bmMoY29va2llRmlsZVBhdGgsICd7fScsICd1dGYtOCcpO1xuICB9XG5cbiAgY29uc3QgdG90YWxLZXlzID0gT2JqZWN0LmtleXMoY29va2llRGF0YSkubGVuZ3RoO1xuICBjb25zdCByYXdVc2VyS2V5ID0gY29va2llRGF0YVsndXNlcktleSddO1xuICBjb25zdCB1c2VyS2V5U3RhdHVzID1cbiAgICByYXdVc2VyS2V5ID09PSB1bmRlZmluZWRcbiAgICAgID8gJ01JU1NJTkcnXG4gICAgICA6IHJhd1VzZXJLZXkgPT09ICdcIlwiJyB8fCByYXdVc2VyS2V5ID09PSAnbnVsbCcgfHwgcmF3VXNlcktleSA9PT0gJydcbiAgICAgICAgPyBgRU1QVFkoJHtKU09OLnN0cmluZ2lmeShyYXdVc2VyS2V5KX0pYFxuICAgICAgICA6IGBQUkVTRU5UKCR7cmF3VXNlcktleS5zdWJzdHJpbmcoMCwgMzApfS4uLilgO1xuICBjb25zb2xlLmxvZyhcbiAgICBgW0Nvb2tpZXNdIGluaXRDb29raWVzOiB1c2VyS2V5PSR7dXNlcktleVN0YXR1c30sIHRvdGFsS2V5cz0ke3RvdGFsS2V5c30sIHBhdGg9JHtjb29raWVGaWxlUGF0aH1gLFxuICApO1xuXG4gIC8vIEFkZGluZyBhcHAgVVVJRCB0byBjb29raWVzXG4gIGlmICghY29va2llRGF0YS5hcHBVVUlEKSB7XG4gICAgc2V0Q29va2llKCdhcHBVVUlEJywgSlNPTi5zdHJpbmdpZnkoY3J5cHRvLnJhbmRvbVVVSUQoKSkpO1xuICB9XG5cbiAgLy8gU2VlZCB0aGUgc2hhcmVkIFBvc3RIb2cgYW5vbnltb3VzIGlkIGZyb20gdGhlIHN0YWJsZSBwZXItaW5zdGFsbCBhcHAgVVVJRCBzb1xuICAvLyB0aGUgbWFpbiBwcm9jZXNzIGFuZCBCT1RIIHJlbmRlcmVyIHdpbmRvd3MgKGZyb250ICsgb25ib2FyZGluZykgYWRvcHQgb25lXG4gIC8vIGFub24gaWQgZnJvbSB0aGUgdmVyeSBmaXJzdCBldmVudC4gVGhpcyBydW5zIGluc2lkZSBpbml0Q29va2llcywgYmVmb3JlIGFueVxuICAvLyB3aW5kb3cgbG9hZHMgYW5kIGJlZm9yZSB0aGUgZmlyc3QgbWFpbi1wcm9jZXNzIGNhcHR1cmUsIHNvIG5vIHJhY2UgYmV0d2VlblxuICAvLyBvcmlnaW5zIGNhbiBwaWNrIGRpZmZlcmVudCBpZHMuIFdlIGNvcHkgdGhlIGFscmVhZHktc3RvcmVkIGFwcFVVSUQgdmFsdWVcbiAgLy8gdmVyYmF0aW06IHBvc3Rob2dEaXN0aW5jdElkIGJlY29tZXMgYnl0ZS1pZGVudGljYWwgdG8gYXBwVVVJRCwgc28gZXZlcnlcbiAgLy8gcmVhZGVyIOKAlCBtYWluJ3MgcGFyc2VDb29raWVTdHJpbmcgKEpTT04ucGFyc2UpIGFuZCB0aGUgcmVuZGVyZXIgcHJlbG9hZCdzXG4gIC8vIGdldENvb2tpZSAoSlNPTi5wYXJzZSkg4oCUIHJlc29sdmVzIGl0IHRvIHRoZSBleGFjdCBzYW1lIHBsYWluIFVVSUQgc3RyaW5nLlxuICAvLyBUaGUgdmFsdWUgcGVyc2lzdHMgYWNyb3NzIGxhdW5jaGVzOyB0aGUgZnJvbnQgcmVuZGVyZXIgbGF0ZXIgb3ZlcndyaXRlcyBpdFxuICAvLyB3aXRoIHBvc3Rob2ctanMncyBvd24gaWQsIGFuZCBpZGVudGlmeShwZXJzb25JZCkgdW5pZmllcyB0aGUgZGV2aWNlLlxuICBpZiAoIWNvb2tpZURhdGEucG9zdGhvZ0Rpc3RpbmN0SWQpIHtcbiAgICBzZXRDb29raWUoJ3Bvc3Rob2dEaXN0aW5jdElkJywgY29va2llRGF0YS5hcHBVVUlEKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGdldEFsbENvb2tpZXMgPSBhc3luYyAoKSA9PiB7XG4gIHJldHVybiBjb29raWVEYXRhO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldENvb2tpZSA9IChuYW1lOiBzdHJpbmcpID0+IHtcbiAgcmV0dXJuIGNvb2tpZURhdGFbbmFtZV07XG59O1xuXG5leHBvcnQgY29uc3QgY2xlYXJBbGxDb29raWVzID0gKCkgPT4ge1xuICBjb25zdCBjb29raWVGaWxlUGF0aCA9IGdldENvb2tpZUZpbGVQYXRoKCk7XG4gIGNvb2tpZURhdGEgPSB7fTtcblxuICB0cnkge1xuICAgIGZzLnJtU3luYyhjb29raWVGaWxlUGF0aCwge2ZvcmNlOiB0cnVlfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUubG9nKCdjbGVhckFsbENvb2tpZXMgPiBlcnIgOicsIHNlcmlhbGl6ZUZvckxvZyhlcnIpKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzZXRDb29raWUgPSAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGNvb2tpZUZpbGVQYXRoID0gZ2V0Q29va2llRmlsZVBhdGgoKTtcbiAgY29va2llRGF0YVtuYW1lXSA9IHZhbHVlO1xuICB0cnkge1xuICAgIGZzLndyaXRlRmlsZVN5bmMoY29va2llRmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGNvb2tpZURhdGEsIG51bGwsIDIpKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS5sb2coJ3NldENvb2tpZSA+IGVyciA6Jywgc2VyaWFsaXplRm9yTG9nKGVycikpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcbiIsIi8vIFNoYXJlZCBieSBFbGVjdHJvbiBhbmQgQ0VQOyBrZWVwIHRoaXMgbW9kdWxlIGluZGVwZW5kZW50IG9mIGVpdGhlciBydW50aW1lLlxyXG5leHBvcnQgY29uc3QgTUFYX0pTWEJJTl9TSVpFX0JZVEVTID0gMTYgKiAxMDI0ICogMTAyNDtcclxuY29uc3QgSlNYQklOX1NJR05BVFVSRSA9ICdASlNYQklOQCc7XHJcblxyXG5pbnRlcmZhY2UgSnN4QmluQ2FjaGVSZWFkZXIge1xyXG4gIHN0YXRTeW5jKGZpbGVQYXRoOiBzdHJpbmcpOiB7aXNGaWxlKCk6IGJvb2xlYW47IHNpemU6IG51bWJlcn07XHJcbiAgcmVhZEZpbGVTeW5jKGZpbGVQYXRoOiBzdHJpbmcpOiBVaW50OEFycmF5O1xyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgbm9ybWFsaXplVHJ1c3RlZEpzeFVybCA9ICh2YWx1ZTogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICBsZXQgdXJsOiBVUkw7XHJcbiAgdHJ5IHtcclxuICAgIHVybCA9IG5ldyBVUkwodmFsdWUpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEpTWEJJTiBkb3dubG9hZCBVUkwnKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRydXN0ZWRIb3N0ID1cclxuICAgIHVybC5ob3N0bmFtZSA9PT0gJ3Bwcm8tanN4LnN0YXRpYy5hdXRvY3V0LmNvbScgfHxcclxuICAgIHVybC5ob3N0bmFtZSA9PT0gJ3Bwcm8tanN4LnN0YXRpYy5hdXRvc3RnLmNvbScgfHxcclxuICAgIC9ecHByby1qc3gtWzEtOV1cXGQqXFwucWFcXC5hdXRvc3RnXFwuY29tJC8udGVzdCh1cmwuaG9zdG5hbWUpO1xyXG5cclxuICBpZiAodXJsLnByb3RvY29sICE9PSAnaHR0cHM6Jykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdKU1hCSU4gZG93bmxvYWRzIHJlcXVpcmUgSFRUUFMnKTtcclxuICB9XHJcbiAgaWYgKHVybC51c2VybmFtZSB8fCB1cmwucGFzc3dvcmQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSlNYQklOIGRvd25sb2FkIFVSTHMgY2Fubm90IGNvbnRhaW4gY3JlZGVudGlhbHMnKTtcclxuICB9XHJcbiAgaWYgKHVybC5wb3J0KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0pTWEJJTiBkb3dubG9hZHMgcmVxdWlyZSB0aGUgc3RhbmRhcmQgSFRUUFMgcG9ydCcpO1xyXG4gIH1cclxuICBpZiAoIXRydXN0ZWRIb3N0KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVudHJ1c3RlZCBKU1hCSU4gZG93bmxvYWQgaG9zdDogJHt1cmwuaG9zdG5hbWUgfHwgJzxlbXB0eT4nfWApO1xyXG4gIH1cclxuICBpZiAoIXVybC5wYXRobmFtZS5lbmRzV2l0aCgnL2luZGV4LmpzeGJpbicpKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0pTWEJJTiBkb3dubG9hZCBVUkwgbXVzdCB0YXJnZXQgaW5kZXguanN4YmluJyk7XHJcbiAgfVxyXG4gIGlmICh1cmwuaGFzaCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdKU1hCSU4gZG93bmxvYWQgVVJMIGNhbm5vdCBjb250YWluIGEgZnJhZ21lbnQnKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB1cmwuaHJlZjtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCB2YWxpZGF0ZUpzeEJpbiA9IChjb250ZW50OiBVaW50OEFycmF5KTogdm9pZCA9PiB7XHJcbiAgaWYgKGNvbnRlbnQubGVuZ3RoID4gTUFYX0pTWEJJTl9TSVpFX0JZVEVTKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0pTWEJJTiBleGNlZWRzIHRoZSAxNiBNaUIgc2l6ZSBsaW1pdCcpO1xyXG4gIH1cclxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgSlNYQklOX1NJR05BVFVSRS5sZW5ndGg7IGluZGV4ICs9IDEpIHtcclxuICAgIGlmIChjb250ZW50W2luZGV4XSAhPT0gSlNYQklOX1NJR05BVFVSRS5jaGFyQ29kZUF0KGluZGV4KSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Rvd25sb2FkZWQgZmlsZSBpcyBub3QgYSB2YWxpZCBKU1hCSU4gYXJ0aWZhY3QnKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdmFsaWRhdGVDYWNoZWRKc3hCaW4gPSAoXHJcbiAgZmlsZVBhdGg6IHN0cmluZyxcclxuICByZWFkZXI6IEpzeEJpbkNhY2hlUmVhZGVyLFxyXG4pOiB2b2lkID0+IHtcclxuICBjb25zdCBzdGF0cyA9IHJlYWRlci5zdGF0U3luYyhmaWxlUGF0aCk7XHJcbiAgaWYgKCFzdGF0cy5pc0ZpbGUoKSB8fCBzdGF0cy5zaXplID4gTUFYX0pTWEJJTl9TSVpFX0JZVEVTKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY2FjaGVkIEpTWEJJTiBmaWxlJyk7XHJcbiAgfVxyXG4gIGNvbnN0IGNvbnRlbnQgPSByZWFkZXIucmVhZEZpbGVTeW5jKGZpbGVQYXRoKTtcclxuICB2YWxpZGF0ZUpzeEJpbihjb250ZW50KTtcclxufTtcclxuIiwiaW1wb3J0IHtjcmVhdGVIYXNoLCByYW5kb21CeXRlc30gZnJvbSAnbm9kZTpjcnlwdG8nO1xuaW1wb3J0IHtcbiAgbWtkaXJTeW5jLFxuICByZWFkRmlsZVN5bmMsXG4gIHJlbmFtZVN5bmMsXG4gIHJtU3luYyxcbiAgc3RhdFN5bmMsXG4gIHdyaXRlRmlsZVN5bmMsXG59IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdub2RlOnBhdGgnO1xuXG5pbXBvcnQge1xuICBub3JtYWxpemVUcnVzdGVkSnN4VXJsLFxuICB2YWxpZGF0ZUNhY2hlZEpzeEJpbixcbiAgdmFsaWRhdGVKc3hCaW4sXG59IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NoYXJlZC9wcHJvLWpzeC9wcHJvSnN4QXJ0aWZhY3QudXRpbHMnO1xuXG5jb25zdCBwZW5kaW5nRG93bmxvYWRzID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8dm9pZD4+KCk7XG5cbmNvbnN0IHVwZGF0ZUNhY2hlID0gYXN5bmMgKFxuICB1cmw6IHN0cmluZyxcbiAgZGlyZWN0b3J5OiBzdHJpbmcsXG4gIGNhY2hlUGF0aDogc3RyaW5nLFxuICBkb3dubG9hZDogKHVybDogc3RyaW5nKSA9PiBQcm9taXNlPEJ1ZmZlcj4sXG4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZG93bmxvYWQodXJsKTtcbiAgICB2YWxpZGF0ZUpzeEJpbihjb250ZW50KTtcbiAgICBta2RpclN5bmMoZGlyZWN0b3J5LCB7cmVjdXJzaXZlOiB0cnVlfSk7XG4gICAgY29uc3Qgc3VmZml4ID0gcmFuZG9tQnl0ZXMoMTYpLnRvU3RyaW5nKCdoZXgnKTtcbiAgICBjb25zdCB0ZW1wb3JhcnlQYXRoID0gYCR7Y2FjaGVQYXRofS4ke3N1ZmZpeH0udG1wYDtcbiAgICB0cnkge1xuICAgICAgd3JpdGVGaWxlU3luYyh0ZW1wb3JhcnlQYXRoLCBjb250ZW50LCB7ZmxhZzogJ3d4J30pO1xuICAgICAgcmVuYW1lU3luYyh0ZW1wb3JhcnlQYXRoLCBjYWNoZVBhdGgpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBybVN5bmModGVtcG9yYXJ5UGF0aCwge2ZvcmNlOiB0cnVlfSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdbUFBybyBKU1hdIFByZXBhcmVkIGNsaWVudCBpbiBFbGVjdHJvbicsIHtjYWNoZVBhdGh9KTtcbiAgfSBjYXRjaCAoZG93bmxvYWRFcnJvcikge1xuICAgIHRyeSB7XG4gICAgICB2YWxpZGF0ZUNhY2hlZEpzeEJpbihjYWNoZVBhdGgsIHtyZWFkRmlsZVN5bmMsIHN0YXRTeW5jfSk7XG4gICAgfSBjYXRjaCAoY2FjaGVFcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnVW5hYmxlIHRvIHByZXBhcmUgSlNYQklOOiBkb3dubG9hZCBmYWlsZWQgYW5kIG5vIHZhbGlkIGNhY2hlIGlzIGF2YWlsYWJsZScsXG4gICAgICAgIHtcbiAgICAgICAgICBjYXVzZToge2NhY2hlRXJyb3IsIGRvd25sb2FkRXJyb3J9LFxuICAgICAgICB9LFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc29sZS53YXJuKCdbUFBybyBKU1hdIERvd25sb2FkIGZhaWxlZDsgdXNpbmcgdmFsaWRhdGVkIGNhY2hlJywge1xuICAgICAgY2FjaGVQYXRoLFxuICAgICAgZG93bmxvYWRFcnJvcixcbiAgICB9KTtcbiAgfVxufTtcblxuLyoqIFByZXNlcnZlIHRoZSBVUkwtaGFzaGVkIGZpbGVuYW1lIHVzZWQgYnkgaW5zdGFsbGVkIENFUCBwYW5lbHMuICovXG5leHBvcnQgY29uc3QgcHJlcGFyZVBwcm9Kc3hDYWNoZSA9IChcbiAganN4VXJsOiBzdHJpbmcsXG4gIGRpcmVjdG9yeTogc3RyaW5nLFxuICBkb3dubG9hZDogKHVybDogc3RyaW5nKSA9PiBQcm9taXNlPEJ1ZmZlcj4sXG4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgY29uc3QgdXJsID0gbm9ybWFsaXplVHJ1c3RlZEpzeFVybChqc3hVcmwpO1xuICBjb25zdCBoYXNoID0gY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKHVybCkuZGlnZXN0KCdoZXgnKTtcbiAgY29uc3QgY2FjaGVQYXRoID0gam9pbihkaXJlY3RvcnksIGBpbmRleC0ke2hhc2h9LmpzeGJpbmApO1xuICBjb25zdCBwZW5kaW5nID0gcGVuZGluZ0Rvd25sb2Fkcy5nZXQoY2FjaGVQYXRoKTtcbiAgaWYgKHBlbmRpbmcpIHJldHVybiBwZW5kaW5nO1xuXG4gIGNvbnN0IG9wZXJhdGlvbiA9IHVwZGF0ZUNhY2hlKHVybCwgZGlyZWN0b3J5LCBjYWNoZVBhdGgsIGRvd25sb2FkKS5maW5hbGx5KFxuICAgICgpID0+IHtcbiAgICAgIHBlbmRpbmdEb3dubG9hZHMuZGVsZXRlKGNhY2hlUGF0aCk7XG4gICAgfSxcbiAgKTtcbiAgcGVuZGluZ0Rvd25sb2Fkcy5zZXQoY2FjaGVQYXRoLCBvcGVyYXRpb24pO1xuICByZXR1cm4gb3BlcmF0aW9uO1xufTtcbiIsImltcG9ydCB0eXBlIHtDbGllbnRSZXF1ZXN0LCBJbmNvbWluZ01lc3NhZ2V9IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IHtNQVhfSlNYQklOX1NJWkVfQllURVN9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NoYXJlZC9wcHJvLWpzeC9wcHJvSnN4QXJ0aWZhY3QudXRpbHMnO1xuaW1wb3J0IHt2ZXJib3NlQXhpb3N9IGZyb20gJy4vYXhpb3MudXRpbHMnO1xuaW1wb3J0IHtwcmVwYXJlUHByb0pzeENhY2hlfSBmcm9tICcuL3Bwcm9Kc3hDYWNoZS51dGlscyc7XG5cbmNvbnN0IFJFUVVFU1RfVElNRU9VVF9NUyA9IDMwXzAwMDtcblxuY29uc3QgZ2V0SGVhZGVyVmFsdWUgPSAodmFsdWU6IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+XG4gIEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUuam9pbignLCcpIDogdmFsdWU7XG5cbmNvbnN0IHZhbGlkYXRlUmVkaXJlY3QgPSAocmVkaXJlY3RVcmw6IHN0cmluZywgcmVxdWVzdFVybDogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGNvbnN0IHRhcmdldCA9IG5ldyBVUkwocmVkaXJlY3RVcmwpO1xuICBjb25zdCBzb3VyY2UgPSBuZXcgVVJMKHJlcXVlc3RVcmwpO1xuICBpZiAoXG4gICAgdGFyZ2V0Lm9yaWdpbiAhPT0gc291cmNlLm9yaWdpbiB8fFxuICAgIHRhcmdldC51c2VybmFtZSB8fFxuICAgIHRhcmdldC5wYXNzd29yZCB8fFxuICAgIHRhcmdldC5oYXNoIHx8XG4gICAgIXRhcmdldC5wYXRobmFtZS5lbmRzV2l0aCgnL2luZGV4LmpzeGJpbicpXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBKU1hCSU4gcmVkaXJlY3QnKTtcbiAgfVxufTtcblxuY29uc3QgZG93bmxvYWRKc3hCaW4gPSBhc3luYyAodXJsOiBzdHJpbmcpOiBQcm9taXNlPEJ1ZmZlcj4gPT4ge1xuICBjb25zdCByZXF1ZXN0VXJsID0gbmV3IFVSTCh1cmwpO1xuICByZXF1ZXN0VXJsLnNlYXJjaFBhcmFtcy5zZXQoJ25vY2FjaGUnLCBEYXRlLm5vdygpLnRvU3RyaW5nKCkpO1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHZlcmJvc2VBeGlvcy5nZXQ8SW5jb21pbmdNZXNzYWdlPihyZXF1ZXN0VXJsLmhyZWYsIHtcbiAgICBhdXRvY3V0UmVxdWlyZUh0dHBzOiB0cnVlLFxuICAgIC8vIEEgdmFsaWRhdGVkIGxvY2FsIGNhY2hlIGlzIHRoZSByZWNvdmVyeSBwYXRoLiBLZWVwIHByb3h5IGZhbGxiYWNrLCBidXRcbiAgICAvLyBkbyBub3QgcmVwZWF0IHRpbWVvdXRzIG9yIHJlamVjdGVkIHJlZGlyZWN0cyB0aHJvdWdoIHRoZSByZXRyeSBpbnRlcmNlcHRvci5cbiAgICBhdXRvY3V0UmV0cnlNb2RlOiAnZXh0ZXJuYWwnLFxuICAgIGF1dG9jdXRWYWxpZGF0ZVJlZGlyZWN0OiB2YWxpZGF0ZVJlZGlyZWN0LFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBY2NlcHQtRW5jb2RpbmcnOiAnaWRlbnRpdHknLFxuICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUsIG5vLXN0b3JlJyxcbiAgICB9LFxuICAgIG1heFJlZGlyZWN0czogNSxcbiAgICByZXNwb25zZVR5cGU6ICdzdHJlYW0nLFxuICAgIHRpbWVvdXQ6IFJFUVVFU1RfVElNRU9VVF9NUyxcbiAgICB2YWxpZGF0ZVN0YXR1czogc3RhdHVzID0+IHN0YXR1cyA9PT0gMjAwLFxuICB9KTtcbiAgY29uc3Qgc3RyZWFtID0gcmVzcG9uc2UuZGF0YTtcbiAgY29uc3QgcmVxdWVzdCA9IHJlc3BvbnNlLnJlcXVlc3QgYXMgQ2xpZW50UmVxdWVzdDtcblxuICAvLyBUaGUgc2hhcmVkIGFkYXB0ZXIgcmVzb2x2ZXMgc3RyZWFtIHJlcXVlc3RzIGF0IHRoZSBoZWFkZXJzLiBCb3VuZCB0aGVcbiAgLy8gYm9keSBzZXBhcmF0ZWx5LCBpbmNsdWRpbmcgYWJvcnRlZC9lYXJseS1jbG9zZSByZXNwb25zZXMsIGJlZm9yZSBjYWNoaW5nLlxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcbiAgICBsZXQgcmVjZWl2ZWRCeXRlcyA9IDA7XG4gICAgbGV0IHNldHRsZWQgPSBmYWxzZTtcbiAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoXG4gICAgICAoKSA9PiBmYWlsKG5ldyBFcnJvcignSlNYQklOIHJlc3BvbnNlIHRpbWVkIG91dCcpKSxcbiAgICAgIFJFUVVFU1RfVElNRU9VVF9NUyxcbiAgICApO1xuICAgIGNvbnN0IGZhaWwgPSAoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICBpZiAoc2V0dGxlZCkgcmV0dXJuO1xuICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICB9O1xuXG4gICAgc3RyZWFtLm9uKCdlcnJvcicsIGZhaWwpO1xuICAgIHN0cmVhbS5vbignYWJvcnRlZCcsICgpID0+IGZhaWwobmV3IEVycm9yKCdKU1hCSU4gcmVzcG9uc2Ugd2FzIGFib3J0ZWQnKSkpO1xuICAgIHJlcXVlc3Qub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgaWYgKCFzZXR0bGVkKSBmYWlsKG5ldyBFcnJvcignSlNYQklOIHJlc3BvbnNlIGNsb3NlZCBlYXJseScpKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHJhd0xlbmd0aCA9IGdldEhlYWRlclZhbHVlKHN0cmVhbS5oZWFkZXJzWydjb250ZW50LWxlbmd0aCddKTtcbiAgICBjb25zdCBleHBlY3RlZEJ5dGVzID1cbiAgICAgIHJhd0xlbmd0aCA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogTnVtYmVyKHJhd0xlbmd0aCk7XG4gICAgY29uc3QgZW5jb2RpbmdIZWFkZXIgPSBnZXRIZWFkZXJWYWx1ZShzdHJlYW0uaGVhZGVyc1snY29udGVudC1lbmNvZGluZyddKTtcbiAgICBjb25zdCBlbmNvZGluZyA9IGVuY29kaW5nSGVhZGVyPy50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoXG4gICAgICAoZW5jb2RpbmcgJiYgZW5jb2RpbmcgIT09ICdpZGVudGl0eScpIHx8XG4gICAgICAoZXhwZWN0ZWRCeXRlcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICghL15cXGQrJC8udGVzdChTdHJpbmcocmF3TGVuZ3RoKSkgfHxcbiAgICAgICAgICAhTnVtYmVyLmlzU2FmZUludGVnZXIoZXhwZWN0ZWRCeXRlcykgfHxcbiAgICAgICAgICBleHBlY3RlZEJ5dGVzID4gTUFYX0pTWEJJTl9TSVpFX0JZVEVTKSlcbiAgICApIHtcbiAgICAgIGZhaWwobmV3IEVycm9yKCdJbnZhbGlkIEpTWEJJTiByZXNwb25zZSBlbmNvZGluZyBvciBzaXplJykpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN0cmVhbS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgaWYgKHNldHRsZWQpIHJldHVybjtcbiAgICAgIGlmIChleHBlY3RlZEJ5dGVzICE9PSB1bmRlZmluZWQgJiYgZXhwZWN0ZWRCeXRlcyAhPT0gcmVjZWl2ZWRCeXRlcykge1xuICAgICAgICBmYWlsKFxuICAgICAgICAgIG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBJbmNvbXBsZXRlIEpTWEJJTiByZXNwb25zZTogZXhwZWN0ZWQgJHtleHBlY3RlZEJ5dGVzfSBieXRlcywgcmVjZWl2ZWQgJHtyZWNlaXZlZEJ5dGVzfWAsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgcmVzb2x2ZShCdWZmZXIuY29uY2F0KGNodW5rcywgcmVjZWl2ZWRCeXRlcykpO1xuICAgIH0pO1xuICAgIHN0cmVhbS5vbignZGF0YScsIChjaHVuazogQnVmZmVyKSA9PiB7XG4gICAgICBpZiAoc2V0dGxlZCkgcmV0dXJuO1xuICAgICAgcmVjZWl2ZWRCeXRlcyArPSBjaHVuay5sZW5ndGg7XG4gICAgICBpZiAocmVjZWl2ZWRCeXRlcyA+IE1BWF9KU1hCSU5fU0laRV9CWVRFUykge1xuICAgICAgICBmYWlsKG5ldyBFcnJvcignSlNYQklOIGV4Y2VlZHMgdGhlIDE2IE1pQiBzaXplIGxpbWl0JykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjaHVua3MucHVzaChjaHVuayk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHByZXBhcmVQcHJvSnN4ID0gKHVybDogc3RyaW5nLCBkaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gPT5cbiAgcHJlcGFyZVBwcm9Kc3hDYWNoZSh1cmwsIGRpcmVjdG9yeSwgZG93bmxvYWRKc3hCaW4pO1xuIiwiaW1wb3J0IHtuZXR9IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IHtnZXROZXR3b3JrRmFpbHVyZUtpbmR9IGZyb20gJy4vbmV0d29ya0Vycm9yLnN0YXJ0LnV0aWxzJztcbmltcG9ydCB7d2FpdFVudGlsTmV0d29ya09ubGluZX0gZnJvbSAnLi9uZXR3b3JrUmV0cnkuc3RhcnQudXRpbHMnO1xuXG5leHBvcnQgdHlwZSBTdGFydHVwTmV0d29ya1N0YXRlID1cbiAgfCAnY2hlY2tpbmcnXG4gIHwgJ29mZmxpbmUnXG4gIHwgJ3JlYWR5J1xuICB8ICd1bnJlYWNoYWJsZSc7XG5cbmNvbnN0IE9OTElORV9SRVRSWV9ERUxBWV9NUyA9IDEwMDAwO1xuXG5sZXQgc3RhcnR1cE5ldHdvcmtTdGF0ZTogU3RhcnR1cE5ldHdvcmtTdGF0ZSA9ICdjaGVja2luZyc7XG5sZXQgc3RhcnR1cFJldHJ5UmVzb2x2ZXI6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcblxuY29uc3Qgc2xlZXAgPSAobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT5cbiAgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG5cbmV4cG9ydCBjb25zdCBnZXRTdGFydHVwTmV0d29ya1N0YXRlID0gKCk6IFN0YXJ0dXBOZXR3b3JrU3RhdGUgPT5cbiAgc3RhcnR1cE5ldHdvcmtTdGF0ZTtcblxuZXhwb3J0IGNvbnN0IHNldFN0YXJ0dXBOZXR3b3JrU3RhdGUgPSAoc3RhdGU6IFN0YXJ0dXBOZXR3b3JrU3RhdGUpOiB2b2lkID0+IHtcbiAgc3RhcnR1cE5ldHdvcmtTdGF0ZSA9IHN0YXRlO1xufTtcblxuZXhwb3J0IGNvbnN0IHJlcXVlc3RTdGFydHVwUmV0cnkgPSAoKTogdm9pZCA9PiB7XG4gIGlmIChuZXQuaXNPbmxpbmUoKSAmJiBzdGFydHVwUmV0cnlSZXNvbHZlcikge1xuICAgIHN0YXJ0dXBSZXRyeVJlc29sdmVyKCk7XG4gICAgc3RhcnR1cFJldHJ5UmVzb2x2ZXIgPSB1bmRlZmluZWQ7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCB3YWl0Rm9yU3RhcnR1cFJldHJ5ID0gYXN5bmMgKGVycm9yOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGNvbnN0IGZhaWx1cmVLaW5kID0gZ2V0TmV0d29ya0ZhaWx1cmVLaW5kKGVycm9yKTtcbiAgY29uc3QgaXNPZmZsaW5lID0gZmFpbHVyZUtpbmQgPT09ICdvZmZsaW5lJyB8fCAhbmV0LmlzT25saW5lKCk7XG4gIHNldFN0YXJ0dXBOZXR3b3JrU3RhdGUoaXNPZmZsaW5lID8gJ29mZmxpbmUnIDogJ3VucmVhY2hhYmxlJyk7XG5cbiAgY29uc3QgcmV0cnlSZXF1ZXN0ZWQgPSBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IHtcbiAgICBzdGFydHVwUmV0cnlSZXNvbHZlciA9IHJlc29sdmU7XG4gIH0pO1xuICB0cnkge1xuICAgIGF3YWl0IFByb21pc2UucmFjZShbXG4gICAgICBpc09mZmxpbmUgPyB3YWl0VW50aWxOZXR3b3JrT25saW5lKCkgOiBzbGVlcChPTkxJTkVfUkVUUllfREVMQVlfTVMpLFxuICAgICAgcmV0cnlSZXF1ZXN0ZWQsXG4gICAgXSk7XG4gIH0gZmluYWxseSB7XG4gICAgc3RhcnR1cFJldHJ5UmVzb2x2ZXIgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBzZXRTdGFydHVwTmV0d29ya1N0YXRlKCdjaGVja2luZycpO1xufTtcbiIsImltcG9ydCB7d2luMzJ9IGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgY29uc3QgV0lORE9XU19FTlZJUk9OTUVOVF9QQVRIX05BTUVTID0gW1xuICAnQ29tbW9uUHJvZ3JhbUZpbGVzJyxcbiAgJ0xPQ0FMQVBQREFUQScsXG4gICdQcm9ncmFtRGF0YScsXG4gICdTeXN0ZW1Sb290Jyxcbl0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIFdpbmRvd3NFbnZpcm9ubWVudFBhdGhOYW1lID1cbiAgKHR5cGVvZiBXSU5ET1dTX0VOVklST05NRU5UX1BBVEhfTkFNRVMpW251bWJlcl07XG5cbmV4cG9ydCBjb25zdCBpc1dpbmRvd3NFbnZpcm9ubWVudFBhdGhOYW1lID0gKFxuICBuYW1lOiB1bmtub3duLFxuKTogbmFtZSBpcyBXaW5kb3dzRW52aXJvbm1lbnRQYXRoTmFtZSA9PlxuICBXSU5ET1dTX0VOVklST05NRU5UX1BBVEhfTkFNRVMuc29tZShjYW5kaWRhdGUgPT4gY2FuZGlkYXRlID09PSBuYW1lKTtcblxuZXhwb3J0IGNvbnN0IGdldFdpbmRvd3NFbnZpcm9ubWVudFBhdGggPSAoXG4gIG5hbWU6IFdpbmRvd3NFbnZpcm9ubWVudFBhdGhOYW1lLFxuKTogc3RyaW5nID0+IHtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICd3aW4zMicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bmFtZX0gd2FzIHJlcXVlc3RlZCBvdXRzaWRlIFdpbmRvd3NgKTtcbiAgfVxuXG4gIGNvbnN0IGVudmlyb25tZW50UGF0aCA9IHByb2Nlc3MuZW52W25hbWVdO1xuICBpZiAodHlwZW9mIGVudmlyb25tZW50UGF0aCAhPT0gJ3N0cmluZycgfHwgZW52aXJvbm1lbnRQYXRoLnRyaW0oKSA9PT0gJycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bmFtZX0gZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgbm90IGRlZmluZWRgKTtcbiAgfVxuXG4gIHJldHVybiBlbnZpcm9ubWVudFBhdGg7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0V2luZG93c1N5c3RlbUJpbmFyeVBhdGggPSAoYmluYXJ5TmFtZTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgY29uc3Qgc3lzdGVtUm9vdFBhdGggPSBnZXRXaW5kb3dzRW52aXJvbm1lbnRQYXRoKCdTeXN0ZW1Sb290Jyk7XG4gIHJldHVybiB3aW4zMi5qb2luKHN5c3RlbVJvb3RQYXRoLCAnU3lzdGVtMzInLCBiaW5hcnlOYW1lKTtcbn07XG4iLCJpbXBvcnQge2FwcCwgQnJvd3NlcldpbmRvdywgY2xpcGJvYXJkLCBkaWFsb2csIGlwY01haW59IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7SVNfREVWfSBmcm9tICdAL2Vudic7XG5pbXBvcnQge2FwcE5hbWV9IGZyb20gJ0AvdXRpbHMvc3RhcnRGdW5jdGlvbnMvYXBwTmFtZS5zdGFydC51dGlscyc7XG5pbXBvcnQge1xuICBpbml0U2hhcmVkVmFyaWFibGVzLFxuICBzaGFyZWRWYXJpYWJsZXMsXG59IGZyb20gJ0AvdXRpbHMvc3RhcnRGdW5jdGlvbnMvc2hhcmVkVmFyaWFibGVzLnN0YXJ0LnV0aWxzJztcblxuaW1wb3J0IHtpc0VsZWN0cm9uSW5pdGlhbGl6ZWQsIHN0ZXB9IGZyb20gJy4uJztcbmltcG9ydCB7ZG93bmxvYWRGaWxlLCB2ZXJib3NlQXhpb3N9IGZyb20gJy4vYXhpb3MudXRpbHMnO1xuaW1wb3J0IHtnZXRDb29raWV9IGZyb20gJy4vY29va2llcy51dGlscyc7XG5pbXBvcnQge2VsZWN0cm9uTG9nZ2VyfSBmcm9tICcuL2xvZ2dlci51dGlscyc7XG5pbXBvcnQge3Nob3J0aWZ5UGF0aH0gZnJvbSAnLi9wYXRoLnV0aWxzJztcbmltcG9ydCB7cHJlcGFyZVBwcm9Kc3h9IGZyb20gJy4vcHByb0pzeC51dGlscyc7XG5pbXBvcnQge1xuICBnZXRTdGFydHVwTmV0d29ya1N0YXRlLFxuICByZXF1ZXN0U3RhcnR1cFJldHJ5LFxufSBmcm9tICcuL3N0YXJ0RnVuY3Rpb25zL3N0YXJ0dXBOZXR3b3JrU3RhdGUuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHtsb2dXaW5kb3dzVGxzRXJyb3J9IGZyb20gJy4vdGxzRXJyb3IudXRpbHMnO1xuaW1wb3J0IHtcbiAgZ2V0V2luZG93c0Vudmlyb25tZW50UGF0aCxcbiAgaXNXaW5kb3dzRW52aXJvbm1lbnRQYXRoTmFtZSxcbn0gZnJvbSAnLi93aW5kb3dzRW52aXJvbm1lbnQudXRpbHMnO1xuXG5jb25zdCBzaG91bGROb3RBcHBlbmRBdXRvQ3V0OiBQYXJhbWV0ZXJzPHR5cGVvZiBhcHAuZ2V0UGF0aD5bMF1bXSA9IFtcbiAgJ3VzZXJEYXRhJyxcbl07XG5cbmNvbnN0IGlzTmF0aXZlUGF0aE5hbWUgPSAobmFtZTogdW5rbm93bik6IG5hbWUgaXMgJ2FwcERhdGEnIHwgJ2V4ZScgPT5cbiAgbmFtZSA9PT0gJ2FwcERhdGEnIHx8IG5hbWUgPT09ICdleGUnO1xuXG5jb25zdCBnZXRJUENQYXRoTmFtZSA9IChwYXlsb2FkOiB1bmtub3duKTogdW5rbm93biA9PiB7XG4gIGlmICh0eXBlb2YgcGF5bG9hZCAhPT0gJ29iamVjdCcgfHwgcGF5bG9hZCA9PT0gbnVsbCB8fCAhKCduYW1lJyBpbiBwYXlsb2FkKSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHBheWxvYWQubmFtZTtcbn07XG5cbmNvbnN0IGdldFJ1bnRpbWVQYXRocyA9ICgpID0+ICh7XG4gIExPR19GSUxFX1BBVEg6IHNoYXJlZFZhcmlhYmxlcz8uTE9HX0ZJTEVfUEFUSCxcbiAgVEFSX1BBVEg6IHNoYXJlZFZhcmlhYmxlcz8uVEFSX1BBVEgsXG4gIFRFTVBfRk9MREVSX1BBVEg6IHNoYXJlZFZhcmlhYmxlcz8uVEVNUF9GT0xERVJfUEFUSCxcbn0pO1xuXG5jb25zdCByZXN0b3JlUnVudGltZVBhdGhzID0gKHBhdGhzOiBSZXR1cm5UeXBlPHR5cGVvZiBnZXRSdW50aW1lUGF0aHM+KSA9PiB7XG4gIGlmICghc2hhcmVkVmFyaWFibGVzKSByZXR1cm47XG4gIGlmIChwYXRocy5URU1QX0ZPTERFUl9QQVRIKSB7XG4gICAgc2hhcmVkVmFyaWFibGVzLlRFTVBfRk9MREVSX1BBVEggPSBwYXRocy5URU1QX0ZPTERFUl9QQVRIO1xuICB9XG4gIGlmIChwYXRocy5MT0dfRklMRV9QQVRIKSB7XG4gICAgc2hhcmVkVmFyaWFibGVzLkxPR19GSUxFX1BBVEggPSBwYXRocy5MT0dfRklMRV9QQVRIO1xuICB9XG4gIGlmIChwYXRocy5UQVJfUEFUSCkge1xuICAgIHNoYXJlZFZhcmlhYmxlcy5UQVJfUEFUSCA9IHBhdGhzLlRBUl9QQVRIO1xuICB9XG59O1xuXG5jb25zdCByZWZyZXNoU2hhcmVkVmFyaWFibGVzID0gYXN5bmMgKCkgPT4ge1xuICBjb25zb2xlLmxvZyhcbiAgICAnW2VsZWN0cm9uOnJlZnJlc2hTaGFyZWRWYXJpYWJsZXNdIHNoYXJlZFZhcmlhYmxlcyBlbXB0eSwgcmV0cnlpbmcgaW5pdFNoYXJlZFZhcmlhYmxlcygpJyxcbiAgKTtcbiAgY29uc3QgcnVudGltZVBhdGhzID0gZ2V0UnVudGltZVBhdGhzKCk7XG4gIGF3YWl0IGluaXRTaGFyZWRWYXJpYWJsZXMoKTtcbiAgcmVzdG9yZVJ1bnRpbWVQYXRocyhydW50aW1lUGF0aHMpO1xuICBjb25zb2xlLmxvZyhcbiAgICAnW2VsZWN0cm9uOnJlZnJlc2hTaGFyZWRWYXJpYWJsZXNdIHNoYXJlZFZhcmlhYmxlcyByZWZyZXNoZWQ6JyxcbiAgICAhIXNoYXJlZFZhcmlhYmxlcyxcbiAgICBPYmplY3Qua2V5cyhzaGFyZWRWYXJpYWJsZXMgfHwge30pLFxuICApO1xuICByZXR1cm4gc2hhcmVkVmFyaWFibGVzO1xufTtcblxudHlwZSBQcmVsb2FkTmV0d29ya0Vycm9yUGF5bG9hZCA9IHtcbiAgZXJyb3I/OiB1bmtub3duO1xuICBzdGFjaz86ICdwcmVsb2FkLWdvdCc7XG4gIHVybD86IHN0cmluZztcbn07XG5cbmV4cG9ydCBjb25zdCBpbml0RWxlY3Ryb25JUENIYW5kbGVyID0gKCkgPT4ge1xuICBpcGNNYWluLm9uKCdlbGVjdHJvbjpnZXROYXRpdmVQYXRoJywgKGV2ZW50LCBwYXlsb2FkOiB1bmtub3duKSA9PiB7XG4gICAgY29uc3QgbmFtZSA9IGdldElQQ1BhdGhOYW1lKHBheWxvYWQpO1xuICAgIGlmICghaXNOYXRpdmVQYXRoTmFtZShuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBuYXRpdmUgRWxlY3Ryb24gcGF0aDogXCIke1N0cmluZyhuYW1lKX1cImApO1xuICAgIH1cblxuICAgIGV2ZW50LnJldHVyblZhbHVlID0gYXBwLmdldFBhdGgobmFtZSk7XG4gIH0pO1xuXG4gIGlwY01haW4ub24oXG4gICAgJ2VsZWN0cm9uOmdldFdpbmRvd3NFbnZpcm9ubWVudFBhdGgnLFxuICAgIChldmVudCwgcGF5bG9hZDogdW5rbm93bikgPT4ge1xuICAgICAgY29uc3QgbmFtZSA9IGdldElQQ1BhdGhOYW1lKHBheWxvYWQpO1xuICAgICAgaWYgKCFpc1dpbmRvd3NFbnZpcm9ubWVudFBhdGhOYW1lKG5hbWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5zdXBwb3J0ZWQgV2luZG93cyBlbnZpcm9ubWVudCBwYXRoOiBcIiR7U3RyaW5nKG5hbWUpfVwiYCxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSBnZXRXaW5kb3dzRW52aXJvbm1lbnRQYXRoKG5hbWUpO1xuICAgIH0sXG4gICk7XG5cbiAgaXBjTWFpbi5vbignZWxlY3Ryb246Z2V0UGF0aCcsIGFzeW5jIChldmVudCwge25hbWUsIHNraXBTaG9ydGlmeX0pID0+IHtcbiAgICBpZiAoWyd0ZW1wJywgJ3RlbXBQYXRoJ10uaW5jbHVkZXMobmFtZSkpIHtcbiAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gc2hhcmVkVmFyaWFibGVzPy5URU1QX0ZPTERFUl9QQVRIO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFwcERhdGFQYXRoID0gYXBwLmdldFBhdGgobmFtZSk7XG4gICAgY29uc3QgZmluYWxQYXRoID0gc2hvdWxkTm90QXBwZW5kQXV0b0N1dC5pbmNsdWRlcyhuYW1lKVxuICAgICAgPyBhcHBEYXRhUGF0aFxuICAgICAgOiBqb2luKGFwcERhdGFQYXRoLCBhcHBOYW1lKTtcbiAgICBldmVudC5yZXR1cm5WYWx1ZSA9IHNraXBTaG9ydGlmeVxuICAgICAgPyBmaW5hbFBhdGhcbiAgICAgIDogYXdhaXQgc2hvcnRpZnlQYXRoKGZpbmFsUGF0aCk7XG4gIH0pO1xuXG4gIGlwY01haW4ub24oJ2VsZWN0cm9uOmdldENsaXBib2FyZCcsIGV2ZW50ID0+IHtcbiAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGNsaXBib2FyZC5yZWFkVGV4dCgpO1xuICB9KTtcblxuICBpcGNNYWluLm9uKCdlbGVjdHJvbjpzZXRDbGlwYm9hcmQnLCAoZXZlbnQsIHt0ZXh0fSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdTZXR0aW5nIGNsaXBib2FyZCcsIHRleHQpO1xuICAgIGNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgZXZlbnQucmV0dXJuVmFsdWUgPSB0cnVlO1xuICB9KTtcblxuICBpcGNNYWluLm9uKCdlbGVjdHJvbjpnZXRWZXJzaW9uJywgZXZlbnQgPT4ge1xuICAgIGV2ZW50LnJldHVyblZhbHVlID0gc2hhcmVkVmFyaWFibGVzPy5WRVJTSU9OIHx8IGFwcC5nZXRWZXJzaW9uKCk7XG4gIH0pO1xuXG4gIGlwY01haW4ub24oXG4gICAgJ2VsZWN0cm9uOnNob3dTYXZlRGlhbG9nJyxcbiAgICAoXG4gICAgICBldmVudCxcbiAgICAgIHtcbiAgICAgICAgZGVmYXVsdFBhdGgsXG4gICAgICAgIGZpbHRlcnMsXG4gICAgICB9OiB7XG4gICAgICAgIGRlZmF1bHRQYXRoPzogc3RyaW5nO1xuICAgICAgICBmaWx0ZXJzPzoge25hbWU6IHN0cmluZzsgZXh0ZW5zaW9uczogc3RyaW5nW119W107XG4gICAgICB9LFxuICAgICkgPT4ge1xuICAgICAgY29uc3Qgd2luZG93ID0gQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClbMF07XG4gICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGRpYWxvZy5zaG93U2F2ZURpYWxvZ1N5bmMod2luZG93LCB7XG4gICAgICAgIGRlZmF1bHRQYXRoLFxuICAgICAgICBmaWx0ZXJzLFxuICAgICAgICBwcm9wZXJ0aWVzOiBbJ3Nob3dPdmVyd3JpdGVDb25maXJtYXRpb24nXSxcbiAgICAgIH0pO1xuICAgIH0sXG4gICk7XG5cbiAgaXBjTWFpbi5vbignZWxlY3Ryb246cmVkdWNlV2luZG93JywgKCkgPT4ge1xuICAgIEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpLmZvckVhY2god2luZG93ID0+IHtcbiAgICAgIHdpbmRvdy5taW5pbWl6ZSgpO1xuICAgIH0pO1xuICB9KTtcblxuICBpcGNNYWluLm9uKCdlbGVjdHJvbjpyZWRpcmVjdFRvRnJvbnQnLCBldmVudCA9PiB7XG4gICAgY29uc3Qgd2luZG93ID0gQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClbMF07XG4gICAgZXZlbnQucmV0dXJuVmFsdWUgPSB0cnVlO1xuICAgIGlmICh3aW5kb3cpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdSZWRpcmVjdGluZyB0byBmcm9udCcsIHNoYXJlZFZhcmlhYmxlcz8uRlJPTlRfVVJMKTtcbiAgICAgIHZvaWQgd2luZG93LmxvYWRVUkwoc2hhcmVkVmFyaWFibGVzPy5GUk9OVF9VUkwgfHwgJycpLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJlZGlyZWN0aW5nIHRvIGZyb250JywgZXJyKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnTm8gd2luZG93IGZvdW5kLCBjYW5ub3QgcmVkaXJlY3QgdG8gZnJvbnQnKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlwY01haW4ub24oJ2VsZWN0cm9uOnRvZ2dsZUFsd2F5c09uVG9wJywgZXZlbnQgPT4ge1xuICAgIGNvbnN0IHdpbmRvdyA9IEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpWzBdO1xuICAgIHdpbmRvdy5zZXRBbHdheXNPblRvcCghd2luZG93LmlzQWx3YXlzT25Ub3AoKSk7XG4gICAgZXZlbnQucmV0dXJuVmFsdWUgPSB3aW5kb3cuaXNBbHdheXNPblRvcCgpO1xuICB9KTtcblxuICBpcGNNYWluLm9uKCdlbGVjdHJvbjpnZXRTaGFyZWRWYXJpYWJsZXMnLCBldmVudCA9PiB7XG4gICAgZXZlbnQucmV0dXJuVmFsdWUgPSBzaGFyZWRWYXJpYWJsZXM7XG4gIH0pO1xuXG4gIGlwY01haW4uaGFuZGxlKCdlbGVjdHJvbjpyZWZyZXNoU2hhcmVkVmFyaWFibGVzJywgYXN5bmMgKCkgPT4ge1xuICAgIHJldHVybiByZWZyZXNoU2hhcmVkVmFyaWFibGVzKCk7XG4gIH0pO1xuXG4gIGlwY01haW4uaGFuZGxlKCdlbGVjdHJvbjpmbHVzaExvZ3MnLCBhc3luYyAoKSA9PiB7XG4gICAgYXdhaXQgZWxlY3Ryb25Mb2dnZXIud2FpdEZvckRyYWluKCk7XG4gIH0pO1xuXG4gIGlwY01haW4uaGFuZGxlKCdlbGVjdHJvbjpwcmVwYXJlUHByb0pzeCcsIGFzeW5jIChfZXZlbnQsIHVybDogc3RyaW5nKSA9PiB7XG4gICAgLy8gRGV2ZWxvcG1lbnQgQ0VQIHBhbmVscyBsb2FkIHRoZWlyIGJ1bmRsZWQsIHdhdGNoZWQgSlNYIHRocm91Z2ggaW5pdEJvbHQuXG4gICAgaWYgKElTX0RFVikgcmV0dXJuO1xuICAgIGNvbnN0IGRpcmVjdG9yeSA9IGpvaW4oYXBwLmdldFBhdGgoJ2FwcERhdGEnKSwgYXBwTmFtZSk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHByZXBhcmVQcHJvSnN4KHVybCwgZGlyZWN0b3J5KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW1BQcm8gSlNYXSBGYWlsZWQgdG8gcHJlcGFyZSBjbGllbnQnLCBlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH0pO1xuXG4gIGlwY01haW4ub24oJ2VsZWN0cm9uOnJldHJ5U3RhcnR1cE5ldHdvcmsnLCByZXF1ZXN0U3RhcnR1cFJldHJ5KTtcblxuICBpcGNNYWluLm9uKCdlbGVjdHJvbjppc1JlYWR5JywgZXZlbnQgPT4ge1xuICAgIGV2ZW50LnJldHVyblZhbHVlID0gW1xuICAgICAgaXNFbGVjdHJvbkluaXRpYWxpemVkLFxuICAgICAgc3RlcCxcbiAgICAgIGAke2dldENvb2tpZSgnYXBwVVVJRCcpfSAtICR7YXBwLmdldFZlcnNpb24oKX1gLFxuICAgICAgZ2V0U3RhcnR1cE5ldHdvcmtTdGF0ZSgpLFxuICAgIF07XG4gIH0pO1xuXG4gIGlwY01haW4ub24oJ2VsZWN0cm9uOmdldElQSW5mb3MnLCBhc3luYyBldmVudCA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFRoZSBBUEkgY2FuIHNvbWV0aW1lIHJldHVybiA0MDNcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHZlcmJvc2VBeGlvcy5nZXQoJ2h0dHBzOi8vYXBpLm15aXAuY29tJyk7XG4gICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IHJlcy5kYXRhO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2dXaW5kb3dzVGxzRXJyb3IoJ2F4aW9zJywgZXJyb3IsIHt1cmw6ICdodHRwczovL2FwaS5teWlwLmNvbSd9KTtcbiAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSk7XG5cbiAgaXBjTWFpbi5vbihcbiAgICAnZWxlY3Ryb246bG9nTmV0d29ya0Vycm9yJyxcbiAgICAoX2V2ZW50LCBwYXlsb2FkPzogUHJlbG9hZE5ldHdvcmtFcnJvclBheWxvYWQpID0+IHtcbiAgICAgIGxvZ1dpbmRvd3NUbHNFcnJvcihwYXlsb2FkPy5zdGFjayA/PyAncHJlbG9hZC1nb3QnLCBwYXlsb2FkPy5lcnJvciwge1xuICAgICAgICB1cmw6IHBheWxvYWQ/LnVybCxcbiAgICAgIH0pO1xuICAgIH0sXG4gICk7XG5cbiAgaXBjTWFpbi5vbihcbiAgICAnZWxlY3Ryb246ZG93bmxvYWQnLFxuICAgIGFzeW5jIChcbiAgICAgIGV2ZW50LFxuICAgICAgdXJsOiBzdHJpbmcsXG4gICAgICBvdXRwdXRGb2xkZXJQYXRoOiBzdHJpbmcsXG4gICAgICBvcHRpb25zPzoge3JlcXVpcmVIdHRwcz86IGJvb2xlYW59LFxuICAgICkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZG93bmxvYWRGaWxlKHVybCwgb3V0cHV0Rm9sZGVyUGF0aCwge1xuICAgICAgICAgIHJlcXVpcmVIdHRwczogb3B0aW9ucz8ucmVxdWlyZUh0dHBzLFxuICAgICAgICB9KTtcbiAgICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSByZXM7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBsb2dXaW5kb3dzVGxzRXJyb3IoJ2F4aW9zLWRvd25sb2FkJywgZXJyb3IsIHtvdXRwdXRGb2xkZXJQYXRoLCB1cmx9KTtcbiAgICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSxcbiAgKTtcbn07XG4iLCJpbXBvcnQgdHlwZSB7RXhlY0V4Y2VwdGlvbn0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmltcG9ydCB7ZXhpc3RzU3luYywgbWtkaXJTeW5jLCByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7dW56aXBTeW5jfSBmcm9tICdmZmxhdGUnO1xuaW1wb3J0IHtkaXJuYW1lLCBqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtzaGFyZWRWYXJpYWJsZXN9IGZyb20gJ0AvdXRpbHMvc3RhcnRGdW5jdGlvbnMvc2hhcmVkVmFyaWFibGVzLnN0YXJ0LnV0aWxzJztcblxuaW1wb3J0IHtleGVjRmlsZX0gZnJvbSAnLi9jaGlsZFByb2Nlc3MudXRpbHMnO1xuaW1wb3J0IHtnZXRXaW5kb3dzU3lzdGVtQmluYXJ5UGF0aH0gZnJvbSAnLi93aW5kb3dzRW52aXJvbm1lbnQudXRpbHMnO1xuXG4vLyBXaW5kb3dzIDEwKyBzaGlwcyBic2R0YXIgdW5kZXIgJVN5c3RlbVJvb3QlXFxTeXN0ZW0zMiBhbmQgbm9ybWFsbHkgZXhwb3NlcyBpdCBvbiBQQVRIIGFzIGB0YXJgLlxuY29uc3QgV0lORE9XU19ERUZBVUxUX1RBUiA9ICd0YXInO1xuXG5jb25zdCBnZXREZWZhdWx0VGFyQ2FuZGlkYXRlcyA9ICgpOiBzdHJpbmdbXSA9PiB7XG4gIGNvbnN0IGNhbmRpZGF0ZXMgPSBbV0lORE9XU19ERUZBVUxUX1RBUl07XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgY29uc3Qgc3lzdGVtUm9vdFBhdGggPSBwcm9jZXNzLmVudi5TeXN0ZW1Sb290O1xuICAgIGlmICh0eXBlb2Ygc3lzdGVtUm9vdFBhdGggPT09ICdzdHJpbmcnICYmIHN5c3RlbVJvb3RQYXRoLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgIGNhbmRpZGF0ZXMucHVzaChnZXRXaW5kb3dzU3lzdGVtQmluYXJ5UGF0aCgndGFyLmV4ZScpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNhbmRpZGF0ZXM7XG59O1xuXG5jb25zdCBmb3JtYXRFeGVjRmFpbHVyZSA9IChcbiAgbGFiZWw6IHN0cmluZyxcbiAgc3RkZXJyOiBzdHJpbmcsXG4gIGVycm9yOiBFeGVjRXhjZXB0aW9uLFxuKTogc3RyaW5nID0+XG4gIGAke2xhYmVsfSBmYWlsZWQgKGV4aXQgJHtlcnJvci5jb2RlID8/ICd1bmtub3duJ30pOiAke1xuICAgIHN0ZGVyciB8fCBlcnJvci5tZXNzYWdlIHx8ICdubyBlcnJvciBvdXRwdXQnXG4gIH1gO1xuXG5jb25zdCBnZXRUYXJDYW5kaWRhdGVzID0gKCk6IHN0cmluZ1tdID0+IHtcbiAgY29uc3QgaW5zdGFsbGVkVGFyID0gc2hhcmVkVmFyaWFibGVzPy5UQVJfUEFUSDtcbiAgY29uc3QgY2FuZGlkYXRlczogc3RyaW5nW10gPSBbXTtcbiAgaWYgKFxuICAgIHR5cGVvZiBpbnN0YWxsZWRUYXIgPT09ICdzdHJpbmcnICYmXG4gICAgaW5zdGFsbGVkVGFyICE9PSAnJyAmJlxuICAgIGV4aXN0c1N5bmMoaW5zdGFsbGVkVGFyKVxuICApIHtcbiAgICBjYW5kaWRhdGVzLnB1c2goaW5zdGFsbGVkVGFyKTtcbiAgfVxuICBjYW5kaWRhdGVzLnB1c2goLi4uZ2V0RGVmYXVsdFRhckNhbmRpZGF0ZXMoKSk7XG4gIHJldHVybiBjYW5kaWRhdGVzO1xufTtcblxuZXhwb3J0IGNvbnN0IHJlc29sdmVXb3JraW5nVGFyUGF0aCA9IGFzeW5jIChcbiAgZG93bmxvYWRlZFRhclBhdGg6IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gIGNvbnN0IGNhbmRpZGF0ZXMgPSBbZG93bmxvYWRlZFRhclBhdGgsIC4uLmdldERlZmF1bHRUYXJDYW5kaWRhdGVzKCldO1xuICBjb25zdCBmYWlsdXJlczogc3RyaW5nW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IHRhckJpbmFyeSBvZiBjYW5kaWRhdGVzKSB7XG4gICAgY29uc3Qge3N0ZGVyciwgZXJyb3J9ID0gYXdhaXQgZXhlY0ZpbGUodGFyQmluYXJ5LCBbJy0tdmVyc2lvbiddKTtcbiAgICBpZiAoZXJyb3IgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0YXJCaW5hcnk7XG4gICAgfVxuICAgIGZhaWx1cmVzLnB1c2goZm9ybWF0RXhlY0ZhaWx1cmUoYHRhciBcIiR7dGFyQmluYXJ5fVwiYCwgc3RkZXJyLCBlcnJvcikpO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgIGBObyB3b3JraW5nIHRhciBjYW5kaWRhdGUgZm91bmQ6IFwiJHtmYWlsdXJlcy5qb2luKCdcIiB8IFwiJyl9XCJgLFxuICApO1xufTtcblxuLy8gUnVucyBhIHRhciBzdWItY29tbWFuZCwgZmFsbGluZyBiYWNrIHRvIHRoZSBPUy1kZWZhdWx0IHRhciB3aGVuIHRoZVxuLy8gQXV0b0N1dC1pbnN0YWxsZWQgYmluYXJ5IGlzIG1pc3NpbmcsIGVtcHR5LCBvciBmYWlscyB0byBleGVjdXRlLlxuZXhwb3J0IGNvbnN0IHJ1blRhcldpdGhGYWxsYmFjayA9IGFzeW5jIChcbiAgdGFyQXJnczogc3RyaW5nW10sXG4gIGxhYmVsOiBzdHJpbmcsXG4pOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBjb25zdCBjYW5kaWRhdGVzID0gZ2V0VGFyQ2FuZGlkYXRlcygpO1xuICBjb25zdCBmYWlsdXJlczogc3RyaW5nW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IHRhckJpbmFyeSBvZiBjYW5kaWRhdGVzKSB7XG4gICAgY29uc29sZS5sb2coJ1J1bm5pbmcnLCB0YXJCaW5hcnksIHRhckFyZ3Muam9pbignICcpKTtcbiAgICBjb25zdCB7c3Rkb3V0LCBzdGRlcnIsIGVycm9yfSA9IGF3YWl0IGV4ZWNGaWxlKHRhckJpbmFyeSwgdGFyQXJncyk7XG4gICAgaWYgKGVycm9yID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gc3Rkb3V0O1xuICAgIH1cbiAgICBmYWlsdXJlcy5wdXNoKGZvcm1hdEV4ZWNGYWlsdXJlKGB0YXIgXCIke3RhckJpbmFyeX1cImAsIHN0ZGVyciwgZXJyb3IpKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihcbiAgICBgJHtsYWJlbH0gZmFpbGVkIGZvciBhbGwgdGFyIGNhbmRpZGF0ZXM6IFwiJHtmYWlsdXJlcy5qb2luKCdcIiB8IFwiJyl9XCJgLFxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IGV4dHJhY3RaaXBXaXRoRmZsYXRlID0gKFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICB1bnppcFBhdGg6IHN0cmluZyxcbik6IHN0cmluZ1tdID0+IHtcbiAgY29uc3QgYXJjaGl2ZSA9IHVuemlwU3luYyhyZWFkRmlsZVN5bmMoZmlsZVBhdGgpKTtcbiAgY29uc3QgdG9wTGV2ZWxFbnRyaWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgZm9yIChjb25zdCBbZW50cnlQYXRoLCBjb250ZW50XSBvZiBPYmplY3QuZW50cmllcyhhcmNoaXZlKSkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gZW50cnlQYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICBjb25zdCB0b3BTZWdtZW50ID0gbm9ybWFsaXplZFBhdGguc3BsaXQoJy8nKVswXTtcbiAgICBpZiAodG9wU2VnbWVudC5sZW5ndGggPiAwKSB7XG4gICAgICB0b3BMZXZlbEVudHJpZXMuYWRkKHRvcFNlZ21lbnQpO1xuICAgIH1cblxuICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gam9pbih1bnppcFBhdGgsIG5vcm1hbGl6ZWRQYXRoKTtcbiAgICBpZiAobm9ybWFsaXplZFBhdGguZW5kc1dpdGgoJy8nKSkge1xuICAgICAgbWtkaXJTeW5jKGRlc3RpbmF0aW9uLCB7cmVjdXJzaXZlOiB0cnVlfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1rZGlyU3luYyhkaXJuYW1lKGRlc3RpbmF0aW9uKSwge3JlY3Vyc2l2ZTogdHJ1ZX0pO1xuICAgICAgd3JpdGVGaWxlU3luYyhkZXN0aW5hdGlvbiwgY29udGVudCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIEFycmF5LmZyb20odG9wTGV2ZWxFbnRyaWVzKTtcbn07XG4iLCJpbXBvcnQge3NoYXJlZFZhcmlhYmxlc30gZnJvbSAnQC91dGlscy9zdGFydEZ1bmN0aW9ucy9zaGFyZWRWYXJpYWJsZXMuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHthcHAsIGlwY01haW59IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7ZXhpc3RzU3luYywgbWtkaXJTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtkb3dubG9hZEZpbGV9IGZyb20gJy4vYXhpb3MudXRpbHMnO1xuaW1wb3J0IHtzaG9ydGlmeVBhdGh9IGZyb20gJy4vcGF0aC51dGlscyc7XG5pbXBvcnQge2V4ZWNGaWxlfSBmcm9tICcuL2NoaWxkUHJvY2Vzcy51dGlscyc7XG5pbXBvcnQge2V4dHJhY3RaaXBXaXRoRmZsYXRlLCBydW5UYXJXaXRoRmFsbGJhY2t9IGZyb20gJy4vdGFyLnV0aWxzJztcblxuY29uc3Qgc3VwcG9ydGVkQXJjaHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmdbXX0gPSB7XG4gIGRhcndpbjogWydhcm02NCcsICd4NjQnXSxcbiAgd2luMzI6IFsnYXJtNjQnLCAneDY0J10sXG59O1xuY29uc3QgaXNBcmNoU3VwcG9ydGVkID0gKHBsYXRmb3JtOiBzdHJpbmcsIGFyY2g6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICBpZiAoIXN1cHBvcnRlZEFyY2hzW3BsYXRmb3JtXSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gc3VwcG9ydGVkQXJjaHNbcGxhdGZvcm1dLmluY2x1ZGVzKGFyY2gpO1xufTtcblxuY29uc3QgdW56aXBGaWxlID0gYXN5bmMgKGZpbGVQYXRoOiBzdHJpbmcsIHVuemlwUGF0aDogc3RyaW5nKSA9PiB7XG4gIGlmICh1bnppcFBhdGggJiYgIWV4aXN0c1N5bmModW56aXBQYXRoKSkge1xuICAgIG1rZGlyU3luYyh1bnppcFBhdGgsIHtyZWN1cnNpdmU6IHRydWV9KTtcbiAgfVxuXG4gIGlmIChvcy5wbGF0Zm9ybSgpID09PSAnZGFyd2luJykge1xuICAgIGNvbnN0IHVuemlwQXJncyA9IFtcbiAgICAgICctbycsXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIC4uLih1bnppcFBhdGggPyAoWyctZCcsIHVuemlwUGF0aF0gYXMgY29uc3QpIDogW10pLFxuICAgIF07XG4gICAgY29uc29sZS5sb2coJ1J1bm5pbmcgdW56aXAnLCB1bnppcEFyZ3Muam9pbignICcpKTtcbiAgICBjb25zdCB7c3RkZXJyLCBlcnJvcn0gPSBhd2FpdCBleGVjRmlsZSgndW56aXAnLCB1bnppcEFyZ3MpO1xuICAgIGlmIChlcnJvciAhPT0gbnVsbCkge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdW56aXBwaW5nOiAnLCBzdGRlcnIpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHN0ZGVycik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW5UYXJXaXRoRmFsbGJhY2soXG4gICAgICAgIFsnLXh2ZicsIGZpbGVQYXRoLCAuLi4odW56aXBQYXRoID8gKFsnLUMnLCB1bnppcFBhdGhdIGFzIGNvbnN0KSA6IFtdKV0sXG4gICAgICAgICd0YXIgZXh0cmFjdCcsXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ3RhciBleHRyYWN0aW9uIGZhaWxlZCwgZmFsbGluZyBiYWNrIHRvIGZmbGF0ZScsIGAke2Vycm9yfWApO1xuICAgICAgZXh0cmFjdFppcFdpdGhGZmxhdGUoZmlsZVBhdGgsIHVuemlwUGF0aCk7XG4gICAgfVxuICB9XG59O1xuXG5jb25zdCBkb3dubG9hZEZGTVBFRyA9IGFzeW5jICgpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBjb25zdCBkb3dubG9hZFBhdGggPSBzaGFyZWRWYXJpYWJsZXM/LlRFTVBfRk9MREVSX1BBVEg7XG4gIGlmICghZG93bmxvYWRQYXRoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUZW1wb3JhcnkgZm9sZGVyIHBhdGggaXMgdW5hdmFpbGFibGUnKTtcbiAgfVxuXG4gIC8vIEhvc3QgYXJjaCwgbm90IG9zLmFyY2goKTogdGhlIHg2NCBidWlsZCBydW5zIGVtdWxhdGVkIG9uIFdpbmRvd3Mtb24tQVJNLFxuICAvLyBhbmQgdGhlIHByZWxvYWQgdmFsaWRhdGVzIHRoZSBiaW5hcmllcyBhZ2FpbnN0IHRoZSBob3N0IGFyY2guXG4gIGNvbnN0IGFyY2ggPSBzaGFyZWRWYXJpYWJsZXM/LkFSQ0g7XG4gIGlmICghYXJjaCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSG9zdCBhcmNoIGlzIHVuYXZhaWxhYmxlJyk7XG4gIH1cblxuICBjb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4gIGlmICghaXNBcmNoU3VwcG9ydGVkKHBsYXRmb3JtLCBhcmNoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgYXJjaCAoJHthcmNofSlgKTtcbiAgfVxuXG4gIGNvbnN0IGRvd25sb2FkVXJscyA9IFtcbiAgICBgaHR0cHM6Ly9jZG4uYXV0b2N1dC50ZWNoLzBfcmVzc291cmNlcy9mZm1wZWcvJHtwbGF0Zm9ybX0vJHthcmNofS9mZm1wZWcuemlwYCxcbiAgICBgaHR0cHM6Ly9jZG4uYXV0b2N1dC50ZWNoLzBfcmVzc291cmNlcy9mZm1wZWcvJHtwbGF0Zm9ybX0vJHthcmNofS9mZnByb2JlLnppcGAsXG4gIF07XG4gIGNvbnNvbGUubG9nKCdkb3dubG9hZFVybHMnLCBkb3dubG9hZFVybHMpO1xuXG4gIGNvbnNvbGUubG9nKCdGRk1QRUcgd2lsbCBiZSBkb3dubG9hZGVkIHRvJywgZG93bmxvYWRQYXRoKTtcbiAgbWtkaXJTeW5jKGRvd25sb2FkUGF0aCwge3JlY3Vyc2l2ZTogdHJ1ZX0pO1xuXG4gIGNvbnN0IGZmbXBlZ0ZvbGRlclBhdGggPSBhd2FpdCBzaG9ydGlmeVBhdGgoXG4gICAgam9pbihgJHthcHAuZ2V0UGF0aCgndXNlckRhdGEnKX1gLCAnZmZtcGVnJyksXG4gICk7XG4gIGF3YWl0IFByb21pc2UuYWxsKFxuICAgIGRvd25sb2FkVXJscy5tYXAoYXN5bmMgdXJsID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdEb3dubG9hZGluZyBmcm9tJywgdXJsKTtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gYXdhaXQgZG93bmxvYWRGaWxlKHVybCwgZG93bmxvYWRQYXRoKTtcblxuICAgICAgY29uc29sZS5sb2coYEZGTVBFRyBkb3dubG9hZGVkIHRvICR7ZmlsZVBhdGh9YCk7XG4gICAgICBjb25zb2xlLmxvZygnVW56aXBwaW5nJywgZmlsZVBhdGgpO1xuICAgICAgYXdhaXQgdW56aXBGaWxlKGZpbGVQYXRoLCBmZm1wZWdGb2xkZXJQYXRoKTtcbiAgICB9KSxcbiAgKTtcblxuICByZXR1cm4gZmZtcGVnRm9sZGVyUGF0aDtcbn07XG5cbmV4cG9ydCBjb25zdCBpbml0U2V0dXBJUENIYW5kbGVyID0gKCkgPT4ge1xuICBpcGNNYWluLm9uKCdlbGVjdHJvbjpkb3dubG9hZEZGTVBFRycsIGFzeW5jIGV2ZW50ID0+IHtcbiAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGF3YWl0IGRvd25sb2FkRkZNUEVHKCk7XG4gIH0pO1xufTtcbiIsImltcG9ydCB0eXBlIHtVcGRhdGVPcHRpb25zfSBmcm9tICd2ZWxvcGFjayc7XG5cbmV4cG9ydCBjb25zdCBnZXRVcGRhdGVPcHRpb25zID0gKCk6IFVwZGF0ZU9wdGlvbnMgPT4gKHtcbiAgQWxsb3dWZXJzaW9uRG93bmdyYWRlOiB0cnVlLFxuICBNYXhpbXVtRGVsdGFzQmVmb3JlRmFsbGJhY2s6IDEwLFxufSk7XG4iLCJpbXBvcnQge2FwcH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHtzcGF3bn0gZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7cmFuZG9tVVVJRH0gZnJvbSAnbm9kZTpjcnlwdG8nO1xuaW1wb3J0IHtcbiAgYWNjZXNzU3luYyxcbiAgY29uc3RhbnRzLFxuICBleGlzdHNTeW5jLFxuICBta2RpclN5bmMsXG4gIG1rZHRlbXBTeW5jLFxuICByZWFscGF0aFN5bmMsXG4gIHJlbmFtZVN5bmMsXG4gIHJtU3luYyxcbn0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuXG5pbXBvcnQge2V4ZWNGaWxlfSBmcm9tICcuLi9jaGlsZFByb2Nlc3MudXRpbHMnO1xuaW1wb3J0IHthcHBOYW1lfSBmcm9tICcuL2FwcE5hbWUuc3RhcnQudXRpbHMnO1xuXG5leHBvcnQgdHlwZSBNYWNEZXN0aW5hdGlvblByb2JlID1cbiAgfCB7YXZhaWxhYmlsaXR5OiAncGVybWlzc2lvbi1kZW5pZWQnOyBlcnJvcjogRXJyb3J9XG4gIHwge2F2YWlsYWJpbGl0eTogJ3JlcGxhY2VhYmxlJ31cbiAgfCB7YXZhaWxhYmlsaXR5OiAndW5hdmFpbGFibGUnOyBlcnJvcjogRXJyb3J9O1xuXG5leHBvcnQgdHlwZSBNYWNJbnN0YWxsQWN0aW9uID0gJ2hhbmRvZmYnIHwgJ2luc3RhbGwnIHwgJ21pZ3JhdGUnIHwgJ25vbmUnO1xuXG5leHBvcnQgdHlwZSBNYWNJbnN0YWxsUmVzdWx0ID1cbiAgfCB7XG4gICAgICBhY3Rpb246ICdub25lJztcbiAgICAgIGN1cnJlbnRQYXRoOiBzdHJpbmc7XG4gICAgICBzY29wZTogTWFjSW5zdGFsbFNjb3BlO1xuICAgICAgc3RhdHVzOiAncmVhZHknO1xuICAgIH1cbiAgfCB7XG4gICAgICBhY3Rpb246IEV4Y2x1ZGU8TWFjSW5zdGFsbEFjdGlvbiwgJ25vbmUnPjtcbiAgICAgIGVycm9yOiBFcnJvcjtcbiAgICAgIHNjb3BlOiBFeGNsdWRlPE1hY0luc3RhbGxTY29wZSwgJ2V4dGVybmFsJz47XG4gICAgICBzb3VyY2VQYXRoOiBzdHJpbmc7XG4gICAgICBzdGF0dXM6ICdmYWlsZWQnO1xuICAgICAgdGFyZ2V0UGF0aDogc3RyaW5nO1xuICAgIH1cbiAgfCB7XG4gICAgICBhY3Rpb246IEV4Y2x1ZGU8TWFjSW5zdGFsbEFjdGlvbiwgJ25vbmUnPjtcbiAgICAgIHNjb3BlOiBFeGNsdWRlPE1hY0luc3RhbGxTY29wZSwgJ2V4dGVybmFsJz47XG4gICAgICBzb3VyY2VQYXRoOiBzdHJpbmc7XG4gICAgICBzdGF0dXM6ICdyZWxhdW5jaGluZyc7XG4gICAgICB0YXJnZXRQYXRoOiBzdHJpbmc7XG4gICAgfTtcblxuZXhwb3J0IHR5cGUgTWFjSW5zdGFsbFNjb3BlID0gJ2V4dGVybmFsJyB8ICdzeXN0ZW0nIHwgJ3VzZXInO1xuXG50eXBlIEluc3RhbGxlZFNjb3BlID0gRXhjbHVkZTxNYWNJbnN0YWxsU2NvcGUsICdleHRlcm5hbCc+O1xuXG50eXBlIEluc3RhbGxSZXF1ZXN0ID0ge1xuICBhY3Rpb246ICdpbnN0YWxsJyB8ICdtaWdyYXRlJztcbiAgc2NvcGU6IEluc3RhbGxlZFNjb3BlO1xuICBzb3VyY2VQYXRoOiBzdHJpbmc7XG4gIHRhcmdldFBhdGg6IHN0cmluZztcbn07XG5cbnR5cGUgTWFjSW5zdGFsbExvY2F0aW9uT3B0aW9ucyA9IHtcbiAgZXhlY3V0YWJsZVBhdGg/OiBzdHJpbmc7XG4gIHN5c3RlbUFwcFBhdGg/OiBzdHJpbmc7XG4gIHVzZXJBcHBQYXRoPzogc3RyaW5nO1xufTtcblxuY29uc3QgQVBQX0JVTkRMRV9OQU1FID0gYCR7YXBwTmFtZX0uYXBwYDtcbmNvbnN0IFBFUk1JU1NJT05fRVJST1JfQ09ERVMgPSBuZXcgU2V0KFsnRUFDQ0VTJywgJ0VQRVJNJywgJ0VST0ZTJ10pO1xuY29uc3QgUEVSTUlTU0lPTl9FUlJPUl9URVhUID0gW1xuICAnb3BlcmF0aW9uIG5vdCBwZXJtaXR0ZWQnLFxuICAncGVybWlzc2lvbiBkZW5pZWQnLFxuICAncmVhZC1vbmx5IGZpbGUgc3lzdGVtJyxcbl07XG5cbmNvbnN0IGlzVW5zaWduZWRRYUJ1aWxkID0gKCk6IGJvb2xlYW4gPT4ge1xuICBjb25zdCBidWlsZFZlcnNpb246IHVua25vd24gPSBpbXBvcnQubWV0YS5lbnYuVklURV9WRVJTSU9OO1xuICByZXR1cm4gdHlwZW9mIGJ1aWxkVmVyc2lvbiA9PT0gJ3N0cmluZycgJiYgYnVpbGRWZXJzaW9uLnN0YXJ0c1dpdGgoJ3FhLXByLScpO1xufTtcblxuY29uc3QgdG9FcnJvciA9IChlcnJvcjogdW5rbm93bik6IEVycm9yID0+IHtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cbiAgcmV0dXJuIG5ldyBFcnJvcihTdHJpbmcoZXJyb3IpKTtcbn07XG5cbmNvbnN0IGdldEVycm9yQ29kZSA9IChlcnJvcjogRXJyb3IpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICBjb25zdCBjYW5kaWRhdGUgPSBlcnJvciBhcyBOb2RlSlMuRXJybm9FeGNlcHRpb247XG4gIHJldHVybiB0eXBlb2YgY2FuZGlkYXRlLmNvZGUgPT09ICdzdHJpbmcnID8gY2FuZGlkYXRlLmNvZGUgOiB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgaXNNYWNJbnN0YWxsUGVybWlzc2lvbkVycm9yID0gKGVycm9yOiB1bmtub3duKTogYm9vbGVhbiA9PiB7XG4gIGxldCBjdXJyZW50RXJyb3I6IHVua25vd24gPSBlcnJvcjtcbiAgY29uc3QgdmlzaXRlZCA9IG5ldyBTZXQ8dW5rbm93bj4oKTtcblxuICB3aGlsZSAoY3VycmVudEVycm9yICYmICF2aXNpdGVkLmhhcyhjdXJyZW50RXJyb3IpKSB7XG4gICAgdmlzaXRlZC5hZGQoY3VycmVudEVycm9yKTtcbiAgICBjb25zdCBub3JtYWxpemVkRXJyb3IgPSB0b0Vycm9yKGN1cnJlbnRFcnJvcik7XG4gICAgY29uc3QgZXJyb3JDb2RlID0gZ2V0RXJyb3JDb2RlKG5vcm1hbGl6ZWRFcnJvcik7XG4gICAgaWYgKGVycm9yQ29kZSAmJiBQRVJNSVNTSU9OX0VSUk9SX0NPREVTLmhhcyhlcnJvckNvZGUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBub3JtYWxpemVkTWVzc2FnZSA9IG5vcm1hbGl6ZWRFcnJvci5tZXNzYWdlLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKFxuICAgICAgUEVSTUlTU0lPTl9FUlJPUl9URVhULnNvbWUobWVzc2FnZVBhcnQgPT5cbiAgICAgICAgbm9ybWFsaXplZE1lc3NhZ2UuaW5jbHVkZXMobWVzc2FnZVBhcnQpLFxuICAgICAgKVxuICAgICkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY3VycmVudEVycm9yID0gbm9ybWFsaXplZEVycm9yLmNhdXNlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3Qgbm9ybWFsaXplRXhpc3RpbmdQYXRoID0gKGNhbmRpZGF0ZVBhdGg6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGlmIChleGlzdHNTeW5jKGNhbmRpZGF0ZVBhdGgpKSB7XG4gICAgcmV0dXJuIHJlYWxwYXRoU3luYy5uYXRpdmUoY2FuZGlkYXRlUGF0aCk7XG4gIH1cbiAgcmV0dXJuIHBhdGgucmVzb2x2ZShjYW5kaWRhdGVQYXRoKTtcbn07XG5cbmNvbnN0IGFyZVNhbWVQYXRocyA9IChmaXJzdFBhdGg6IHN0cmluZywgc2Vjb25kUGF0aDogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gIGNvbnN0IG5vcm1hbGl6ZWRGaXJzdFBhdGggPSBub3JtYWxpemVFeGlzdGluZ1BhdGgoZmlyc3RQYXRoKTtcbiAgY29uc3Qgbm9ybWFsaXplZFNlY29uZFBhdGggPSBub3JtYWxpemVFeGlzdGluZ1BhdGgoc2Vjb25kUGF0aCk7XG4gIHJldHVybiBub3JtYWxpemVkRmlyc3RQYXRoID09PSBub3JtYWxpemVkU2Vjb25kUGF0aDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRNYWNJbnN0YWxsUGF0aHMgPSAoKToge1xuICBzeXN0ZW1BcHBQYXRoOiBzdHJpbmc7XG4gIHVzZXJBcHBQYXRoOiBzdHJpbmc7XG59ID0+IHtcbiAgY29uc3Qgc3lzdGVtQXBwUGF0aCA9IHBhdGguam9pbignL0FwcGxpY2F0aW9ucycsIEFQUF9CVU5ETEVfTkFNRSk7XG4gIGNvbnN0IHVzZXJBcHBsaWNhdGlvbnNQYXRoID0gcGF0aC5qb2luKGFwcC5nZXRQYXRoKCdob21lJyksICdBcHBsaWNhdGlvbnMnKTtcbiAgY29uc3QgdXNlckFwcFBhdGggPSBwYXRoLmpvaW4odXNlckFwcGxpY2F0aW9uc1BhdGgsIEFQUF9CVU5ETEVfTkFNRSk7XG4gIHJldHVybiB7c3lzdGVtQXBwUGF0aCwgdXNlckFwcFBhdGh9O1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEN1cnJlbnRNYWNBcHBCdW5kbGVQYXRoID0gKFxuICBleGVjdXRhYmxlUGF0aCA9IHByb2Nlc3MuZXhlY1BhdGgsXG4pOiBzdHJpbmcgPT4ge1xuICBjb25zdCByZXNvbHZlZEV4ZWN1dGFibGVQYXRoID0gcmVhbHBhdGhTeW5jLm5hdGl2ZShleGVjdXRhYmxlUGF0aCk7XG4gIGNvbnN0IHBhdGhQYXJ0cyA9IHJlc29sdmVkRXhlY3V0YWJsZVBhdGguc3BsaXQocGF0aC5zZXApO1xuXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwYXRoUGFydHMubGVuZ3RoIC0gMTsgaW5kZXggKz0gMSkge1xuICAgIGNvbnN0IHBhdGhQYXJ0ID0gcGF0aFBhcnRzW2luZGV4XTtcbiAgICBjb25zdCBuZXh0UGF0aFBhcnQgPSBwYXRoUGFydHNbaW5kZXggKyAxXTtcbiAgICBpZiAocGF0aFBhcnQuZW5kc1dpdGgoJy5hcHAnKSAmJiBuZXh0UGF0aFBhcnQgPT09ICdDb250ZW50cycpIHtcbiAgICAgIGNvbnN0IGJ1bmRsZVBhcnRzID0gcGF0aFBhcnRzLnNsaWNlKDAsIGluZGV4ICsgMSk7XG4gICAgICBjb25zdCBidW5kbGVQYXRoID0gYnVuZGxlUGFydHMuam9pbihwYXRoLnNlcCk7XG4gICAgICByZXR1cm4gYnVuZGxlUGF0aCB8fCBwYXRoLnNlcDtcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgYENvdWxkIG5vdCBkZXJpdmUgdGhlIG1hY09TIGFwcCBidW5kbGUgZnJvbSBleGVjdXRhYmxlIHBhdGg6ICR7cmVzb2x2ZWRFeGVjdXRhYmxlUGF0aH1gLFxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzVmFsaWRNYWNBcHBCdW5kbGUgPSAoYXBwQnVuZGxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gIGNvbnN0IGluZm9QbGlzdFBhdGggPSBwYXRoLmpvaW4oYXBwQnVuZGxlUGF0aCwgJ0NvbnRlbnRzJywgJ0luZm8ucGxpc3QnKTtcbiAgY29uc3QgZXhlY3V0YWJsZVBhdGggPSBwYXRoLmpvaW4oYXBwQnVuZGxlUGF0aCwgJ0NvbnRlbnRzJywgJ01hY09TJywgYXBwTmFtZSk7XG5cbiAgdHJ5IHtcbiAgICBhY2Nlc3NTeW5jKGluZm9QbGlzdFBhdGgsIGNvbnN0YW50cy5SX09LKTtcbiAgICBhY2Nlc3NTeW5jKGV4ZWN1dGFibGVQYXRoLCBjb25zdGFudHMuUl9PSyB8IGNvbnN0YW50cy5YX09LKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBjbGFzc2lmeVByb2JlRXJyb3IgPSAoZXJyb3I6IHVua25vd24pOiBNYWNEZXN0aW5hdGlvblByb2JlID0+IHtcbiAgY29uc3Qgbm9ybWFsaXplZEVycm9yID0gdG9FcnJvcihlcnJvcik7XG4gIGlmIChpc01hY0luc3RhbGxQZXJtaXNzaW9uRXJyb3Iobm9ybWFsaXplZEVycm9yKSkge1xuICAgIHJldHVybiB7YXZhaWxhYmlsaXR5OiAncGVybWlzc2lvbi1kZW5pZWQnLCBlcnJvcjogbm9ybWFsaXplZEVycm9yfTtcbiAgfVxuICByZXR1cm4ge2F2YWlsYWJpbGl0eTogJ3VuYXZhaWxhYmxlJywgZXJyb3I6IG5vcm1hbGl6ZWRFcnJvcn07XG59O1xuXG5jb25zdCByZW1vdmVQcm9iZVBhdGggPSAocHJvYmVQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQpOiB2b2lkID0+IHtcbiAgaWYgKCFwcm9iZVBhdGggfHwgIWV4aXN0c1N5bmMocHJvYmVQYXRoKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBybVN5bmMocHJvYmVQYXRoLCB7Zm9yY2U6IHRydWUsIHJlY3Vyc2l2ZTogdHJ1ZX0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHByb2JlTWFjQXBwQnVuZGxlUmVwbGFjZW1lbnQgPSAoXG4gIGFwcEJ1bmRsZVBhdGg6IHN0cmluZyxcbiAgY3JlYXRlUGFyZW50OiBib29sZWFuLFxuKTogTWFjRGVzdGluYXRpb25Qcm9iZSA9PiB7XG4gIGNvbnN0IHBhcmVudFBhdGggPSBwYXRoLmRpcm5hbWUoYXBwQnVuZGxlUGF0aCk7XG4gIGxldCBwcm9iZVBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgbGV0IHJlbmFtZWRQcm9iZVBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGlmIChjcmVhdGVQYXJlbnQpIHtcbiAgICAgIG1rZGlyU3luYyhwYXJlbnRQYXRoLCB7cmVjdXJzaXZlOiB0cnVlfSk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvYmVQcmVmaXggPSBwYXRoLmpvaW4ocGFyZW50UGF0aCwgYC4ke2FwcE5hbWV9LndyaXRlLXRlc3QtYCk7XG4gICAgcHJvYmVQYXRoID0gbWtkdGVtcFN5bmMocHJvYmVQcmVmaXgpO1xuICAgIHJlbmFtZWRQcm9iZVBhdGggPSBgJHtwcm9iZVBhdGh9LXJlbmFtZWRgO1xuICAgIHJlbmFtZVN5bmMocHJvYmVQYXRoLCByZW5hbWVkUHJvYmVQYXRoKTtcbiAgICBwcm9iZVBhdGggPSB1bmRlZmluZWQ7XG4gICAgcmVtb3ZlUHJvYmVQYXRoKHJlbmFtZWRQcm9iZVBhdGgpO1xuICAgIHJlbmFtZWRQcm9iZVBhdGggPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHthdmFpbGFiaWxpdHk6ICdyZXBsYWNlYWJsZSd9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBjbGFzc2lmeVByb2JlRXJyb3IoZXJyb3IpO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICByZW1vdmVQcm9iZVBhdGgocHJvYmVQYXRoKTtcbiAgICAgIHJlbW92ZVByb2JlUGF0aChyZW5hbWVkUHJvYmVQYXRoKTtcbiAgICB9IGNhdGNoIChjbGVhbnVwRXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tNYWNJbnN0YWxsXSBGYWlsZWQgdG8gcmVtb3ZlIHdyaXRlIHByb2JlOicsIGNsZWFudXBFcnJvcik7XG4gICAgfVxuICB9XG59O1xuXG5jb25zdCBydW5JbnN0YWxsQ29tbWFuZCA9IGFzeW5jIChcbiAgZXhlY3V0YWJsZTogc3RyaW5nLFxuICBhcmdzOiBzdHJpbmdbXSxcbiAgb3BlcmF0aW9uOiBzdHJpbmcsXG4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY0ZpbGUoZXhlY3V0YWJsZSwgYXJncyk7XG4gIGlmICghcmVzdWx0LmVycm9yKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZXJyb3JEZXRhaWwgPSByZXN1bHQuc3RkZXJyLnRyaW0oKSB8fCByZXN1bHQuZXJyb3IubWVzc2FnZTtcbiAgdGhyb3cgbmV3IEVycm9yKGAke29wZXJhdGlvbn0gZmFpbGVkOiAke2Vycm9yRGV0YWlsfWAsIHtcbiAgICBjYXVzZTogcmVzdWx0LmVycm9yLFxuICB9KTtcbn07XG5cbmNvbnN0IHJlc3RvcmVCYWNrdXAgPSAoXG4gIHRhcmdldFBhdGg6IHN0cmluZyxcbiAgYmFja3VwUGF0aDogc3RyaW5nLFxuKTogRXJyb3IgfCB1bmRlZmluZWQgPT4ge1xuICB0cnkge1xuICAgIGlmIChleGlzdHNTeW5jKHRhcmdldFBhdGgpKSB7XG4gICAgICBybVN5bmModGFyZ2V0UGF0aCwge2ZvcmNlOiB0cnVlLCByZWN1cnNpdmU6IHRydWV9KTtcbiAgICB9XG4gICAgcmVuYW1lU3luYyhiYWNrdXBQYXRoLCB0YXJnZXRQYXRoKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiB0b0Vycm9yKGVycm9yKTtcbiAgfVxufTtcblxuY29uc3QgcmVwbGFjZVRhcmdldFdpdGhTdGFnZWRCdW5kbGUgPSAoXG4gIHN0YWdlZFBhdGg6IHN0cmluZyxcbiAgdGFyZ2V0UGF0aDogc3RyaW5nLFxuKTogdm9pZCA9PiB7XG4gIGNvbnN0IHBhcmVudFBhdGggPSBwYXRoLmRpcm5hbWUodGFyZ2V0UGF0aCk7XG4gIGNvbnN0IGJhY2t1cE5hbWUgPSBgLiR7cGF0aC5iYXNlbmFtZSh0YXJnZXRQYXRoKX0uYmFja3VwLSR7cmFuZG9tVVVJRCgpfWA7XG4gIGNvbnN0IGJhY2t1cFBhdGggPSBwYXRoLmpvaW4ocGFyZW50UGF0aCwgYmFja3VwTmFtZSk7XG4gIGNvbnN0IHNob3VsZEJhY2t1cFRhcmdldCA9IGV4aXN0c1N5bmModGFyZ2V0UGF0aCk7XG4gIGxldCBkaWRNb3ZlU3RhZ2VkQnVuZGxlID0gZmFsc2U7XG5cbiAgdHJ5IHtcbiAgICBpZiAoc2hvdWxkQmFja3VwVGFyZ2V0KSB7XG4gICAgICByZW5hbWVTeW5jKHRhcmdldFBhdGgsIGJhY2t1cFBhdGgpO1xuICAgIH1cbiAgICByZW5hbWVTeW5jKHN0YWdlZFBhdGgsIHRhcmdldFBhdGgpO1xuICAgIGRpZE1vdmVTdGFnZWRCdW5kbGUgPSB0cnVlO1xuXG4gICAgaWYgKCFpc1ZhbGlkTWFjQXBwQnVuZGxlKHRhcmdldFBhdGgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEluc3RhbGxlZCBhcHAgYnVuZGxlIGlzIGludmFsaWQ6ICR7dGFyZ2V0UGF0aH1gKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKCFzaG91bGRCYWNrdXBUYXJnZXQgfHwgIWV4aXN0c1N5bmMoYmFja3VwUGF0aCkpIHtcbiAgICAgIGlmIChkaWRNb3ZlU3RhZ2VkQnVuZGxlICYmIGV4aXN0c1N5bmModGFyZ2V0UGF0aCkpIHtcbiAgICAgICAgcm1TeW5jKHRhcmdldFBhdGgsIHtmb3JjZTogdHJ1ZSwgcmVjdXJzaXZlOiB0cnVlfSk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG5cbiAgICBjb25zdCByZXN0b3JlRXJyb3IgPSByZXN0b3JlQmFja3VwKHRhcmdldFBhdGgsIGJhY2t1cFBhdGgpO1xuICAgIGlmIChyZXN0b3JlRXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEZhaWxlZCB0byBpbnN0YWxsICR7dGFyZ2V0UGF0aH0gYW5kIHJlc3RvcmUgYmFja3VwICR7YmFja3VwUGF0aH06ICR7cmVzdG9yZUVycm9yLm1lc3NhZ2V9YCxcbiAgICAgICAge2NhdXNlOiBlcnJvcn0sXG4gICAgICApO1xuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuXG4gIGlmIChzaG91bGRCYWNrdXBUYXJnZXQgJiYgZXhpc3RzU3luYyhiYWNrdXBQYXRoKSkge1xuICAgIHRyeSB7XG4gICAgICBybVN5bmMoYmFja3VwUGF0aCwge2ZvcmNlOiB0cnVlLCByZWN1cnNpdmU6IHRydWV9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBgW01hY0luc3RhbGxdIEluc3RhbGxlZCBhcHAgYnV0IGNvdWxkIG5vdCByZW1vdmUgYmFja3VwICR7YmFja3VwUGF0aH06YCxcbiAgICAgICAgZXJyb3IsXG4gICAgICApO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGluc3RhbGxNYWNBcHBCdW5kbGUgPSBhc3luYyAoXG4gIHNvdXJjZVBhdGg6IHN0cmluZyxcbiAgdGFyZ2V0UGF0aDogc3RyaW5nLFxuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmICghaXNWYWxpZE1hY0FwcEJ1bmRsZShzb3VyY2VQYXRoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgU291cmNlIGFwcCBidW5kbGUgaXMgaW52YWxpZDogJHtzb3VyY2VQYXRofWApO1xuICB9XG5cbiAgY29uc3QgcGFyZW50UGF0aCA9IHBhdGguZGlybmFtZSh0YXJnZXRQYXRoKTtcbiAgbWtkaXJTeW5jKHBhcmVudFBhdGgsIHtyZWN1cnNpdmU6IHRydWV9KTtcbiAgY29uc3Qgc3RhZ2VkTmFtZSA9IGAuJHtwYXRoLmJhc2VuYW1lKHRhcmdldFBhdGgpfS5pbnN0YWxsaW5nLSR7cmFuZG9tVVVJRCgpfWA7XG4gIGNvbnN0IHN0YWdlZFBhdGggPSBwYXRoLmpvaW4ocGFyZW50UGF0aCwgc3RhZ2VkTmFtZSk7XG5cbiAgY29uc29sZS5sb2coJ1tNYWNJbnN0YWxsXSBTdGFnaW5nIGFwcCBidW5kbGUnLCB7XG4gICAgc291cmNlUGF0aCxcbiAgICBzdGFnZWRQYXRoLFxuICAgIHRhcmdldFBhdGgsXG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgYXdhaXQgcnVuSW5zdGFsbENvbW1hbmQoXG4gICAgICAnL3Vzci9iaW4vZGl0dG8nLFxuICAgICAgWyctLXJzcmMnLCAnLS1leHRhdHRyJywgc291cmNlUGF0aCwgc3RhZ2VkUGF0aF0sXG4gICAgICAnQXBwIGJ1bmRsZSBjb3B5JyxcbiAgICApO1xuICAgIGF3YWl0IHJ1bkluc3RhbGxDb21tYW5kKFxuICAgICAgJy91c3IvYmluL3hhdHRyJyxcbiAgICAgIFsnLWRyJywgJ2NvbS5hcHBsZS5xdWFyYW50aW5lJywgc3RhZ2VkUGF0aF0sXG4gICAgICAnUXVhcmFudGluZSByZW1vdmFsJyxcbiAgICApO1xuICAgIGlmIChpc1Vuc2lnbmVkUWFCdWlsZCgpKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdbTWFjSW5zdGFsbF0gU2tpcHBpbmcgY29kZSBzaWduYXR1cmUgdmVyaWZpY2F0aW9uIGZvciBhbiB1bnNpZ25lZCBRQSBQUiBidWlsZC4nLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgcnVuSW5zdGFsbENvbW1hbmQoXG4gICAgICAgICcvdXNyL2Jpbi9jb2Rlc2lnbicsXG4gICAgICAgIFsnLS12ZXJpZnknLCAnLS1kZWVwJywgJy0tc3RyaWN0Jywgc3RhZ2VkUGF0aF0sXG4gICAgICAgICdDb2RlIHNpZ25hdHVyZSB2ZXJpZmljYXRpb24nLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmVwbGFjZVRhcmdldFdpdGhTdGFnZWRCdW5kbGUoc3RhZ2VkUGF0aCwgdGFyZ2V0UGF0aCk7XG4gIH0gZmluYWxseSB7XG4gICAgaWYgKGV4aXN0c1N5bmMoc3RhZ2VkUGF0aCkpIHtcbiAgICAgIHJtU3luYyhzdGFnZWRQYXRoLCB7Zm9yY2U6IHRydWUsIHJlY3Vyc2l2ZTogdHJ1ZX0pO1xuICAgIH1cbiAgfVxufTtcblxuY29uc3QgY3JlYXRlUmVhZHlSZXN1bHQgPSAoXG4gIGN1cnJlbnRQYXRoOiBzdHJpbmcsXG4gIHNjb3BlOiBNYWNJbnN0YWxsU2NvcGUsXG4pOiBNYWNJbnN0YWxsUmVzdWx0ID0+ICh7XG4gIGFjdGlvbjogJ25vbmUnLFxuICBjdXJyZW50UGF0aCxcbiAgc2NvcGUsXG4gIHN0YXR1czogJ3JlYWR5Jyxcbn0pO1xuXG5jb25zdCBjcmVhdGVIYW5kb2ZmUmVzdWx0ID0gKFxuICBzb3VyY2VQYXRoOiBzdHJpbmcsXG4gIHRhcmdldFBhdGg6IHN0cmluZyxcbiAgc2NvcGU6IEluc3RhbGxlZFNjb3BlLFxuKTogTWFjSW5zdGFsbFJlc3VsdCA9PiAoe1xuICBhY3Rpb246ICdoYW5kb2ZmJyxcbiAgc2NvcGUsXG4gIHNvdXJjZVBhdGgsXG4gIHN0YXR1czogJ3JlbGF1bmNoaW5nJyxcbiAgdGFyZ2V0UGF0aCxcbn0pO1xuXG5jb25zdCBjcmVhdGVGYWlsZWRSZXN1bHQgPSAoXG4gIHJlcXVlc3Q6IEluc3RhbGxSZXF1ZXN0LFxuICBlcnJvcjogdW5rbm93bixcbik6IE1hY0luc3RhbGxSZXN1bHQgPT4gKHtcbiAgYWN0aW9uOiByZXF1ZXN0LmFjdGlvbixcbiAgZXJyb3I6IHRvRXJyb3IoZXJyb3IpLFxuICBzY29wZTogcmVxdWVzdC5zY29wZSxcbiAgc291cmNlUGF0aDogcmVxdWVzdC5zb3VyY2VQYXRoLFxuICBzdGF0dXM6ICdmYWlsZWQnLFxuICB0YXJnZXRQYXRoOiByZXF1ZXN0LnRhcmdldFBhdGgsXG59KTtcblxuY29uc3QgcGVyZm9ybUluc3RhbGwgPSBhc3luYyAoXG4gIHJlcXVlc3Q6IEluc3RhbGxSZXF1ZXN0LFxuKTogUHJvbWlzZTxNYWNJbnN0YWxsUmVzdWx0PiA9PiB7XG4gIHRyeSB7XG4gICAgYXdhaXQgaW5zdGFsbE1hY0FwcEJ1bmRsZShyZXF1ZXN0LnNvdXJjZVBhdGgsIHJlcXVlc3QudGFyZ2V0UGF0aCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFjdGlvbjogcmVxdWVzdC5hY3Rpb24sXG4gICAgICBzY29wZTogcmVxdWVzdC5zY29wZSxcbiAgICAgIHNvdXJjZVBhdGg6IHJlcXVlc3Quc291cmNlUGF0aCxcbiAgICAgIHN0YXR1czogJ3JlbGF1bmNoaW5nJyxcbiAgICAgIHRhcmdldFBhdGg6IHJlcXVlc3QudGFyZ2V0UGF0aCxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBjcmVhdGVGYWlsZWRSZXN1bHQocmVxdWVzdCwgZXJyb3IpO1xuICB9XG59O1xuXG5jb25zdCBnZXRQcm9iZUVycm9yID0gKFxuICBwcm9iZTogRXhjbHVkZTxNYWNEZXN0aW5hdGlvblByb2JlLCB7YXZhaWxhYmlsaXR5OiAncmVwbGFjZWFibGUnfT4sXG4pOiBFcnJvciA9PiBwcm9iZS5lcnJvcjtcblxuY29uc3QgZW5zdXJlRnJvbVN5c3RlbUxvY2F0aW9uID0gYXN5bmMgKFxuICBjdXJyZW50UGF0aDogc3RyaW5nLFxuICBzeXN0ZW1BcHBQYXRoOiBzdHJpbmcsXG4gIHVzZXJBcHBQYXRoOiBzdHJpbmcsXG4pOiBQcm9taXNlPE1hY0luc3RhbGxSZXN1bHQ+ID0+IHtcbiAgY29uc3Qgc3lzdGVtUHJvYmUgPSBwcm9iZU1hY0FwcEJ1bmRsZVJlcGxhY2VtZW50KHN5c3RlbUFwcFBhdGgsIGZhbHNlKTtcbiAgaWYgKHN5c3RlbVByb2JlLmF2YWlsYWJpbGl0eSA9PT0gJ3JlcGxhY2VhYmxlJykge1xuICAgIHJldHVybiBjcmVhdGVSZWFkeVJlc3VsdChjdXJyZW50UGF0aCwgJ3N5c3RlbScpO1xuICB9XG5cbiAgY29uc3QgdXNlcklzVmFsaWQgPSBpc1ZhbGlkTWFjQXBwQnVuZGxlKHVzZXJBcHBQYXRoKTtcbiAgY29uc3QgdXNlclByb2JlID0gcHJvYmVNYWNBcHBCdW5kbGVSZXBsYWNlbWVudCh1c2VyQXBwUGF0aCwgdHJ1ZSk7XG4gIGlmICh1c2VySXNWYWxpZCAmJiB1c2VyUHJvYmUuYXZhaWxhYmlsaXR5ID09PSAncmVwbGFjZWFibGUnKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUhhbmRvZmZSZXN1bHQoY3VycmVudFBhdGgsIHVzZXJBcHBQYXRoLCAndXNlcicpO1xuICB9XG5cbiAgaWYgKFxuICAgIHN5c3RlbVByb2JlLmF2YWlsYWJpbGl0eSA9PT0gJ3Blcm1pc3Npb24tZGVuaWVkJyAmJlxuICAgIHVzZXJQcm9iZS5hdmFpbGFiaWxpdHkgPT09ICdyZXBsYWNlYWJsZSdcbiAgKSB7XG4gICAgcmV0dXJuIHBlcmZvcm1JbnN0YWxsKHtcbiAgICAgIGFjdGlvbjogJ21pZ3JhdGUnLFxuICAgICAgc2NvcGU6ICd1c2VyJyxcbiAgICAgIHNvdXJjZVBhdGg6IGN1cnJlbnRQYXRoLFxuICAgICAgdGFyZ2V0UGF0aDogdXNlckFwcFBhdGgsXG4gICAgfSk7XG4gIH1cblxuICBpZiAoc3lzdGVtUHJvYmUuYXZhaWxhYmlsaXR5ID09PSAndW5hdmFpbGFibGUnKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUZhaWxlZFJlc3VsdChcbiAgICAgIHtcbiAgICAgICAgYWN0aW9uOiAnbWlncmF0ZScsXG4gICAgICAgIHNjb3BlOiAnc3lzdGVtJyxcbiAgICAgICAgc291cmNlUGF0aDogY3VycmVudFBhdGgsXG4gICAgICAgIHRhcmdldFBhdGg6IHN5c3RlbUFwcFBhdGgsXG4gICAgICB9LFxuICAgICAgZ2V0UHJvYmVFcnJvcihzeXN0ZW1Qcm9iZSksXG4gICAgKTtcbiAgfVxuXG4gIGlmICh1c2VyUHJvYmUuYXZhaWxhYmlsaXR5ICE9PSAncmVwbGFjZWFibGUnKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUZhaWxlZFJlc3VsdChcbiAgICAgIHtcbiAgICAgICAgYWN0aW9uOiAnbWlncmF0ZScsXG4gICAgICAgIHNjb3BlOiAndXNlcicsXG4gICAgICAgIHNvdXJjZVBhdGg6IGN1cnJlbnRQYXRoLFxuICAgICAgICB0YXJnZXRQYXRoOiB1c2VyQXBwUGF0aCxcbiAgICAgIH0sXG4gICAgICBnZXRQcm9iZUVycm9yKHVzZXJQcm9iZSksXG4gICAgKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBtYWNPUyB1c2VyIGRlc3RpbmF0aW9uIHN0YXRlJyk7XG59O1xuXG5jb25zdCBlbnN1cmVGcm9tVXNlckxvY2F0aW9uID0gYXN5bmMgKFxuICBjdXJyZW50UGF0aDogc3RyaW5nLFxuICBzeXN0ZW1BcHBQYXRoOiBzdHJpbmcsXG4gIHVzZXJBcHBQYXRoOiBzdHJpbmcsXG4pOiBQcm9taXNlPE1hY0luc3RhbGxSZXN1bHQ+ID0+IHtcbiAgY29uc3QgdXNlclByb2JlID0gcHJvYmVNYWNBcHBCdW5kbGVSZXBsYWNlbWVudCh1c2VyQXBwUGF0aCwgZmFsc2UpO1xuICBpZiAodXNlclByb2JlLmF2YWlsYWJpbGl0eSA9PT0gJ3JlcGxhY2VhYmxlJykge1xuICAgIHJldHVybiBjcmVhdGVSZWFkeVJlc3VsdChjdXJyZW50UGF0aCwgJ3VzZXInKTtcbiAgfVxuXG4gIGNvbnN0IHN5c3RlbUlzVmFsaWQgPSBpc1ZhbGlkTWFjQXBwQnVuZGxlKHN5c3RlbUFwcFBhdGgpO1xuICBjb25zdCBzeXN0ZW1Qcm9iZSA9IHByb2JlTWFjQXBwQnVuZGxlUmVwbGFjZW1lbnQoc3lzdGVtQXBwUGF0aCwgZmFsc2UpO1xuICBpZiAoc3lzdGVtSXNWYWxpZCAmJiBzeXN0ZW1Qcm9iZS5hdmFpbGFiaWxpdHkgPT09ICdyZXBsYWNlYWJsZScpIHtcbiAgICByZXR1cm4gY3JlYXRlSGFuZG9mZlJlc3VsdChjdXJyZW50UGF0aCwgc3lzdGVtQXBwUGF0aCwgJ3N5c3RlbScpO1xuICB9XG5cbiAgaWYgKFxuICAgIHVzZXJQcm9iZS5hdmFpbGFiaWxpdHkgPT09ICdwZXJtaXNzaW9uLWRlbmllZCcgJiZcbiAgICBzeXN0ZW1Qcm9iZS5hdmFpbGFiaWxpdHkgPT09ICdyZXBsYWNlYWJsZSdcbiAgKSB7XG4gICAgcmV0dXJuIHBlcmZvcm1JbnN0YWxsKHtcbiAgICAgIGFjdGlvbjogJ21pZ3JhdGUnLFxuICAgICAgc2NvcGU6ICdzeXN0ZW0nLFxuICAgICAgc291cmNlUGF0aDogY3VycmVudFBhdGgsXG4gICAgICB0YXJnZXRQYXRoOiBzeXN0ZW1BcHBQYXRoLFxuICAgIH0pO1xuICB9XG5cbiAgaWYgKHVzZXJQcm9iZS5hdmFpbGFiaWxpdHkgPT09ICd1bmF2YWlsYWJsZScpIHtcbiAgICByZXR1cm4gY3JlYXRlRmFpbGVkUmVzdWx0KFxuICAgICAge1xuICAgICAgICBhY3Rpb246ICdtaWdyYXRlJyxcbiAgICAgICAgc2NvcGU6ICd1c2VyJyxcbiAgICAgICAgc291cmNlUGF0aDogY3VycmVudFBhdGgsXG4gICAgICAgIHRhcmdldFBhdGg6IHVzZXJBcHBQYXRoLFxuICAgICAgfSxcbiAgICAgIGdldFByb2JlRXJyb3IodXNlclByb2JlKSxcbiAgICApO1xuICB9XG5cbiAgaWYgKHN5c3RlbVByb2JlLmF2YWlsYWJpbGl0eSAhPT0gJ3JlcGxhY2VhYmxlJykge1xuICAgIHJldHVybiBjcmVhdGVGYWlsZWRSZXN1bHQoXG4gICAgICB7XG4gICAgICAgIGFjdGlvbjogJ21pZ3JhdGUnLFxuICAgICAgICBzY29wZTogJ3N5c3RlbScsXG4gICAgICAgIHNvdXJjZVBhdGg6IGN1cnJlbnRQYXRoLFxuICAgICAgICB0YXJnZXRQYXRoOiBzeXN0ZW1BcHBQYXRoLFxuICAgICAgfSxcbiAgICAgIGdldFByb2JlRXJyb3Ioc3lzdGVtUHJvYmUpLFxuICAgICk7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgbWFjT1Mgc3lzdGVtIGRlc3RpbmF0aW9uIHN0YXRlJyk7XG59O1xuXG5jb25zdCBpbnN0YWxsRXh0ZXJuYWxCdW5kbGVGb3JVc2VyID0gYXN5bmMgKFxuICBjdXJyZW50UGF0aDogc3RyaW5nLFxuICB1c2VyQXBwUGF0aDogc3RyaW5nLFxuKTogUHJvbWlzZTxNYWNJbnN0YWxsUmVzdWx0PiA9PiB7XG4gIGNvbnN0IHVzZXJQcm9iZSA9IHByb2JlTWFjQXBwQnVuZGxlUmVwbGFjZW1lbnQodXNlckFwcFBhdGgsIHRydWUpO1xuICBpZiAodXNlclByb2JlLmF2YWlsYWJpbGl0eSAhPT0gJ3JlcGxhY2VhYmxlJykge1xuICAgIHJldHVybiBjcmVhdGVGYWlsZWRSZXN1bHQoXG4gICAgICB7XG4gICAgICAgIGFjdGlvbjogJ2luc3RhbGwnLFxuICAgICAgICBzY29wZTogJ3VzZXInLFxuICAgICAgICBzb3VyY2VQYXRoOiBjdXJyZW50UGF0aCxcbiAgICAgICAgdGFyZ2V0UGF0aDogdXNlckFwcFBhdGgsXG4gICAgICB9LFxuICAgICAgZ2V0UHJvYmVFcnJvcih1c2VyUHJvYmUpLFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gcGVyZm9ybUluc3RhbGwoe1xuICAgIGFjdGlvbjogJ2luc3RhbGwnLFxuICAgIHNjb3BlOiAndXNlcicsXG4gICAgc291cmNlUGF0aDogY3VycmVudFBhdGgsXG4gICAgdGFyZ2V0UGF0aDogdXNlckFwcFBhdGgsXG4gIH0pO1xufTtcblxuY29uc3QgZW5zdXJlRnJvbUV4dGVybmFsTG9jYXRpb24gPSBhc3luYyAoXG4gIGN1cnJlbnRQYXRoOiBzdHJpbmcsXG4gIHN5c3RlbUFwcFBhdGg6IHN0cmluZyxcbiAgdXNlckFwcFBhdGg6IHN0cmluZyxcbik6IFByb21pc2U8TWFjSW5zdGFsbFJlc3VsdD4gPT4ge1xuICBjb25zdCB1c2VySXNWYWxpZCA9IGlzVmFsaWRNYWNBcHBCdW5kbGUodXNlckFwcFBhdGgpO1xuICBpZiAodXNlcklzVmFsaWQpIHtcbiAgICBjb25zdCB1c2VyUHJvYmUgPSBwcm9iZU1hY0FwcEJ1bmRsZVJlcGxhY2VtZW50KHVzZXJBcHBQYXRoLCBmYWxzZSk7XG4gICAgaWYgKHVzZXJQcm9iZS5hdmFpbGFiaWxpdHkgPT09ICdyZXBsYWNlYWJsZScpIHtcbiAgICAgIHJldHVybiBjcmVhdGVIYW5kb2ZmUmVzdWx0KGN1cnJlbnRQYXRoLCB1c2VyQXBwUGF0aCwgJ3VzZXInKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBzeXN0ZW1Jc1ZhbGlkID0gaXNWYWxpZE1hY0FwcEJ1bmRsZShzeXN0ZW1BcHBQYXRoKTtcbiAgY29uc3Qgc3lzdGVtUHJvYmUgPSBwcm9iZU1hY0FwcEJ1bmRsZVJlcGxhY2VtZW50KHN5c3RlbUFwcFBhdGgsIGZhbHNlKTtcbiAgaWYgKHN5c3RlbUlzVmFsaWQgJiYgc3lzdGVtUHJvYmUuYXZhaWxhYmlsaXR5ID09PSAncmVwbGFjZWFibGUnKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUhhbmRvZmZSZXN1bHQoY3VycmVudFBhdGgsIHN5c3RlbUFwcFBhdGgsICdzeXN0ZW0nKTtcbiAgfVxuXG4gIGlmIChzeXN0ZW1Qcm9iZS5hdmFpbGFiaWxpdHkgPT09ICdyZXBsYWNlYWJsZScpIHtcbiAgICBjb25zdCBzeXN0ZW1JbnN0YWxsUmVzdWx0ID0gYXdhaXQgcGVyZm9ybUluc3RhbGwoe1xuICAgICAgYWN0aW9uOiAnaW5zdGFsbCcsXG4gICAgICBzY29wZTogJ3N5c3RlbScsXG4gICAgICBzb3VyY2VQYXRoOiBjdXJyZW50UGF0aCxcbiAgICAgIHRhcmdldFBhdGg6IHN5c3RlbUFwcFBhdGgsXG4gICAgfSk7XG4gICAgaWYgKFxuICAgICAgc3lzdGVtSW5zdGFsbFJlc3VsdC5zdGF0dXMgIT09ICdmYWlsZWQnIHx8XG4gICAgICAhaXNNYWNJbnN0YWxsUGVybWlzc2lvbkVycm9yKHN5c3RlbUluc3RhbGxSZXN1bHQuZXJyb3IpXG4gICAgKSB7XG4gICAgICByZXR1cm4gc3lzdGVtSW5zdGFsbFJlc3VsdDtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcbiAgICAgICdbTWFjSW5zdGFsbF0gU3lzdGVtIGluc3RhbGxhdGlvbiBsb3N0IHdyaXRlIGFjY2VzczsgZmFsbGluZyBiYWNrIHRvIHRoZSB1c2VyIGxvY2F0aW9uLicsXG4gICAgKTtcbiAgICByZXR1cm4gaW5zdGFsbEV4dGVybmFsQnVuZGxlRm9yVXNlcihjdXJyZW50UGF0aCwgdXNlckFwcFBhdGgpO1xuICB9XG5cbiAgaWYgKHN5c3RlbVByb2JlLmF2YWlsYWJpbGl0eSA9PT0gJ3Blcm1pc3Npb24tZGVuaWVkJykge1xuICAgIHJldHVybiBpbnN0YWxsRXh0ZXJuYWxCdW5kbGVGb3JVc2VyKGN1cnJlbnRQYXRoLCB1c2VyQXBwUGF0aCk7XG4gIH1cblxuICByZXR1cm4gY3JlYXRlRmFpbGVkUmVzdWx0KFxuICAgIHtcbiAgICAgIGFjdGlvbjogJ2luc3RhbGwnLFxuICAgICAgc2NvcGU6ICdzeXN0ZW0nLFxuICAgICAgc291cmNlUGF0aDogY3VycmVudFBhdGgsXG4gICAgICB0YXJnZXRQYXRoOiBzeXN0ZW1BcHBQYXRoLFxuICAgIH0sXG4gICAgZ2V0UHJvYmVFcnJvcihzeXN0ZW1Qcm9iZSksXG4gICk7XG59O1xuXG5jb25zdCBnZXRDdXJyZW50SW5zdGFsbFNjb3BlID0gKFxuICBjdXJyZW50UGF0aDogc3RyaW5nLFxuICBzeXN0ZW1BcHBQYXRoOiBzdHJpbmcsXG4gIHVzZXJBcHBQYXRoOiBzdHJpbmcsXG4pOiBNYWNJbnN0YWxsU2NvcGUgPT4ge1xuICBpZiAoYXJlU2FtZVBhdGhzKGN1cnJlbnRQYXRoLCBzeXN0ZW1BcHBQYXRoKSkge1xuICAgIHJldHVybiAnc3lzdGVtJztcbiAgfVxuICBpZiAoYXJlU2FtZVBhdGhzKGN1cnJlbnRQYXRoLCB1c2VyQXBwUGF0aCkpIHtcbiAgICByZXR1cm4gJ3VzZXInO1xuICB9XG4gIHJldHVybiAnZXh0ZXJuYWwnO1xufTtcblxuZXhwb3J0IGNvbnN0IGVuc3VyZU1hY0luc3RhbGxMb2NhdGlvbiA9IGFzeW5jIChcbiAgb3B0aW9uczogTWFjSW5zdGFsbExvY2F0aW9uT3B0aW9ucyA9IHt9LFxuKTogUHJvbWlzZTxNYWNJbnN0YWxsUmVzdWx0PiA9PiB7XG4gIGlmICghYXBwLmlzUGFja2FnZWQgfHwgcHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ2RhcndpbicpIHtcbiAgICByZXR1cm4gY3JlYXRlUmVhZHlSZXN1bHQocHJvY2Vzcy5leGVjUGF0aCwgJ2V4dGVybmFsJyk7XG4gIH1cblxuICBjb25zdCBkZWZhdWx0SW5zdGFsbFBhdGhzID0gZ2V0TWFjSW5zdGFsbFBhdGhzKCk7XG4gIGNvbnN0IHN5c3RlbUFwcFBhdGggPVxuICAgIG9wdGlvbnMuc3lzdGVtQXBwUGF0aCA/PyBkZWZhdWx0SW5zdGFsbFBhdGhzLnN5c3RlbUFwcFBhdGg7XG4gIGNvbnN0IHVzZXJBcHBQYXRoID0gb3B0aW9ucy51c2VyQXBwUGF0aCA/PyBkZWZhdWx0SW5zdGFsbFBhdGhzLnVzZXJBcHBQYXRoO1xuICBjb25zdCBleGVjdXRhYmxlUGF0aCA9IG9wdGlvbnMuZXhlY3V0YWJsZVBhdGggPz8gcHJvY2Vzcy5leGVjUGF0aDtcbiAgbGV0IGN1cnJlbnRQYXRoOiBzdHJpbmc7XG4gIHRyeSB7XG4gICAgY3VycmVudFBhdGggPSBnZXRDdXJyZW50TWFjQXBwQnVuZGxlUGF0aChleGVjdXRhYmxlUGF0aCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUZhaWxlZFJlc3VsdChcbiAgICAgIHtcbiAgICAgICAgYWN0aW9uOiAnaW5zdGFsbCcsXG4gICAgICAgIHNjb3BlOiAnc3lzdGVtJyxcbiAgICAgICAgc291cmNlUGF0aDogZXhlY3V0YWJsZVBhdGgsXG4gICAgICAgIHRhcmdldFBhdGg6IHN5c3RlbUFwcFBhdGgsXG4gICAgICB9LFxuICAgICAgZXJyb3IsXG4gICAgKTtcbiAgfVxuXG4gIGlmICghaXNWYWxpZE1hY0FwcEJ1bmRsZShjdXJyZW50UGF0aCkpIHtcbiAgICByZXR1cm4gY3JlYXRlRmFpbGVkUmVzdWx0KFxuICAgICAge1xuICAgICAgICBhY3Rpb246ICdpbnN0YWxsJyxcbiAgICAgICAgc2NvcGU6ICdzeXN0ZW0nLFxuICAgICAgICBzb3VyY2VQYXRoOiBjdXJyZW50UGF0aCxcbiAgICAgICAgdGFyZ2V0UGF0aDogc3lzdGVtQXBwUGF0aCxcbiAgICAgIH0sXG4gICAgICBuZXcgRXJyb3IoYFJ1bm5pbmcgYXBwIGJ1bmRsZSBpcyBpbnZhbGlkOiAke2N1cnJlbnRQYXRofWApLFxuICAgICk7XG4gIH1cblxuICBjb25zdCBjdXJyZW50U2NvcGUgPSBnZXRDdXJyZW50SW5zdGFsbFNjb3BlKFxuICAgIGN1cnJlbnRQYXRoLFxuICAgIHN5c3RlbUFwcFBhdGgsXG4gICAgdXNlckFwcFBhdGgsXG4gICk7XG4gIGNvbnNvbGUubG9nKCdbTWFjSW5zdGFsbF0gUmVzb2x2aW5nIGluc3RhbGxhdGlvbiBsb2NhdGlvbicsIHtcbiAgICBjdXJyZW50UGF0aCxcbiAgICBjdXJyZW50U2NvcGUsXG4gICAgc3lzdGVtQXBwUGF0aCxcbiAgICB1c2VyQXBwUGF0aCxcbiAgfSk7XG5cbiAgaWYgKGN1cnJlbnRTY29wZSA9PT0gJ3N5c3RlbScpIHtcbiAgICByZXR1cm4gZW5zdXJlRnJvbVN5c3RlbUxvY2F0aW9uKGN1cnJlbnRQYXRoLCBzeXN0ZW1BcHBQYXRoLCB1c2VyQXBwUGF0aCk7XG4gIH1cbiAgaWYgKGN1cnJlbnRTY29wZSA9PT0gJ3VzZXInKSB7XG4gICAgcmV0dXJuIGVuc3VyZUZyb21Vc2VyTG9jYXRpb24oY3VycmVudFBhdGgsIHN5c3RlbUFwcFBhdGgsIHVzZXJBcHBQYXRoKTtcbiAgfVxuICByZXR1cm4gZW5zdXJlRnJvbUV4dGVybmFsTG9jYXRpb24oY3VycmVudFBhdGgsIHN5c3RlbUFwcFBhdGgsIHVzZXJBcHBQYXRoKTtcbn07XG5cbmNvbnN0IE9QRU5fQUZURVJfRVhJVF9TQ1JJUFQgPSBgXG5wYXJlbnRfcGlkPVwiJDFcIlxudGFyZ2V0X2FwcD1cIiQyXCJcbmRlZXBfbGlua191cmw9XCIkM1wiXG53aGlsZSBraWxsIC0wIFwiJHBhcmVudF9waWRcIiAyPi9kZXYvbnVsbDsgZG9cbiAgL2Jpbi9zbGVlcCAwLjFcbmRvbmVcbmlmIFsgLW4gXCIkZGVlcF9saW5rX3VybFwiIF07IHRoZW5cbiAgZXhlYyAvdXNyL2Jpbi9vcGVuIC1hIFwiJHRhcmdldF9hcHBcIiBcIiRkZWVwX2xpbmtfdXJsXCJcbmZpXG5leGVjIC91c3IvYmluL29wZW4gLWEgXCIkdGFyZ2V0X2FwcFwiXG5gO1xuXG5leHBvcnQgY29uc3QgbGF1bmNoTWFjQXBwQWZ0ZXJDdXJyZW50UHJvY2Vzc0V4aXRzID0gKFxuICB0YXJnZXRQYXRoOiBzdHJpbmcsXG4gIGRlZXBMaW5rVXJsPzogc3RyaW5nLFxuKTogdm9pZCA9PiB7XG4gIGNvbnN0IGhhbmRvZmZQcm9jZXNzID0gc3Bhd24oXG4gICAgJy9iaW4vc2gnLFxuICAgIFtcbiAgICAgICctYycsXG4gICAgICBPUEVOX0FGVEVSX0VYSVRfU0NSSVBULFxuICAgICAgJ2F1dG9jdXQtbWFjLWluc3RhbGwtaGFuZG9mZicsXG4gICAgICBTdHJpbmcocHJvY2Vzcy5waWQpLFxuICAgICAgdGFyZ2V0UGF0aCxcbiAgICAgIGRlZXBMaW5rVXJsID8/ICcnLFxuICAgIF0sXG4gICAge2N3ZDogYXBwLmdldFBhdGgoJ3RlbXAnKSwgZGV0YWNoZWQ6IHRydWUsIHN0ZGlvOiAnaWdub3JlJ30sXG4gICk7XG4gIGhhbmRvZmZQcm9jZXNzLm9uY2UoJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tNYWNJbnN0YWxsXSBGYWlsZWQgdG8gc3RhcnQgaGFuZG9mZiBoZWxwZXI6JywgZXJyb3IpO1xuICB9KTtcbiAgaGFuZG9mZlByb2Nlc3MudW5yZWYoKTtcbn07XG4iLCJpbXBvcnQgKiBhcyBTZW50cnkgZnJvbSAnQHNlbnRyeS9lbGVjdHJvbi9tYWluJztcbmltcG9ydCB7YXBwLCBCcm93c2VyV2luZG93LCBkaWFsb2csIGlwY01haW59IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7ZXhpdH0gZnJvbSAncHJvY2Vzcyc7XG5pbXBvcnQgdHlwZSB7VXBkYXRlSW5mb30gZnJvbSAndmVsb3BhY2snO1xuaW1wb3J0IHtVcGRhdGVNYW5hZ2VyfSBmcm9tICd2ZWxvcGFjayc7XG5cbmltcG9ydCB7SVNfUFJPRH0gZnJvbSAnLi4vLi4vZW52JztcbmltcG9ydCB7Z2V0VXBkYXRlT3B0aW9uc30gZnJvbSAnLi4vLi4vcWEvcWFVcGRhdGVyJztcbmltcG9ydCB7ZWxlY3Ryb25Mb2dnZXJ9IGZyb20gJy4uL2xvZ2dlci51dGlscyc7XG5pbXBvcnQge3JlbW92ZVN0YXJ0aW5nRmlsZX0gZnJvbSAnLi4vc3RhcnRpbmdGaWxlLnV0aWxzJztcbmltcG9ydCB7bG9nV2luZG93c1Rsc0Vycm9yfSBmcm9tICcuLi90bHNFcnJvci51dGlscyc7XG5pbXBvcnQge1xuICBlbnN1cmVNYWNJbnN0YWxsTG9jYXRpb24sXG4gIGxhdW5jaE1hY0FwcEFmdGVyQ3VycmVudFByb2Nlc3NFeGl0cyxcbiAgdHlwZSBNYWNJbnN0YWxsUmVzdWx0LFxufSBmcm9tICcuL21hY0luc3RhbGxMb2NhdGlvbi5zdGFydC51dGlscyc7XG5pbXBvcnQge3NoYXJlZFZhcmlhYmxlc30gZnJvbSAnLi9zaGFyZWRWYXJpYWJsZXMuc3RhcnQudXRpbHMnO1xuXG5leHBvcnQgdHlwZSBVcGRhdGVDaGVja0luZm8gPSB7XG4gIHN0YXR1czogJ2NoZWNraW5nJyB8ICdkb3dubG9hZGluZycgfCAncmVhZHknIHwgJ2Vycm9yJyB8ICd1cC10by1kYXRlJztcbiAgcHJvZ3Jlc3M/OiBudW1iZXI7XG59O1xuXG5jb25zdCBpc0F1dG9VcGRhdGVFbmFibGVkID0gYXBwLmlzUGFja2FnZWQ7XG5cbmNvbnN0IHZlcnNpb24gPVxuICBJU19QUk9EIHx8ICFpbXBvcnQubWV0YS5lbnYuVklURV9WRVJTSU9OXG4gICAgPyBhcHAuZ2V0VmVyc2lvbigpXG4gICAgOiBpbXBvcnQubWV0YS5lbnYuVklURV9WRVJTSU9OO1xuXG5jb25zdCBFTEVDVFJPTl9BUFBfUFJPSkVDVF9JRCA9ICdhZWEnO1xuXG5jb25zdCBub3JtYWxpemVWZXJzaW9uRm9yQ29tcGFyZSA9ICh2ZXJzaW9uOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgdmVyc2lvbi5yZXBsYWNlKC9edi8sICcnKS5yZXBsYWNlKC9ec3RnLS8sICcnKTtcblxuY29uc3QgaXNDdXJyZW50VmVyc2lvbkxhdGVzdCA9ICgpOiBib29sZWFuIHwgdW5kZWZpbmVkID0+IHtcbiAgY29uc3QgcHJvamVjdFZlcnNpb25zSnNvbiA9IHNoYXJlZFZhcmlhYmxlcz8uUFJPSkVDVF9WRVJTSU9OUztcbiAgaWYgKCFwcm9qZWN0VmVyc2lvbnNKc29uKSB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICAnW2luaXRVcGRhdGVyXSBQUk9KRUNUX1ZFUlNJT05TIG5vdCBpbiBzaGFyZWRWYXJpYWJsZXMsIHdpbGwgcnVuIFVwZGF0ZU1hbmFnZXInLFxuICAgICk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgcHJvamVjdFZlcnNpb25zID0gSlNPTi5wYXJzZShwcm9qZWN0VmVyc2lvbnNKc29uKSBhcyBSZWNvcmQ8XG4gICAgICBzdHJpbmcsXG4gICAgICBzdHJpbmdcbiAgICA+O1xuICAgIGNvbnN0IGNvb2tUYWcgPSBwcm9qZWN0VmVyc2lvbnNbRUxFQ1RST05fQVBQX1BST0pFQ1RfSURdO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRDdXJyZW50ID0gbm9ybWFsaXplVmVyc2lvbkZvckNvbXBhcmUodmVyc2lvbik7XG4gICAgaWYgKCFjb29rVGFnKSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgYFtpbml0VXBkYXRlcl0gTm8gQ29vayB0YWcgZm9yICR7RUxFQ1RST05fQVBQX1BST0pFQ1RfSUR9LCB3aWxsIHJ1biBVcGRhdGVNYW5hZ2VyYCxcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgYFtpbml0VXBkYXRlcl0gVmVyc2lvbiBjaGVjazogY3VycmVudD1cIiR7dmVyc2lvbn1cIiAoJHtub3JtYWxpemVkQ3VycmVudH0pLCBDb29rPVwibm9uZVwiLCBpc0xhdGVzdD11bmtub3duYCxcbiAgICAgICk7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IG5vcm1hbGl6ZWRDb29rID0gbm9ybWFsaXplVmVyc2lvbkZvckNvbXBhcmUoY29va1RhZyk7XG4gICAgY29uc3QgaXNMYXRlc3QgPSBub3JtYWxpemVkQ3VycmVudCA9PT0gbm9ybWFsaXplZENvb2s7XG5cbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIGBbaW5pdFVwZGF0ZXJdIFZlcnNpb24gY2hlY2s6IGN1cnJlbnQ9XCIke3ZlcnNpb259XCIgKCR7bm9ybWFsaXplZEN1cnJlbnR9KSwgQ29vaz1cIiR7Y29va1RhZ31cIiAoJHtub3JtYWxpemVkQ29va30pLCBpc0xhdGVzdD0ke2lzTGF0ZXN0fWAsXG4gICAgKTtcbiAgICByZXR1cm4gaXNMYXRlc3Q7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICAnW2luaXRVcGRhdGVyXSBGYWlsZWQgdG8gcGFyc2UgUFJPSkVDVF9WRVJTSU9OUywgd2lsbCBydW4gVXBkYXRlTWFuYWdlcicsXG4gICAgICBlcnJvcixcbiAgICApO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn07XG5cbmxldCB1cGRhdGVNYW5hZ2VyOiBVcGRhdGVNYW5hZ2VyIHwgbnVsbCA9IG51bGw7XG5leHBvcnQgY29uc3QgdXBkYXRlQ2hlY2tJbmZvOiBVcGRhdGVDaGVja0luZm8gPSB7XG4gIHN0YXR1czogaXNBdXRvVXBkYXRlRW5hYmxlZCA/ICdjaGVja2luZycgOiAndXAtdG8tZGF0ZScsXG59O1xuZXhwb3J0IGxldCB1cGRhdGVJbmZvOiBVcGRhdGVJbmZvIHwgbnVsbCA9IG51bGw7XG5cbmNvbnN0IGNsb3NlQWxsV2luZG93cyA9ICgpOiB2b2lkID0+IHtcbiAgQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKCkuZm9yRWFjaCgod2luZG93OiBCcm93c2VyV2luZG93KSA9PiB7XG4gICAgaWYgKCF3aW5kb3cuaXNEZXN0cm95ZWQoKSkge1xuICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGdldE1hY0luc3RhbGxGYWlsdXJlRGV0YWlsID0gKFxuICBpbnN0YWxsUmVzdWx0OiBFeHRyYWN0PE1hY0luc3RhbGxSZXN1bHQsIHtzdGF0dXM6ICdmYWlsZWQnfT4sXG4pOiBzdHJpbmcgPT4ge1xuICByZXR1cm4gW1xuICAgIGBTb3VyY2U6ICR7aW5zdGFsbFJlc3VsdC5zb3VyY2VQYXRofWAsXG4gICAgYERlc3RpbmF0aW9uOiAke2luc3RhbGxSZXN1bHQudGFyZ2V0UGF0aH1gLFxuICAgICcnLFxuICAgIGluc3RhbGxSZXN1bHQuZXJyb3IubWVzc2FnZSxcbiAgXS5qb2luKCdcXG4nKTtcbn07XG5cbmNvbnN0IHN0b3BGb3JNYWNJbnN0YWxsRmFpbHVyZSA9IGFzeW5jIChcbiAgaW5zdGFsbFJlc3VsdDogRXh0cmFjdDxNYWNJbnN0YWxsUmVzdWx0LCB7c3RhdHVzOiAnZmFpbGVkJ30+LFxuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGNvbnNvbGUuZXJyb3IoJ1tVcGRhdGVyXSBtYWNPUyBpbnN0YWxsIGxvY2F0aW9uIGNoZWNrIGZhaWxlZCcsIHtcbiAgICBhY3Rpb246IGluc3RhbGxSZXN1bHQuYWN0aW9uLFxuICAgIGVycm9yOiBpbnN0YWxsUmVzdWx0LmVycm9yLFxuICAgIHNvdXJjZVBhdGg6IGluc3RhbGxSZXN1bHQuc291cmNlUGF0aCxcbiAgICB0YXJnZXRQYXRoOiBpbnN0YWxsUmVzdWx0LnRhcmdldFBhdGgsXG4gIH0pO1xuICBTZW50cnkud2l0aFNjb3BlKHNjb3BlID0+IHtcbiAgICBzY29wZS5zZXRDb250ZXh0KCdtYWNfaW5zdGFsbF9sb2NhdGlvbicsIHtcbiAgICAgIGFjdGlvbjogaW5zdGFsbFJlc3VsdC5hY3Rpb24sXG4gICAgICBzb3VyY2VQYXRoOiBpbnN0YWxsUmVzdWx0LnNvdXJjZVBhdGgsXG4gICAgICB0YXJnZXRQYXRoOiBpbnN0YWxsUmVzdWx0LnRhcmdldFBhdGgsXG4gICAgfSk7XG4gICAgU2VudHJ5LmNhcHR1cmVFeGNlcHRpb24oaW5zdGFsbFJlc3VsdC5lcnJvcik7XG4gIH0pO1xuXG4gIGF3YWl0IGRpYWxvZy5zaG93TWVzc2FnZUJveCh7XG4gICAgYnV0dG9uczogWydRdWl0IEF1dG9DdXQnXSxcbiAgICBkZWZhdWx0SWQ6IDAsXG4gICAgZGV0YWlsOiBnZXRNYWNJbnN0YWxsRmFpbHVyZURldGFpbChpbnN0YWxsUmVzdWx0KSxcbiAgICBtZXNzYWdlOlxuICAgICAgJ0F1dG9DdXQgY291bGQgbm90IHByZXBhcmUgYSB3cml0YWJsZSBBcHBsaWNhdGlvbnMgZm9sZGVyIGZvciB0aGUgdXBkYXRlLicsXG4gICAgdGl0bGU6ICdBdXRvQ3V0IHVwZGF0ZSBjb3VsZCBub3Qgc3RhcnQnLFxuICAgIHR5cGU6ICdlcnJvcicsXG4gIH0pO1xuXG4gIHJlbW92ZVN0YXJ0aW5nRmlsZSgpO1xuICBhd2FpdCBlbGVjdHJvbkxvZ2dlci53YWl0Rm9yRHJhaW4oKTtcbiAgY2xvc2VBbGxXaW5kb3dzKCk7XG4gIGFwcC5xdWl0KCk7XG4gIGV4aXQoNDEpO1xufTtcblxuY29uc3QgaGFuZG9mZk1hY1VwZGF0ZVRvV3JpdGFibGVJbnN0YWxsID0gYXN5bmMgKFxuICBpbnN0YWxsUmVzdWx0OiBFeHRyYWN0PE1hY0luc3RhbGxSZXN1bHQsIHtzdGF0dXM6ICdyZWxhdW5jaGluZyd9Pixcbik6IFByb21pc2U8dm9pZD4gPT4ge1xuICBjb25zb2xlLmxvZygnW1VwZGF0ZXJdIEhhbmRpbmcgb2ZmIHVwZGF0ZSB0byB3cml0YWJsZSBtYWNPUyBpbnN0YWxsJywge1xuICAgIGFjdGlvbjogaW5zdGFsbFJlc3VsdC5hY3Rpb24sXG4gICAgc291cmNlUGF0aDogaW5zdGFsbFJlc3VsdC5zb3VyY2VQYXRoLFxuICAgIHRhcmdldFBhdGg6IGluc3RhbGxSZXN1bHQudGFyZ2V0UGF0aCxcbiAgfSk7XG5cbiAgcmVtb3ZlU3RhcnRpbmdGaWxlKCk7XG4gIGxhdW5jaE1hY0FwcEFmdGVyQ3VycmVudFByb2Nlc3NFeGl0cyhpbnN0YWxsUmVzdWx0LnRhcmdldFBhdGgpO1xuICBhd2FpdCBlbGVjdHJvbkxvZ2dlci53YWl0Rm9yRHJhaW4oKTtcbiAgY2xvc2VBbGxXaW5kb3dzKCk7XG4gIGFwcC5xdWl0KCk7XG4gIGV4aXQoNDIpO1xufTtcblxuY29uc3QgcHJlcGFyZU1hY0luc3RhbGxGb3JVcGRhdGUgPSBhc3luYyAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnZGFyd2luJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY29uc3QgaW5zdGFsbFJlc3VsdCA9IGF3YWl0IGVuc3VyZU1hY0luc3RhbGxMb2NhdGlvbigpO1xuICBpZiAoaW5zdGFsbFJlc3VsdC5zdGF0dXMgPT09ICdyZWFkeScpIHtcbiAgICBjb25zb2xlLmxvZygnW1VwZGF0ZXJdIG1hY09TIGluc3RhbGwgaXMgcmVwbGFjZWFibGUnLCB7XG4gICAgICBjdXJyZW50UGF0aDogaW5zdGFsbFJlc3VsdC5jdXJyZW50UGF0aCxcbiAgICAgIHNjb3BlOiBpbnN0YWxsUmVzdWx0LnNjb3BlLFxuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKGluc3RhbGxSZXN1bHQuc3RhdHVzID09PSAncmVsYXVuY2hpbmcnKSB7XG4gICAgYXdhaXQgaGFuZG9mZk1hY1VwZGF0ZVRvV3JpdGFibGVJbnN0YWxsKGluc3RhbGxSZXN1bHQpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGF3YWl0IHN0b3BGb3JNYWNJbnN0YWxsRmFpbHVyZShpbnN0YWxsUmVzdWx0KTtcbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuZXhwb3J0IGNvbnN0IGluaXRVcGRhdGVyID0gYXN5bmMgKCkgPT4ge1xuICBpZiAoaXNBdXRvVXBkYXRlRW5hYmxlZCkge1xuICAgIGNvbnN0IGlzTGF0ZXN0QWNjb3JkaW5nVG9Db29rID0gaXNDdXJyZW50VmVyc2lvbkxhdGVzdCgpO1xuICAgIGlmIChpc0xhdGVzdEFjY29yZGluZ1RvQ29vaykge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICdbaW5pdFVwZGF0ZXJdIEN1cnJlbnQgdmVyc2lvbiBtYXRjaGVzIENvb2ssIHNraXBwaW5nIFVwZGF0ZU1hbmFnZXInLFxuICAgICAgKTtcbiAgICAgIHVwZGF0ZUNoZWNrSW5mby5zdGF0dXMgPSAndXAtdG8tZGF0ZSc7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXG4gICAgICAnW2luaXRVcGRhdGVyXSBWZXJzaW9uIG1pc21hdGNoIG9yIHVuYXZhaWxhYmxlLCBydW5uaW5nIFVwZGF0ZU1hbmFnZXIuLi4nLFxuICAgICk7XG4gICAgY29uc29sZS5sb2coJ0FwcCBpcyBwYWNrYWdlZCwgc2V0dGluZyB1cCBhdXRvIHVwZGF0ZXIuLi4nKTtcbiAgICBjb25zdCB1cGRhdGVyVXJsID0gc2hhcmVkVmFyaWFibGVzPy5VUERBVEVSX1VSTCB8fCAnJztcbiAgICBjb25zdCB1cGRhdGVPcHRpb25zID0gZ2V0VXBkYXRlT3B0aW9ucygpO1xuICAgIGNvbnNvbGUubG9nKCdBdXRvIHVwZGF0ZXIgZmVlZCBVUkw6JywgdXBkYXRlclVybCk7XG4gICAgdHJ5IHtcbiAgICAgIHVwZGF0ZU1hbmFnZXIgPSBuZXcgVXBkYXRlTWFuYWdlcih1cGRhdGVyVXJsLCB1cGRhdGVPcHRpb25zKTtcbiAgICAgIGNvbnNvbGUubG9nKCdVcGRhdGVNYW5hZ2VyIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgJ1tpbml0VXBkYXRlcl0gdXBkYXRlTWFuYWdlcicsXG4gICAgICAgIHVwZGF0ZU1hbmFnZXIuZ2V0QXBwSWQoKSxcbiAgICAgICAgdXBkYXRlTWFuYWdlci5nZXRDdXJyZW50VmVyc2lvbigpLFxuICAgICAgICB1cGRhdGVNYW5hZ2VyLmdldFVwZGF0ZVBlbmRpbmdSZXN0YXJ0KCksXG4gICAgICApO1xuICAgICAgdXBkYXRlSW5mbyA9IGF3YWl0IHVwZGF0ZU1hbmFnZXIuY2hlY2tGb3JVcGRhdGVzQXN5bmMoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdbaW5pdFVwZGF0ZXJdIHVwZGF0ZUluZm8nLCB1cGRhdGVJbmZvKTtcblxuICAgICAgaWYgKHVwZGF0ZUluZm8pIHtcbiAgICAgICAgdXBkYXRlQ2hlY2tJbmZvLnN0YXR1cyA9ICdkb3dubG9hZGluZyc7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbaW5pdFVwZGF0ZXJdIGRvd25sb2FkaW5nIHVwZGF0ZScsIHVwZGF0ZUluZm8pO1xuICAgICAgICBhd2FpdCB1cGRhdGVNYW5hZ2VyLmRvd25sb2FkVXBkYXRlQXN5bmModXBkYXRlSW5mbywgcHJvZ3Jlc3MgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdbaW5pdFVwZGF0ZXJdIGRvd25sb2FkaW5nIHVwZGF0ZScsIHByb2dyZXNzKTtcbiAgICAgICAgICB1cGRhdGVDaGVja0luZm8uc3RhdHVzID0gJ2Rvd25sb2FkaW5nJztcbiAgICAgICAgICB1cGRhdGVDaGVja0luZm8ucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbaW5pdFVwZGF0ZXJdIHVwZGF0ZSBkb3dubG9hZGVkJywgdXBkYXRlSW5mbyk7XG4gICAgICAgIHVwZGF0ZUNoZWNrSW5mby5zdGF0dXMgPSAncmVhZHknO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdXBkYXRlQ2hlY2tJbmZvLnN0YXR1cyA9XG4gICAgICAgICAgaXNMYXRlc3RBY2NvcmRpbmdUb0Nvb2sgPT09IGZhbHNlID8gJ2Vycm9yJyA6ICd1cC10by1kYXRlJztcbiAgICAgICAgaWYgKGlzTGF0ZXN0QWNjb3JkaW5nVG9Db29rID09PSBmYWxzZSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAnW2luaXRVcGRhdGVyXSBDb29rIHRhcmdldHMgYW5vdGhlciB2ZXJzaW9uIGJ1dCBWZWxvcGFjayByZXR1cm5lZCBubyB1cGRhdGUnLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coJ1tpbml0VXBkYXRlcl0gZW5kJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdXBkYXRlQ2hlY2tJbmZvLnN0YXR1cyA9ICdlcnJvcic7XG4gICAgICBsb2dXaW5kb3dzVGxzRXJyb3IoJ3ZlbG9wYWNrLXVwZGF0ZXInLCBlLCB7dXJsOiB1cGRhdGVyVXJsfSk7XG4gICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gY2hlY2sgZm9yIHVwZGF0ZXMgZnJvbSAke3VwZGF0ZXJVcmx9OmApO1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoKChlIGFzIGFueSkgfHwge30pLnN0YWNrKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoKChlIGFzIGFueSkgfHwge30pLm1lc3NhZ2UpO1xuICAgICAgY29uc29sZS5lcnJvcigoKGUgYXMgYW55KSB8fCB7fSkubmFtZSk7XG4gICAgICBTZW50cnkuY2FwdHVyZUV4Y2VwdGlvbihlKTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBpbml0VXBkYXRlcklQQ0hhbmRsZXIgPSAoKSA9PiB7XG4gIGlwY01haW4ub24oJ3VwZGF0ZXI6Z2V0SW5mb3MnLCBhc3luYyBldmVudCA9PiB7XG4gICAgZXZlbnQucmV0dXJuVmFsdWUgPSB1cGRhdGVDaGVja0luZm87XG4gIH0pO1xuICBpcGNNYWluLm9uKCd1cGRhdGVyOnJlc3RhcnQnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcGVuZGluZ1VwZGF0ZU1hbmFnZXIgPSB1cGRhdGVNYW5hZ2VyO1xuICAgIGNvbnN0IHBlbmRpbmdVcGRhdGVJbmZvID0gdXBkYXRlSW5mbztcbiAgICBpZiAoIXBlbmRpbmdVcGRhdGVNYW5hZ2VyIHx8ICFwZW5kaW5nVXBkYXRlSW5mbykgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgY2FuQXBwbHlVcGRhdGUgPSBhd2FpdCBwcmVwYXJlTWFjSW5zdGFsbEZvclVwZGF0ZSgpO1xuICAgIGlmICghY2FuQXBwbHlVcGRhdGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygncmVzdGFydGluZyBhcHAnLCBwZW5kaW5nVXBkYXRlSW5mbyk7XG4gICAgY29uc3QgcHJldmVudEVsZXZhdGlvblByb21wdCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nO1xuICAgIHBlbmRpbmdVcGRhdGVNYW5hZ2VyLndhaXRFeGl0VGhlbkFwcGx5VXBkYXRlKFxuICAgICAgcGVuZGluZ1VwZGF0ZUluZm8sXG4gICAgICBwcmV2ZW50RWxldmF0aW9uUHJvbXB0LFxuICAgICk7XG4gICAgY29uc29sZS5sb2coJ3VwZGF0ZXIgbGF1bmNoZWQnLCBwZW5kaW5nVXBkYXRlSW5mbyk7XG4gICAgY2xvc2VBbGxXaW5kb3dzKCk7XG4gICAgY29uc29sZS5sb2coJ2FsbCB3aW5kb3dzIGNsb3NlZCcsIHBlbmRpbmdVcGRhdGVJbmZvKTtcbiAgICBhcHAucXVpdCgpO1xuICAgIGNvbnNvbGUubG9nKCdhcHAgcXVpdHRlZCwgZXhpdGluZy4uLicsIHBlbmRpbmdVcGRhdGVJbmZvKTtcbiAgICBleGl0KDQwKTtcbiAgfSk7XG59O1xuIiwiaW1wb3J0IHtpcGNNYWlufSBmcm9tICdlbGVjdHJvbic7XG5cbmltcG9ydCB7XG4gIGNsZWFyQWxsQ29va2llcyxcbiAgZ2V0QWxsQ29va2llcyxcbiAgZ2V0Q29va2llLFxuICBpbml0Q29va2llcyxcbiAgc2V0Q29va2llLFxufSBmcm9tICcuLi9jb29raWVzLnV0aWxzJztcblxuZXhwb3J0IGNvbnN0IGluaXRDb29raWVzSVBDSGFuZGxlciA9IGFzeW5jICgpID0+IHtcbiAgaXBjTWFpbi5vbignY29va2llczpnZXRBbGwnLCBhc3luYyBldmVudCA9PiB7XG4gICAgZXZlbnQucmV0dXJuVmFsdWUgPSBnZXRBbGxDb29raWVzKCk7XG4gIH0pO1xuXG4gIGlwY01haW4ub24oJ2Nvb2tpZXM6Z2V0JywgYXN5bmMgKGV2ZW50LCBuYW1lOiBzdHJpbmcpID0+IHtcbiAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGdldENvb2tpZShuYW1lKTtcbiAgfSk7XG5cbiAgaXBjTWFpbi5vbignY29va2llczpzZXQnLCBhc3luYyAoZXZlbnQsIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykgPT4ge1xuICAgIGV2ZW50LnJldHVyblZhbHVlID0gc2V0Q29va2llKG5hbWUsIHZhbHVlKTtcbiAgfSk7XG5cbiAgaXBjTWFpbi5vbignY29va2llczpjbGVhckFsbCcsIGFzeW5jIGV2ZW50ID0+IHtcbiAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGNsZWFyQWxsQ29va2llcygpO1xuICB9KTtcblxuICBhd2FpdCBpbml0Q29va2llcygpO1xufTtcbiIsInR5cGUgRG93bmxvYWRJbnN0YWxsZXIgPSAoaW5zdGFsbGVyVXJsOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nPjtcblxuY29uc3Qgbm9ybWFsaXplSHR0cHNVcmwgPSAocmF3VXJsOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBjb25zdCB0cmltbWVkVXJsID0gcmF3VXJsLnRyaW0oKTtcbiAgaWYgKCF0cmltbWVkVXJsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBdXRvQ3V0IHRvb2xzIGluc3RhbGxlciBVUkwgaXMgZW1wdHknKTtcbiAgfVxuXG4gIGNvbnN0IGhhc1Byb3RvY29sID0gL15bYS16XVthLXpcXGQrLi1dKjovaS50ZXN0KHRyaW1tZWRVcmwpO1xuICBjb25zdCB1cmxXaXRoUHJvdG9jb2wgPSBoYXNQcm90b2NvbCA/IHRyaW1tZWRVcmwgOiBgaHR0cHM6Ly8ke3RyaW1tZWRVcmx9YDtcbiAgY29uc3QgcGFyc2VkVXJsID0gbmV3IFVSTCh1cmxXaXRoUHJvdG9jb2wpO1xuXG4gIGlmIChwYXJzZWRVcmwucHJvdG9jb2wgIT09ICdodHRwczonKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBdXRvQ3V0IHRvb2xzIGluc3RhbGxlciBVUkxzIG11c3QgdXNlIEhUVFBTJyk7XG4gIH1cblxuICByZXR1cm4gcGFyc2VkVXJsLmhyZWY7XG59O1xuXG5leHBvcnQgY29uc3QgcmVzb2x2ZUh0dHBzSW5zdGFsbGVyQmFzZVVybHMgPSAoXG4gIGNvbmZpZ3VyZWRVcmxzOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCxcbik6IHN0cmluZ1tdID0+IHtcbiAgaWYgKGNvbmZpZ3VyZWRVcmxzID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBjYW5kaWRhdGVzID0gQXJyYXkuaXNBcnJheShjb25maWd1cmVkVXJscylcbiAgICA/IGNvbmZpZ3VyZWRVcmxzXG4gICAgOiBbY29uZmlndXJlZFVybHNdO1xuXG4gIC8vIFRyZWF0IGFueSBpbnNlY3VyZSBtaXJyb3IgYXMgYW4gaW52YWxpZCBjaGFubmVsIGNvbmZpZ3VyYXRpb24gaW5zdGVhZCBvZlxuICAvLyBzaWxlbnRseSBjaGFuZ2luZyB0aGUgY29uZmlndXJlZCBmYWlsb3ZlciBzZXQuXG4gIHJldHVybiBjYW5kaWRhdGVzLm1hcChub3JtYWxpemVIdHRwc1VybCk7XG59O1xuXG5leHBvcnQgY29uc3QgYnVpbGRJbnN0YWxsZXJBcnRpZmFjdFVybHMgPSAoXG4gIGJhc2VVcmxzOiBzdHJpbmdbXSxcbiAgaW5zdGFsbGVyUGF0aDogc3RyaW5nLFxuKTogc3RyaW5nW10gPT5cbiAgYmFzZVVybHMubWFwKGJhc2VVcmwgPT4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRCYXNlVXJsID0gbmV3IFVSTChiYXNlVXJsKTtcbiAgICBpZiAoIW5vcm1hbGl6ZWRCYXNlVXJsLnBhdGhuYW1lLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgIG5vcm1hbGl6ZWRCYXNlVXJsLnBhdGhuYW1lICs9ICcvJztcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFVSTChpbnN0YWxsZXJQYXRoLCBub3JtYWxpemVkQmFzZVVybCkuaHJlZjtcbiAgfSk7XG5cbmV4cG9ydCBjb25zdCBkb3dubG9hZEluc3RhbGxlckZyb21NaXJyb3JzID0gYXN5bmMgKFxuICBpbnN0YWxsZXJVcmxzOiBzdHJpbmdbXSxcbiAgZG93bmxvYWRJbnN0YWxsZXI6IERvd25sb2FkSW5zdGFsbGVyLFxuKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgY29uc3QgZG93bmxvYWRFcnJvcnM6IHVua25vd25bXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgaW5zdGFsbGVyVXJsIG9mIGluc3RhbGxlclVybHMpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IGRvd25sb2FkSW5zdGFsbGVyKGluc3RhbGxlclVybCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGRvd25sb2FkRXJyb3JzLnB1c2goZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBBZ2dyZWdhdGVFcnJvcihcbiAgICBkb3dubG9hZEVycm9ycyxcbiAgICAnQXV0b0N1dCB0b29scyBpbnN0YWxsZXIgZG93bmxvYWQgZmFpbGVkIGZyb20gZXZlcnkgY29uZmlndXJlZCBtaXJyb3InLFxuICApO1xufTtcbiIsImltcG9ydCB7aXBjTWFpbn0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHtleGlzdHNTeW5jLCBta2R0ZW1wU3luYywgdW5saW5rU3luYywgd3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2Rvd25sb2FkRmlsZX0gZnJvbSAnLi4vYXhpb3MudXRpbHMnO1xuaW1wb3J0IHtwb3dlcnNoZWxsfSBmcm9tICcuLi9jaGlsZFByb2Nlc3MudXRpbHMnO1xuaW1wb3J0IHtcbiAgYnVpbGRJbnN0YWxsZXJBcnRpZmFjdFVybHMsXG4gIGRvd25sb2FkSW5zdGFsbGVyRnJvbU1pcnJvcnMsXG4gIHJlc29sdmVIdHRwc0luc3RhbGxlckJhc2VVcmxzLFxufSBmcm9tICcuL3ByZW1pZXJlVG9vbHNJbnN0YWxsZXIuY29udHJhY3RzJztcbmltcG9ydCB7ZmV0Y2hDb29rUHVibGljQ2hhbm5lbH0gZnJvbSAnLi91cmxzLnN0YXJ0LnV0aWxzJztcbmltcG9ydCB7c2hhcmVkVmFyaWFibGVzfSBmcm9tICcuL3NoYXJlZFZhcmlhYmxlcy5zdGFydC51dGlscyc7XG5cbmNvbnN0IFBSRU1JRVJFX1BMVUdJTl9GT0xERVJfTkFNRSA9ICdBdXRvQ3V0JztcbmNvbnN0IFdJTkRPV1NfVE9PTFNfSU5TVEFMTEVSX1BBVEggPSAnd2luLXg2NC9BdXRvQ3V0X1Rvb2xzX0luc3RhbGxlci5leGUnO1xuY29uc3QgSU5TVEFMTEVSX1BST0pFQ1RfS0VZID0gJ2F1dG9jdXQtcHJlbWllcmUtdG9vbC1pbnN0YWxsZXInO1xuY29uc3QgSU5TVEFMTEVSX1BBVEhfRU5WX0tFWSA9ICdBVVRPQ1VUX1BSRU1JRVJFX1RPT0xTX0lOU1RBTExFUl9QQVRIJztcbmNvbnN0IFJVTl9JTlNUQUxMRVJfRUxFVkFURURfQ09NTUFORCA9IFtcbiAgXCIkRXJyb3JBY3Rpb25QcmVmZXJlbmNlID0gJ1N0b3AnXCIsXG4gIGAkaW5zdGFsbGVyID0gU3RhcnQtUHJvY2VzcyAtRmlsZVBhdGggJGVudjoke0lOU1RBTExFUl9QQVRIX0VOVl9LRVl9IC1WZXJiIFJ1bkFzIC1XYWl0IC1QYXNzVGhydWAsXG4gICdleGl0ICRpbnN0YWxsZXIuRXhpdENvZGUnLFxuXS5qb2luKCc7ICcpO1xuXG5leHBvcnQgdHlwZSBQcmVtaWVyZVRvb2xzSW5zdGFsbFN0YXR1cyA9ICdpbnN0YWxsZWQnIHwgJ25vdC1uZWVkZWQnIHwgJ2Vycm9yJztcbmV4cG9ydCB0eXBlIFByZW1pZXJlVG9vbHNJbnN0YWxsUmVzdWx0ID0ge1xuICBzdGF0dXM6IFByZW1pZXJlVG9vbHNJbnN0YWxsU3RhdHVzO1xufTtcblxudHlwZSBDaGFubmVsVXJscyA9IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHN0cmluZ1tdPjtcblxuY29uc3QgZ2V0UHJlbWllcmVQbHVnaW5EaXIgPSAoKTogc3RyaW5nID0+XG4gIHNoYXJlZFZhcmlhYmxlcz8uUFJFTUlFUkVfUExVR0lOX0RJUiA/PyAnJztcblxuY29uc3QgcmVzb2x2ZVBsdWdpblJvb3RGb2xkZXIgPSAocHJlbWllcmVQbHVnaW5EaXI6IHN0cmluZyk6IHN0cmluZyA9PlxuICBwYXRoLmpvaW4ocHJlbWllcmVQbHVnaW5EaXIsIFBSRU1JRVJFX1BMVUdJTl9GT0xERVJfTkFNRSk7XG5cbmNvbnN0IGNhbldyaXRlVG9Gb2xkZXIgPSAoZm9sZGVyUGF0aDogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gIGlmICghZXhpc3RzU3luYyhmb2xkZXJQYXRoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHByb2JlRmlsZVBhdGggPSBwYXRoLmpvaW4oXG4gICAgZm9sZGVyUGF0aCxcbiAgICBgLmF1dG9jdXQtd3JpdGUtcHJvYmUtJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpfWAsXG4gICk7XG5cbiAgdHJ5IHtcbiAgICB3cml0ZUZpbGVTeW5jKHByb2JlRmlsZVBhdGgsICcnKTtcbiAgICBpZiAoZXhpc3RzU3luYyhwcm9iZUZpbGVQYXRoKSkge1xuICAgICAgdW5saW5rU3luYyhwcm9iZUZpbGVQYXRoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChleGlzdHNTeW5jKHByb2JlRmlsZVBhdGgpKSB7XG4gICAgICAgIHVubGlua1N5bmMocHJvYmVGaWxlUGF0aCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoY2xlYW51cEVycm9yKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdbUHJlbWllcmVUb29sc10gRmFpbGVkIHRvIHJlbW92ZSB3cml0ZSBwcm9iZScsXG4gICAgICAgIHByb2JlRmlsZVBhdGgsXG4gICAgICAgIGNsZWFudXBFcnJvcixcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuLyoqXG4gKiBBIFVBQyBlbGV2YXRpb24gaXMgb25seSByZXF1aXJlZCBvbiBXaW5kb3dzIHdoZW4gUHJlbWllcmUgaXMgaW5zdGFsbGVkIGFuZCBpdHNcbiAqIHNoYXJlZCBwbHVnaW4gZm9sZGVyIGNhbm5vdCBiZSB3cml0dGVuIHRvIHdpdGhvdXQgZWxldmF0aW9uLiBUaGUgd3JpdGUtcHJvYmVcbiAqIGNhcHR1cmVzIFwibm90IGFkbWluICsgZm9sZGVyIG5vdCBjcmVhdGVkICsgZm9sZGVyIG5vdCBncmFudGVkXCIgaW4gb25lIHNpZ25hbC5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzUHJlbWllcmVUb29sc0luc3RhbGxOZWVkZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gIGlmIChvcy5wbGF0Zm9ybSgpICE9PSAnd2luMzInKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgcHJlbWllcmVQbHVnaW5EaXIgPSBnZXRQcmVtaWVyZVBsdWdpbkRpcigpO1xuICBpZiAocHJlbWllcmVQbHVnaW5EaXIgPT09ICcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3Qgcm9vdEZvbGRlciA9IHJlc29sdmVQbHVnaW5Sb290Rm9sZGVyKHByZW1pZXJlUGx1Z2luRGlyKTtcbiAgY29uc3QgYWxyZWFkeVdyaXRhYmxlID1cbiAgICBleGlzdHNTeW5jKHJvb3RGb2xkZXIpICYmIGNhbldyaXRlVG9Gb2xkZXIocm9vdEZvbGRlcik7XG4gIHJldHVybiAhYWxyZWFkeVdyaXRhYmxlO1xufTtcblxuY29uc3QgcmVzb2x2ZUluc3RhbGxlckJhc2VVcmxzID0gKGNoYW5uZWxVcmxzOiBDaGFubmVsVXJscyk6IHN0cmluZ1tdID0+IHtcbiAgY29uc3QgdmFsdWUgPSBjaGFubmVsVXJsc1tJTlNUQUxMRVJfUFJPSkVDVF9LRVldO1xuICByZXR1cm4gcmVzb2x2ZUh0dHBzSW5zdGFsbGVyQmFzZVVybHModmFsdWUpO1xufTtcblxuY29uc3QgZmV0Y2hJbnN0YWxsZXJCYXNlVXJscyA9IGFzeW5jICgpOiBQcm9taXNlPHN0cmluZ1tdPiA9PiB7XG4gIGNvbnN0IGNvb2tVcmwgPSBpbXBvcnQubWV0YS5lbnYuVklURV9DT09LX1VSTDtcbiAgaWYgKCFjb29rVXJsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb29rIFVSTCBub3QgY29uZmlndXJlZCcpO1xuICB9XG5cbiAgY29uc3Qge2RhdGF9ID0gYXdhaXQgZmV0Y2hDb29rUHVibGljQ2hhbm5lbDxDaGFubmVsVXJscz4oY29va1VybCk7XG4gIHJldHVybiByZXNvbHZlSW5zdGFsbGVyQmFzZVVybHMoZGF0YSk7XG59O1xuXG5jb25zdCBydW5JbnN0YWxsZXIgPSBhc3luYyAoaW5zdGFsbGVyUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIC8vIFRoZSBpbnN0YWxsZXIgbWFuaWZlc3QgcmVxdWlyZXMgYWRtaW5pc3RyYXRvciBwcml2aWxlZ2VzLiBBIGRpcmVjdFxuICAvLyBjaGlsZF9wcm9jZXNzIGxhdW5jaCBjYW5ub3QgdHJpZ2dlciBVQUMsIHNvIHVzZSBXaW5kb3dzJyBSdW5BcyBzaGVsbCB2ZXJiLlxuICBjb25zdCB7ZXJyb3IsIHN0ZGVycn0gPSBhd2FpdCBwb3dlcnNoZWxsKFJVTl9JTlNUQUxMRVJfRUxFVkFURURfQ09NTUFORCwge1xuICAgIGVudjoge1tJTlNUQUxMRVJfUEFUSF9FTlZfS0VZXTogaW5zdGFsbGVyUGF0aH0sXG4gIH0pO1xuICBpZiAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3Ioc3RkZXJyIHx8IGVycm9yLm1lc3NhZ2UpO1xuICB9XG59O1xuXG4vKipcbiAqIERvd25sb2FkcyBhbmQgcnVucyB0aGUgZWxldmF0ZWQgQXV0b0N1dCB0b29scyBpbnN0YWxsZXIsIHdoaWNoIHByZXBhcmVzIChhbmRcbiAqIGdyYW50cyB3cml0ZSBhY2Nlc3MgdG8pIFByZW1pZXJlJ3Mgc2hhcmVkIHBsdWdpbiBmb2xkZXIgc28gc3Vic2VxdWVudCBwbHVnaW5cbiAqIGluc3RhbGxzIG5lZWQgbm8gZWxldmF0aW9uLiBXaW5kb3dzLW9ubHk7IG5ldmVyIHRocm93cy5cbiAqL1xuZXhwb3J0IGNvbnN0IGluc3RhbGxQcmVtaWVyZVRvb2xzID0gYXN5bmMgKFxuICBvcHRpb25zOiB7YXNzdW1lUHJlbWllcmVJbnN0YWxsZWQ/OiBib29sZWFufSA9IHt9LFxuKTogUHJvbWlzZTxQcmVtaWVyZVRvb2xzSW5zdGFsbFJlc3VsdD4gPT4ge1xuICBjb25zdCB7YXNzdW1lUHJlbWllcmVJbnN0YWxsZWQgPSBmYWxzZX0gPSBvcHRpb25zO1xuXG4gIHRyeSB7XG4gICAgaWYgKG9zLnBsYXRmb3JtKCkgIT09ICd3aW4zMicpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiAnbm90LW5lZWRlZCd9O1xuICAgIH1cblxuICAgIGNvbnN0IHByZW1pZXJlUGx1Z2luRGlyID0gZ2V0UHJlbWllcmVQbHVnaW5EaXIoKTtcbiAgICBjb25zdCBjYW5SZXNvbHZlUGx1Z2luRGlyID0gcHJlbWllcmVQbHVnaW5EaXIgIT09ICcnO1xuICAgIGlmICghY2FuUmVzb2x2ZVBsdWdpbkRpciAmJiAhYXNzdW1lUHJlbWllcmVJbnN0YWxsZWQpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiAnbm90LW5lZWRlZCd9O1xuICAgIH1cblxuICAgIGNvbnN0IGluc3RhbGxlckJhc2VVcmxzID0gYXdhaXQgZmV0Y2hJbnN0YWxsZXJCYXNlVXJscygpO1xuICAgIGlmIChpbnN0YWxsZXJCYXNlVXJscy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQXV0b0N1dCB0b29scyBpbnN0YWxsZXIgcHJvamVjdCBpcyBtaXNzaW5nJyk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5zdGFsbGVyVXJscyA9IGJ1aWxkSW5zdGFsbGVyQXJ0aWZhY3RVcmxzKFxuICAgICAgaW5zdGFsbGVyQmFzZVVybHMsXG4gICAgICBXSU5ET1dTX1RPT0xTX0lOU1RBTExFUl9QQVRILFxuICAgICk7XG5cbiAgICBjb25zdCBkb3dubG9hZEZvbGRlciA9IG1rZHRlbXBTeW5jKFxuICAgICAgcGF0aC5qb2luKG9zLnRtcGRpcigpLCAnYXV0b2N1dC10b29scy0nKSxcbiAgICApO1xuICAgIGNvbnN0IGluc3RhbGxlclBhdGggPSBhd2FpdCBkb3dubG9hZEluc3RhbGxlckZyb21NaXJyb3JzKFxuICAgICAgaW5zdGFsbGVyVXJscyxcbiAgICAgIGluc3RhbGxlclVybCA9PlxuICAgICAgICBkb3dubG9hZEZpbGUoaW5zdGFsbGVyVXJsLCBkb3dubG9hZEZvbGRlciwge3JlcXVpcmVIdHRwczogdHJ1ZX0pLFxuICAgICk7XG4gICAgaWYgKCFleGlzdHNTeW5jKGluc3RhbGxlclBhdGgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F1dG9DdXQgdG9vbHMgaW5zdGFsbGVyIGRvd25sb2FkIGZhaWxlZCcpO1xuICAgIH1cblxuICAgIGF3YWl0IHJ1bkluc3RhbGxlcihpbnN0YWxsZXJQYXRoKTtcblxuICAgIGlmIChjYW5SZXNvbHZlUGx1Z2luRGlyKSB7XG4gICAgICBjb25zdCByb290Rm9sZGVyID0gcmVzb2x2ZVBsdWdpblJvb3RGb2xkZXIocHJlbWllcmVQbHVnaW5EaXIpO1xuICAgICAgaWYgKCFjYW5Xcml0ZVRvRm9sZGVyKHJvb3RGb2xkZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnQXV0b0N1dCB0b29scyBpbnN0YWxsZXIgZGlkIG5vdCBwcmVwYXJlIGEgd3JpdGFibGUgZm9sZGVyJyxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge3N0YXR1czogJ2luc3RhbGxlZCd9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUud2FybignW1ByZW1pZXJlVG9vbHNdIGluc3RhbGwgZmFpbGVkJywgZXJyb3IpO1xuICAgIHJldHVybiB7c3RhdHVzOiAnZXJyb3InfTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGluaXRQcmVtaWVyZVRvb2xzSVBDSGFuZGxlciA9ICgpOiB2b2lkID0+IHtcbiAgaXBjTWFpbi5oYW5kbGUoXG4gICAgJ2VsZWN0cm9uOnByZW1pZXJlLXRvb2xzOmluc3RhbGwnLFxuICAgIGFzeW5jIChfZXZlbnQsIG9wdGlvbnM/OiB7YXNzdW1lUHJlbWllcmVJbnN0YWxsZWQ/OiBib29sZWFufSkgPT5cbiAgICAgIGluc3RhbGxQcmVtaWVyZVRvb2xzKG9wdGlvbnMgPz8ge30pLFxuICApO1xuXG4gIGlwY01haW4uaGFuZGxlKCdlbGVjdHJvbjpwcmVtaWVyZS10b29sczppcy1uZWVkZWQnLCBhc3luYyAoKSA9PlxuICAgIGlzUHJlbWllcmVUb29sc0luc3RhbGxOZWVkZWQoKSxcbiAgKTtcbn07XG4iLCJpbXBvcnQge2luaXRGcm9udElwY0hhbmRsZXJ9IGZyb20gJ0AvZnJvbnRJcGMnO1xuaW1wb3J0IHtpbml0TWFpbldpbmRvd0lQQ0hhbmRsZXJ9IGZyb20gJ0AvbWFpbldpbmRvdyc7XG5pbXBvcnQge2luaXRFbGVjdHJvbklQQ0hhbmRsZXJ9IGZyb20gJ0AvdXRpbHMvZWxlY3Ryb24udXRpbHMnO1xuaW1wb3J0IHtpbml0U2V0dXBJUENIYW5kbGVyfSBmcm9tICdAL3V0aWxzL3NldHVwLnV0aWxzJztcbmltcG9ydCB7aW5pdFVwZGF0ZXJJUENIYW5kbGVyfSBmcm9tICdAL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3VwZGF0ZXIuc3RhcnQudXRpbHMnO1xuXG5pbXBvcnQge2luaXRDb29raWVzSVBDSGFuZGxlcn0gZnJvbSAnLi9zdGFydEZ1bmN0aW9ucy9jb29raWVzLnN0YXJ0LnV0aWxzJztcbmltcG9ydCB7aW5pdFByZW1pZXJlVG9vbHNJUENIYW5kbGVyfSBmcm9tICcuL3N0YXJ0RnVuY3Rpb25zL3ByZW1pZXJlVG9vbHMuc3RhcnQudXRpbHMnO1xuXG5leHBvcnQgY29uc3QgaW5pdElQQ0hhbmRsZXJzID0gYXN5bmMgKCkgPT4ge1xuICBjb25zb2xlLmxvZygnSW5pdCBJUEMgaGFuZGxlcnMnKTtcbiAgaW5pdE1haW5XaW5kb3dJUENIYW5kbGVyKCk7XG4gIGNvbnNvbGUubG9nKCdNYWluIHdpbmRvdyBJUEMgaGFuZGxlciBpbml0aWFsaXplZCcpO1xuXG4gIGluaXRTZXR1cElQQ0hhbmRsZXIoKTtcbiAgY29uc29sZS5sb2coJ1NldHVwIElQQyBoYW5kbGVyIGluaXRpYWxpemVkJyk7XG5cbiAgaW5pdFVwZGF0ZXJJUENIYW5kbGVyKCk7XG4gIGNvbnNvbGUubG9nKCdVcGRhdGVyIElQQyBoYW5kbGVyIGluaXRpYWxpemVkJyk7XG5cbiAgaW5pdEVsZWN0cm9uSVBDSGFuZGxlcigpO1xuICBjb25zb2xlLmxvZygnRWxlY3Ryb24gSVBDIGhhbmRsZXIgaW5pdGlhbGl6ZWQnKTtcblxuICBpbml0UHJlbWllcmVUb29sc0lQQ0hhbmRsZXIoKTtcbiAgY29uc29sZS5sb2coJ1ByZW1pZXJlIHRvb2xzIElQQyBoYW5kbGVyIGluaXRpYWxpemVkJyk7XG5cbiAgYXdhaXQgaW5pdENvb2tpZXNJUENIYW5kbGVyKCk7XG4gIGNvbnNvbGUubG9nKCdDb29raWVzIElQQyBoYW5kbGVyIGluaXRpYWxpemVkJyk7XG5cbiAgaW5pdEZyb250SXBjSGFuZGxlcigpO1xuICBjb25zb2xlLmxvZygnRnJvbnQgSVBDIGhhbmRsZXIgaW5pdGlhbGl6ZWQnKTtcbn07XG4iLCJpbXBvcnQge3NoYXJlZFZhcmlhYmxlc30gZnJvbSAnQC91dGlscy9zdGFydEZ1bmN0aW9ucy9zaGFyZWRWYXJpYWJsZXMuc3RhcnQudXRpbHMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgY29uc3QgcmVuYW1lRm9sZGVyID0gKGRpcj86IHN0cmluZykgPT4ge1xuICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICBjb25zdCB0ZW1wRGlyID0gZGlyIHx8IHNoYXJlZFZhcmlhYmxlcz8uVEVNUF9GT0xERVJfUEFUSDtcbiAgaWYgKCF0ZW1wRGlyKSB7XG4gICAgY29uc29sZS5lcnJvcignVGVtcCBmb2xkZXIgcGF0aCBpcyBub3Qgc2V0Jyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHRlbXBGb2xkZXIgPSB0ZW1wRGlyLnNwbGl0KC9bXFxcXC9dL2cpLnBvcCgpO1xuICBjb25zdCB0ZW1wRGlyUGFyZW50ID0gdGVtcERpci5yZXBsYWNlKC9bXlxcXFwvXSo/JC8sICcnKTtcblxuICBjb25zdCBuZXdUZW1wRm9sZGVyUGF0aCA9IHRlbXBEaXIgKyBgLSR7dGltZXN0YW1wfWA7XG4gIGNvbnNvbGUubG9nKGBSZW5hbWluZyB0ZW1wIGZvbGRlciB0byAke25ld1RlbXBGb2xkZXJQYXRofWApO1xuICB0cnkge1xuICAgIC8vIFJlbmFtZSB0aGUgdGVtcCBmb2xkZXIgaGVyZVxuICAgIGZzLnJlbmFtZVN5bmModGVtcERpciwgbmV3VGVtcEZvbGRlclBhdGgpO1xuICAgIGNvbnNvbGUubG9nKCdUZW1wIGZvbGRlciByZW5hbWVkIHN1Y2Nlc3NmdWxseScpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHJlbmFtZSB0ZW1wIGZvbGRlcjonLCBlKTtcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdDbGVhbmluZyB1cCBvbGQgdGVtcCBmb2xkZXJzLi4uJyk7XG4gIGNvbnN0IHByZWZpeCA9IGAke3RlbXBGb2xkZXJ9LWA7XG5cbiAgbGV0IGZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICB0cnkge1xuICAgIGZpbGVzID0gZnMucmVhZGRpclN5bmModGVtcERpclBhcmVudCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZWFkaW5nIHRlbXAgZGlyZWN0b3J5OicsIGUpO1xuICB9XG5cbiAgY29uc3QgYXV0b2N1dEZvbGRlcnMgPSBmaWxlc1xuICAgIC5maWx0ZXIoZmlsZSA9PiBmaWxlLnN0YXJ0c1dpdGgocHJlZml4KSlcbiAgICAubWFwKGZpbGUgPT4gKHtcbiAgICAgIG5hbWU6IGZpbGUsXG4gICAgICBwYXRoOiBwYXRoLmpvaW4odGVtcERpclBhcmVudCwgZmlsZSksXG4gICAgICB0aW1lc3RhbXA6IHBhcnNlSW50KGZpbGUuc2xpY2UocHJlZml4Lmxlbmd0aCkpLFxuICAgIH0pKVxuICAgIC5zb3J0KChhLCBiKSA9PiBiLnRpbWVzdGFtcCAtIGEudGltZXN0YW1wKTtcblxuICBpZiAoYXV0b2N1dEZvbGRlcnMubGVuZ3RoID4gMykge1xuICAgIGF1dG9jdXRGb2xkZXJzLnNsaWNlKDIpLmZvckVhY2goZm9sZGVyID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZzLnJtU3luYyhmb2xkZXIucGF0aCwge3JlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWV9KTtcbiAgICAgICAgY29uc29sZS5sb2coYE9sZCB0ZW1wIGZvbGRlciAke2ZvbGRlci5uYW1lfSBkZWxldGVkYCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBkZWxldGUgZm9sZGVyICR7Zm9sZGVyLm5hbWV9OmAsIGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuIiwiaW1wb3J0IHtyZW5hbWVGb2xkZXJ9IGZyb20gJ0AvdXRpbHMvcmVuYW1lRm9sZGVyLnV0aWxzJztcbmltcG9ydCB7YXBwfSBmcm9tICdlbGVjdHJvbic7XG5cbmV4cG9ydCBjb25zdCBleGl0ID0gKGNvZGU6IG51bWJlciA9IDApID0+IHtcbiAgY29uc29sZS5sb2coJ1N0b3BwaW5nIGVsZWN0cm9uIGFwcC4uLicpO1xuICByZW5hbWVGb2xkZXIoKTtcbiAgY29uc29sZS5sb2coYEV4aXRpbmcgd2l0aCBjb2RlICR7Y29kZX0uLi5gKTtcbiAgYXBwLnF1aXQoKTtcbn07XG4iLCJpbXBvcnQge3Jlc3RvcmVXaW5kb3d9IGZyb20gJ0AvbWFpbldpbmRvdyc7XG5pbXBvcnQge2FwcH0gZnJvbSAnZWxlY3Ryb24nO1xuXG50eXBlIFNlY29uZEluc3RhbmNlSGFuZGxlciA9IChhcmd2OiBzdHJpbmdbXSkgPT4gYm9vbGVhbjtcblxuZXhwb3J0IGNvbnN0IGVuc3VyZVNpbmdsZUluc3RhbmNlID0gKFxuICBoYW5kbGVTZWNvbmRJbnN0YW5jZT86IFNlY29uZEluc3RhbmNlSGFuZGxlcixcbikgPT4ge1xuICBjb25zb2xlLmxvZygnRW5zdXJlIHNpbmdsZSBpbnN0YW5jZScpO1xuICBjb25zdCBpc1NpbmdsZUluc3RhbmNlID0gYXBwLnJlcXVlc3RTaW5nbGVJbnN0YW5jZUxvY2soKTtcbiAgaWYgKCFpc1NpbmdsZUluc3RhbmNlKSB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICAnQW5vdGhlciBpbnN0YW5jZSBpcyBydW5uaW5nLCBxdWl0dGluZyB0aGlzIG9uZS4gJyArXG4gICAgICAgIGAoYXJnczogJHtwcm9jZXNzLmFyZ3Yuam9pbignICcpfSlgLFxuICAgICk7XG4gICAgYXBwLmV4aXQoKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cbiAgY29uc29sZS5sb2coJ1NpbmdsZSBpbnN0YW5jZSBsb2NrIGFjcXVpcmVkJyk7XG4gIGFwcC5vbignc2Vjb25kLWluc3RhbmNlJywgKF9ldmVudCwgYXJndikgPT4ge1xuICAgIGlmIChoYW5kbGVTZWNvbmRJbnN0YW5jZT8uKGFyZ3YpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXG4gICAgICBgQW5vdGhlciBpbnN0YW5jZSB0cmllZCB0byBydW4gKGFyZ3M6ICR7YXJndi5qb2luKCcgJyl9KSwgcmVzdG9yaW5nIHdpbmRvdy4uLmAsXG4gICAgKTtcbiAgICByZXN0b3JlV2luZG93KCk7XG4gIH0pO1xufTtcbiIsImltcG9ydCB7cmVuYW1lRm9sZGVyfSBmcm9tICdAL3V0aWxzL3JlbmFtZUZvbGRlci51dGlscyc7XG5pbXBvcnQgKiBhcyBTZW50cnkgZnJvbSAnQHNlbnRyeS9lbGVjdHJvbi9tYWluJztcbmltcG9ydCB7YXBwfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHt0bXBkaXJ9IGZyb20gJ29zJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge2VsZWN0cm9uTG9nZ2VyfSBmcm9tICcuLi9sb2dnZXIudXRpbHMnO1xuXG4vKipcbiAqIE11c3QgYmUgY2FsbGVkIGFmdGVyIHNoYXJlZFZhcmlhYmxlcyBpcyBpbml0aWFsaXplZFxuICovXG5leHBvcnQgY29uc3QgaW5pdExvZ2dlciA9ICgpID0+IHtcbiAgbGV0IGxvZ0ZpbGVQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQgPSAnTk9UX1NFVCc7XG5cbiAgLy8gRG8gbm90IHJlbmFtZSB0aGUgZm9sZGVyIFwiQXV0b0N1dFwiIGJlY2F1c2UgaXQgY2F1c2UgY29uZmxpY3Qgd2l0aCBhdXRvY3V0LWV4dGVuc2lvbi12M1xuICAvLyBJZiBjaGFuZ2VkLCB1cGRhdGUgdGhlIHBhdGggaW4gdGhlIHByZWxvYWQvbm9kZUlwYy50cyBmaWxlXG4gIGNvbnN0IHRlbXBGb2xkZXJQYXRoID0gam9pbih0bXBkaXIoKSwgJ2NvbS5hdXRvY3V0JywgJ2NvbS5hdXRvY3V0LmFlYScpO1xuICBpZiAoZnMuZXhpc3RzU3luYyh0ZW1wRm9sZGVyUGF0aCkpIHtcbiAgICByZW5hbWVGb2xkZXIodGVtcEZvbGRlclBhdGgpO1xuICB9XG4gIGZzLm1rZGlyU3luYyh0ZW1wRm9sZGVyUGF0aCwge1xuICAgIHJlY3Vyc2l2ZTogdHJ1ZSxcbiAgfSk7XG4gIGNvbnNvbGUubG9nKCdUZW1wIGZvbGRlciBjcmVhdGVkJyk7XG5cbiAgdHJ5IHtcbiAgICBsb2dGaWxlUGF0aCA9XG4gICAgICAhYXBwLmlzUGFja2FnZWQgJiYgaW1wb3J0Lm1ldGEuZW52LlZJVEVfTE9HX0lOX0ZJTEUgPT09ICdmYWxzZSdcbiAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgOiBqb2luKHRlbXBGb2xkZXJQYXRoLCAnYXV0b2N1dC5hZWEubG9nJyk7XG4gICAgZWxlY3Ryb25Mb2dnZXIuaW5pdChsb2dGaWxlUGF0aCk7XG4gICAgbG9nRmlsZVBhdGggPSBsb2dGaWxlUGF0aD8ucmVwbGFjZSgvXFwuYWVhXFwubG9nJC8sICcubG9nJyk7XG4gIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgIFNlbnRyeS5jYXB0dXJlRXhjZXB0aW9uKGUpO1xuICB9XG5cbiAgcmV0dXJuIHt0ZW1wRm9sZGVyUGF0aCwgbG9nRmlsZVBhdGh9O1xufTtcbiIsImltcG9ydCB7c3lzdGVtUHJlZmVyZW5jZXN9IGZyb20gJ2VsZWN0cm9uJztcblxuZXhwb3J0IGNvbnN0IGluaXRNYWNTcGVjaWZpY1NldHRpbmdzID0gKCkgPT4ge1xuICAvL0Rpc2FibGUgZGljdGF0aW9uIGFuZCBjaGFyYWN0ZXIgcGFsZXR0ZSBpbiBNYWNPU1xuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICBzeXN0ZW1QcmVmZXJlbmNlcy5zZXRVc2VyRGVmYXVsdChcbiAgICAgICdOU0Rpc2FibGVkRGljdGF0aW9uTWVudUl0ZW0nLFxuICAgICAgJ2Jvb2xlYW4nLFxuICAgICAgdHJ1ZSxcbiAgICApO1xuICAgIHN5c3RlbVByZWZlcmVuY2VzLnNldFVzZXJEZWZhdWx0KFxuICAgICAgJ05TRGlzYWJsZWRDaGFyYWN0ZXJQYWxldHRlTWVudUl0ZW0nLFxuICAgICAgJ2Jvb2xlYW4nLFxuICAgICAgdHJ1ZSxcbiAgICApO1xuICB9XG59O1xuIiwiaW1wb3J0IHtJU19TVEFHSU5HfSBmcm9tICdAL2Vudic7XG5pbXBvcnQge2dldENvb2tpZX0gZnJvbSAnQC91dGlscy9jb29raWVzLnV0aWxzJztcbmltcG9ydCB7YXBwfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQge1Bvc3RIb2d9IGZyb20gJ3Bvc3Rob2ctbm9kZSc7XG5cbi8vIFNoYXJlZCB3aXRoIHRoZSByZW5kZXJlciAoYXV0b2N1dC1mcm9udCBQb3N0aG9nUHJvdmlkZXIpIHNvIGV2ZW50cyBmcm9tIHRoZVxuLy8gbWFpbiBwcm9jZXNzIGF0dGFjaCB0byB0aGUgc2FtZSBQb3N0SG9nIHBlcnNvbi5cbmNvbnN0IFBPU1RIT0dfQVBJX0tFWSA9ICdwaGNfQlZkMk1uUUU1dmxFb1dRaVNvbmJSckRCR2IycFpyeXduRnBQNW9wWXdPNic7XG5jb25zdCBQT1NUSE9HX0hPU1QgPSAnaHR0cHM6Ly9waG90by5hdXRvY3V0LmNvbSc7XG5jb25zdCBQT1NUSE9HX0RJU1RJTkNUX0lEX0NPT0tJRSA9ICdwb3N0aG9nRGlzdGluY3RJZCc7XG5jb25zdCBBUFBfVVVJRF9DT09LSUUgPSAnYXBwVVVJRCc7XG5cbmxldCBwb3N0aG9nQ2xpZW50OiBQb3N0SG9nIHwgdW5kZWZpbmVkO1xuXG5jb25zdCBnZXRFbnZpcm9ubWVudCA9ICgpOiAnZGV2ZWxvcG1lbnQnIHwgJ3N0YWdpbmcnIHwgJ3Byb2R1Y3Rpb24nID0+IHtcbiAgaWYgKCFhcHAuaXNQYWNrYWdlZCkge1xuICAgIHJldHVybiAnZGV2ZWxvcG1lbnQnO1xuICB9XG4gIHJldHVybiBJU19TVEFHSU5HID8gJ3N0YWdpbmcnIDogJ3Byb2R1Y3Rpb24nO1xufTtcblxuLy8gQ29va2llcyBhcmUgcGVyc2lzdGVkIEpTT04tZW5jb2RlZCBieSB0aGUgY29va2llIHN0b3JlLCBzbyB0aGUgcmF3IHZhbHVlIG11c3Rcbi8vIGJlIHBhcnNlZCBiYWNrIGludG8gdGhlIHBsYWluIHN0cmluZyB0aGUgcmVuZGVyZXIgd3JvdGUuXG5jb25zdCBwYXJzZUNvb2tpZVN0cmluZyA9IChcbiAgcmF3VmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCxcbik6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG4gIGlmICghcmF3VmFsdWUpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXdWYWx1ZSk7XG4gICAgcmV0dXJuIHR5cGVvZiBwYXJzZWQgPT09ICdzdHJpbmcnID8gcGFyc2VkIDogdW5kZWZpbmVkO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gcmF3VmFsdWU7XG4gIH1cbn07XG5cbi8vIFByZWZlciB0aGUgZGlzdGluY3QgaWQgc2hhcmVkIGJ5IHRoZSByZW5kZXJlciwgZmFsbGluZyBiYWNrIHRvIHRoZSBzdGFibGUgYXBwXG4vLyBVVUlEIHNvIGVhcmx5IG1haW4tcHJvY2VzcyBldmVudHMgYXJlIHN0aWxsIGF0dHJpYnV0ZWQgdG8gYSBzaW5nbGUgcGVyc29uLlxuZXhwb3J0IGNvbnN0IGdldERpc3RpbmN0SWQgPSAoKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gKFxuICAgICAgcGFyc2VDb29raWVTdHJpbmcoZ2V0Q29va2llKFBPU1RIT0dfRElTVElOQ1RfSURfQ09PS0lFKSkgPz9cbiAgICAgIHBhcnNlQ29va2llU3RyaW5nKGdldENvb2tpZShBUFBfVVVJRF9DT09LSUUpKVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGluaXRQb3N0SG9nID0gKCkgPT4ge1xuICB0cnkge1xuICAgIHBvc3Rob2dDbGllbnQgPSBuZXcgUG9zdEhvZyhQT1NUSE9HX0FQSV9LRVksIHtcbiAgICAgIGhvc3Q6IFBPU1RIT0dfSE9TVCxcbiAgICAgIC8vIFNlbmQgZXZlbnRzIHByb21wdGx5IHNvIG5vdGhpbmcgaXMgbG9zdCBvbiBhIHF1aWNrIHF1aXQsIHdoaWxlIGtlZXBpbmdcbiAgICAgIC8vIGV2ZXJ5IG5ldHdvcmsgY2FsbCBpbiB0aGUgYmFja2dyb3VuZC5cbiAgICAgIGZsdXNoQXQ6IDEsXG4gICAgICBmbHVzaEludGVydmFsOiAxMDAwMCxcbiAgICAgIC8vIEJvdW5kIG5ldHdvcmsgd29yayBzbyBhIHNsb3cvb2ZmbGluZSBlbmRwb2ludCBjYW4gbmV2ZXIgcGlsZSB1cCByZXRyaWVzLlxuICAgICAgcmVxdWVzdFRpbWVvdXQ6IDMwMDAsXG4gICAgICBmZXRjaFJldHJ5Q291bnQ6IDAsXG4gICAgICAvLyBUaGlzIGNsaWVudCBvbmx5IGNhcHR1cmVzIGV2ZW50czogbmV2ZXIgdG91Y2ggZmVhdHVyZSBmbGFncywgc3VydmV5cyBvclxuICAgICAgLy8gcmVtb3RlIGNvbmZpZywgd2hpY2ggd291bGQgb3RoZXJ3aXNlIGZpcmUgcmVxdWVzdHMgb24gaW5pdC9pZGVudGlmeS5cbiAgICAgIHByZWxvYWRGZWF0dXJlRmxhZ3M6IGZhbHNlLFxuICAgICAgZGlzYWJsZVN1cnZleXM6IHRydWUsXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS53YXJuKCdbUG9zdEhvZ10gRmFpbGVkIHRvIGluaXRpYWxpemUgY2xpZW50JywgZXJyb3IpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgY2FwdHVyZU1haW5FdmVudCA9IChcbiAgZXZlbnQ6IHN0cmluZyxcbiAgcHJvcGVydGllczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fSxcbikgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGRpc3RpbmN0SWQgPSBnZXREaXN0aW5jdElkKCk7XG4gICAgaWYgKCFwb3N0aG9nQ2xpZW50IHx8ICFkaXN0aW5jdElkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcG9zdGhvZ0NsaWVudC5jYXB0dXJlKHtcbiAgICAgIGRpc3RpbmN0SWQsXG4gICAgICBldmVudCxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgYXBwOiAnYXV0b2N1dF9hZWEnLFxuICAgICAgICBlbnZpcm9ubWVudDogZ2V0RW52aXJvbm1lbnQoKSxcbiAgICAgICAgJ2VsZWN0cm9uLXZlcnNpb24nOiBhcHAuZ2V0VmVyc2lvbigpLFxuICAgICAgICAuLi5wcm9wZXJ0aWVzLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tQb3N0SG9nXSBGYWlsZWQgdG8gY2FwdHVyZSBtYWluIGV2ZW50JywgZXJyb3IpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc2h1dGRvd25Qb3N0SG9nID0gYXN5bmMgKCkgPT4ge1xuICB0cnkge1xuICAgIC8vIEJvdW5kZWQgZmx1c2ggc28gcXVpdHRpbmcgaXMgbmV2ZXIgZGVsYXllZCBieSBhIHNsb3cgbmV0d29yay5cbiAgICBhd2FpdCBwb3N0aG9nQ2xpZW50Py5zaHV0ZG93bigyMDAwKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tQb3N0SG9nXSBGYWlsZWQgdG8gc2h1dGRvd24gY2xpZW50JywgZXJyb3IpO1xuICB9XG59O1xuIiwiaW1wb3J0IHtJU19TVEFHSU5HfSBmcm9tICdAL2Vudic7XG5pbXBvcnQge3NldFN0ZXB9IGZyb20gJ0AvaW5kZXgnO1xuaW1wb3J0IHt0ZXJtfSBmcm9tICdAL3V0aWxzL2xvZ2dlci51dGlscyc7XG5pbXBvcnQgKiBhcyBTZW50cnkgZnJvbSAnQHNlbnRyeS9lbGVjdHJvbi9tYWluJztcbmltcG9ydCB7YXBwLCBkaWFsb2d9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3RtcGRpcn0gZnJvbSAnb3MnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtnZXRDb29raWV9IGZyb20gJy4uL2Nvb2tpZXMudXRpbHMnO1xuaW1wb3J0IHtnZXREaXN0aW5jdElkfSBmcm9tICcuL3Bvc3Rob2cuc3RhcnQudXRpbHMnO1xuXG5jb25zdCBMT0dfRklMRVMgPSBbXG4gICdhdXRvY3V0LmFlYS5sb2cnLFxuICAnYXV0b2N1dC5jb21wdXRlLmxvZycsXG4gICdhdXRvY3V0LmZyb250LmxvZycsXG4gICdhdXRvY3V0Lmhvc3QubG9nJyxcbiAgJ2F1dG9jdXQuaG9zdFNlcnZlci5sb2cnLFxuXTtcblxuZXhwb3J0IGNvbnN0IGluaXRTZW50cnkgPSAoKSA9PiB7XG4gIGlmIChhcHAuaXNQYWNrYWdlZClcbiAgICBjb25zb2xlLmxvZygnRU5WIDogJyArIEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52LCBudWxsLCAyKSk7XG4gIFNlbnRyeS5pbml0KHtcbiAgICBkc246ICdodHRwczovLzMyNWUxZjk1OGE1N2IwMDI0YWFiNGU0OTExNzgyMGNmQG80NTA0NzY0NjYyMDg3NjgwLmluZ2VzdC51cy5zZW50cnkuaW8vNDUwNzg2NTcwMDU2NDk5MicsXG4gICAgZW52aXJvbm1lbnQ6IGFwcC5pc1BhY2thZ2VkXG4gICAgICA/IElTX1NUQUdJTkdcbiAgICAgICAgPyAnc3RhZ2luZydcbiAgICAgICAgOiAncHJvZHVjdGlvbidcbiAgICAgIDogJ2RldmVsb3BtZW50JyxcbiAgICBiZWZvcmVTZW5kKGV2ZW50LCBoaW50KSB7XG4gICAgICBldmVudC50YWdzID0ge1xuICAgICAgICAuLi5ldmVudC50YWdzLFxuICAgICAgICAnQXV0b0N1dCBWZXJzaW9uJzogYXBwLmdldFZlcnNpb24oKSxcbiAgICAgICAga2V5OiBnZXRDb29raWUoJ3VzZXJLZXknKSxcbiAgICAgICAgVVVJRDogZ2V0Q29va2llKCdhcHBVVUlEJyksXG4gICAgICAgIGNvdW50cnk6IGdldENvb2tpZSgnY291bnRyeUluZm9zJyksXG4gICAgICAgIHBvc3Rob2dEaXN0aW5jdElkOiBnZXREaXN0aW5jdElkKCksXG4gICAgICB9O1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb29raWVzID0gSlNPTi5wYXJzZShcbiAgICAgICAgICByZWFkRmlsZVN5bmMoXG4gICAgICAgICAgICBqb2luKGFwcC5nZXRQYXRoKCd1c2VyRGF0YScpLCAnYXV0b2N1dF9kYXRhLmpzb24nKSxcbiAgICAgICAgICAgICd1dGYtOCcsXG4gICAgICAgICAgKSxcbiAgICAgICAgKSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICAgICAgICBjb25zdCBhcHBVVUlEOiB1bmtub3duID0gSlNPTi5wYXJzZShjb29raWVzLmFwcFVVSUQpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgYXBwVVVJRCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXBwVVVJRCBjb29raWUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2ZW50LnVzZXIgPSB7Li4uZXZlbnQudXNlciwgaWQ6IGFwcFVVSUR9O1xuICAgICAgICBldmVudC50YWdzLlVVSUQgPSBhcHBVVUlEO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIFVzZXIgaWRlbnRpZmljYXRpb24gbXVzdCBuZXZlciBwcmV2ZW50IHNlbmRpbmcgdGhlIFNlbnRyeSBldmVudC5cbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbG9nRm9sZGVyUGF0aCA9IGpvaW4odG1wZGlyKCksICdjb20uYXV0b2N1dCcsICdjb20uYXV0b2N1dC5hZWEnKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGZpbGVuYW1lIG9mIExPR19GSUxFUykge1xuICAgICAgICAgIGNvbnN0IGxvZ0ZpbGVQYXRoID0gam9pbihsb2dGb2xkZXJQYXRoLCBmaWxlbmFtZSk7XG4gICAgICAgICAgaWYgKGV4aXN0c1N5bmMobG9nRmlsZVBhdGgpKSB7XG4gICAgICAgICAgICBoaW50LmF0dGFjaG1lbnRzID8/PSBbXTtcbiAgICAgICAgICAgIGhpbnQuYXR0YWNobWVudHMucHVzaCh7XG4gICAgICAgICAgICAgIGZpbGVuYW1lLFxuICAgICAgICAgICAgICBkYXRhOiByZWFkRmlsZVN5bmMobG9nRmlsZVBhdGgsICd1dGYtOCcpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gTG9nIGF0dGFjaG1lbnRzIG11c3QgbmV2ZXIgcHJldmVudCBzZW5kaW5nIHRoZSBTZW50cnkgZXZlbnQuXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9LFxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZW50cnlXcmFwcGVyID0gPFQ+KHNlbnRyeUZpbmdlcnByaW50OiBzdHJpbmcsIGZuOiAoKSA9PiBUKTogVCA9PiB7XG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICBgU3RlcCAke3Rlcm0uQm9sZH0ke3NlbnRyeUZpbmdlcnByaW50fSR7dGVybS5SZXNldH0gb25nb2luZyAuLi5gLFxuICAgICk7XG4gICAgc2V0U3RlcChzZW50cnlGaW5nZXJwcmludCk7XG4gICAgLy8gSU5JVF9TVEVQIHdhcyBlbWl0dGVkIGhlcmUgb24gZXZlcnkgc3RhcnR1cCBzdGVwICh+MjAvbGF1bmNoKSBidXQgbm8gc2F2ZWRcbiAgICAvLyBpbnNpZ2h0IGNvbnN1bWVkIGl0LCBhbmQgdGhlIHN0ZXAgaXMgYWxyZWFkeSB0cmFja2VkIGJ5IHNldFN0ZXAoKSArIFNlbnRyeVxuICAgIC8vIGJyZWFkY3J1bWJzLiBEcm9wcGVkIHRvIGN1dCBQb3N0SG9nIGV2ZW50IHZvbHVtZSB3aXRob3V0IGxvc2luZyBzaWduYWwuXG4gICAgcmV0dXJuIGZuKCk7XG4gIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKGAke3NlbnRyeUZpbmdlcnByaW50fSBmYWlsZWRgKTtcbiAgICBkaWFsb2cuc2hvd0Vycm9yQm94KCdFcnJvcicsIGUubWVzc2FnZSk7XG5cbiAgICBTZW50cnkud2l0aFNjb3BlKHNjb3BlID0+IHtcbiAgICAgIHNjb3BlLnNldEZpbmdlcnByaW50KFtzZW50cnlGaW5nZXJwcmludF0pO1xuXG4gICAgICBzY29wZS5zZXRUYWcoJ2FwcFVVSUQnLCBnZXRDb29raWUoJ2FwcFVVSUQnKSk7XG5cbiAgICAgIFNlbnRyeS5jYXB0dXJlRXhjZXB0aW9uKGUpO1xuICAgIH0pO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7Q2hpbGRQcm9jZXNzfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuaW1wb3J0IHtzaGFyZWRWYXJpYWJsZXN9IGZyb20gJ0AvdXRpbHMvc3RhcnRGdW5jdGlvbnMvc2hhcmVkVmFyaWFibGVzLnN0YXJ0LnV0aWxzJztcbmltcG9ydCB7Zm9ya30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQge21rZGlyU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7ZG93bmxvYWRGaWxlfSBmcm9tICcuL3V0aWxzL2F4aW9zLnV0aWxzJztcbmltcG9ydCB7SVNfUFJPRH0gZnJvbSAnLi9lbnYnO1xuaW1wb3J0IHt3YXRjaFN1YnByb2Nlc3NUZXJtaW5hdGlvbn0gZnJvbSAnLi9zdWJwcm9jZXNzVGVybWluYXRpb24nO1xuaW1wb3J0IHtlbGVjdHJvbkxvZ2dlcn0gZnJvbSAnLi91dGlscy9sb2dnZXIudXRpbHMnO1xuXG5leHBvcnQgdHlwZSBUYXNrVGFyZ2V0ID0gJ3Bwcm8nIHwgJ2RhdmluY2knIHwgJ2VsZWN0cm9uJztcbmV4cG9ydCB0eXBlIFRhc2tSZXF1ZXN0ID0ge1xuICBkb21haW46IHtcbiAgICBzbHVnOiBzdHJpbmc7XG4gICAgdGFyZ2V0OiBUYXNrVGFyZ2V0O1xuICB9O1xuICBwcmlvcml0eTogbnVtYmVyO1xuICBkYXRhOiBhbnk7XG4gIGRlYnVnPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCBsZXQgY29tcHV0ZUluc3RhbmNlOiBDaGlsZFByb2Nlc3MgfCBudWxsID0gbnVsbDtcblxuY29uc3QgZ2V0Q29tcHV0ZUluc3RhbmNlRGlhZ25vc3RpY3MgPSAoKSA9PiB7XG4gIGlmICghY29tcHV0ZUluc3RhbmNlKSByZXR1cm4ge2hhc0luc3RhbmNlOiBmYWxzZX07XG5cbiAgcmV0dXJuIHtcbiAgICBjb25uZWN0ZWQ6IGNvbXB1dGVJbnN0YW5jZS5jb25uZWN0ZWQsXG4gICAgZXhpdENvZGU6IGNvbXB1dGVJbnN0YW5jZS5leGl0Q29kZSxcbiAgICBoYXNJbnN0YW5jZTogdHJ1ZSxcbiAgICBraWxsZWQ6IGNvbXB1dGVJbnN0YW5jZS5raWxsZWQsXG4gICAgcGlkOiBjb21wdXRlSW5zdGFuY2UucGlkLFxuICAgIHNpZ25hbENvZGU6IGNvbXB1dGVJbnN0YW5jZS5zaWduYWxDb2RlLFxuICAgIHNwYXduZmlsZTogY29tcHV0ZUluc3RhbmNlLnNwYXduZmlsZSxcbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBkb3dubG9hZFNjcmlwdCA9IGFzeW5jIChcbiAgc2NyaXB0UmVsYXRpdmVQYXRoOiBzdHJpbmcsXG4gIHt3aXRoQ2FjaGUgPSBmYWxzZX06IHt3aXRoQ2FjaGU/OiBib29sZWFufSA9IHt9LFxuKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgaWYgKCFzaGFyZWRWYXJpYWJsZXM/LkNPTVBVVEVfVVJMKSB0aHJvdyBuZXcgRXJyb3IoJ0NPTVBVVEVfVVJMIGlzIG5vdCBzZXQnKTtcbiAgaWYgKCFzaGFyZWRWYXJpYWJsZXM/LlRFTVBfRk9MREVSX1BBVEgpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdURU1QX0ZPTERFUl9QQVRIIGlzIG5vdCBzZXQnKTtcblxuICBjb25zdCBkb3dubG9hZFVybCA9IG5ldyBVUkwoc2NyaXB0UmVsYXRpdmVQYXRoLCBzaGFyZWRWYXJpYWJsZXMuQ09NUFVURV9VUkwpXG4gICAgLmhyZWY7XG4gIGNvbnNvbGUubG9nKCdEb3dubG9hZGluZyBzY3JpcHQgZnJvbScsIGRvd25sb2FkVXJsKTtcblxuICBjb25zdCByZWxhdGl2ZVBhdGhQYXJ0cyA9IHNjcmlwdFJlbGF0aXZlUGF0aC5zcGxpdCgnLycpO1xuICBjb25zdCBmb2xkZXJQYXRoID1cbiAgICByZWxhdGl2ZVBhdGhQYXJ0cy5sZW5ndGggPiAxXG4gICAgICA/IHJlbGF0aXZlUGF0aFBhcnRzLnNsaWNlKDAsIC0xKS5qb2luKCcvJylcbiAgICAgIDogJyc7XG5cbiAgY29uc3Qgc2NyaXB0RmlsZW5hbWUgPSByZWxhdGl2ZVBhdGhQYXJ0c1tyZWxhdGl2ZVBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblxuICBjb25zdCB3cml0ZVBhdGggPSBwYXRoLmpvaW4oXG4gICAgc2hhcmVkVmFyaWFibGVzLlRFTVBfRk9MREVSX1BBVEgsXG4gICAgJ2NvbS5hdXRvY3V0LmNvbXB1dGUnLFxuICAgIGZvbGRlclBhdGgsXG4gICk7XG5cbiAgY29uc29sZS5sb2coXG4gICAgYFdyaXRpbmcgJHtzY3JpcHRGaWxlbmFtZX0gY29tcHV0ZSBzY3JpcHQgdG8gJHt3cml0ZVBhdGh9IGZvbGRlcmAsXG4gICk7XG5cbiAgbWtkaXJTeW5jKHdyaXRlUGF0aCwge3JlY3Vyc2l2ZTogdHJ1ZX0pO1xuXG4gIGNvbnN0IGZpbGVQYXRoID0gYXdhaXQgZG93bmxvYWRGaWxlKGRvd25sb2FkVXJsLCB3cml0ZVBhdGgsIHt3aXRoQ2FjaGV9KTtcbiAgY29uc29sZS5sb2coYFNjcmlwdCAke3NjcmlwdFJlbGF0aXZlUGF0aH0gZG93bmxvYWRlZCB0byAke2ZpbGVQYXRofWApO1xuICByZXR1cm4gZmlsZVBhdGg7XG59O1xuXG5leHBvcnQgY29uc3Qgc3RvcENvbXB1dGUgPSAocmVhc29uID0gJ3Vuc3BlY2lmaWVkJykgPT4ge1xuICBlbGVjdHJvbkxvZ2dlci5sb2coXG4gICAgJ1N0b3BwaW5nIGNvbXB1dGUnLFxuICAgIHtcbiAgICAgIHJlYXNvbixcbiAgICAgIC4uLmdldENvbXB1dGVJbnN0YW5jZURpYWdub3N0aWNzKCksXG4gICAgfSxcbiAgICB7Zm9yY2VGbHVzaDogdHJ1ZX0sXG4gICk7XG4gIGNvbXB1dGVJbnN0YW5jZT8ua2lsbCgpO1xufTtcblxuZXhwb3J0IGNvbnN0IHN0YXJ0Q29tcHV0ZSA9IGFzeW5jIChcbiAgc2hhcmVkVmFyaWFibGVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWQ+LFxuKSA9PiB7XG4gIHRyeSB7XG4gICAgLy8gbWFpbi5janMgbGl2ZXMgYXQgYSBtdXRhYmxlIFVSTCAodW5saWtlIHRoZSBoYXNoLWFkZHJlc3NlZCBkb21haW5cbiAgICAvLyBzY3JpcHRzKSwgc28gYSBjYWNoZWQgY29weSBtZWFucyBydW5uaW5nIGEgZGVwcmVjYXRlZCBidWlsZC5cbiAgICBjb25zdCBmaWxlUGF0aCA9IGF3YWl0IGRvd25sb2FkU2NyaXB0KCdtYWluLmNqcycsIHt3aXRoQ2FjaGU6IGZhbHNlfSk7XG4gICAgaWYgKGNvbXB1dGVJbnN0YW5jZSAhPT0gbnVsbCkge1xuICAgICAgZWxlY3Ryb25Mb2dnZXIud2FybihcbiAgICAgICAgJ0V4aXN0aW5nIGNvbXB1dGUgaW5zdGFuY2UgZm91bmQgYmVmb3JlIHN0YXJ0OyBraWxsaW5nIGl0JyxcbiAgICAgICAge1xuICAgICAgICAgIC4uLmdldENvbXB1dGVJbnN0YW5jZURpYWdub3N0aWNzKCksXG4gICAgICAgIH0sXG4gICAgICAgIHtmb3JjZUZsdXNoOiB0cnVlfSxcbiAgICAgICk7XG4gICAgICBjb21wdXRlSW5zdGFuY2Uua2lsbCgpO1xuICAgIH1cbiAgICBjb21wdXRlSW5zdGFuY2UgPSBmb3JrKGZpbGVQYXRoLCBbXSwge1xuICAgICAgZXhlY0FyZ3Y6IElTX1BST0QgPyBbXSA6IFsnLS1pbnNwZWN0PTkyMzEnXSxcbiAgICAgIGVudjoge1xuICAgICAgICAuLi5wcm9jZXNzLmVudixcbiAgICAgICAgLi4uc2hhcmVkVmFyaWFibGVzLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZygnQ29tcHV0ZSBmb3JrZWQnLCB7XG4gICAgICBleGVjQXJndjogSVNfUFJPRCA/IFtdIDogWyctLWluc3BlY3Q9OTIzMSddLFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBwaWQ6IGNvbXB1dGVJbnN0YW5jZS5waWQsXG4gICAgICBwbGF0Zm9ybTogcHJvY2Vzcy5wbGF0Zm9ybSxcbiAgICB9KTtcbiAgICBjb21wdXRlSW5zdGFuY2Uub24oJ3NwYXduJywgKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ0NvbXB1dGUgc3Bhd25lZCcsIGdldENvbXB1dGVJbnN0YW5jZURpYWdub3N0aWNzKCkpO1xuICAgIH0pO1xuICAgIGNvbXB1dGVJbnN0YW5jZS5vbignZGlzY29ubmVjdCcsICgpID0+IHtcbiAgICAgIGNvbnNvbGUud2FybignQ29tcHV0ZSBJUEMgY2hhbm5lbCBkaXNjb25uZWN0ZWQnLCB7XG4gICAgICAgIC4uLmdldENvbXB1dGVJbnN0YW5jZURpYWdub3N0aWNzKCksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBjb21wdXRlSW5zdGFuY2Uub24oJ2Vycm9yJywgZXJyID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvbXB1dGUgY2hpbGQgcHJvY2VzcyBlcnJvcicsIHtcbiAgICAgICAgZXJyb3I6IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLnN0YWNrIDogZXJyLFxuICAgICAgICAuLi5nZXRDb21wdXRlSW5zdGFuY2VEaWFnbm9zdGljcygpLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29tcHV0ZUluc3RhbmNlLm9uKCdleGl0JywgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgZWxlY3Ryb25Mb2dnZXIuZXJyb3IoXG4gICAgICAgICdDb21wdXRlIGV4aXRlZCcsXG4gICAgICAgIHtcbiAgICAgICAgICBjb2RlLFxuICAgICAgICAgIHNpZ25hbCxcbiAgICAgICAgICAuLi5nZXRDb21wdXRlSW5zdGFuY2VEaWFnbm9zdGljcygpLFxuICAgICAgICB9LFxuICAgICAgICB7Zm9yY2VGbHVzaDogdHJ1ZX0sXG4gICAgICApO1xuICAgIH0pO1xuICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHN0b3BDb21wdXRlKCdlbGVjdHJvbiBTSUdJTlQnKSk7XG4gICAgcHJvY2Vzcy5vbignU0lHVEVSTScsICgpID0+IHN0b3BDb21wdXRlKCdlbGVjdHJvbiBTSUdURVJNJykpO1xuICAgIHByb2Nlc3Mub24oJ2V4aXQnLCAoKSA9PiBzdG9wQ29tcHV0ZSgnZWxlY3Ryb24gZXhpdCcpKTtcblxuICAgIHdhdGNoU3VicHJvY2Vzc1Rlcm1pbmF0aW9uKGNvbXB1dGVJbnN0YW5jZSwgJ2NvbXB1dGUnKTtcblxuICAgIGNvbnNvbGUubG9nKCdDb21wdXRlIHN0YXJ0ZWQnKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gIH1cbn07XG4iLCJpbXBvcnQge2Rvd25sb2FkU2NyaXB0fSBmcm9tICdAL2NvbXB1dGUnO1xuaW1wb3J0IHtzaGFyZWRWYXJpYWJsZXN9IGZyb20gJ0AvdXRpbHMvc3RhcnRGdW5jdGlvbnMvc2hhcmVkVmFyaWFibGVzLnN0YXJ0LnV0aWxzJztcbmltcG9ydCB7SXBjU2VydmVyfSBmcm9tICdAa2V6aW9zL25vZGUtaXBjJztcblxubGV0IHNlcnZlcjogSXBjU2VydmVyO1xuXG5jb25zdCBzdG9wSXBjU2VydmVyID0gKCkgPT4ge1xuICBjb25zb2xlLmxvZygnU3RvcHBpbmcgIElwYyBzZXJ2ZXInKTtcbiAgc2VydmVyLmNsb3NlKCk7XG59O1xuXG5leHBvcnQgY29uc3Qgc3RhcnRJcGNTZXJ2ZXIgPSAoKSA9PiB7XG4gIHNlcnZlciA9IG5ldyBJcGNTZXJ2ZXIoXG4gICAge1xuICAgICAgc29ja2V0Um9vdFBhdGg6IHNoYXJlZFZhcmlhYmxlcz8uVEVNUF9GT0xERVJfUEFUSCxcbiAgICB9LFxuICAgIGFzeW5jIChjbGllbnRTb2NrZXQsIG1lc3NhZ2UpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHN3aXRjaCAobWVzc2FnZS5ldmVudCkge1xuICAgICAgICAgIGNhc2UgJ2Rvd25sb2FkU2NyaXB0Jzoge1xuICAgICAgICAgICAgY29uc3QgdGFzayA9IG1lc3NhZ2UubWVzc2FnZURhdGE7XG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGF3YWl0IGRvd25sb2FkU2NyaXB0KHRhc2suZGF0YSk7XG5cbiAgICAgICAgICAgIHNlcnZlci5yZXNwb25kKGNsaWVudFNvY2tldCwgbWVzc2FnZS5pZCwgZmlsZVBhdGgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIGNvbnN0IHNlcmlhbGl6ZWRFcnJvciA9IHtcbiAgICAgICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgIG5hbWU6IGVycm9yLm5hbWUsXG4gICAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICAgIGZyb206ICdpcGMnLFxuICAgICAgICB9O1xuICAgICAgICBzZXJ2ZXIuZXJyb3IoY2xpZW50U29ja2V0LCBtZXNzYWdlLmlkLCBzZXJpYWxpemVkRXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gICk7XG5cbiAgc2VydmVyLmxpc3RlbignY29tLmF1dG9jdXQubWFpbicpO1xuICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiBzdG9wSXBjU2VydmVyKCkpO1xuICBwcm9jZXNzLm9uKCdTSUdURVJNJywgKCkgPT4gc3RvcElwY1NlcnZlcigpKTtcbiAgcHJvY2Vzcy5vbignZXhpdCcsICgpID0+IHN0b3BJcGNTZXJ2ZXIoKSk7XG59O1xuIiwiaW1wb3J0IHthcHAsIEJyb3dzZXJXaW5kb3csIGlwY01haW4sIG5ldH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcblxuaW1wb3J0IHtcbiAgY2FuQ29udGludWVRYVNlbGVjdGlvbixcbiAgZ2V0UWFTZWxlY3Rpb25FcnJvcixcbiAgcGFyc2VRYUxpc3QsXG4gIHR5cGUgUWFMaXN0SXRlbSxcbn0gZnJvbSAnLi9xYUNvbnRyYWN0cyc7XG5pbXBvcnQge2lzUGFja2FnZWRTdGFnaW5nQnVpbGR9IGZyb20gJy4vcWFNb2RlJztcbmltcG9ydCB7c2V0UWFUYXJnZXR9IGZyb20gJy4vcWFUYXJnZXQnO1xuXG5jb25zdCBRQV9MSVNUX0NIQU5ORUwgPSAncWEtc2VsZWN0b3I6bGlzdCc7XG5jb25zdCBRQV9TVEFSVF9DSEFOTkVMID0gJ3FhLXNlbGVjdG9yOnN0YXJ0JztcbmNvbnN0IFFBX1NUQVJUX1NUQUdJTkdfQ0hBTk5FTCA9ICdxYS1zZWxlY3RvcjpzdGFydC1zdGFnaW5nJztcbmNvbnN0IFFBX0xJU1RfUEFUSCA9ICcvdjIvcHVibGljL3FhLWxpc3QnO1xuY29uc3QgUUFfTElTVF9USU1FT1VUX01TID0gMTBfMDAwO1xuXG50eXBlIFFhTGlzdFJlc3BvbnNlID1cbiAgfCB7ZXJyb3I6IHN0cmluZzsgb2s6IGZhbHNlfVxuICB8IHtpdGVtczogUWFMaXN0SXRlbVtdOyBvazogdHJ1ZX07XG5cbnR5cGUgUWFTdGFydFJlc3BvbnNlID0ge2Vycm9yOiBzdHJpbmc7IG9rOiBmYWxzZX0gfCB7b2s6IHRydWV9O1xuXG5jb25zdCBnZXRRYUxpc3RVcmwgPSAoKTogVVJMID0+IHtcbiAgY29uc3QgY29uZmlndXJlZENvb2tVcmw6IHVua25vd24gPSBpbXBvcnQubWV0YS5lbnYuVklURV9DT09LX1VSTDtcbiAgY29uc3QgY29va1VybCA9XG4gICAgdHlwZW9mIGNvbmZpZ3VyZWRDb29rVXJsID09PSAnc3RyaW5nJyAmJiBjb25maWd1cmVkQ29va1VybC5sZW5ndGggPiAwXG4gICAgICA/IGNvbmZpZ3VyZWRDb29rVXJsXG4gICAgICA6ICdodHRwczovL21hbi5hdXRvY3V0LmNvbS8nO1xuICByZXR1cm4gbmV3IFVSTChRQV9MSVNUX1BBVEgsIGNvb2tVcmwpO1xufTtcblxuY29uc3QgZmV0Y2hRYUxpc3QgPSBhc3luYyAoXG4gIHNlbGVjdG9yU2lnbmFsPzogQWJvcnRTaWduYWwsXG4pOiBQcm9taXNlPFFhTGlzdEl0ZW1bXT4gPT4ge1xuICBpZiAoIWlzUGFja2FnZWRTdGFnaW5nQnVpbGQoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIFFBIHNlbGVjdG9yIGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgYnVpbGQnKTtcbiAgfVxuXG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgUUFfTElTVF9USU1FT1VUX01TKTtcbiAgY29uc3QgYWJvcnRTZWxlY3RvclJlcXVlc3QgPSAoKTogdm9pZCA9PiBjb250cm9sbGVyLmFib3J0KCk7XG4gIHNlbGVjdG9yU2lnbmFsPy5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIGFib3J0U2VsZWN0b3JSZXF1ZXN0LCB7b25jZTogdHJ1ZX0pO1xuICBpZiAoc2VsZWN0b3JTaWduYWw/LmFib3J0ZWQpIHtcbiAgICBjb250cm9sbGVyLmFib3J0KCk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbmV0LmZldGNoKGdldFFhTGlzdFVybCgpLmhyZWYsIHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdDYWNoZS1Db250cm9sJzogJ25vLWNhY2hlJyxcbiAgICAgIH0sXG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICB9KTtcblxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUUEgbGlzdCByZXF1ZXN0IGZhaWxlZCB3aXRoIEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgYm9keTogdW5rbm93biA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICByZXR1cm4gcGFyc2VRYUxpc3QoYm9keSk7XG4gIH0gZmluYWxseSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgIHNlbGVjdG9yU2lnbmFsPy5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIGFib3J0U2VsZWN0b3JSZXF1ZXN0KTtcbiAgfVxufTtcblxuY29uc3QgdG9TZWxlY3RvckVycm9yID0gKGVycm9yOiB1bmtub3duKTogc3RyaW5nID0+IHtcbiAgY29uc29sZS5lcnJvcignW1FBIFNlbGVjdG9yXSBSZXF1ZXN0IGZhaWxlZDonLCBlcnJvcik7XG4gIHJldHVybiBlcnJvciBpbnN0YW5jZW9mIEVycm9yXG4gICAgPyBlcnJvci5tZXNzYWdlXG4gICAgOiAnVGhlIFFBIHNlcnZpY2UgaXMgdGVtcG9yYXJpbHkgdW5hdmFpbGFibGUnO1xufTtcblxuZXhwb3J0IGNvbnN0IG9wZW5RYVNlbGVjdG9yID0gYXN5bmMgKFxuICBjb250aW51ZU9yZGluYXJ5Qm9vdHN0cmFwOiAoKSA9PiBQcm9taXNlPHZvaWQ+LFxuKTogUHJvbWlzZTxCcm93c2VyV2luZG93PiA9PiB7XG4gIGlmICghaXNQYWNrYWdlZFN0YWdpbmdCdWlsZCgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgUUEgc2VsZWN0b3IgY2FuIG9ubHkgb3BlbiBpbiBwYWNrYWdlZCBzdGFnaW5nIGJ1aWxkcycpO1xuICB9XG5cbiAgbGV0IGNvbnRyb2xsZWRDbG9zZSA9IGZhbHNlO1xuICBsZXQgY29udGludWF0aW9uU3RhcnRlZCA9IGZhbHNlO1xuICBsZXQgYXBwbGljYXRpb25Jc1F1aXR0aW5nID0gZmFsc2U7XG4gIGNvbnN0IHNlbGVjdG9yUmVxdWVzdHMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG5cbiAgY29uc3Qgc2VsZWN0b3JBc3NldHNQYXRoID0gcGF0aC5qb2luKFxuICAgIHByb2Nlc3MucmVzb3VyY2VzUGF0aCxcbiAgICAnYXNzZXRzJyxcbiAgICAncWEtc2VsZWN0b3InLFxuICApO1xuICBjb25zdCBzZWxlY3RvcldpbmRvdyA9IG5ldyBCcm93c2VyV2luZG93KHtcbiAgICBhdXRvSGlkZU1lbnVCYXI6IHRydWUsXG4gICAgYmFja2dyb3VuZENvbG9yOiAnIzEwMTAxNScsXG4gICAgY2VudGVyOiB0cnVlLFxuICAgIGhlaWdodDogNzYwLFxuICAgIG1pbkhlaWdodDogNTYwLFxuICAgIG1pbldpZHRoOiA2NDAsXG4gICAgc2hvdzogZmFsc2UsXG4gICAgdGl0bGU6ICdBdXRvQ3V0IFFBJyxcbiAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgY29udGV4dElzb2xhdGlvbjogdHJ1ZSxcbiAgICAgIGRldlRvb2xzOiBmYWxzZSxcbiAgICAgIG5vZGVJbnRlZ3JhdGlvbjogZmFsc2UsXG4gICAgICBwcmVsb2FkOiBwYXRoLmpvaW4oc2VsZWN0b3JBc3NldHNQYXRoLCAncHJlbG9hZC5janMnKSxcbiAgICAgIHNhbmRib3g6IHRydWUsXG4gICAgICB3ZWJ2aWV3VGFnOiBmYWxzZSxcbiAgICB9LFxuICAgIHdpZHRoOiA3NjAsXG4gIH0pO1xuXG4gIGNvbnN0IGlzU2VsZWN0b3JTZW5kZXIgPSAoc2VuZGVySWQ6IG51bWJlcik6IGJvb2xlYW4gPT5cbiAgICAhc2VsZWN0b3JXaW5kb3cuaXNEZXN0cm95ZWQoKSAmJiBzZWxlY3RvcldpbmRvdy53ZWJDb250ZW50cy5pZCA9PT0gc2VuZGVySWQ7XG5cbiAgY29uc3QgZ2V0Q29udGludWF0aW9uRXJyb3IgPSAoKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgICBpZiAoY29udGludWF0aW9uU3RhcnRlZCkge1xuICAgICAgcmV0dXJuICdBdXRvQ3V0IHN0YXJ0dXAgaGFzIGFscmVhZHkgcmVzdW1lZCc7XG4gICAgfVxuICAgIGlmIChcbiAgICAgICFjYW5Db250aW51ZVFhU2VsZWN0aW9uKFxuICAgICAgICBhcHBsaWNhdGlvbklzUXVpdHRpbmcsXG4gICAgICAgIHNlbGVjdG9yV2luZG93LmlzRGVzdHJveWVkKCksXG4gICAgICApXG4gICAgKSB7XG4gICAgICByZXR1cm4gJ0F1dG9DdXQgaXMgY2xvc2luZyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfTtcblxuICBjb25zdCBydW5PcmRpbmFyeUJvb3RzdHJhcEZyb21TZWxlY3RvciA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBpZiAoXG4gICAgICAhY2FuQ29udGludWVRYVNlbGVjdGlvbihcbiAgICAgICAgYXBwbGljYXRpb25Jc1F1aXR0aW5nLFxuICAgICAgICBzZWxlY3RvcldpbmRvdy5pc0Rlc3Ryb3llZCgpLFxuICAgICAgKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEtlZXAgdGhlIHNlbGVjdG9yIEJyb3dzZXJXaW5kb3cgYWxpdmUgd2hpbGUgb3JkaW5hcnkgYm9vdHN0cmFwIGNyZWF0ZXNcbiAgICAvLyB0aGUgYXBwbGljYXRpb24gd2luZG93LiBDbG9zaW5nIHRoZSBsYXN0IHdpbmRvdyBtYWtlcyBFbGVjdHJvbiBxdWl0IGJ5XG4gICAgLy8gZGVmYXVsdCBhbmQgd291bGQgaW50ZXJydXB0IGJvb3RzdHJhcCBiZWZvcmUgQXV0b0N1dCBjYW4gcmVvcGVuLlxuICAgIHNlbGVjdG9yV2luZG93LmhpZGUoKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBjb250aW51ZU9yZGluYXJ5Qm9vdHN0cmFwKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICdbUUEgU2VsZWN0b3JdIE9yZGluYXJ5IGJvb3RzdHJhcCBmYWlsZWQgYWZ0ZXIgc2VsZWN0b3I6JyxcbiAgICAgICAgZXJyb3IsXG4gICAgICApO1xuICAgICAgYXBwLnF1aXQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICAhY2FuQ29udGludWVRYVNlbGVjdGlvbihcbiAgICAgICAgYXBwbGljYXRpb25Jc1F1aXR0aW5nLFxuICAgICAgICBzZWxlY3RvcldpbmRvdy5pc0Rlc3Ryb3llZCgpLFxuICAgICAgKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnRyb2xsZWRDbG9zZSA9IHRydWU7XG4gICAgc2VsZWN0b3JXaW5kb3cuY2xvc2UoKTtcbiAgfTtcblxuICBjb25zdCBjb250aW51ZUZyb21TZWxlY3RvciA9ICgpOiBRYVN0YXJ0UmVzcG9uc2UgPT4ge1xuICAgIGNvbnRpbnVhdGlvblN0YXJ0ZWQgPSB0cnVlO1xuICAgIHNldEltbWVkaWF0ZSgoKSA9PiB2b2lkIHJ1bk9yZGluYXJ5Qm9vdHN0cmFwRnJvbVNlbGVjdG9yKCkpO1xuICAgIHJldHVybiB7b2s6IHRydWV9O1xuICB9O1xuXG4gIGlwY01haW4uaGFuZGxlKFFBX0xJU1RfQ0hBTk5FTCwgYXN5bmMgKGV2ZW50KTogUHJvbWlzZTxRYUxpc3RSZXNwb25zZT4gPT4ge1xuICAgIGlmICghaXNTZWxlY3RvclNlbmRlcihldmVudC5zZW5kZXIuaWQpKSB7XG4gICAgICByZXR1cm4ge2Vycm9yOiAnVW5hdXRob3JpemVkIFFBIHNlbGVjdG9yIHJlcXVlc3QnLCBvazogZmFsc2V9O1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4ge2l0ZW1zOiBhd2FpdCBmZXRjaFFhTGlzdChzZWxlY3RvclJlcXVlc3RzLnNpZ25hbCksIG9rOiB0cnVlfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIHtlcnJvcjogdG9TZWxlY3RvckVycm9yKGVycm9yKSwgb2s6IGZhbHNlfTtcbiAgICB9XG4gIH0pO1xuXG4gIGlwY01haW4uaGFuZGxlKFxuICAgIFFBX1NUQVJUX0NIQU5ORUwsXG4gICAgYXN5bmMgKGV2ZW50LCBwck51bWJlcjogdW5rbm93bik6IFByb21pc2U8UWFTdGFydFJlc3BvbnNlPiA9PiB7XG4gICAgICBpZiAoIWlzU2VsZWN0b3JTZW5kZXIoZXZlbnQuc2VuZGVyLmlkKSkge1xuICAgICAgICByZXR1cm4ge2Vycm9yOiAnVW5hdXRob3JpemVkIFFBIHNlbGVjdG9yIHJlcXVlc3QnLCBvazogZmFsc2V9O1xuICAgICAgfVxuICAgICAgY29uc3QgaW5pdGlhbENvbnRpbnVhdGlvbkVycm9yID0gZ2V0Q29udGludWF0aW9uRXJyb3IoKTtcbiAgICAgIGlmIChpbml0aWFsQ29udGludWF0aW9uRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHtlcnJvcjogaW5pdGlhbENvbnRpbnVhdGlvbkVycm9yLCBvazogZmFsc2V9O1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjdXJyZW50UWFMaXN0ID0gYXdhaXQgZmV0Y2hRYUxpc3Qoc2VsZWN0b3JSZXF1ZXN0cy5zaWduYWwpO1xuICAgICAgICBjb25zdCBzZWxlY3Rpb25FcnJvciA9IGdldFFhU2VsZWN0aW9uRXJyb3IoY3VycmVudFFhTGlzdCwgcHJOdW1iZXIpO1xuICAgICAgICBpZiAoc2VsZWN0aW9uRXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4ge2Vycm9yOiBzZWxlY3Rpb25FcnJvciwgb2s6IGZhbHNlfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb250aW51YXRpb25FcnJvciA9IGdldENvbnRpbnVhdGlvbkVycm9yKCk7XG4gICAgICAgIGlmIChjb250aW51YXRpb25FcnJvcikge1xuICAgICAgICAgIHJldHVybiB7ZXJyb3I6IGNvbnRpbnVhdGlvbkVycm9yLCBvazogZmFsc2V9O1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0UWFUYXJnZXQoTnVtYmVyKHByTnVtYmVyKSk7XG4gICAgICAgIHJldHVybiBjb250aW51ZUZyb21TZWxlY3RvcigpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHtlcnJvcjogdG9TZWxlY3RvckVycm9yKGVycm9yKSwgb2s6IGZhbHNlfTtcbiAgICAgIH1cbiAgICB9LFxuICApO1xuXG4gIGlwY01haW4uaGFuZGxlKFFBX1NUQVJUX1NUQUdJTkdfQ0hBTk5FTCwgKGV2ZW50KTogUWFTdGFydFJlc3BvbnNlID0+IHtcbiAgICBpZiAoIWlzU2VsZWN0b3JTZW5kZXIoZXZlbnQuc2VuZGVyLmlkKSkge1xuICAgICAgcmV0dXJuIHtlcnJvcjogJ1VuYXV0aG9yaXplZCBRQSBzZWxlY3RvciByZXF1ZXN0Jywgb2s6IGZhbHNlfTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250aW51YXRpb25FcnJvciA9IGdldENvbnRpbnVhdGlvbkVycm9yKCk7XG4gICAgaWYgKGNvbnRpbnVhdGlvbkVycm9yKSB7XG4gICAgICByZXR1cm4ge2Vycm9yOiBjb250aW51YXRpb25FcnJvciwgb2s6IGZhbHNlfTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udGludWVGcm9tU2VsZWN0b3IoKTtcbiAgfSk7XG5cbiAgY29uc3QgcmVtb3ZlSXBjSGFuZGxlcnMgPSAoKTogdm9pZCA9PiB7XG4gICAgaXBjTWFpbi5yZW1vdmVIYW5kbGVyKFFBX0xJU1RfQ0hBTk5FTCk7XG4gICAgaXBjTWFpbi5yZW1vdmVIYW5kbGVyKFFBX1NUQVJUX0NIQU5ORUwpO1xuICAgIGlwY01haW4ucmVtb3ZlSGFuZGxlcihRQV9TVEFSVF9TVEFHSU5HX0NIQU5ORUwpO1xuICB9O1xuXG4gIGFwcC5vbmNlKCdiZWZvcmUtcXVpdCcsICgpID0+IHtcbiAgICBhcHBsaWNhdGlvbklzUXVpdHRpbmcgPSB0cnVlO1xuICAgIHNlbGVjdG9yUmVxdWVzdHMuYWJvcnQoKTtcbiAgfSk7XG4gIHNlbGVjdG9yV2luZG93Lm9uY2UoJ3JlYWR5LXRvLXNob3cnLCAoKSA9PiBzZWxlY3RvcldpbmRvdy5zaG93KCkpO1xuICBzZWxlY3RvcldpbmRvdy5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgc2VsZWN0b3JSZXF1ZXN0cy5hYm9ydCgpO1xuICAgIGlmICghY29udHJvbGxlZENsb3NlICYmICFhcHBsaWNhdGlvbklzUXVpdHRpbmcpIHtcbiAgICAgIGFwcC5xdWl0KCk7XG4gICAgfVxuICB9KTtcbiAgc2VsZWN0b3JXaW5kb3cub25jZSgnY2xvc2VkJywgKCkgPT4ge1xuICAgIHNlbGVjdG9yUmVxdWVzdHMuYWJvcnQoKTtcbiAgICByZW1vdmVJcGNIYW5kbGVycygpO1xuICB9KTtcblxuICB0cnkge1xuICAgIGF3YWl0IHNlbGVjdG9yV2luZG93LmxvYWRGaWxlKHBhdGguam9pbihzZWxlY3RvckFzc2V0c1BhdGgsICdpbmRleC5odG1sJykpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJlbW92ZUlwY0hhbmRsZXJzKCk7XG4gICAgaWYgKCFzZWxlY3RvcldpbmRvdy5pc0Rlc3Ryb3llZCgpKSB7XG4gICAgICBjb250cm9sbGVkQ2xvc2UgPSB0cnVlO1xuICAgICAgc2VsZWN0b3JXaW5kb3cuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuXG4gIHJldHVybiBzZWxlY3RvcldpbmRvdztcbn07XG4iLCJpbXBvcnQge0lTX1BST0R9IGZyb20gJ0AvZW52JztcbmltcG9ydCB7YXBwfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgREVFUF9MSU5LX1NDSEVNRSA9IElTX1BST0QgPyAnYXV0b2N1dCcgOiAnYXV0b2N1dHN0Zyc7XG5cbmV4cG9ydCBjb25zdCBpbml0RGVlcExpbmsgPSAoKSA9PiB7XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnZGFyd2luJykge1xuICAgIGFwcC5zZXRBc0RlZmF1bHRQcm90b2NvbENsaWVudChERUVQX0xJTktfU0NIRU1FKTtcbiAgfVxufTtcbiIsImltcG9ydCB7c3Bhd259IGZyb20gJ25vZGU6Y2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IERFVEFDSEVEX0VOVl9LRVkgPSAnQVVUT0NVVF9ERVRBQ0hFRCc7XG5jb25zdCBOT19ERVRBQ0hFRF9BUkcgPSAnLS1uby1kZXRhY2hlZCc7XG5cbi8qKlxuICogT24gV2luZG93cywgcmUtc3Bhd25zIHRoZSBjdXJyZW50IHByb2Nlc3MgYXMgYSBmdWxseSBkZXRhY2hlZCBwcm9jZXNzXG4gKiBzbyBpdCBzdXJ2aXZlcyBpbmRlcGVuZGVudGx5IG9mIHdoYXRldmVyIHBhcmVudCBsYXVuY2hlZCBpdC5cbiAqXG4gKiBVc2VzIGFuIGVudiBmbGFnIHRvIGF2b2lkIGluZmluaXRlIHJlLXNwYXduIGxvb3BzLlxuICogUGFzcyBgLS1uby1kZXRhY2hlZGAgdG8gc2tpcCByZS1zcGF3biBhbmQgc3RheSBhdHRhY2hlZCB0byB0aGUgcGFyZW50LlxuICogTXVzdCBiZSBjYWxsZWQgYmVmb3JlIGBhcHAucmVxdWVzdFNpbmdsZUluc3RhbmNlTG9jaygpYC5cbiAqL1xuZXhwb3J0IGNvbnN0IGRldGFjaEZyb21QYXJlbnRPbldpbmRvd3MgPSAoKSA9PiB7XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSByZXR1cm47XG4gIGlmIChwcm9jZXNzLmFyZ3YuaW5jbHVkZXMoTk9fREVUQUNIRURfQVJHKSkge1xuICAgIHJldHVybiBjb25zb2xlLmxvZygnW1Byb2Nlc3NdIFNraXBwaW5nIGRldGFjaGVkIHJlLXNwYXduICgtLW5vLWRldGFjaGVkKScpO1xuICB9XG4gIGlmIChwcm9jZXNzLmVudltERVRBQ0hFRF9FTlZfS0VZXSA9PT0gJzEnKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKCdbUHJvY2Vzc10gQWxyZWFkeSBkZXRhY2hlZCcpO1xuICB9XG4gIGNvbnNvbGUubG9nKCdbUHJvY2Vzc10gUmUtc3Bhd25pbmcgYXMgZGV0YWNoZWQgcHJvY2VzcycpO1xuXG4gIGNvbnN0IGNoaWxkID0gc3Bhd24ocHJvY2Vzcy5leGVjUGF0aCwgcHJvY2Vzcy5hcmd2LnNsaWNlKDEpLCB7XG4gICAgZGV0YWNoZWQ6IHRydWUsXG4gICAgc3RkaW86ICdpZ25vcmUnLFxuICAgIGVudjogey4uLnByb2Nlc3MuZW52LCBbREVUQUNIRURfRU5WX0tFWV06ICcxJ30sXG4gIH0pO1xuICBjaGlsZC51bnJlZigpO1xuICBwcm9jZXNzLmV4aXQoMCk7XG59O1xuIiwiaW1wb3J0IHtyZXN0b3JlV2luZG93fSBmcm9tICdAL21haW5XaW5kb3cnO1xuaW1wb3J0IHthcHB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7ZXhpdH0gZnJvbSAncHJvY2Vzcyc7XG5cbmV4cG9ydCBjb25zdCBpbml0RXZlbnRzID0gKCkgPT4ge1xuICAvKipcbiAgICogSGFuZGxlIHdpbmRvdyBjbG9zZSBldmVudFxuICAgKi9cbiAgYXBwLm9uKCd3aW5kb3ctYWxsLWNsb3NlZCcsICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnQWxsIHdpbmRvd3MgYXJlIGNsb3NlZCwgcXVpdHRpbmcuLi4nKTtcbiAgICBleGl0KDUwKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqIEBzZWUgaHR0cHM6Ly93d3cuZWxlY3Ryb25qcy5vcmcvZG9jcy9sYXRlc3QvYXBpL2FwcCNldmVudC1hY3RpdmF0ZS1tYWNvcyBFdmVudDogJ2FjdGl2YXRlJy5cbiAgICovXG4gIGFwcC5vbignYWN0aXZhdGUnLCAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ2FjdGl2YXRlIGV2ZW50IHRyaWdnZXJlZCwgcmVzdG9yaW5nIHdpbmRvdy4uLicpO1xuICAgIHJlc3RvcmVXaW5kb3coKTtcbiAgfSk7XG59O1xuIiwiaW1wb3J0IHtJU19QUk9EfSBmcm9tICdAL2Vudic7XG5pbXBvcnQge1xuICBhcHAsXG4gIEJyb3dzZXJXaW5kb3csXG4gIGlwY01haW4sXG4gIE1lbnUsXG4gIHR5cGUgTWVudUl0ZW1Db25zdHJ1Y3Rvck9wdGlvbnMsXG4gIHNjcmVlbixcbn0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHthcHBlbmRRYU1vZGVNZW51fSBmcm9tICcuLi8uLi9xYS9xYU1vZGUnO1xuaW1wb3J0IHtyZWdpc3RlckJyb3dzZXJXaW5kb3dUbHNEaWFnbm9zdGljc30gZnJvbSAnLi4vdGxzRXJyb3IudXRpbHMnO1xuaW1wb3J0IHtzaGFyZWRWYXJpYWJsZXN9IGZyb20gJy4vc2hhcmVkVmFyaWFibGVzLnN0YXJ0LnV0aWxzJztcblxuY29uc3QgT05CT0FSRElOR19XSU5ET1dfV0lEVEggPSAxMTM2O1xuY29uc3QgT05CT0FSRElOR19XSU5ET1dfSEVJR0hUID0gNjM5O1xuXG5leHBvcnQgY29uc3QgaW5pdE9uYm9hcmRpbmcgPSAoKSA9PlxuICBuZXcgUHJvbWlzZTxib29sZWFuPihhc3luYyByZXNvbHZlID0+IHtcbiAgICBjb25zdCB1c2VyRGF0YVBhdGggPSBhcHAuZ2V0UGF0aCgndXNlckRhdGEnKTtcbiAgICBjb25zdCBvbmJvYXJkaW5nRmlsZVBhdGggPSBwYXRoLmpvaW4odXNlckRhdGFQYXRoLCAnb25ib2FyZGluZy5qc29uJyk7XG5cbiAgICBpZiAoZnMuZXhpc3RzU3luYyhvbmJvYXJkaW5nRmlsZVBhdGgpKSB7XG4gICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgb25ib2FyZGluZyB3aW5kb3cgaWYgdGhlIGZpbGUgZG9lcyBub3QgZXhpc3RcbiAgICBjb25zdCBkaXNwbGF5ID0gc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCk7XG4gICAgY29uc3Qge3dpZHRoOiBzY3JlZW5XaWR0aCwgaGVpZ2h0OiBzY3JlZW5IZWlnaHR9ID0gZGlzcGxheS53b3JrQXJlYVNpemU7XG5cbiAgICBjb25zdCBvbmJvYXJkaW5nV2luZG93ID0gbmV3IEJyb3dzZXJXaW5kb3coe1xuICAgICAgd2lkdGg6IE9OQk9BUkRJTkdfV0lORE9XX1dJRFRILFxuICAgICAgaGVpZ2h0OiBPTkJPQVJESU5HX1dJTkRPV19IRUlHSFQsXG5cbiAgICAgIG1heFdpZHRoOiBNYXRoLm1pbihPTkJPQVJESU5HX1dJTkRPV19XSURUSCwgc2NyZWVuV2lkdGggKiAwLjgpLFxuICAgICAgbWF4SGVpZ2h0OiBNYXRoLm1pbihPTkJPQVJESU5HX1dJTkRPV19IRUlHSFQsIHNjcmVlbkhlaWdodCAqIDAuOCksXG5cbiAgICAgIGNlbnRlcjogdHJ1ZSxcblxuICAgICAgYWx3YXlzT25Ub3A6IHRydWUsXG5cbiAgICAgIHJlc2l6YWJsZTogZmFsc2UsXG4gICAgICBtb3ZhYmxlOiBmYWxzZSxcblxuICAgICAgbWluaW1pemFibGU6IGZhbHNlLFxuICAgICAgbWF4aW1pemFibGU6IGZhbHNlLFxuICAgICAgZnVsbHNjcmVlbmFibGU6IGZhbHNlLFxuXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMTUxNTFjJyxcblxuICAgICAgZnJhbWU6IGZhbHNlLFxuXG4gICAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgICBkZXZUb29sczogIUlTX1BST0QsXG4gICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogZmFsc2UsXG4gICAgICAgIGNvbnRleHRJc29sYXRpb246IHRydWUsXG4gICAgICAgIHNhbmRib3g6IGZhbHNlLFxuICAgICAgICB3ZWJ2aWV3VGFnOiBmYWxzZSxcbiAgICAgICAgcHJlbG9hZDogcGF0aC5qb2luKGFwcC5nZXRBcHBQYXRoKCksICdwYWNrYWdlcy9wcmVsb2FkL2Rpc3QvaW5kZXgubWpzJyksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIHJlZ2lzdGVyQnJvd3NlcldpbmRvd1Rsc0RpYWdub3N0aWNzKG9uYm9hcmRpbmdXaW5kb3cpO1xuICAgIG9uYm9hcmRpbmdXaW5kb3cucmVtb3ZlTWVudSgpO1xuICAgIG9uYm9hcmRpbmdXaW5kb3cuc2V0TWVudUJhclZpc2liaWxpdHkoZmFsc2UpO1xuICAgIG9uYm9hcmRpbmdXaW5kb3cuc2V0RnVsbFNjcmVlbmFibGUoZmFsc2UpO1xuICAgIHNldE1haW5NZW51KCk7XG5cbiAgICBvbmJvYXJkaW5nV2luZG93Lm9uKCdzaG93JywgKCkgPT4ge1xuICAgICAgaWYgKCFJU19QUk9EKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdPcGVuaW5nIGRldiB0b29scycpO1xuICAgICAgICBvbmJvYXJkaW5nV2luZG93Py53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlwY01haW4ub24oJ2VsZWN0cm9uOm9uYm9hcmRpbmc6cmVkaXJlY3RUb0Zyb250JywgZXZlbnQgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ1JlZGlyZWN0aW5nIHRvIGZyb250Jyk7XG4gICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IHRydWU7XG4gICAgICB2b2lkIG9uYm9hcmRpbmdXaW5kb3dcbiAgICAgICAgLmxvYWRVUkwoc2hhcmVkVmFyaWFibGVzPy5PTkJPQVJESU5HX1VSTCB8fCAnJylcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgcmVkaXJlY3RpbmcgdG8gb25ib2FyZGluZyBmcm9udCcsIGVycik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXBjTWFpbi5vbignZWxlY3Ryb246b25ib2FyZGluZzpjb21wbGV0ZWQnLCBldmVudCA9PiB7XG4gICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IHRydWU7XG4gICAgICBvbmJvYXJkaW5nV2luZG93LmNsb3NlKCk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKG9uYm9hcmRpbmdGaWxlUGF0aCwgSlNPTi5zdHJpbmdpZnkoe29uYm9hcmRlZDogdHJ1ZX0pKTtcbiAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIHRoZSBtYWluIHBhZ2Ugb2YgdGhlIG1haW4gd2luZG93LlxuICAgICAqL1xuICAgIGNvbnN0IGZpbGVQYXRoID0gIWFwcC5pc1BhY2thZ2VkXG4gICAgICA/ICcuL2J1aWxkUmVzb3VyY2VzL2Fzc2V0cy9vZmZsaW5lLXBhZ2Uvb2ZmbGluZS5vbmJvYXJkaW5nLmh0bWwnXG4gICAgICA6IHBhdGguam9pbihcbiAgICAgICAgICBwcm9jZXNzLnJlc291cmNlc1BhdGgsXG4gICAgICAgICAgJy4vYXNzZXRzL29mZmxpbmUtcGFnZS9vZmZsaW5lLm9uYm9hcmRpbmcuaHRtbCcsXG4gICAgICAgICk7XG4gICAgY29uc29sZS5sb2coJ0xvYWRpbmcgZmlsZSA6ICcsIGZpbGVQYXRoKTtcbiAgICBhd2FpdCBvbmJvYXJkaW5nV2luZG93LmxvYWRGaWxlKGZpbGVQYXRoKTtcblxuICAgIG9uYm9hcmRpbmdXaW5kb3cub24oJ2Nsb3NlZCcsICgpID0+IHtcbiAgICAgIC8vIGZzLndyaXRlRmlsZVN5bmMob25ib2FyZGluZ0ZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeSh7IG9uYm9hcmRlZDogdHJ1ZSB9KSk7XG4gICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICB9KTtcbiAgfSk7XG5jb25zdCBzZXRNYWluTWVudSA9ICgpID0+IHtcbiAgY29uc3QgdGVtcGxhdGU6IE1lbnVJdGVtQ29uc3RydWN0b3JPcHRpb25zW10gPSBbXG4gICAge1xuICAgICAgbGFiZWw6ICdBdXRvQ3V0JyxcbiAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnUXVpdCBBdXRvQ3V0JyxcbiAgICAgICAgICBjbGljaygpIHtcbiAgICAgICAgICAgIGFwcC5xdWl0KCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICAuLi4oIUlTX1BST0RcbiAgICAgID8gW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnRGV2ZWxvcGVyJyxcbiAgICAgICAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnU2hvdyBEZXZUb29scycsXG4gICAgICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDbWRPckN0cmwrRCcsXG4gICAgICAgICAgICAgICAgY2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKHcgPT4gIXcuaXNEZXN0cm95ZWQoKSlcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2god2luZG93ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1Nob3cgRGV2VG9vbHMgKGRldGFjaCknLFxuICAgICAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ21kT3JDdHJsK1NoaWZ0K0QnLFxuICAgICAgICAgICAgICAgIGNsaWNrKCkge1xuICAgICAgICAgICAgICAgICAgQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcih3ID0+ICF3LmlzRGVzdHJveWVkKCkpXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKHdpbmRvdyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyh7bW9kZTogJ2RldGFjaCd9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnUmVsb2FkJyxcbiAgICAgICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NtZE9yQ3RybCtSJyxcbiAgICAgICAgICAgICAgICBjbGljaygpIHtcbiAgICAgICAgICAgICAgICAgIEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIodyA9PiAhdy5pc0Rlc3Ryb3llZCgpKVxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCh3aW5kb3cgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJDb250ZW50cy5yZWxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXVxuICAgICAgOiBbXSksXG4gIF07XG4gIGNvbnN0IHRlbXBsYXRlV2l0aFFhTW9kZSA9IGFwcGVuZFFhTW9kZU1lbnUodGVtcGxhdGUpO1xuICBNZW51LnNldEFwcGxpY2F0aW9uTWVudShNZW51LmJ1aWxkRnJvbVRlbXBsYXRlKHRlbXBsYXRlV2l0aFFhTW9kZSkpO1xufTtcbiIsImltcG9ydCB7YXBwfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQge3BsYXRmb3JtLCBhcmNofSBmcm9tICdvcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2Rvd25sb2FkRmlsZX0gZnJvbSAnLi4vYXhpb3MudXRpbHMnO1xuaW1wb3J0IHtzaG9ydGlmeVBhdGh9IGZyb20gJy4uL3BhdGgudXRpbHMnO1xuaW1wb3J0IHtyZXNvbHZlV29ya2luZ1RhclBhdGh9IGZyb20gJy4uL3Rhci51dGlscyc7XG5pbXBvcnQge3NoYXJlZFZhcmlhYmxlc30gZnJvbSAnLi9zaGFyZWRWYXJpYWJsZXMuc3RhcnQudXRpbHMnO1xuXG5jb25zdCBzdXBwb3J0ZWRBcmNoczoge1trZXk6IHN0cmluZ106IHN0cmluZ1tdfSA9IHtcbiAgd2luMzI6IFsnYXJtNjQnLCAneDY0J10sXG59O1xuXG5leHBvcnQgY29uc3QgaW5pdFRhciA9IGFzeW5jICgpID0+IHtcbiAgY29uc3Qgb3NBcmNoID0gYXJjaCgpO1xuICBjb25zdCBvc1BsYXRmb3JtID0gcGxhdGZvcm0oKTtcblxuICBpZiAoIShzdXBwb3J0ZWRBcmNocz8uW29zUGxhdGZvcm1dIHx8IFtdKS5pbmNsdWRlcyhvc0FyY2gpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZG93bmxvYWRVcmwgPSBgaHR0cHM6Ly9jZG4uYXV0b2N1dC50ZWNoLzBfcmVzc291cmNlcy90YXIvJHtvc1BsYXRmb3JtfS8ke29zQXJjaH0vdGFyLmV4ZWA7XG5cbiAgY29uc29sZS5sb2coJ0Rvd25sb2FkaW5nIHRhci4uLicpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgdGFyUGF0aCA9IGpvaW4oYCR7YXBwLmdldFBhdGgoJ3VzZXJEYXRhJyl9YCk7XG4gICAgY29uc3QgdGFyRmlsZVBhdGggPSBhd2FpdCBkb3dubG9hZEZpbGUoZG93bmxvYWRVcmwsIHRhclBhdGgpO1xuICAgIGNvbnN0IHdvcmtpbmdUYXJQYXRoID0gYXdhaXQgcmVzb2x2ZVdvcmtpbmdUYXJQYXRoKHRhckZpbGVQYXRoKTtcblxuICAgIGlmIChzaGFyZWRWYXJpYWJsZXMpIHtcbiAgICAgIHNoYXJlZFZhcmlhYmxlcy5UQVJfUEFUSCA9XG4gICAgICAgIHdvcmtpbmdUYXJQYXRoID09PSB0YXJGaWxlUGF0aFxuICAgICAgICAgID8gYXdhaXQgc2hvcnRpZnlQYXRoKHRhckZpbGVQYXRoKVxuICAgICAgICAgIDogd29ya2luZ1RhclBhdGg7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBkb3dubG9hZCB0YXI6JywgZXJyb3IpO1xuICB9XG59O1xuIiwiLy8gRHVyaW5nIFZlbG9wYWNrIHVwZGF0ZSBsaWZlY3ljbGUgdGhlIGFwcCBtYXkgYmUgc3Bhd25lZCB3aXRoIHBpcGVkIHN0ZGlvO1xuLy8gd2hlbiB0aGUgcGFyZW50IGNsb3NlcyBwaXBlcywgZXZlcnkgY29uc29sZS5sb2cgdHJpZ2dlcnMgRVBJUEUuXG5jb25zdCBpZ25vcmVFcGlwZSA9IChlcnI6IE5vZGVKUy5FcnJub0V4Y2VwdGlvbikgPT4ge1xuICBpZiAoZXJyLmNvZGUgIT09ICdFUElQRScpIHRocm93IGVycjtcbn07XG5wcm9jZXNzLnN0ZG91dD8ub24/LignZXJyb3InLCBpZ25vcmVFcGlwZSk7XG5wcm9jZXNzLnN0ZGVycj8ub24/LignZXJyb3InLCBpZ25vcmVFcGlwZSk7XG5cbmltcG9ydCB7VmVsb3BhY2tBcHB9IGZyb20gJ3ZlbG9wYWNrJztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTcXVpcnJlbCAvIFZlbG9wYWNrIGxpZmVjeWNsZSBkZXRlY3Rpb24gJiBsb2dnaW5nXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnNvbGUubG9nKGBbU3RhcnR1cF0gYXJndjogJHtwcm9jZXNzLmFyZ3Yuam9pbignICcpfWApO1xuXG5jb25zdCBsb2dWZWxvcGFja0hvb2sgPSAoaG9va05hbWU6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nKSA9PlxuICBjb25zb2xlLmxvZyhgW1ZlbG9wYWNrXSBob29rPSR7aG9va05hbWV9IHZlcnNpb249JHt2ZXJzaW9ufWApO1xuXG4vLyBWZWxvcGFjayBidWlsZGVyIG5lZWRzIHRvIGJlIHRoZSBmaXJzdCB0aGluZyB0byBydW4gaW4gdGhlIG1haW4gcHJvY2Vzcy5cbi8vIEluIHNvbWUgY2FzZXMsIGl0IG1pZ2h0IHF1aXQvcmVzdGFydCB0aGUgcHJvY2VzcyB0byBwZXJmb3JtIHRhc2tzLlxuVmVsb3BhY2tBcHAuYnVpbGQoKVxuICAuc2V0TG9nZ2VyKChsZXZlbCwgbXNnKSA9PiBjb25zb2xlLmxvZyhgW1ZlbG9wYWNrXSBbJHtsZXZlbH1dICR7bXNnfWApKVxuICAuc2V0QXV0b0FwcGx5T25TdGFydHVwKGZhbHNlKVxuICAub25BZnRlckluc3RhbGxGYXN0Q2FsbGJhY2sodiA9PiBsb2dWZWxvcGFja0hvb2soJ2FmdGVyLWluc3RhbGwnLCB2KSlcbiAgLm9uQmVmb3JlVXBkYXRlRmFzdENhbGxiYWNrKHYgPT4gbG9nVmVsb3BhY2tIb29rKCdiZWZvcmUtdXBkYXRlJywgdikpXG4gIC5vbkFmdGVyVXBkYXRlRmFzdENhbGxiYWNrKHYgPT4gbG9nVmVsb3BhY2tIb29rKCdhZnRlci11cGRhdGUnLCB2KSlcbiAgLm9uQmVmb3JlVW5pbnN0YWxsRmFzdENhbGxiYWNrKHYgPT4gbG9nVmVsb3BhY2tIb29rKCdiZWZvcmUtdW5pbnN0YWxsJywgdikpXG4gIC5vbkZpcnN0UnVuKHYgPT4gY29uc29sZS5sb2coYFtWZWxvcGFja10gZmlyc3QtcnVuIHZlcnNpb249JHt2fWApKVxuICAub25SZXN0YXJ0ZWQodiA9PiBjb25zb2xlLmxvZyhgW1ZlbG9wYWNrXSByZXN0YXJ0ZWQgdmVyc2lvbj0ke3Z9YCkpXG4gIC5ydW4oKTtcblxuaW1wb3J0ICcuL3NlY3VyaXR5LXJlc3RyaWN0aW9ucyc7XG5cbmltcG9ydCB7YXBwLCBkaWFsb2csIG5ldH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcblxuaW1wb3J0IHtzdGFydEhvc3RTZXJ2ZXJ9IGZyb20gJ0AvaG9zdFNlcnZlcic7XG5pbXBvcnQge2NyZWF0ZVdpbmRvd30gZnJvbSAnQC9tYWluV2luZG93JztcbmltcG9ydCB7aW5pdElQQ0hhbmRsZXJzfSBmcm9tICdAL3V0aWxzL2lwYy51dGlscyc7XG5pbXBvcnQge2V4aXR9IGZyb20gJ0AvdXRpbHMvcHJvY2Vzcy51dGlscyc7XG5pbXBvcnQge2NoZWNrVXJsQXZhaWxhYmlsaXR5fSBmcm9tICdAL3V0aWxzL2ZldGNoLnV0aWxzJztcbmltcG9ydCB7ZWxlY3Ryb25Mb2dnZXJ9IGZyb20gJ0AvdXRpbHMvbG9nZ2VyLnV0aWxzJztcbmltcG9ydCB7aW5pdEFwcE5hbWV9IGZyb20gJ0AvdXRpbHMvc3RhcnRGdW5jdGlvbnMvYXBwTmFtZS5zdGFydC51dGlscyc7XG5pbXBvcnQge2Vuc3VyZVNpbmdsZUluc3RhbmNlfSBmcm9tICdAL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL2Vuc3VyZVNpbmdsZUluc3RhbmNlLnN0YXJ0LnV0aWxzJztcbmltcG9ydCB7aW5pdExvZ2dlcn0gZnJvbSAnQC91dGlscy9zdGFydEZ1bmN0aW9ucy9sb2dnZXIuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHtpbml0TWFjU3BlY2lmaWNTZXR0aW5nc30gZnJvbSAnQC91dGlscy9zdGFydEZ1bmN0aW9ucy9tYWMuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHtcbiAgY2FwdHVyZU1haW5FdmVudCxcbiAgaW5pdFBvc3RIb2csXG4gIHNodXRkb3duUG9zdEhvZyxcbn0gZnJvbSAnQC91dGlscy9zdGFydEZ1bmN0aW9ucy9wb3N0aG9nLnN0YXJ0LnV0aWxzJztcbmltcG9ydCB7XG4gIGluaXRTZW50cnksXG4gIHNlbnRyeVdyYXBwZXIsXG59IGZyb20gJ0AvdXRpbHMvc3RhcnRGdW5jdGlvbnMvc2VudHJ5LnN0YXJ0LnV0aWxzJztcbmltcG9ydCB7XG4gIGluaXRTaGFyZWRWYXJpYWJsZXMsXG4gIHNoYXJlZFZhcmlhYmxlcyxcbn0gZnJvbSAnQC91dGlscy9zdGFydEZ1bmN0aW9ucy9zaGFyZWRWYXJpYWJsZXMuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHtTdGFydHVwVXJsVmFsaWRhdGlvbkVycm9yfSBmcm9tICdAL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3NoYXJlZFZhcmlhYmxlc0Fzc2VydC5zdGFydC51dGlscyc7XG5pbXBvcnQge2dldE5ldHdvcmtGYWlsdXJlS2luZH0gZnJvbSAnQC91dGlscy9zdGFydEZ1bmN0aW9ucy9uZXR3b3JrRXJyb3Iuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHtcbiAgaGFzU3RhcnR1cEZhaWx1cmVzLFxuICB0cmFja1N0YXJ0dXBGYWlsdXJlLFxufSBmcm9tICdAL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3N0YXJ0dXBOZXR3b3JrTW9uaXRvci5zdGFydC51dGlscyc7XG5pbXBvcnQge1xuICBzZXRTdGFydHVwTmV0d29ya1N0YXRlLFxuICB3YWl0Rm9yU3RhcnR1cFJldHJ5LFxufSBmcm9tICdAL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3N0YXJ0dXBOZXR3b3JrU3RhdGUuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHtpbml0VXBkYXRlcn0gZnJvbSAnQC91dGlscy9zdGFydEZ1bmN0aW9ucy91cGRhdGVyLnN0YXJ0LnV0aWxzJztcblxuaW1wb3J0IHtzdGFydENvbXB1dGV9IGZyb20gJy4vY29tcHV0ZSc7XG5pbXBvcnQge3N0YXJ0SXBjU2VydmVyfSBmcm9tICcuL2lwYyc7XG5pbXBvcnQge2dldFFhU3RhcnR1cEFjdGlvbn0gZnJvbSAnLi9xYS9xYUNvbnRyYWN0cyc7XG5pbXBvcnQge1xuICBoYXNRYU1vZGVUb2dnbGVBcmd1bWVudCxcbiAgaW5zdGFsbFFhUGxhdGZvcm1Db250cm9scyxcbiAgaXNQYWNrYWdlZFN0YWdpbmdCdWlsZCxcbiAgaXNRYU1vZGVFbmFibGVkLFxuICBpc1FhTW9kZVJlbGF1bmNoUGVuZGluZyxcbiAgcmVxdWVzdFFhTW9kZVRvZ2dsZUFuZFJlbGF1bmNoLFxufSBmcm9tICcuL3FhL3FhTW9kZSc7XG5pbXBvcnQge29wZW5RYVNlbGVjdG9yfSBmcm9tICcuL3FhL3FhU2VsZWN0b3InO1xuaW1wb3J0IHtpbml0QXhpb3N9IGZyb20gJy4vdXRpbHMvYXhpb3MudXRpbHMnO1xuaW1wb3J0IHtpbml0RGVlcExpbmt9IGZyb20gJy4vdXRpbHMvc3RhcnRGdW5jdGlvbnMvZGVlcGxpbmsuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHtkZXRhY2hGcm9tUGFyZW50T25XaW5kb3dzfSBmcm9tICcuL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL2RldGFjaEZyb21QYXJlbnQuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHtpbml0RXZlbnRzfSBmcm9tICcuL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL2V2ZW50cy5zdGFydC51dGlscyc7XG5pbXBvcnQge1xuICBlbnN1cmVNYWNJbnN0YWxsTG9jYXRpb24sXG4gIGxhdW5jaE1hY0FwcEFmdGVyQ3VycmVudFByb2Nlc3NFeGl0cyxcbiAgdHlwZSBNYWNJbnN0YWxsUmVzdWx0LFxufSBmcm9tICcuL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL21hY0luc3RhbGxMb2NhdGlvbi5zdGFydC51dGlscyc7XG5pbXBvcnQge2luaXRPbmJvYXJkaW5nfSBmcm9tICcuL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL29uYm9hcmRpbmcuc3RhcnQudXRpbHMnO1xuaW1wb3J0IHtpbml0VGFyfSBmcm9tICcuL3V0aWxzL3N0YXJ0RnVuY3Rpb25zL3Rhci5zdGFydC51dGlscyc7XG5pbXBvcnQge1xuICBjaGVja1N0YXJ0aW5nRmlsZUV4aXN0cyxcbiAgY3JlYXRlU3RhcnRpbmdGaWxlLFxuICByZW1vdmVTdGFydGluZ0ZpbGUsXG59IGZyb20gJy4vdXRpbHMvc3RhcnRpbmdGaWxlLnV0aWxzJztcblxuZXhwb3J0IGxldCBpc0VsZWN0cm9uSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbmV4cG9ydCBsZXQgc3RlcCA9ICcnO1xuXG5leHBvcnQgY29uc3Qgc2V0U3RlcCA9IChuZXdTdGVwOiBzdHJpbmcpID0+IHtcbiAgc3RlcCA9IG5ld1N0ZXA7XG59O1xuXG5sZXQgZGVlcExpbmtQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5sZXQgcGVuZGluZ0RlZXBMaW5rVXJsOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbmNvbnN0IHNldFBlbmRpbmdEZWVwTGluayA9IChkZWVwTGlua1VybDogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGNvbnN0IHByb3RvY29sU2VwYXJhdG9ySW5kZXggPSBkZWVwTGlua1VybC5pbmRleE9mKCc6Ly8nKTtcbiAgaWYgKHByb3RvY29sU2VwYXJhdG9ySW5kZXggPT09IC0xKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcGVuZGluZ0RlZXBMaW5rVXJsID0gZGVlcExpbmtVcmw7XG4gIGRlZXBMaW5rUGF0aCA9IGRlZXBMaW5rVXJsLnNsaWNlKHByb3RvY29sU2VwYXJhdG9ySW5kZXggKyAzKTtcbn07XG5cbmNvbnN0IGNsZWFyUGVuZGluZ0RlZXBMaW5rID0gKCk6IHZvaWQgPT4ge1xuICBwZW5kaW5nRGVlcExpbmtVcmwgPSB1bmRlZmluZWQ7XG4gIGRlZXBMaW5rUGF0aCA9IHVuZGVmaW5lZDtcbn07XG5cbmlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnZGFyd2luJykge1xuICBjb25zdCBkZWVwTGlua0FyZ3VtZW50ID0gcHJvY2Vzcy5hcmd2LmZpbmQoYXJndW1lbnQgPT5cbiAgICAvXmF1dG9jdXQoPzpzdGcpPzpcXC9cXC8vLnRlc3QoYXJndW1lbnQpLFxuICApO1xuICBpZiAoZGVlcExpbmtBcmd1bWVudCkge1xuICAgIHNldFBlbmRpbmdEZWVwTGluayhkZWVwTGlua0FyZ3VtZW50KTtcbiAgfVxufVxuXG4vLyBOZWVkIHRvIGJlIGRlZmluZWQgYXMgc29vbiBhcyBwb3NzaWJsZSB0byBhdm9pZCBtaXNzaW5nIHRoZSBldmVudFxuYXBwLm9uKCdvcGVuLXVybCcsIChldmVudCwgdXJsKSA9PiB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIHNldFBlbmRpbmdEZWVwTGluayh1cmwpO1xufSk7XG5cbi8qKlxuICogU2V0IHRoZSBhcHAgbmFtZSB1c2VkIGZvciBhcHAgZm9sZGVyIChsaWtlIH4vTGlicmFyeS9BcHBsaWNhdGlvbiBTdXBwb3J0L0F1dG9DdXREZXYpXG4gKlxuICogLyFcXC8hXFwvIVxcLyFcXC8hXFwvIVxcLyFcXC8hXFwvIVxcLyFcXC8hXFwvIVxcLyFcXC8hXFwvIVxcLyFcXC8hXFwvIVxcLyFcXC8hXFwvIVxcXG4gKiBNVVNUIEJFIFRIRSBGSVJTVCBGVU5DVElPTiBDQUxMRURcbiAqIC8hXFwvIVxcLyFcXC8hXFwvIVxcLyFcXC8hXFwvIVxcLyFcXC8hXFwvIVxcLyFcXC8hXFwvIVxcLyFcXC8hXFwvIVxcLyFcXC8hXFwvIVxcLyFcXFxuICpcbiAqL1xuaW5pdEFwcE5hbWUoKTtcblxuY29uc3QgaXNRYVN0YWdpbmdCdWlsZCA9IGlzUGFja2FnZWRTdGFnaW5nQnVpbGQoKTtcbmNvbnN0IGlzUWFNb2RlRW5hYmxlZEF0TGF1bmNoID0gaXNRYU1vZGVFbmFibGVkKCk7XG5jb25zdCBpc0NvbGRRYU1vZGVUb2dnbGUgPSBoYXNRYU1vZGVUb2dnbGVBcmd1bWVudChwcm9jZXNzLmFyZ3YpO1xuY29uc3QgcmVzb2x2ZVFhU3RhcnR1cEFjdGlvbiA9ICgpID0+XG4gIGdldFFhU3RhcnR1cEFjdGlvbih7XG4gICAgZGVlcExpbmtQYXRoLFxuICAgIGhhc1RvZ2dsZUFyZ3VtZW50OiBpc0NvbGRRYU1vZGVUb2dnbGUsXG4gICAgaXNQYWNrYWdlZDogYXBwLmlzUGFja2FnZWQsXG4gICAgaXNTdGFnaW5nOiBpc1FhU3RhZ2luZ0J1aWxkLFxuICAgIHFhTW9kZUVuYWJsZWQ6IGlzUWFNb2RlRW5hYmxlZEF0TGF1bmNoLFxuICB9KTtcbmNvbnN0IGluaXRpYWxRYVN0YXJ0dXBBY3Rpb24gPSByZXNvbHZlUWFTdGFydHVwQWN0aW9uKCk7XG5cbmNvbnNvbGUubG9nKCdhcHBOYW1lJywgaW1wb3J0Lm1ldGEuZW52KTtcblxuLyoqXG4gKiBPbiBXaW5kb3dzLCByZS1zcGF3biBhcyBhIGRldGFjaGVkIHByb2Nlc3Mgc28gdGhlIGFwcFxuICogaXMgbmV2ZXIga2lsbGVkIHdoZW4gaXRzIHBhcmVudCAoaW5zdGFsbGVyLCB3YXRjaGRvZywg4oCmKSBleGl0cy5cbiAqIE11c3QgcnVuIGJlZm9yZSByZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrKCkuXG4gKi9cbmRldGFjaEZyb21QYXJlbnRPbldpbmRvd3MoKTtcblxuY29uc3QgaGFuZGxlU2Vjb25kSW5zdGFuY2UgPSAoYXJndjogc3RyaW5nW10pOiBib29sZWFuID0+IHtcbiAgaWYgKCFoYXNRYU1vZGVUb2dnbGVBcmd1bWVudChhcmd2KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdbUUEgTW9kZV0gVG9nZ2xlIHJlcXVlc3RlZCBieSBhIHNlY29uZCBpbnN0YW5jZScpO1xuICByZXF1ZXN0UWFNb2RlVG9nZ2xlQW5kUmVsYXVuY2goKTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5sZXQgb3JkaW5hcnlDb3JlSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbmxldCBvcmRpbmFyeUNyYXNoVHJhY2tpbmdJbml0aWFsaXplZCA9IGZhbHNlO1xubGV0IHNlbnRyeUluaXRpYWxpemVkID0gZmFsc2U7XG5sZXQgb3JkaW5hcnlQYXRoczpcbiAgfCB7bG9nRmlsZVBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDsgdGVtcEZvbGRlclBhdGg6IHN0cmluZ31cbiAgfCB1bmRlZmluZWQ7XG5sZXQgc2hvdWxkRGlzcGxheUVycm9yRGlhbG9nID0gZmFsc2U7XG5cbmNvbnN0IGluaXRpYWxpemVTZW50cnlCZWZvcmVSZWFkeSA9ICgpOiB2b2lkID0+IHtcbiAgaWYgKHNlbnRyeUluaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgc2VudHJ5V3JhcHBlcignaW5pdFNlbnRyeScsIGluaXRTZW50cnkpO1xuICBzZW50cnlJbml0aWFsaXplZCA9IHRydWU7XG59O1xuXG5jb25zdCBpbml0aWFsaXplT3JkaW5hcnlDb3JlID0gKGluaXRpYWxpemVTaW5nbGVJbnN0YW5jZTogYm9vbGVhbik6IHZvaWQgPT4ge1xuICBpZiAob3JkaW5hcnlDb3JlSW5pdGlhbGl6ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBzZW50cnlXcmFwcGVyKCdpbml0UG9zdEhvZycsIGluaXRQb3N0SG9nKTtcbiAgc2VudHJ5V3JhcHBlcignaW5pdEF4aW9zJywgaW5pdEF4aW9zKTtcbiAgaWYgKGluaXRpYWxpemVTaW5nbGVJbnN0YW5jZSkge1xuICAgIHNlbnRyeVdyYXBwZXIoJ2Vuc3VyZVNpbmdsZUluc3RhbmNlJywgKCkgPT5cbiAgICAgIGVuc3VyZVNpbmdsZUluc3RhbmNlKGhhbmRsZVNlY29uZEluc3RhbmNlKSxcbiAgICApO1xuICB9XG5cbiAgb3JkaW5hcnlQYXRocyA9IHNlbnRyeVdyYXBwZXIoJ2luaXRMb2dnZXInLCBpbml0TG9nZ2VyKTtcbiAgb3JkaW5hcnlDb3JlSW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gIGNvbnNvbGUubG9nKCdSdW5uaW5nIGVsZWN0cm9uIHZlcnNpb24nLCBhcHAuZ2V0VmVyc2lvbigpKTtcbiAgY29uc29sZS5sb2coJ0xhdW5jaCBhcmdzOicsIHByb2Nlc3MuYXJndi5qb2luKCcgJykpO1xuICBjb25zb2xlLmxvZyhgW1Byb2Nlc3NdIHBpZD0ke3Byb2Nlc3MucGlkfSBwcGlkPSR7cHJvY2Vzcy5wcGlkfWApO1xufTtcblxuY29uc3QgaW5pdGlhbGl6ZU9yZGluYXJ5Q3Jhc2hUcmFja2luZyA9ICgpOiB2b2lkID0+IHtcbiAgaWYgKG9yZGluYXJ5Q3Jhc2hUcmFja2luZ0luaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICghb3JkaW5hcnlDb3JlSW5pdGlhbGl6ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ09yZGluYXJ5IGNvcmUgbXVzdCBpbml0aWFsaXplIGJlZm9yZSBjcmFzaCB0cmFja2luZycpO1xuICB9XG5cbiAgc2VudHJ5V3JhcHBlcignaW5pdFByb2Nlc3NFeGl0TGlzdGVuZXJzJywgKCkgPT4ge1xuICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IGV4aXQoMTAwKSk7XG4gICAgcHJvY2Vzcy5vbignU0lHVEVSTScsICgpID0+IGV4aXQoMTAxKSk7XG4gIH0pO1xuXG4gIGlmIChjaGVja1N0YXJ0aW5nRmlsZUV4aXN0cygpKSB7XG4gICAgY29uc29sZS5sb2coJ1N0YXJ0aW5nIGZpbGUgZXhpc3RzLCBhc2tpbmcgdXNlciBmb3IgYWN0aW9uJyk7XG4gICAgc2hvdWxkRGlzcGxheUVycm9yRGlhbG9nID0gdHJ1ZTtcbiAgfVxuICBjcmVhdGVTdGFydGluZ0ZpbGUoKTtcbiAgc2VudHJ5V3JhcHBlcignaW5pdE1hY1NwZWNpZmljU2V0dGluZ3MnLCBpbml0TWFjU3BlY2lmaWNTZXR0aW5ncyk7XG4gIG9yZGluYXJ5Q3Jhc2hUcmFja2luZ0luaXRpYWxpemVkID0gdHJ1ZTtcbn07XG5cbi8vIFRoZSBFbGVjdHJvbiBTZW50cnkgU0RLIGluc3RhbGxzIGxpZmVjeWNsZSBob29rcyB0aGF0IG11c3QgZXhpc3QgYmVmb3JlIHRoZVxuLy8gYXBwIGVtaXRzIGByZWFkeWAuIFFBIHNlbGVjdGlvbiBkZWxheXMgZXZlcnkgb3RoZXIgb3JkaW5hcnkgc3RhcnR1cCBzaWRlXG4vLyBlZmZlY3QsIGJ1dCBTZW50cnkgY2Fubm90IGJlIHBhcnQgb2YgdGhhdCBkZWxheWVkIGJvdW5kYXJ5LlxuaW5pdGlhbGl6ZVNlbnRyeUJlZm9yZVJlYWR5KCk7XG5cbmlmIChpbml0aWFsUWFTdGFydHVwQWN0aW9uID09PSAnb3JkaW5hcnknKSB7XG4gIGluaXRpYWxpemVPcmRpbmFyeUNvcmUodHJ1ZSk7XG59IGVsc2Uge1xuICAvLyBBIGdhdGVkIGxhdW5jaCBuZWVkcyBzaW5nbGUtaW5zdGFuY2UgY29vcmRpbmF0aW9uLCBidXQgbm9uZSBvZiB0aGUgbm9ybWFsXG4gIC8vIHByb2R1Y3QgYW5hbHl0aWNzLCBsb2dnaW5nLCBuZXR3b3JrIHNldHVwLCBvciBjcmFzaC1zZW50aW5lbCBzaWRlIGVmZmVjdHNcbiAgLy8geWV0LlxuICBlbnN1cmVTaW5nbGVJbnN0YW5jZShoYW5kbGVTZWNvbmRJbnN0YW5jZSk7XG59XG5cbi8vIEVsZWN0cm9uIGFwcCBldmVudHNcbmFwcC5vbignYmVmb3JlLXF1aXQnLCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKCdbQXBwXSBiZWZvcmUtcXVpdCcpO1xuICB2b2lkIHNodXRkb3duUG9zdEhvZygpO1xufSk7XG5hcHAub24oJ3dpbGwtcXVpdCcsICgpID0+IGNvbnNvbGUubG9nKCdbQXBwXSB3aWxsLXF1aXQnKSk7XG5hcHAub24oJ3F1aXQnLCAoX2UsIGNvZGUpID0+IGNvbnNvbGUubG9nKGBbQXBwXSBxdWl0IHdpdGggY29kZT0ke2NvZGV9YCkpO1xuYXBwLm9uKCdyZW5kZXItcHJvY2Vzcy1nb25lJywgKF9lLCBfd2MsIGRldGFpbHMpID0+XG4gIGNvbnNvbGUuZXJyb3IoJ1tBcHBdIHJlbmRlci1wcm9jZXNzLWdvbmU6JywgZGV0YWlscyksXG4pO1xuYXBwLm9uKCdjaGlsZC1wcm9jZXNzLWdvbmUnLCAoX2UsIGRldGFpbHMpID0+XG4gIGNvbnNvbGUuZXJyb3IoJ1tBcHBdIGNoaWxkLXByb2Nlc3MtZ29uZTonLCBkZXRhaWxzKSxcbik7XG5cbi8vIFByb2Nlc3MgbGlmZWN5Y2xlIGV2ZW50c1xucHJvY2Vzcy5vbignZXhpdCcsIGNvZGUgPT4gY29uc29sZS5sb2coYFtQcm9jZXNzXSBleGl0IHdpdGggY29kZT0ke2NvZGV9YCkpO1xucHJvY2Vzcy5vbignYmVmb3JlRXhpdCcsIGNvZGUgPT5cbiAgY29uc29sZS5sb2coYFtQcm9jZXNzXSBiZWZvcmVFeGl0IHdpdGggY29kZT0ke2NvZGV9YCksXG4pO1xucHJvY2Vzcy5vbignZGlzY29ubmVjdCcsICgpID0+IGNvbnNvbGUubG9nKCdbUHJvY2Vzc10gZGlzY29ubmVjdCcpKTtcblxuLy8gRXJyb3JzXG5wcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIGVyciA9PlxuICBjb25zb2xlLmVycm9yKCdbUHJvY2Vzc10gdW5jYXVnaHRFeGNlcHRpb246JywgZXJyPy5zdGFjayA/PyBlcnIpLFxuKTtcbnByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uTW9uaXRvcicsIGVyciA9PlxuICBjb25zb2xlLmVycm9yKCdbUHJvY2Vzc10gdW5jYXVnaHRFeGNlcHRpb25Nb25pdG9yOicsIGVycj8uc3RhY2sgPz8gZXJyKSxcbik7XG5wcm9jZXNzLm9uKCd1bmhhbmRsZWRSZWplY3Rpb24nLCAocmVhc29uLCBwcm9taXNlKSA9PlxuICBjb25zb2xlLmVycm9yKCdbUHJvY2Vzc10gdW5oYW5kbGVkUmVqZWN0aW9uOicsIHJlYXNvbiksXG4pO1xuXG4vLyBXYXJuaW5nc1xucHJvY2Vzcy5vbignd2FybmluZycsIHdhcm5pbmcgPT5cbiAgY29uc29sZS53YXJuKGBbUHJvY2Vzc10gd2FybmluZzogJHt3YXJuaW5nLm5hbWV9OiAke3dhcm5pbmcubWVzc2FnZX1gKSxcbik7XG5cbi8vIFNpZ25hbHNcbmNvbnN0IGxvZ1NpZ25hbCA9IChzaWduYWw6IHN0cmluZykgPT4gKCkgPT5cbiAgY29uc29sZS5sb2coYFtQcm9jZXNzXSBSZWNlaXZlZCBzaWduYWw6ICR7c2lnbmFsfWApO1xucHJvY2Vzcy5vbignU0lHSU5UJywgbG9nU2lnbmFsKCdTSUdJTlQnKSk7XG5wcm9jZXNzLm9uKCdTSUdURVJNJywgbG9nU2lnbmFsKCdTSUdURVJNJykpO1xucHJvY2Vzcy5vbignU0lHSFVQJywgbG9nU2lnbmFsKCdTSUdIVVAnKSk7XG5wcm9jZXNzLm9uKCdTSUdQSVBFJywgbG9nU2lnbmFsKCdTSUdQSVBFJykpO1xuaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcbiAgcHJvY2Vzcy5vbignU0lHQlJFQUsnLCBsb2dTaWduYWwoJ1NJR0JSRUFLJykpO1xufVxuXG5pZiAoaW5pdGlhbFFhU3RhcnR1cEFjdGlvbiA9PT0gJ29yZGluYXJ5Jykge1xuICBpbml0aWFsaXplT3JkaW5hcnlDcmFzaFRyYWNraW5nKCk7XG59XG5cbmNvbnN0IGdldFN5c3RlbVJlcG9ydFVybCA9IGFzeW5jICgpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBjb25zdCBkZXZVcmwgPSAhYXBwLmlzUGFja2FnZWQgPyAnaHR0cDovL2xvY2FsaG9zdDo1NTczJyA6IHVuZGVmaW5lZDtcblxuICBpZiAoZGV2VXJsKSB7XG4gICAgY29uc29sZS5sb2coJ0NoZWNraW5nIGRldiBzeXN0ZW0gcmVwb3J0IGF2YWlsYWJpbGl0eS4uLicpO1xuICAgIGNvbnN0IGlzT25saW5lQXZhaWxhYmxlID0gYXdhaXQgY2hlY2tVcmxBdmFpbGFiaWxpdHkoZGV2VXJsLCB7XG4gICAgICB0aW1lb3V0OiA1MDAwLFxuICAgIH0pO1xuXG4gICAgaWYgKGlzT25saW5lQXZhaWxhYmxlKSB7XG4gICAgICBjb25zb2xlLmxvZygnVXNpbmcgb25saW5lIHN5c3RlbSByZXBvcnQnKTtcbiAgICAgIHJldHVybiBkZXZVcmw7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbG9jYWxQYXRoID0gIWFwcC5pc1BhY2thZ2VkXG4gICAgPyAnLi9idWlsZFJlc291cmNlcy9hc3NldHMvc3lzci9pbmRleC5odG1sJ1xuICAgIDogcGF0aC5qb2luKHByb2Nlc3MucmVzb3VyY2VzUGF0aCwgJy4vYXNzZXRzL3N5c3IvaW5kZXguaHRtbCcpO1xuXG4gIHJldHVybiBgZmlsZTovLyR7bG9jYWxQYXRofWA7XG59O1xuXG5jb25zdCBvcGVuU3lzdGVtUmVwb3J0ID0gYXN5bmMgKGZyb20/OiAnZXJyb3InIHwgJ2RlZXAtbGluaycpID0+IHtcbiAgY29uc29sZS5sb2coYE9wZW5pbmcgc3lzdGVtIHJlcG9ydCBmcm9tICR7ZnJvbSB8fCAndW5rbm93bid9Li4uYCk7XG4gIGNvbnN0IHN5c3JVcmwgPSBhd2FpdCBnZXRTeXN0ZW1SZXBvcnRVcmwoKTtcbiAgYXdhaXQgc2VudHJ5V3JhcHBlcignaW5pdElQQ0hhbmRsZXJzJywgaW5pdElQQ0hhbmRsZXJzKTtcbiAgY2FwdHVyZU1haW5FdmVudCgnYWVhX3N5c3RlbV9yZXBvcnRfb3BlbmVkJywge2Zyb206IGZyb20gPz8gJ3Vua25vd24nfSk7XG4gIGNyZWF0ZVdpbmRvdyhzeXNyVXJsLCB7XG4gICAgc2l6ZToge3dpZHRoOiA2MDAsIGhlaWdodDogODAwfSxcbiAgICBmcmFtZTogdHJ1ZSxcbiAgfSk7XG4gIHJlbW92ZVN0YXJ0aW5nRmlsZSgpO1xufTtcblxubGV0IG1hY0luc3RhbGxSZXN1bHQ6IE1hY0luc3RhbGxSZXN1bHQgfCB1bmRlZmluZWQ7XG5cbmNvbnN0IGdldE1hY0luc3RhbGxFdmVudFByb3BlcnRpZXMgPSAoXG4gIGluc3RhbGxSZXN1bHQ6IE1hY0luc3RhbGxSZXN1bHQsXG4pOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9PiAoe1xuICBpbnN0YWxsQWN0aW9uOiBpbnN0YWxsUmVzdWx0LmFjdGlvbixcbiAgaW5zdGFsbFNjb3BlOiBpbnN0YWxsUmVzdWx0LnNjb3BlLFxuICBpbnN0YWxsU3RhdHVzOiBpbnN0YWxsUmVzdWx0LnN0YXR1cyxcbn0pO1xuXG5jb25zdCBoYW5kbGVNYWNJbnN0YWxsRmFpbHVyZSA9IGFzeW5jIChcbiAgaW5zdGFsbFJlc3VsdDogRXh0cmFjdDxNYWNJbnN0YWxsUmVzdWx0LCB7c3RhdHVzOiAnZmFpbGVkJ30+LFxuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGNvbnNvbGUuZXJyb3IoJ1tNYWNJbnN0YWxsXSBJbnN0YWxsYXRpb24gZmFpbGVkJywge1xuICAgIGFjdGlvbjogaW5zdGFsbFJlc3VsdC5hY3Rpb24sXG4gICAgZXJyb3I6IGluc3RhbGxSZXN1bHQuZXJyb3IsXG4gICAgc291cmNlUGF0aDogaW5zdGFsbFJlc3VsdC5zb3VyY2VQYXRoLFxuICAgIHRhcmdldFBhdGg6IGluc3RhbGxSZXN1bHQudGFyZ2V0UGF0aCxcbiAgfSk7XG4gIGNhcHR1cmVNYWluRXZlbnQoJ2FlYV9pbnN0YWxsYXRpb25fZmFpbGVkJywge1xuICAgIC4uLmdldE1hY0luc3RhbGxFdmVudFByb3BlcnRpZXMoaW5zdGFsbFJlc3VsdCksXG4gICAgZXJyb3I6IGluc3RhbGxSZXN1bHQuZXJyb3IubWVzc2FnZSxcbiAgfSk7XG5cbiAgYXdhaXQgZGlhbG9nLnNob3dNZXNzYWdlQm94KHtcbiAgICBidXR0b25zOiBbJ1F1aXQgQXV0b0N1dCddLFxuICAgIGRlZmF1bHRJZDogMCxcbiAgICBkZXRhaWw6IFtcbiAgICAgIGBTb3VyY2U6ICR7aW5zdGFsbFJlc3VsdC5zb3VyY2VQYXRofWAsXG4gICAgICBgRGVzdGluYXRpb246ICR7aW5zdGFsbFJlc3VsdC50YXJnZXRQYXRofWAsXG4gICAgICAnJyxcbiAgICAgIGluc3RhbGxSZXN1bHQuZXJyb3IubWVzc2FnZSxcbiAgICBdLmpvaW4oJ1xcbicpLFxuICAgIG1lc3NhZ2U6XG4gICAgICAnQXV0b0N1dCBjb3VsZCBub3QgYmUgaW5zdGFsbGVkIGluIGEgd3JpdGFibGUgQXBwbGljYXRpb25zIGZvbGRlci4nLFxuICAgIHRpdGxlOiAnQXV0b0N1dCBpbnN0YWxsYXRpb24gZmFpbGVkJyxcbiAgICB0eXBlOiAnZXJyb3InLFxuICB9KTtcblxuICByZW1vdmVTdGFydGluZ0ZpbGUoKTtcbiAgYXdhaXQgZWxlY3Ryb25Mb2dnZXIud2FpdEZvckRyYWluKCk7XG4gIGFwcC5xdWl0KCk7XG59O1xuXG5jb25zdCBoYW5kbGVNYWNJbnN0YWxsSGFuZG9mZiA9IGFzeW5jIChcbiAgaW5zdGFsbFJlc3VsdDogRXh0cmFjdDxNYWNJbnN0YWxsUmVzdWx0LCB7c3RhdHVzOiAncmVsYXVuY2hpbmcnfT4sXG4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgY29uc29sZS5sb2coJ1tNYWNJbnN0YWxsXSBIYW5kaW5nIG9mZiB0byBpbnN0YWxsZWQgYXBwJywge1xuICAgIGFjdGlvbjogaW5zdGFsbFJlc3VsdC5hY3Rpb24sXG4gICAgc291cmNlUGF0aDogaW5zdGFsbFJlc3VsdC5zb3VyY2VQYXRoLFxuICAgIHRhcmdldFBhdGg6IGluc3RhbGxSZXN1bHQudGFyZ2V0UGF0aCxcbiAgfSk7XG4gIGNhcHR1cmVNYWluRXZlbnQoXG4gICAgJ2FlYV9pbnN0YWxsYXRpb25faGFuZG9mZicsXG4gICAgZ2V0TWFjSW5zdGFsbEV2ZW50UHJvcGVydGllcyhpbnN0YWxsUmVzdWx0KSxcbiAgKTtcblxuICByZW1vdmVTdGFydGluZ0ZpbGUoKTtcbiAgbGF1bmNoTWFjQXBwQWZ0ZXJDdXJyZW50UHJvY2Vzc0V4aXRzKFxuICAgIGluc3RhbGxSZXN1bHQudGFyZ2V0UGF0aCxcbiAgICBwZW5kaW5nRGVlcExpbmtVcmwsXG4gICk7XG4gIGF3YWl0IGVsZWN0cm9uTG9nZ2VyLndhaXRGb3JEcmFpbigpO1xuICBhcHAucXVpdCgpO1xufTtcblxuY29uc3QgZW5zdXJlSW5zdGFsbExvY2F0aW9uQmVmb3JlU3RhcnR1cCA9IGFzeW5jICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgaWYgKG1hY0luc3RhbGxSZXN1bHQ/LnN0YXR1cyA9PT0gJ3JlYWR5Jykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgbWFjSW5zdGFsbFJlc3VsdCA9IGF3YWl0IGVuc3VyZU1hY0luc3RhbGxMb2NhdGlvbigpO1xuICBjb25zb2xlLmxvZyhcbiAgICAnW01hY0luc3RhbGxdIExvY2F0aW9uIHJlc3VsdCcsXG4gICAgZ2V0TWFjSW5zdGFsbEV2ZW50UHJvcGVydGllcyhtYWNJbnN0YWxsUmVzdWx0KSxcbiAgKTtcblxuICBpZiAobWFjSW5zdGFsbFJlc3VsdC5zdGF0dXMgPT09ICdyZWFkeScpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAobWFjSW5zdGFsbFJlc3VsdC5zdGF0dXMgPT09ICdyZWxhdW5jaGluZycpIHtcbiAgICBhd2FpdCBoYW5kbGVNYWNJbnN0YWxsSGFuZG9mZihtYWNJbnN0YWxsUmVzdWx0KTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBhd2FpdCBoYW5kbGVNYWNJbnN0YWxsRmFpbHVyZShtYWNJbnN0YWxsUmVzdWx0KTtcbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3Qgc3RhcnRPcmRpbmFyeUJvb3RzdHJhcCA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaW5pdGlhbGl6ZU9yZGluYXJ5Q29yZShmYWxzZSk7XG4gIGluaXRpYWxpemVPcmRpbmFyeUNyYXNoVHJhY2tpbmcoKTtcbiAgaWYgKCFvcmRpbmFyeVBhdGhzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdPcmRpbmFyeSBzdGFydHVwIHBhdGhzIGFyZSB1bmF2YWlsYWJsZScpO1xuICB9XG4gIGNvbnN0IHtsb2dGaWxlUGF0aCwgdGVtcEZvbGRlclBhdGh9ID0gb3JkaW5hcnlQYXRocztcblxuICBjb25zb2xlLmxvZygnQUVBIGlzIHJlYWR5Jyk7XG4gIGNvbnNvbGUubG9nKCdSdW5uaW5nIGZyb20nLCBhcHAuZ2V0QXBwUGF0aCgpKTtcblxuICBpZiAoIW1hY0luc3RhbGxSZXN1bHQgfHwgbWFjSW5zdGFsbFJlc3VsdC5zdGF0dXMgIT09ICdyZWFkeScpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21hY09TIGluc3RhbGwgbG9jYXRpb24gd2FzIG5vdCByZXNvbHZlZCBiZWZvcmUgc3RhcnR1cCcpO1xuICB9XG5cbiAgY29uc29sZS5sb2coJ3Nob3VsZERpc3BsYXlFcnJvckRpYWxvZycsIHNob3VsZERpc3BsYXlFcnJvckRpYWxvZyk7XG4gIGlmIChzaG91bGREaXNwbGF5RXJyb3JEaWFsb2cpIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGRpYWxvZy5zaG93TWVzc2FnZUJveCh7XG4gICAgICB0eXBlOiAncXVlc3Rpb24nLFxuICAgICAgYnV0dG9uczogWydTaG93IEF1dG9DdXQgU3lzdGVtIFJlcG9ydCcsICdMYXVuY2ggQXV0b0N1dCBOb3JtYWxseSddLFxuICAgICAgdGl0bGU6ICdBdXRvQ3V0JyxcbiAgICAgIG1lc3NhZ2U6ICdBbiBlcnJvciBvY2N1cmVkIGR1cmluZyBsYXN0IHNlc3Npb24gbGF1bmNoLicsXG4gICAgICBkZXRhaWw6XG4gICAgICAgICdXb3VsZCB5b3UgbGlrZSB0byBzaG93IHRoZSBzeXN0ZW0gcmVwb3J0IG9yIGxhdW5jaCBBdXRvQ3V0IG5vcm1hbGx5PycsXG4gICAgICBkZWZhdWx0SWQ6IDAsXG4gICAgfSk7XG5cbiAgICBpZiAocmVzcG9uc2UucmVzcG9uc2UgPT09IDApIHtcbiAgICAgIC8vIFVzZXIgY2hvc2UgXCJTaG93IFN5c3RlbSBSZXBvcnRcIlxuICAgICAgZGVlcExpbmtQYXRoID0gJ3N5c3RlbS1yZXBvcnQnO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2VyIGNob3NlIFwiTGF1bmNoIEF1dG9DdXQgTm9ybWFsbHlcIlxuICAgICAgY2xlYXJQZW5kaW5nRGVlcExpbmsoKTtcbiAgICB9XG4gIH1cblxuICBpZiAoZGVlcExpbmtQYXRoKSB7XG4gICAgY29uc29sZS5sb2coJ0RlZXAgbGluayBwYXRoJywgZGVlcExpbmtQYXRoKTtcbiAgICBzd2l0Y2ggKGRlZXBMaW5rUGF0aC5yZXBsYWNlKC9eXFwvLywgJycpLnJlcGxhY2UoL1xcLyQvLCAnJykpIHtcbiAgICAgIGNhc2UgJ3N5c3RlbS1yZXBvcnQnOlxuICAgICAgICBhd2FpdCBvcGVuU3lzdGVtUmVwb3J0KCdkZWVwLWxpbmsnKTtcbiAgICAgICAgLy8gSWYgd2UgYXJlIG9wZW5pbmcgdGhlIHN5c3RlbSByZXBvcnQsIHdlIGRvIG5vdCBzdGFydCB0aGUgYXBwXG4gICAgICAgIHJldHVybjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnNvbGUubG9nKCdVbmtub3duIGRlZXAgbGluayBwYXRoJywgZGVlcExpbmtQYXRoKTtcbiAgICAgICAgY2xlYXJQZW5kaW5nRGVlcExpbmsoKTtcbiAgICB9XG4gIH1cblxuICB0cnkge1xuICAgIGF3YWl0IHNlbnRyeVdyYXBwZXIoJ2luaXREZWVwTGluaycsIGluaXREZWVwTGluayk7XG5cbiAgICBhd2FpdCBzZW50cnlXcmFwcGVyKCdpbml0SVBDSGFuZGxlcnMnLCBpbml0SVBDSGFuZGxlcnMpO1xuXG4gICAgbGV0IHN0YXJ0dXBXaW5kb3c6IEF3YWl0ZWQ8UmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlV2luZG93Pj4gfCB1bmRlZmluZWQ7XG4gICAgaWYgKCFuZXQuaXNPbmxpbmUoKSkge1xuICAgICAgY29uc3Qgb2ZmbGluZUVycm9yID0gbmV3IEVycm9yKCduZXQ6OkVSUl9JTlRFUk5FVF9ESVNDT05ORUNURUQnKTtcbiAgICAgIHRyYWNrU3RhcnR1cEZhaWx1cmUob2ZmbGluZUVycm9yLCB7XG4gICAgICAgIG9wZXJhdGlvbjogJ3N0YXJ0dXAtcHJlZmxpZ2h0JyxcbiAgICAgIH0pO1xuICAgICAgc2V0U3RhcnR1cE5ldHdvcmtTdGF0ZSgnb2ZmbGluZScpO1xuICAgICAgc3RhcnR1cFdpbmRvdyA9IGF3YWl0IHNlbnRyeVdyYXBwZXIoJ2NyZWF0ZVdpbmRvdycsICgpID0+IGNyZWF0ZVdpbmRvdygpKTtcbiAgICAgIGF3YWl0IHdhaXRGb3JTdGFydHVwUmV0cnkob2ZmbGluZUVycm9yKTtcbiAgICB9XG5cbiAgICBsZXQgYXJlU2hhcmVkVmFyaWFibGVzUmVhZHkgPSBmYWxzZTtcbiAgICB3aGlsZSAoIWFyZVNoYXJlZFZhcmlhYmxlc1JlYWR5KSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBzZW50cnlXcmFwcGVyKCdpbml0U2hhcmVkVmFyaWFibGVzJywgaW5pdFNoYXJlZFZhcmlhYmxlcyk7XG4gICAgICAgIGFyZVNoYXJlZFZhcmlhYmxlc1JlYWR5ID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGlzTmV0d29ya0ZhaWx1cmUgPVxuICAgICAgICAgIGdldE5ldHdvcmtGYWlsdXJlS2luZChlcnJvcikgIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgIChlcnJvciBpbnN0YW5jZW9mIFN0YXJ0dXBVcmxWYWxpZGF0aW9uRXJyb3IgJiZcbiAgICAgICAgICAgIGVycm9yLmludmFsaWRLZXlzLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgICAgaGFzU3RhcnR1cEZhaWx1cmVzKCkpO1xuICAgICAgICBpZiAoIWlzTmV0d29ya0ZhaWx1cmUpIHtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3RhcnR1cFdpbmRvdyB8fCBzdGFydHVwV2luZG93LmlzRGVzdHJveWVkKCkpIHtcbiAgICAgICAgICBzdGFydHVwV2luZG93ID0gYXdhaXQgc2VudHJ5V3JhcHBlcignY3JlYXRlV2luZG93JywgKCkgPT5cbiAgICAgICAgICAgIGNyZWF0ZVdpbmRvdygpLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgd2FpdEZvclN0YXJ0dXBSZXRyeShlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICAgIHNldFN0YXJ0dXBOZXR3b3JrU3RhdGUoJ3JlYWR5Jyk7XG4gICAgaWYgKHN0YXJ0dXBXaW5kb3cgJiYgIXN0YXJ0dXBXaW5kb3cuaXNEZXN0cm95ZWQoKSkge1xuICAgICAgc3RhcnR1cFdpbmRvdy5jbG9zZSgpO1xuICAgIH1cblxuICAgIC8vIENhcHR1cmVkIGhlcmUgKG5vdCBlYXJsaWVyKSBiZWNhdXNlIGNvb2tpZXMg4oCUIGFuZCB0aHVzIHRoZSBzaGFyZWQgUG9zdEhvZ1xuICAgIC8vIGRpc3RpbmN0IGlkIOKAlCBhcmUgb25seSBhdmFpbGFibGUgYWZ0ZXIgaW5pdElQQ0hhbmRsZXJzLlxuICAgIGNhcHR1cmVNYWluRXZlbnQoJ2FlYV9hcHBfc3RhcnRlZCcsIHtwYWNrYWdlZDogYXBwLmlzUGFja2FnZWR9KTtcblxuICAgIGNvbnN0IGlzT25ib2FyZGluZ0NvbXBsZXRlZCA9IGF3YWl0IHNlbnRyeVdyYXBwZXIoXG4gICAgICAnaW5pdE9uYm9hcmRpbmcnLFxuICAgICAgaW5pdE9uYm9hcmRpbmcsXG4gICAgKTtcblxuICAgIGlmICghaXNPbmJvYXJkaW5nQ29tcGxldGVkKSB7XG4gICAgICBjYXB0dXJlTWFpbkV2ZW50KCdhZWFfb25ib2FyZGluZ19pbmNvbXBsZXRlJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBhcHBsaWNhdGlvbiB3aW5kb3cgYXMgc29vbiBhcyB0aGUgYXBwIGlzIHJlYWR5LlxuICAgIHZvaWQgc2VudHJ5V3JhcHBlcignY3JlYXRlV2luZG93JywgKCkgPT4gY3JlYXRlV2luZG93KCkpO1xuXG4gICAgc2VudHJ5V3JhcHBlcignaW5pdFVwZGF0ZXInLCBpbml0VXBkYXRlcik7XG4gICAgYXdhaXQgc2VudHJ5V3JhcHBlcignaW5pdFRhcicsIGluaXRUYXIpO1xuXG4gICAgaWYgKCFzaGFyZWRWYXJpYWJsZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2hhcmVkIHZhcmlhYmxlcyBhcmUgdW5hdmFpbGFibGUgYWZ0ZXIgaW5pdGlhbGl6YXRpb24nKTtcbiAgICB9XG5cbiAgICBzaGFyZWRWYXJpYWJsZXMuVEVNUF9GT0xERVJfUEFUSCA9IHRlbXBGb2xkZXJQYXRoO1xuICAgIHNoYXJlZFZhcmlhYmxlcy5MT0dfRklMRV9QQVRIID0gbG9nRmlsZVBhdGg7XG5cbiAgICBjb25zb2xlLmxvZygnU3RhcnRpbmcgSVBDIHNlcnZlci4uLicpO1xuICAgIHNlbnRyeVdyYXBwZXIoJ3N0YXJ0SXBjU2VydmVyJywgc3RhcnRJcGNTZXJ2ZXIpO1xuICAgIGNvbnNvbGUubG9nKCdTdGFydGluZyBjb21wdXRlIEFJLi4uJyk7XG4gICAgY29uc3Qgc3RhcnRDb21wdXRlUHJvbWlzZSA9IHNlbnRyeVdyYXBwZXIoJ3N0YXJ0Q29tcHV0ZScsICgpID0+XG4gICAgICBzdGFydENvbXB1dGUoc2hhcmVkVmFyaWFibGVzIHx8IHt9KSxcbiAgICApO1xuICAgIGNvbnNvbGUubG9nKCdTdGFydGluZyBob3N0IHNlcnZlci4uLicpO1xuICAgIGNvbnN0IHN0YXJ0SG9zdFNlcnZlclByb21pc2UgPSBzZW50cnlXcmFwcGVyKCdzdGFydEhvc3RTZXJ2ZXInLCAoKSA9PlxuICAgICAgc3RhcnRIb3N0U2VydmVyKHNoYXJlZFZhcmlhYmxlcyB8fCB7fSksXG4gICAgKTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKFtzdGFydENvbXB1dGVQcm9taXNlLCBzdGFydEhvc3RTZXJ2ZXJQcm9taXNlXSk7XG5cbiAgICBpc0VsZWN0cm9uSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIGNhcHR1cmVNYWluRXZlbnQoJ2FlYV9pbml0aWFsaXphdGlvbl9jb21wbGV0ZWQnLCB7XG4gICAgICBjb3BpZWRUb0FwcGxpY2F0aW9uczogdHJ1ZSxcbiAgICAgIGluc3RhbGxBY3Rpb246IG1hY0luc3RhbGxSZXN1bHQuYWN0aW9uLFxuICAgICAgaW5zdGFsbFNjb3BlOiBtYWNJbnN0YWxsUmVzdWx0LnNjb3BlLFxuICAgIH0pO1xuXG4gICAgaWYgKGFwcC5pc1BhY2thZ2VkKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdm9pZCBzZW50cnlXcmFwcGVyKCdpbml0RXZlbnRzJywgaW5pdEV2ZW50cyk7XG4gICAgICAgIC8vIHNlbnRyeVdyYXBwZXIoJ2NoZWNrRm9yVXBkYXRlcycsICgpID0+IGF1dG9VcGRhdGVyLmNoZWNrRm9yVXBkYXRlcygpKTtcbiAgICAgIH0sIDEwMDAwKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZHVyaW5nIGluaXRpYWxpemF0aW9uOicsIGVycm9yKTtcbiAgICBjYXB0dXJlTWFpbkV2ZW50KCdhZWFfaW5pdGlhbGl6YXRpb25fZmFpbGVkJywge1xuICAgICAgc3RlcCxcbiAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgfSk7XG4gICAgY29uc3Qge3Jlc3BvbnNlfSA9IGF3YWl0IGRpYWxvZy5zaG93TWVzc2FnZUJveCh7XG4gICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgdGl0bGU6ICdBdXRvQ3V0IEluaXRpYWxpemF0aW9uIEVycm9yJyxcbiAgICAgIG1lc3NhZ2U6ICdBbiBlcnJvciBvY2N1cnJlZCBkdXJpbmcgQXV0b0N1dCBpbml0aWFsaXphdGlvbi4nLFxuICAgICAgZGV0YWlsOiBgRXJyb3IgZHVyaW5nIHN0ZXAgOiAke3N0ZXB9XFxuXFxuV291bGQgeW91IGxpa2UgdG8gb3BlbiB0aGUgQXV0b0N1dCBzeXN0ZW0gcmVwb3J0IG9yIGNsb3NlIEF1dG9DdXQ/YCxcbiAgICAgIGJ1dHRvbnM6IFsnT3BlbiBBdXRvQ3V0IFN5c3RlbSBSZXBvcnQnLCAnQ2xvc2UgQXV0b0N1dCddLFxuICAgICAgZGVmYXVsdElkOiAwLFxuICAgICAgY2FuY2VsSWQ6IDEsXG4gICAgfSk7XG5cbiAgICBpZiAocmVzcG9uc2UgPT09IDApIHtcbiAgICAgIG9wZW5TeXN0ZW1SZXBvcnQoJ2Vycm9yJyk7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwcC5xdWl0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlU3RhcnRpbmdGaWxlKCk7XG4gIGNvbnNvbGUubG9nKCdJbml0aWFsaXphdGlvbiBjb21wbGV0ZScpO1xufTtcblxubGV0IG9yZGluYXJ5Qm9vdHN0cmFwUHJvbWlzZTogUHJvbWlzZTx2b2lkPiB8IHVuZGVmaW5lZDtcbmNvbnN0IGNvbnRpbnVlT3JkaW5hcnlCb290c3RyYXAgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIG9yZGluYXJ5Qm9vdHN0cmFwUHJvbWlzZSA/Pz0gc3RhcnRPcmRpbmFyeUJvb3RzdHJhcCgpO1xuICByZXR1cm4gb3JkaW5hcnlCb290c3RyYXBQcm9taXNlO1xufTtcblxuY29uc3QgaGFuZGxlQXBwUmVhZHkgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmIChpc1FhU3RhZ2luZ0J1aWxkICYmIGlzQ29sZFFhTW9kZVRvZ2dsZSkge1xuICAgIGNvbnNvbGUubG9nKCdbUUEgTW9kZV0gVG9nZ2xlIHJlcXVlc3RlZCBieSB0aGlzIGxhdW5jaCcpO1xuICAgIHJlcXVlc3RRYU1vZGVUb2dnbGVBbmRSZWxhdW5jaCgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGNhbkNvbnRpbnVlU3RhcnR1cCA9IGF3YWl0IGVuc3VyZUluc3RhbGxMb2NhdGlvbkJlZm9yZVN0YXJ0dXAoKTtcbiAgaWYgKCFjYW5Db250aW51ZVN0YXJ0dXApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoaXNRYVN0YWdpbmdCdWlsZCkge1xuICAgIGluc3RhbGxRYVBsYXRmb3JtQ29udHJvbHMoKTtcblxuICAgIGlmIChpc1FhTW9kZVJlbGF1bmNoUGVuZGluZygpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChyZXNvbHZlUWFTdGFydHVwQWN0aW9uKCkgPT09ICdzZWxlY3RvcicpIHtcbiAgICAgIGF3YWl0IG9wZW5RYVNlbGVjdG9yKGNvbnRpbnVlT3JkaW5hcnlCb290c3RyYXApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIGF3YWl0IGNvbnRpbnVlT3JkaW5hcnlCb290c3RyYXAoKTtcbn07XG5cbmFwcC5vbigncmVhZHknLCAoKSA9PiB7XG4gIHZvaWQgaGFuZGxlQXBwUmVhZHkoKS5jYXRjaChlcnJvciA9PiB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgYmVmb3JlIEF1dG9DdXQgYm9vdHN0cmFwOicsIGVycm9yKTtcbiAgICBkaWFsb2cuc2hvd0Vycm9yQm94KFxuICAgICAgJ0F1dG9DdXQgSW5pdGlhbGl6YXRpb24gRXJyb3InLFxuICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuICAgICk7XG4gICAgYXBwLnF1aXQoKTtcbiAgfSk7XG59KTtcbiJdLCJuYW1lcyI6WyJDVVJSRU5UX0VOViIsIklTX0RFViIsIklTX1NUQUdJTkciLCJJU19QUk9EIiwiQVVUT0NVVF9ORUVERURfUEVSTUlTU0lPTlMiLCJERVZfT1JJR0lOU19BTkRfUEVSTUlTU0lPTlMiLCJhcHAiLCJvcmlnaW4iLCJTVEFHSU5HX09SSUdJTlNfQU5EX1BFUk1JU1NJT05TIiwiQVVUT0NVVF9PUklHSU5TX0FORF9QRVJNSVNTSU9OUyIsIkFVVE9DVVRfU1lTVEVNX1JFUE9SVF9PUklHSU5TX0FORF9QRVJNSVNTSU9OUyIsIkdJVEhVQl9PUklHSU5TX0FORF9QRVJNSVNTSU9OUyIsInBhdGgiLCJBTExPV0VEX09SSUdJTlNfQU5EX1BFUk1JU1NJT05TIiwiQUxMT1dFRF9FWFRFUk5BTF9PUklHSU5TIiwiXyIsImNvbnRlbnRzIiwiZXZlbnQiLCJ1cmwiLCJwYXRobmFtZSIsIlVSTCIsImRvbWFpbiIsIndlYkNvbnRlbnRzIiwicGVybWlzc2lvbiIsImNhbGxiYWNrIiwicGVybWlzc2lvbkdyYW50ZWQiLCJzaGVsbCIsIndlYlByZWZlcmVuY2VzIiwicGFyYW1zIiwiQ09PS19QUk9KRUNUX0JZX1VSTF9LRVkiLCJtYXBDb29rUmVzcG9uc2VUb1VybENhbmRpZGF0ZXMiLCJyZXNwb25zZSIsImVudHJpZXMiLCJ1cmxLZXkiLCJwcm9qZWN0U2x1ZyIsImNhbmRpZGF0ZXMiLCJxYVRhcmdldCIsInNldFFhVGFyZ2V0IiwicHJOdW1iZXIiLCJnZXRRYVRhcmdldCIsImJ1aWxkUWFDb29rUHVibGljQ2hhbm5lbFBhdGgiLCJ0YXJnZXQiLCJzdWZmaXgiLCJnZXRSZXF1ZXN0UmVkaXJlY3RNb2RlIiwicmVxdWlyZUh0dHBzIiwiaXNSZXF1ZXN0VXJsQWxsb3dlZCIsInJlcXVlc3RVcmwiLCJSRVNUUklDVEVEX1JFUVVFU1RfSEVBREVSUyIsIkNIUk9NSVVNX0VSUk9SX0NPREVfTUFQIiwiYnVpbGRGdWxsVXJsIiwiY29uZmlnIiwicmVxdWVzdGVkIiwiYWJzb2x1dGUiLCJrZXkiLCJ2YWx1ZSIsImFwcGx5SGVhZGVycyIsInJlcXVlc3QiLCJoZWFkZXJzIiwiQXhpb3NIZWFkZXJzIiwibmFtZSIsInRvQXhpb3NFcnJvciIsImVycm9yIiwibWVzc2FnZSIsImNvZGUiLCJlbnRyeSIsIkF4aW9zRXJyb3IiLCJheGlvc0Vycm9yIiwiZWxlY3Ryb25OZXRBZGFwdGVyIiwicmVzb2x2ZSIsInJlamVjdCIsIm1ldGhvZCIsInRpbWVvdXRJZCIsInNldHRsZWQiLCJmYWlsIiwic3VjY2VlZCIsInZhbGlkYXRlU3RhdHVzIiwibmV0IiwiYWN0aXZlUmVxdWVzdCIsInJlZGlyZWN0cyIsIl9zdGF0dXNDb2RlIiwiX21ldGhvZCIsInJlZGlyZWN0VXJsIiwidGltZW91dE1zIiwic3RhdHVzIiwic3RhdHVzVGV4dCIsImNodW5rcyIsImNodW5rIiwiYnVmZmVyIiwiZGF0YSIsImJvZHkiLCJnZXROZXR3b3JrRXJyb3JEYXRhIiwiZ2V0TmV0d29ya0ZhaWx1cmVLaW5kIiwibmV0d29ya0Vycm9yIiwicGF0dGVybiIsImlzT2ZmbGluZU5ldHdvcmtFcnJvciIsImlzVHJhbnNpZW50TmV0d29ya0Vycm9yIiwiREVGQVVMVF9QUk9CRV9USU1FT1VUX01TIiwiREVGQVVMVF9SRVFVRVNUX1RJTUVPVVRfTVMiLCJERUZBVUxUX1BST0JFX1BPTExfTVMiLCJzbGVlcCIsIm1zIiwicHJvYmVFbmRwb2ludCIsIndhaXRGb3JFbmRwb2ludFJlYWNoYWJsZSIsInBvbGxNcyIsInJlcXVlc3RUaW1lb3V0TXMiLCJkZWFkbGluZSIsImxhc3RFcnJvciIsIkRFRkFVTFRfTUFYX1JFVFJJRVMiLCJERUZBVUxUX05FVFdPUktfV0FJVF9USU1FT1VUX01TIiwiREVGQVVMVF9ORVRXT1JLX1BPTExfTVMiLCJERUZBVUxUX0JBU0VfQkFDS09GRl9NUyIsIndhaXRGb3JOZXR3b3JrT25saW5lIiwid2FpdFVudGlsTmV0d29ya09ubGluZSIsInJ1bldpdGhOZXR3b3JrUmV0cnkiLCJmbiIsIm9wdGlvbnMiLCJiYXNlQmFja29mZk1zIiwiZW5kcG9pbnRQcm9iZVVybCIsImxhYmVsIiwibWF4UmV0cmllcyIsIm5ldHdvcmtQb2xsTXMiLCJuZXR3b3JrV2FpdFRpbWVvdXRNcyIsImF0dGVtcHQiLCJiYWNrb2ZmTXMiLCJyZXRyeUVycm9yIiwiVExTX0VSUk9SX1NJR05BTFMiLCJSRVZPQ0FUSU9OX0VSUk9SX1NJR05BTFMiLCJpc1JlY29yZCIsImdldFN0cmluZ1ZhbHVlIiwiZ2V0RXJyb3JGaWVsZHMiLCJyZWNvcmQiLCJnZXRDYXVzZVBhcnRzIiwiY2F1c2UiLCJjYXVzZUZpZWxkcyIsImNvbGxlY3RFcnJvclBhcnRzIiwiZmllbGRzIiwiZGlyZWN0UGFydHMiLCJmYWxsYmFja1BhcnQiLCJnZXRNYXRjaGVkU2lnbmFscyIsInBhcnRzIiwic2lnbmFscyIsInRleHQiLCJzaWduYWwiLCJnZXRBbGxNYXRjaGVkU2lnbmFscyIsImNsYXNzaWZ5V2luZG93c1Rsc0Vycm9yIiwic3RhY2siLCJtYXRjaGVkU2lnbmFscyIsInJldm9jYXRpb25TaWduYWxzIiwibG9nV2luZG93c1Rsc0Vycm9yIiwiY29udGV4dCIsImNsYXNzaWZpY2F0aW9uIiwicmVnaXN0ZXJCcm93c2VyV2luZG93VGxzRGlhZ25vc3RpY3MiLCJicm93c2VyV2luZG93IiwiX2V2ZW50IiwiZXJyb3JDb2RlIiwiZXJyb3JEZXNjcmlwdGlvbiIsInZhbGlkYXRlZFVybCIsImlzTWFpbkZyYW1lIiwiYXhpb3MiLCJnZXRPcmlnaW5NYXAiLCJzaGFyZWRWYXJpYWJsZXMiLCJPUklHSU5fTUFQIiwibWFwcGVkRG9tYWluc0NhY2hlIiwiaXNNYXRjaGluZ1dpbGRjYXJkIiwiaG9zdCIsInRlbXBsYXRlIiwiZXh0cmFjdFN1YmRvbWFpbiIsImdldE1hcHBlZFdpbGRjYXJkIiwicHJveHlEb21haW4iLCJ0YXJnZXRUZW1wbGF0ZXMiLCJzYW5pdGl6ZWRTdWJkb21haW4iLCJmaW5kTWFwcGVkSG9zdG5hbWVzIiwiaG9zdG5hbWUiLCJvcmlnaW5NYXAiLCJ0YXJnZXRzIiwic2hvdWxkVXNlUHJveHlGYWxsYmFjayIsImlzUmVhZGFibGVTdHJlYW0iLCJnZXRBeGlvc1Jlc3BvbnNlRGF0YSIsImdldEF4aW9zRXJyb3JTdW1tYXJ5IiwiZ2V0SGVhZGVyRmlsZW5hbWUiLCJjb250ZW50RGlzcG9zaXRpb24iLCJnZXREb3dubG9hZE91dHB1dFBhdGgiLCJmaWxlVXJsIiwib3V0cHV0Rm9sZGVyUGF0aCIsImZpbGVuYW1lIiwidXJsRmlsZW5hbWUiLCJkZWZhdWx0RmlsZW5hbWUiLCJwaXBlRG93bmxvYWRUb1dyaXRlciIsInN0cmVhbSIsIndyaXRlciIsImhhc0Vycm9yIiwiZXJyIiwidmVyYm9zZUF4aW9zIiwiaW5pdEF4aW9zIiwibWFwcGVkSG9zdG5hbWUiLCJvcmlnaW5hbFJlcXVlc3QiLCJvcmlnaW5hbEhvc3RuYW1lIiwibWFwcGVkSG9zdG5hbWVzIiwicHJveHlJbmRleCIsInByb3h5RXJyb3IiLCJyZXRyeUxpbWl0IiwiZG93bmxvYWRGaWxlIiwid2l0aENhY2hlIiwiZXhpc3RzU3luYyIsIm1rZGlyU3luYyIsIm91dHB1dEZpbGVQYXRoIiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJGT1JCSURERU5fU1RBVFVTX0NPREUiLCJzaG93U3RhZ2luZ0lwV2hpdGVsaXN0TW9kYWwiLCJjaGVja1VybEF2YWlsYWJpbGl0eSIsInNlbGVjdEZpcnN0UmVzcG9uZGluZ1VybCIsInVybHMiLCJ0aW1lb3V0Iiwic3RhcnR1cEZhaWx1cmVzIiwiaGFzUmVwb3J0ZWRGYWlsdXJlIiwidHJhY2tTdGFydHVwRmFpbHVyZSIsImtpbmQiLCJhdmFpbGFiaWxpdHkiLCJoYXNTdGFydHVwRmFpbHVyZXMiLCJyZXBvcnRTdGFydHVwRmFpbHVyZXMiLCJhdmFpbGFiaWxpdGllcyIsImZhaWx1cmUiLCJjb2RlcyIsImhvc3RzIiwia2luZHMiLCJvcGVyYXRpb25zIiwiU2VudHJ5Iiwic2NvcGUiLCJjbGVhclN0YXJ0dXBGYWlsdXJlcyIsIkFVVE9fQ1VUX1VSTF9TRVRfS0VZUyIsImdldEVsZWN0cm9uQXBwVmVyc2lvbiIsIk9QVElPTkFMX1VSTF9TRVRfS0VZUyIsIkZBTExCQUNLX1VSTFNfVVJMIiwiaXNBdXRvQ3V0VXJsU2V0Q29tcGxldGUiLCJ1cmxTZXQiLCJnZXRFbnZVcmxzIiwiZ2V0TG9jYWxVcmxzIiwiZ2V0Q29va0NoYW5uZWxGaWxlUGF0aCIsImdldENvb2tDaGFubmVsU2x1ZyIsInJlYWRGaWxlU3luYyIsImJ1aWxkQ29va1B1YmxpY0NoYW5uZWxQYXRoIiwic2x1ZyIsImdldENvb2tSZXF1ZXN0SGVhZGVycyIsInZlcnNpb24iLCJmZXRjaENvb2tDaGFubmVsRGF0YSIsImFjY2VwdE1pc3NpbmciLCJmZXRjaERlZmF1bHRDb29rUHVibGljQ2hhbm5lbCIsImNvb2tVcmwiLCJmZXRjaENvb2tQdWJsaWNDaGFubmVsIiwicWFQYXRoIiwicWFVcmwiLCJxYVJlc3BvbnNlIiwic2VsZWN0Q29va1VybCIsInNlbGVjdENvb2tVcmxTZXQiLCJmZXRjaGVkQ29va1VybHMiLCJ1cmxDYW5kaWRhdGVzIiwiZ2V0VXJsc0Zyb21Db29rIiwiY29va1VybHMiLCJ1c2VkRGVmYXVsdENoYW5uZWwiLCJnZXRWZXJzaW9uc0Zyb21Db29rIiwidmVyc2lvbnMiLCJmZXRjaGVkVmVyc2lvbnMiLCJmZXRjaEZhbGxiYWNrVXJscyIsImZldGNoZWRVcmxzIiwiZmFsbGJhY2tVcmxzIiwiZ2V0VXJsc0Zyb21GaWxlIiwiZ2V0UHJveHlPcmlnaW5NYXAiLCJkZWZhdWx0TWFwIiwiZXhlY0FzeW5jIiwicHJvbWlzaWZ5IiwiZXhlYyIsIndpbmRvd3NQcm9jZXNzb3JBcmNoaXRlY3R1cmVSZWdpc3RyeUtleSIsInBhcnNlV2luZG93c1JlZ2lzdHJ5U3RyaW5nVmFsdWUiLCJzdGRvdXQiLCJsaW5lIiwibWF0Y2giLCJub3JtYWxpemVXaW5kb3dzUHJvY2Vzc29yQXJjaGl0ZWN0dXJlIiwicmVzb2x2ZVdpbmRvd3NBcmNoIiwicmVnaXN0cnlWYWx1ZSIsIm5vcm1hbGl6ZWRBcmNoIiwicmVzb2x2ZURhcndpbkFyY2giLCJyZXNvbHZlQXJjaCIsIm9zIiwicGxhdGZvcm0iLCJ3aW5kb3dzTWVkaWFDb3JlUGF0aE5lZWRsZSIsIm1hY0FwcGxpY2F0aW9uc0RpciIsIm1hY1ByZW1pZXJlQXBwUHJlZml4IiwiZXhwYW5kV2luZG93c0Vudmlyb25tZW50VmFyaWFibGVzIiwibWlzc2luZ0Vudmlyb25tZW50VmFyaWFibGUiLCJleHBhbmRlZFZhbHVlIiwicGxhY2Vob2xkZXIiLCJtYXRjaGluZ0Vudmlyb25tZW50TmFtZSIsImVudmlyb25tZW50TmFtZSIsImVudmlyb25tZW50VmFsdWUiLCJpc1ZhbGlkV2luZG93c1BsdWdpbkRpciIsImZvbGRlclBhdGgiLCJpc0RyaXZlQWJzb2x1dGUiLCJpc1VuY0Fic29sdXRlIiwicGF0aFdpdGhvdXREcml2ZSIsImlzUHJlbWllcmVJbnN0YWxsZWRPbk1hYyIsImZzIiwicmVzb2x2ZVByZW1pZXJlUGx1Z2luRGlyIiwicmVnaXN0cnlUeXBlIiwicmF3VmFsdWUiLCJ0cmltbWVkVmFsdWUiLCJub3JtYWxpemVkVmFsdWUiLCJSRVFVSVJFRF9TVEFSVFVQX1VSTF9LRVlTIiwiU3RhcnR1cFVybFZhbGlkYXRpb25FcnJvciIsIm1pc3NpbmdLZXlzIiwiaW52YWxpZEtleXMiLCJwcm9ibGVtcyIsImFzc2VydFN0YXJ0dXBVcmxzIiwiZW5zdXJlVHJhaWxpbmdTbGFzaCIsIlVURjhfUE9XRVJTSEVMTF9QUkVGSVgiLCJleGVjRmlsZSIsImZpbGUiLCJhcmdzIiwiZXhlY0ZpbGVOb2RlIiwic3RkZXJyIiwicG93ZXJzaGVsbCIsImNvbW1hbmQiLCJmdWxsQ29tbWFuZCIsImlzQXNjaWkiLCJzdHIiLCJpIiwic2hvcnRpZnlQYXRoIiwiYmFzZSIsImV4dCIsInBhcnNlIiwiaXNGb2xkZXIiLCJkaXIiLCJkaXJuYW1lIiwic2hvdWxkQ3JlYXRlRm9sZGVyIiwiY21kQXJncyIsInNob3J0UGF0aCIsImpvaW4iLCJpbml0U2hhcmVkVmFyaWFibGVzIiwibG9jYWxVcmxzUHJvbWlzZSIsInByb3h5T3JpZ2luTWFwUHJvbWlzZSIsInByb3h5T3JpZ2luTWFwIiwibG9jYWxVcmxzIiwicHJvamVjdFZlcnNpb25zIiwicHJlbWllcmVQbHVnaW5EaXJSYXciLCJhcmNoIiwiZW52VXJscyIsIm9yZGluYXJ5UmVzb2x2ZWRVcmxzIiwicmVzb2x2ZWRVcmxzIiwicHJlbWllcmVQbHVnaW5EaXIiLCJnZXRTdGFydGluZ0ZpbGVQYXRoIiwiY2hlY2tTdGFydGluZ0ZpbGVFeGlzdHMiLCJjcmVhdGVTdGFydGluZ0ZpbGUiLCJmaWxlUGF0aCIsIndyaXRlRmlsZVN5bmMiLCJyZW1vdmVTdGFydGluZ0ZpbGUiLCJ1bmxpbmtTeW5jIiwiUUFfTU9ERV9UT0dHTEVfQVJHVU1FTlQiLCJRQV9TVEFUVVNFUyIsIlFBX1NUQVRVU19TRVQiLCJjb250YWluc1FhTW9kZVRvZ2dsZUFyZ3VtZW50IiwiYXJndiIsImFyZ3VtZW50IiwiZ2V0UWFUb2dnbGVSZWxhdW5jaEFyZ3VtZW50cyIsImlzUGFja2FnZWRTdGFnaW5nSWRlbnRpdHkiLCJpc1BhY2thZ2VkIiwiaXNTdGFnaW5nIiwiZ2V0UWFTdGFydHVwQWN0aW9uIiwiZGVlcExpbmtQYXRoIiwiaGFzVG9nZ2xlQXJndW1lbnQiLCJxYU1vZGVFbmFibGVkIiwibm9ybWFsaXplZERlZXBMaW5rUGF0aCIsInBhcnNlUWFMaXN0IiwiaXRlbSIsImluZGV4IiwiY2FuZGlkYXRlIiwiZ2V0UWFTZWxlY3Rpb25FcnJvciIsIml0ZW1zIiwic2VsZWN0ZWRQdWxsUmVxdWVzdCIsImNhbkNvbnRpbnVlUWFTZWxlY3Rpb24iLCJhcHBsaWNhdGlvbklzUXVpdHRpbmciLCJzZWxlY3RvcldpbmRvd0lzRGVzdHJveWVkIiwiaXNRYU1vZGVNYXJrZXJFbmFibGVkIiwibWFya2VyUGF0aCIsInNldFFhTW9kZU1hcmtlckVuYWJsZWQiLCJlbmFibGVkIiwidGVtcG9yYXJ5UGF0aCIsInJhbmRvbVVVSUQiLCJyZW5hbWVTeW5jIiwiUUFfTU9ERV9NQVJLRVJfRklMRU5BTUUiLCJxYU1vZGVSZWxhdW5jaFJlcXVlc3RlZCIsImlzUGFja2FnZWRTdGFnaW5nQnVpbGQiLCJnZXRRYU1vZGVNYXJrZXJQYXRoIiwiaXNRYU1vZGVFbmFibGVkIiwiaGFzUWFNb2RlVG9nZ2xlQXJndW1lbnQiLCJwZXJmb3JtUWFNb2RlVG9nZ2xlQW5kUmVsYXVuY2giLCJzaG91bGRFbmFibGVRYU1vZGUiLCJyZWxhdW5jaEFyZ3VtZW50cyIsInJlcXVlc3RRYU1vZGVUb2dnbGVBbmRSZWxhdW5jaCIsImlzUWFNb2RlUmVsYXVuY2hQZW5kaW5nIiwiY3JlYXRlUWFNZW51IiwiYXBwZW5kUWFNb2RlTWVudSIsImluc3RhbGxRYVBsYXRmb3JtQ29udHJvbHMiLCJ0ZW1wbGF0ZVdpdGhRYU1vZGUiLCJNZW51IiwiaXNXaXRoaW5EaXNwbGF5Qm91bmRzIiwicG9zIiwic2NyZWVuIiwicmVzdWx0IiwiZGlzcGxheSIsImFyZWEiLCJNSU5JTVVNX1dJTkRPV19TSVpFIiwiTUFYSU1VTV9XSU5ET1dfU0laRSIsIkRFRkFVTFRfV0lORE9XX1NJWkUiLCJJTklUX0ZJTEVfVkVSU0lPTiIsIndpbmRvd0JvdW5kc0JlZm9yZUV4cGFuc2lvbiIsInNldFdpbmRvd0V4cGFuZGVkIiwid2luZG93IiwiZXhwYW5kZWQiLCJwcmV2aW91c0JvdW5kcyIsImJvdW5kcyIsIndvcmtBcmVhIiwid2lkdGgiLCJoZWlnaHQiLCJ4IiwieSIsImdldEluaXRGaWxlVmVyc2lvbiIsImluaXREYXRhIiwiZW5mb3JjZU1pbldpbmRvd1NpemUiLCJtaW5TaXplIiwiY3JlYXRlV2luZG93Iiwic2l6ZSIsImZyYW1lIiwiaW5pdFBhdGgiLCJCcm93c2VyV2luZG93IiwiZGV0YWlscyIsInNldE1haW5NZW51IiwicmVzdG9yZVdpbmRvdyIsInciLCJzZW5kVG9BbGxXaW5kb3dzIiwiaW5pdE1haW5XaW5kb3dJUENIYW5kbGVyIiwiaXBjTWFpbiIsImRldlNlcnZlclVybCIsInRlcm0iLCJjb21wcmVzc1F1ZXVlIiwicXVldWUiLCJtYXhQYXR0ZXJuTGVuIiwiYmVzdExlbiIsImJlc3RDb3VudCIsImJlc3RTYXZpbmdzIiwibWF4UExlbiIsInBMZW4iLCJjb3VudCIsImoiLCJrIiwic2F2aW5ncyIsImZpcnN0IiwibGFzdCIsImZvcm1hdENvbXByZXNzZWQiLCJjb21wcmVzc2VkIiwibGluZXMiLCJlIiwibGV2ZWwiLCJNQVhfTE9HX1NJWkUiLCJzYWZlV3JpdGUiLCJjcmVhdGVDaXJjdWxhclJlcGxhY2VyIiwic2VlbiIsIl9rZXkiLCJzdHJpbmdpZnlMb2dEYXRhIiwiZm9ybWF0Q29uc29sZUFyZyIsImFyZyIsImZvcm1hdEFyZ3MiLCJFbGVjdHJvbkxvZ2dlciIsImxvZ0ZpbGVQYXRoIiwibXNnIiwib3B0cyIsImhlYWRlciIsImZvcm1hdHRlZCIsInNlcmlhbGl6ZUZvckxvZyIsIm9iaiIsInYiLCJlbGVjdHJvbkxvZ2dlciIsIlNVQlBST0NFU1NfVEVSTUlOQVRFRF9ST1VURSIsIkdFVF9URVJNSU5BVEVEX1NVQlBST0NFU1NfUk9VVEUiLCJpc0FwcFF1aXR0aW5nIiwidGVybWluYXRlZFN1YnByb2Nlc3MiLCJub3RpZnlUZXJtaW5hdGVkIiwid2F0Y2hTdWJwcm9jZXNzVGVybWluYXRpb24iLCJpbnN0YW5jZSIsImlnbm9yZWRFeGl0Q29kZXMiLCJob3N0U2VydmVySW5zdGFuY2UiLCJnZXRIb3N0U2VydmVySW5zdGFuY2VEaWFnbm9zdGljcyIsImRvd25sb2FkSG9zdFNlcnZlck1haW4iLCJkb3dubG9hZFVybCIsIndyaXRlUGF0aCIsInN0b3BIb3N0U2VydmVyIiwicmVhc29uIiwic3RhcnRIb3N0U2VydmVyIiwiZm9yayIsIkZST05UX0lQQ19DSEFOTkVMIiwiRlJPTlRfSVBDX01FU1NBR0VfRVZFTlQiLCJGUk9OVF9JUENfQ0FOQ0VMX0VWRU5UIiwiRlJPTlRfSVBDX1NUQVRfRVZFTlQiLCJGUk9OVF9JUENfU0VORF9NRVNTQUdFX1JPVVRFIiwiRlJPTlRfSVBDX0NBTkNFTF9SRVFVRVNURURfUk9VVEUiLCJGUk9OVF9JUENfU1RBVF9ST1VURSIsInNvY2tldFJvb3RQYXRoIiwidG1wZGlyIiwiZnJvbnRJcGNTZXJ2ZXIiLCJmcm9udElwY01lc3NhZ2VSb3V0ZVJlZ2lzdGVyZWQiLCJpc0Zyb250SXBjU3RhdE1lc3NhZ2UiLCJtZXNzYWdlRGF0YSIsImRpc2NhcmRGcm9udElwY1NlcnZlciIsInNlcnZlciIsInN0YXJ0RnJvbnRJcGNTZXJ2ZXIiLCJJcGNTZXJ2ZXIiLCJjbGllbnRTb2NrZXQiLCJpbml0RnJvbnRJcGNIYW5kbGVyIiwiYXBwTmFtZSIsImluaXRBcHBOYW1lIiwiY29va2llRGF0YSIsImdldENvb2tpZUZpbGVQYXRoIiwiaW5pdENvb2tpZXMiLCJjb29raWVGaWxlUGF0aCIsInRvdGFsS2V5cyIsInJhd1VzZXJLZXkiLCJ1c2VyS2V5U3RhdHVzIiwic2V0Q29va2llIiwiZ2V0QWxsQ29va2llcyIsImdldENvb2tpZSIsImNsZWFyQWxsQ29va2llcyIsIk1BWF9KU1hCSU5fU0laRV9CWVRFUyIsIkpTWEJJTl9TSUdOQVRVUkUiLCJub3JtYWxpemVUcnVzdGVkSnN4VXJsIiwidHJ1c3RlZEhvc3QiLCJ2YWxpZGF0ZUpzeEJpbiIsImNvbnRlbnQiLCJ2YWxpZGF0ZUNhY2hlZEpzeEJpbiIsInJlYWRlciIsInN0YXRzIiwicGVuZGluZ0Rvd25sb2FkcyIsInVwZGF0ZUNhY2hlIiwiZGlyZWN0b3J5IiwiY2FjaGVQYXRoIiwiZG93bmxvYWQiLCJyYW5kb21CeXRlcyIsInJtU3luYyIsImRvd25sb2FkRXJyb3IiLCJzdGF0U3luYyIsImNhY2hlRXJyb3IiLCJwcmVwYXJlUHByb0pzeENhY2hlIiwianN4VXJsIiwiaGFzaCIsImNyZWF0ZUhhc2giLCJwZW5kaW5nIiwib3BlcmF0aW9uIiwiUkVRVUVTVF9USU1FT1VUX01TIiwiZ2V0SGVhZGVyVmFsdWUiLCJ2YWxpZGF0ZVJlZGlyZWN0Iiwic291cmNlIiwiZG93bmxvYWRKc3hCaW4iLCJyZWNlaXZlZEJ5dGVzIiwidGltZXIiLCJyYXdMZW5ndGgiLCJleHBlY3RlZEJ5dGVzIiwiZW5jb2RpbmciLCJwcmVwYXJlUHByb0pzeCIsIk9OTElORV9SRVRSWV9ERUxBWV9NUyIsInN0YXJ0dXBOZXR3b3JrU3RhdGUiLCJzdGFydHVwUmV0cnlSZXNvbHZlciIsImdldFN0YXJ0dXBOZXR3b3JrU3RhdGUiLCJzZXRTdGFydHVwTmV0d29ya1N0YXRlIiwic3RhdGUiLCJyZXF1ZXN0U3RhcnR1cFJldHJ5Iiwid2FpdEZvclN0YXJ0dXBSZXRyeSIsImlzT2ZmbGluZSIsInJldHJ5UmVxdWVzdGVkIiwiV0lORE9XU19FTlZJUk9OTUVOVF9QQVRIX05BTUVTIiwiaXNXaW5kb3dzRW52aXJvbm1lbnRQYXRoTmFtZSIsImdldFdpbmRvd3NFbnZpcm9ubWVudFBhdGgiLCJlbnZpcm9ubWVudFBhdGgiLCJnZXRXaW5kb3dzU3lzdGVtQmluYXJ5UGF0aCIsImJpbmFyeU5hbWUiLCJzeXN0ZW1Sb290UGF0aCIsIndpbjMyIiwic2hvdWxkTm90QXBwZW5kQXV0b0N1dCIsImlzTmF0aXZlUGF0aE5hbWUiLCJnZXRJUENQYXRoTmFtZSIsInBheWxvYWQiLCJnZXRSdW50aW1lUGF0aHMiLCJyZXN0b3JlUnVudGltZVBhdGhzIiwicGF0aHMiLCJyZWZyZXNoU2hhcmVkVmFyaWFibGVzIiwicnVudGltZVBhdGhzIiwiaW5pdEVsZWN0cm9uSVBDSGFuZGxlciIsInNraXBTaG9ydGlmeSIsImFwcERhdGFQYXRoIiwiZmluYWxQYXRoIiwiY2xpcGJvYXJkIiwiZGVmYXVsdFBhdGgiLCJmaWx0ZXJzIiwiZGlhbG9nIiwiaXNFbGVjdHJvbkluaXRpYWxpemVkIiwic3RlcCIsInJlcyIsIldJTkRPV1NfREVGQVVMVF9UQVIiLCJnZXREZWZhdWx0VGFyQ2FuZGlkYXRlcyIsImZvcm1hdEV4ZWNGYWlsdXJlIiwiZ2V0VGFyQ2FuZGlkYXRlcyIsImluc3RhbGxlZFRhciIsInJlc29sdmVXb3JraW5nVGFyUGF0aCIsImRvd25sb2FkZWRUYXJQYXRoIiwiZmFpbHVyZXMiLCJ0YXJCaW5hcnkiLCJydW5UYXJXaXRoRmFsbGJhY2siLCJ0YXJBcmdzIiwiZXh0cmFjdFppcFdpdGhGZmxhdGUiLCJ1bnppcFBhdGgiLCJhcmNoaXZlIiwidW56aXBTeW5jIiwidG9wTGV2ZWxFbnRyaWVzIiwiZW50cnlQYXRoIiwibm9ybWFsaXplZFBhdGgiLCJ0b3BTZWdtZW50IiwiZGVzdGluYXRpb24iLCJzdXBwb3J0ZWRBcmNocyIsImlzQXJjaFN1cHBvcnRlZCIsInVuemlwRmlsZSIsInVuemlwQXJncyIsImRvd25sb2FkRkZNUEVHIiwiZG93bmxvYWRQYXRoIiwiZG93bmxvYWRVcmxzIiwiZmZtcGVnRm9sZGVyUGF0aCIsImluaXRTZXR1cElQQ0hhbmRsZXIiLCJnZXRVcGRhdGVPcHRpb25zIiwiQVBQX0JVTkRMRV9OQU1FIiwiUEVSTUlTU0lPTl9FUlJPUl9DT0RFUyIsIlBFUk1JU1NJT05fRVJST1JfVEVYVCIsImlzVW5zaWduZWRRYUJ1aWxkIiwidG9FcnJvciIsImdldEVycm9yQ29kZSIsImlzTWFjSW5zdGFsbFBlcm1pc3Npb25FcnJvciIsImN1cnJlbnRFcnJvciIsInZpc2l0ZWQiLCJub3JtYWxpemVkRXJyb3IiLCJub3JtYWxpemVkTWVzc2FnZSIsIm1lc3NhZ2VQYXJ0Iiwibm9ybWFsaXplRXhpc3RpbmdQYXRoIiwiY2FuZGlkYXRlUGF0aCIsInJlYWxwYXRoU3luYyIsImFyZVNhbWVQYXRocyIsImZpcnN0UGF0aCIsInNlY29uZFBhdGgiLCJub3JtYWxpemVkRmlyc3RQYXRoIiwibm9ybWFsaXplZFNlY29uZFBhdGgiLCJnZXRNYWNJbnN0YWxsUGF0aHMiLCJzeXN0ZW1BcHBQYXRoIiwidXNlckFwcGxpY2F0aW9uc1BhdGgiLCJ1c2VyQXBwUGF0aCIsImdldEN1cnJlbnRNYWNBcHBCdW5kbGVQYXRoIiwiZXhlY3V0YWJsZVBhdGgiLCJyZXNvbHZlZEV4ZWN1dGFibGVQYXRoIiwicGF0aFBhcnRzIiwicGF0aFBhcnQiLCJuZXh0UGF0aFBhcnQiLCJpc1ZhbGlkTWFjQXBwQnVuZGxlIiwiYXBwQnVuZGxlUGF0aCIsImluZm9QbGlzdFBhdGgiLCJhY2Nlc3NTeW5jIiwiY29uc3RhbnRzIiwiY2xhc3NpZnlQcm9iZUVycm9yIiwicmVtb3ZlUHJvYmVQYXRoIiwicHJvYmVQYXRoIiwicHJvYmVNYWNBcHBCdW5kbGVSZXBsYWNlbWVudCIsImNyZWF0ZVBhcmVudCIsInBhcmVudFBhdGgiLCJyZW5hbWVkUHJvYmVQYXRoIiwicHJvYmVQcmVmaXgiLCJta2R0ZW1wU3luYyIsImNsZWFudXBFcnJvciIsInJ1bkluc3RhbGxDb21tYW5kIiwiZXhlY3V0YWJsZSIsImVycm9yRGV0YWlsIiwicmVzdG9yZUJhY2t1cCIsInRhcmdldFBhdGgiLCJiYWNrdXBQYXRoIiwicmVwbGFjZVRhcmdldFdpdGhTdGFnZWRCdW5kbGUiLCJzdGFnZWRQYXRoIiwiYmFja3VwTmFtZSIsInNob3VsZEJhY2t1cFRhcmdldCIsImRpZE1vdmVTdGFnZWRCdW5kbGUiLCJyZXN0b3JlRXJyb3IiLCJpbnN0YWxsTWFjQXBwQnVuZGxlIiwic291cmNlUGF0aCIsInN0YWdlZE5hbWUiLCJjcmVhdGVSZWFkeVJlc3VsdCIsImN1cnJlbnRQYXRoIiwiY3JlYXRlSGFuZG9mZlJlc3VsdCIsImNyZWF0ZUZhaWxlZFJlc3VsdCIsInBlcmZvcm1JbnN0YWxsIiwiZ2V0UHJvYmVFcnJvciIsInByb2JlIiwiZW5zdXJlRnJvbVN5c3RlbUxvY2F0aW9uIiwic3lzdGVtUHJvYmUiLCJ1c2VySXNWYWxpZCIsInVzZXJQcm9iZSIsImVuc3VyZUZyb21Vc2VyTG9jYXRpb24iLCJzeXN0ZW1Jc1ZhbGlkIiwiaW5zdGFsbEV4dGVybmFsQnVuZGxlRm9yVXNlciIsImVuc3VyZUZyb21FeHRlcm5hbExvY2F0aW9uIiwic3lzdGVtSW5zdGFsbFJlc3VsdCIsImdldEN1cnJlbnRJbnN0YWxsU2NvcGUiLCJlbnN1cmVNYWNJbnN0YWxsTG9jYXRpb24iLCJkZWZhdWx0SW5zdGFsbFBhdGhzIiwiY3VycmVudFNjb3BlIiwiT1BFTl9BRlRFUl9FWElUX1NDUklQVCIsImxhdW5jaE1hY0FwcEFmdGVyQ3VycmVudFByb2Nlc3NFeGl0cyIsImRlZXBMaW5rVXJsIiwiaGFuZG9mZlByb2Nlc3MiLCJzcGF3biIsImlzQXV0b1VwZGF0ZUVuYWJsZWQiLCJFTEVDVFJPTl9BUFBfUFJPSkVDVF9JRCIsIm5vcm1hbGl6ZVZlcnNpb25Gb3JDb21wYXJlIiwiaXNDdXJyZW50VmVyc2lvbkxhdGVzdCIsInByb2plY3RWZXJzaW9uc0pzb24iLCJjb29rVGFnIiwibm9ybWFsaXplZEN1cnJlbnQiLCJub3JtYWxpemVkQ29vayIsImlzTGF0ZXN0IiwidXBkYXRlTWFuYWdlciIsInVwZGF0ZUNoZWNrSW5mbyIsInVwZGF0ZUluZm8iLCJjbG9zZUFsbFdpbmRvd3MiLCJnZXRNYWNJbnN0YWxsRmFpbHVyZURldGFpbCIsImluc3RhbGxSZXN1bHQiLCJzdG9wRm9yTWFjSW5zdGFsbEZhaWx1cmUiLCJleGl0IiwiaGFuZG9mZk1hY1VwZGF0ZVRvV3JpdGFibGVJbnN0YWxsIiwicHJlcGFyZU1hY0luc3RhbGxGb3JVcGRhdGUiLCJpbml0VXBkYXRlciIsImlzTGF0ZXN0QWNjb3JkaW5nVG9Db29rIiwidXBkYXRlclVybCIsInVwZGF0ZU9wdGlvbnMiLCJVcGRhdGVNYW5hZ2VyIiwicHJvZ3Jlc3MiLCJpbml0VXBkYXRlcklQQ0hhbmRsZXIiLCJwZW5kaW5nVXBkYXRlTWFuYWdlciIsInBlbmRpbmdVcGRhdGVJbmZvIiwicHJldmVudEVsZXZhdGlvblByb21wdCIsImluaXRDb29raWVzSVBDSGFuZGxlciIsIm5vcm1hbGl6ZUh0dHBzVXJsIiwicmF3VXJsIiwidHJpbW1lZFVybCIsInVybFdpdGhQcm90b2NvbCIsInBhcnNlZFVybCIsInJlc29sdmVIdHRwc0luc3RhbGxlckJhc2VVcmxzIiwiY29uZmlndXJlZFVybHMiLCJidWlsZEluc3RhbGxlckFydGlmYWN0VXJscyIsImJhc2VVcmxzIiwiaW5zdGFsbGVyUGF0aCIsImJhc2VVcmwiLCJub3JtYWxpemVkQmFzZVVybCIsImRvd25sb2FkSW5zdGFsbGVyRnJvbU1pcnJvcnMiLCJpbnN0YWxsZXJVcmxzIiwiZG93bmxvYWRJbnN0YWxsZXIiLCJkb3dubG9hZEVycm9ycyIsImluc3RhbGxlclVybCIsIlBSRU1JRVJFX1BMVUdJTl9GT0xERVJfTkFNRSIsIldJTkRPV1NfVE9PTFNfSU5TVEFMTEVSX1BBVEgiLCJJTlNUQUxMRVJfUFJPSkVDVF9LRVkiLCJJTlNUQUxMRVJfUEFUSF9FTlZfS0VZIiwiUlVOX0lOU1RBTExFUl9FTEVWQVRFRF9DT01NQU5EIiwiZ2V0UHJlbWllcmVQbHVnaW5EaXIiLCJyZXNvbHZlUGx1Z2luUm9vdEZvbGRlciIsImNhbldyaXRlVG9Gb2xkZXIiLCJwcm9iZUZpbGVQYXRoIiwiaXNQcmVtaWVyZVRvb2xzSW5zdGFsbE5lZWRlZCIsInJvb3RGb2xkZXIiLCJyZXNvbHZlSW5zdGFsbGVyQmFzZVVybHMiLCJjaGFubmVsVXJscyIsImZldGNoSW5zdGFsbGVyQmFzZVVybHMiLCJydW5JbnN0YWxsZXIiLCJpbnN0YWxsUHJlbWllcmVUb29scyIsImFzc3VtZVByZW1pZXJlSW5zdGFsbGVkIiwiY2FuUmVzb2x2ZVBsdWdpbkRpciIsImluc3RhbGxlckJhc2VVcmxzIiwiZG93bmxvYWRGb2xkZXIiLCJpbml0UHJlbWllcmVUb29sc0lQQ0hhbmRsZXIiLCJpbml0SVBDSGFuZGxlcnMiLCJyZW5hbWVGb2xkZXIiLCJ0aW1lc3RhbXAiLCJ0ZW1wRGlyIiwidGVtcEZvbGRlciIsInRlbXBEaXJQYXJlbnQiLCJuZXdUZW1wRm9sZGVyUGF0aCIsInByZWZpeCIsImZpbGVzIiwiYXV0b2N1dEZvbGRlcnMiLCJhIiwiYiIsImZvbGRlciIsImVuc3VyZVNpbmdsZUluc3RhbmNlIiwiaGFuZGxlU2Vjb25kSW5zdGFuY2UiLCJpbml0TG9nZ2VyIiwidGVtcEZvbGRlclBhdGgiLCJpbml0TWFjU3BlY2lmaWNTZXR0aW5ncyIsInN5c3RlbVByZWZlcmVuY2VzIiwiUE9TVEhPR19BUElfS0VZIiwiUE9TVEhPR19IT1NUIiwiUE9TVEhPR19ESVNUSU5DVF9JRF9DT09LSUUiLCJBUFBfVVVJRF9DT09LSUUiLCJwb3N0aG9nQ2xpZW50IiwiZ2V0RW52aXJvbm1lbnQiLCJwYXJzZUNvb2tpZVN0cmluZyIsInBhcnNlZCIsImdldERpc3RpbmN0SWQiLCJpbml0UG9zdEhvZyIsIlBvc3RIb2ciLCJjYXB0dXJlTWFpbkV2ZW50IiwicHJvcGVydGllcyIsImRpc3RpbmN0SWQiLCJzaHV0ZG93blBvc3RIb2ciLCJMT0dfRklMRVMiLCJpbml0U2VudHJ5IiwiaGludCIsImNvb2tpZXMiLCJhcHBVVUlEIiwibG9nRm9sZGVyUGF0aCIsInNlbnRyeVdyYXBwZXIiLCJzZW50cnlGaW5nZXJwcmludCIsInNldFN0ZXAiLCJjb21wdXRlSW5zdGFuY2UiLCJnZXRDb21wdXRlSW5zdGFuY2VEaWFnbm9zdGljcyIsImRvd25sb2FkU2NyaXB0Iiwic2NyaXB0UmVsYXRpdmVQYXRoIiwicmVsYXRpdmVQYXRoUGFydHMiLCJzY3JpcHRGaWxlbmFtZSIsInN0b3BDb21wdXRlIiwic3RhcnRDb21wdXRlIiwic3RvcElwY1NlcnZlciIsInN0YXJ0SXBjU2VydmVyIiwidGFzayIsInNlcmlhbGl6ZWRFcnJvciIsIlFBX0xJU1RfQ0hBTk5FTCIsIlFBX1NUQVJUX0NIQU5ORUwiLCJRQV9TVEFSVF9TVEFHSU5HX0NIQU5ORUwiLCJRQV9MSVNUX1BBVEgiLCJRQV9MSVNUX1RJTUVPVVRfTVMiLCJnZXRRYUxpc3RVcmwiLCJjb25maWd1cmVkQ29va1VybCIsImZldGNoUWFMaXN0Iiwic2VsZWN0b3JTaWduYWwiLCJjb250cm9sbGVyIiwiYWJvcnRTZWxlY3RvclJlcXVlc3QiLCJ0b1NlbGVjdG9yRXJyb3IiLCJvcGVuUWFTZWxlY3RvciIsImNvbnRpbnVlT3JkaW5hcnlCb290c3RyYXAiLCJjb250cm9sbGVkQ2xvc2UiLCJjb250aW51YXRpb25TdGFydGVkIiwic2VsZWN0b3JSZXF1ZXN0cyIsInNlbGVjdG9yQXNzZXRzUGF0aCIsInNlbGVjdG9yV2luZG93IiwiaXNTZWxlY3RvclNlbmRlciIsInNlbmRlcklkIiwiZ2V0Q29udGludWF0aW9uRXJyb3IiLCJydW5PcmRpbmFyeUJvb3RzdHJhcEZyb21TZWxlY3RvciIsImNvbnRpbnVlRnJvbVNlbGVjdG9yIiwiaW5pdGlhbENvbnRpbnVhdGlvbkVycm9yIiwiY3VycmVudFFhTGlzdCIsInNlbGVjdGlvbkVycm9yIiwiY29udGludWF0aW9uRXJyb3IiLCJyZW1vdmVJcGNIYW5kbGVycyIsIkRFRVBfTElOS19TQ0hFTUUiLCJpbml0RGVlcExpbmsiLCJERVRBQ0hFRF9FTlZfS0VZIiwiTk9fREVUQUNIRURfQVJHIiwiZGV0YWNoRnJvbVBhcmVudE9uV2luZG93cyIsImluaXRFdmVudHMiLCJPTkJPQVJESU5HX1dJTkRPV19XSURUSCIsIk9OQk9BUkRJTkdfV0lORE9XX0hFSUdIVCIsImluaXRPbmJvYXJkaW5nIiwidXNlckRhdGFQYXRoIiwib25ib2FyZGluZ0ZpbGVQYXRoIiwic2NyZWVuV2lkdGgiLCJzY3JlZW5IZWlnaHQiLCJvbmJvYXJkaW5nV2luZG93IiwiaW5pdFRhciIsIm9zQXJjaCIsIm9zUGxhdGZvcm0iLCJ0YXJQYXRoIiwidGFyRmlsZVBhdGgiLCJ3b3JraW5nVGFyUGF0aCIsImlnbm9yZUVwaXBlIiwibG9nVmVsb3BhY2tIb29rIiwiaG9va05hbWUiLCJWZWxvcGFja0FwcCIsIm5ld1N0ZXAiLCJwZW5kaW5nRGVlcExpbmtVcmwiLCJzZXRQZW5kaW5nRGVlcExpbmsiLCJwcm90b2NvbFNlcGFyYXRvckluZGV4IiwiY2xlYXJQZW5kaW5nRGVlcExpbmsiLCJkZWVwTGlua0FyZ3VtZW50IiwiaXNRYVN0YWdpbmdCdWlsZCIsImlzUWFNb2RlRW5hYmxlZEF0TGF1bmNoIiwiaXNDb2xkUWFNb2RlVG9nZ2xlIiwicmVzb2x2ZVFhU3RhcnR1cEFjdGlvbiIsImluaXRpYWxRYVN0YXJ0dXBBY3Rpb24iLCJfX3ZpdGVfaW1wb3J0X21ldGFfZW52X18iLCJvcmRpbmFyeUNvcmVJbml0aWFsaXplZCIsIm9yZGluYXJ5Q3Jhc2hUcmFja2luZ0luaXRpYWxpemVkIiwic2VudHJ5SW5pdGlhbGl6ZWQiLCJvcmRpbmFyeVBhdGhzIiwic2hvdWxkRGlzcGxheUVycm9yRGlhbG9nIiwiaW5pdGlhbGl6ZVNlbnRyeUJlZm9yZVJlYWR5IiwiaW5pdGlhbGl6ZU9yZGluYXJ5Q29yZSIsImluaXRpYWxpemVTaW5nbGVJbnN0YW5jZSIsImluaXRpYWxpemVPcmRpbmFyeUNyYXNoVHJhY2tpbmciLCJfZSIsIl93YyIsInByb21pc2UiLCJ3YXJuaW5nIiwibG9nU2lnbmFsIiwiZ2V0U3lzdGVtUmVwb3J0VXJsIiwiZGV2VXJsIiwib3BlblN5c3RlbVJlcG9ydCIsImZyb20iLCJzeXNyVXJsIiwibWFjSW5zdGFsbFJlc3VsdCIsImdldE1hY0luc3RhbGxFdmVudFByb3BlcnRpZXMiLCJoYW5kbGVNYWNJbnN0YWxsRmFpbHVyZSIsImhhbmRsZU1hY0luc3RhbGxIYW5kb2ZmIiwiZW5zdXJlSW5zdGFsbExvY2F0aW9uQmVmb3JlU3RhcnR1cCIsInN0YXJ0T3JkaW5hcnlCb290c3RyYXAiLCJzdGFydHVwV2luZG93Iiwib2ZmbGluZUVycm9yIiwiYXJlU2hhcmVkVmFyaWFibGVzUmVhZHkiLCJzdGFydENvbXB1dGVQcm9taXNlIiwic3RhcnRIb3N0U2VydmVyUHJvbWlzZSIsIm9yZGluYXJ5Qm9vdHN0cmFwUHJvbWlzZSIsImhhbmRsZUFwcFJlYWR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE1BQU1BLEtBQ0osY0FFV0MsS0FBU0QsT0FBZ0IsZUFDekJFLEtBQWFGLE9BQWdCLFdBQzdCRyxLQUFVSCxPQUFnQixjQ1lqQ0ksS0FBOEMsb0JBQUksSUFBZ0IsRUFBRSxHQUVwRUMsS0FBeURDLEVBQUksYUFXL0QsQ0FBQyxJQVZEO0FBQUEsRUFDRTtBQUFBLElBQ0UsQ0FBQ0MsTUFBbUIsSUFBSSxPQUFPLGlCQUFpQixFQUFFLEtBQUtBLENBQU07QUFBQSxJQUM3REg7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsQ0FBQ0csTUFBbUIsSUFBSSxPQUFPLHdCQUF3QixFQUFFLEtBQUtBLENBQU07QUFBQSxJQUNwRUg7QUFBQSxFQUFBO0FBRUosR0FFRUksS0FDV0YsRUFBSSxhQVFmLENBQUMsSUFQRDtBQUFBLEVBQ0U7QUFBQSxJQUNFLENBQUNDLE1BQ0MsSUFBSSxPQUFPLHFCQUFxQixFQUFFLEtBQUtBLENBQU07QUFBQSxJQUMvQ0g7QUFBQSxFQUFBO0FBRUosR0FFQUssS0FBMEQ7QUFBQSxFQUM5RCxDQUFDRixNQUFtQixJQUFJLE9BQU8sMkJBQTJCLEVBQUUsS0FBS0EsQ0FBTTtBQUFBLEVBQ3ZFSDtBQUNGLEdBQ01NLEtBQXdFO0FB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
