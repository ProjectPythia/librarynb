const { contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    ready: () => ipcRenderer.send("ready"),
    loadBooks: (callback) => ipcRenderer.on("load-books", callback),
    launchBook: (url) => ipcRenderer.send("launch-book", url),
    openRepo: (url) => ipcRenderer.send("open-repo", url),
    showFolder: (projectDir) => ipcRenderer.send("show-folder", projectDir),
    deleteBook: (projectDir) => ipcRenderer.invoke("delete-book", projectDir)
});
