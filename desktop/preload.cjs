const { contextBridge, app } = require("electron");

contextBridge.exposeInMainWorld("openCutDesktop", Object.freeze({
  isDesktop: true,
  version: app.getVersion(),
  platform: process.platform
}));
