const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('comic4lifeDesktop', {
  isElectron: true,
  platform: process.platform,
  setTitle: (title) => ipcRenderer.invoke('app:setTitle', title),
  quit: () => ipcRenderer.invoke('app:quit'),
  getVersion: () => ipcRenderer.invoke('app:version'),
});
