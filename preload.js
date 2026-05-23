const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getData: () => ipcRenderer.invoke('get-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  updateTray: (text) => ipcRenderer.invoke('update-tray', text),
});
