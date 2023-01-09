const { app, BrowserWindow } = require("electron");
const { createLibraryWindow, createJupyterWindow, createSetupWindow } = require("./src/windows.js");
const config = require("./src/config.js").getConfig();
const { registerProtocol } = require("./src/protocol.js");

if (require('electron-squirrel-startup')) {
    app.quit();
}

app.whenReady().then(() => {
    if(! config) {
        createSetupWindow();
        registerProtocol();
    }
    else if(process.argv[1]) {
        createJupyterWindow(process.argv[1]);
    } else {
        console.log(app.getPath("userData"));
        createLibraryWindow();
    }

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createLibraryWindow();
        }
    });
});


//shutdown code
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});


