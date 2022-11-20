const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    ready: () => ipcRenderer.send('ready'),
    loadBooks: (callback) => ipcRenderer.on('load-books', callback),
    launchBook: (url) => ipcRenderer.send('launch-book', url)
    // we can also expose variables, not just functions
})
