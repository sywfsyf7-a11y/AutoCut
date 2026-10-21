const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");

let mainWindow = null;
let apiProcess = null;
const API_PORT = 18765;
const API_URL = `http://127.0.0.1:${API_PORT}`;

function apiReady(timeoutMs = 1200) {
  return new Promise((resolve) => {
    const req = http.get(API_URL + "/health", (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.setTimeout(timeoutMs, () => { req.destroy(); resolve(false); });
    req.on("error", () => resolve(false));
  });
}

async function startBackend() {
  const sidecar = app.isPackaged
    ? path.join(process.resourcesPath, "OpenCutAPI.exe")
    : path.join(__dirname, "sidecar", "OpenCutAPI.exe");
  if (!fs.existsSync(sidecar)) return false;

  apiProcess = spawn(sidecar, [], {
    windowsHide: true,
    stdio: "ignore",
    env: {
      ...process.env,
      OPENCUT_PORT: String(API_PORT),
      OPENCUT_CORS_ORIGINS: "null,http://localhost:3000,http://127.0.0.1:3000"
    }
  });
  apiProcess.on("error", () => { apiProcess = null; });
  const until = Date.now() + 15000;
  while (Date.now() < until) {
    if (await apiReady()) return true;
    if (!apiProcess || apiProcess.exitCode !== null) return false;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 960,
    minWidth: 900,
    minHeight: 640,
    title: "OpenCut Studio",
    backgroundColor: "#0c1018",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  await startBackend();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("before-quit", () => {
  if (apiProcess && !apiProcess.killed) apiProcess.kill();
});
