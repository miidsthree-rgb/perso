const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),
  exportData: (dataString, filename) => ipcRenderer.invoke('export-data', dataString, filename)
});
