const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("openCutDesktop", Object.freeze({
  isDesktop: true,
  platform: process.platform
}));
