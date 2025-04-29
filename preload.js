const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI',
  {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-restore-window'),
    close: () => ipcRenderer.send('close-window'),
    onWindowBlur: (callback) => ipcRenderer.on('window-blur', (event) => callback(event)),
    onWindowFocus: (callback) => ipcRenderer.on('window-focus', (event) => callback(event)),

    onWindowMaximizeChange: (callback) => ipcRenderer.on('window-maximized', (_, isMaximized) => callback(isMaximized)),
    onWebviewWindowAttempt: (callback) => ipcRenderer.on('new-window-from-webview', (event, url) => callback(url)),
    openExternal: (url) => shell.openExternal(url),

    getPageInfo: (url) => ipcRenderer.invoke('get-page-info', url),

    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_, progress) => callback(progress)),
  }
);