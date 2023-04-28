const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipcRenderer", {
  invoke: (chanel, ...datas) => ipcRenderer.invoke(chanel, ...datas),
  once: (chanel, listener) => ipcRenderer.once(chanel, listener),
  on: (chanel, listener) => ipcRenderer.on(chanel, listener),
});
