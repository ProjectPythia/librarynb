const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    selectDir: () => ipcRenderer.invoke('dialog:selectDir'),
    save: (config) => ipcRenderer.send('save', config),
});
