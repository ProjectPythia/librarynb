const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    ready: () => ipcRenderer.send('ready'),
    onUpdateText: (callback) => ipcRenderer.on('update-text', callback)
})
