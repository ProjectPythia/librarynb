const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    selectDir: () => ipcRenderer.invoke('dialog:selectDir'),
    save: (config) => ipcRenderer.send('save', config),
    onDisplayErrors: (callback) => ipcRenderer.on('display-errors', callback)
});
