const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const { createLauncherWindow, createJupyterWindow } = require('./windows.js')
const { dialog } = require('electron')

app.whenReady().then(() => {
    if (process.argv[1]) {
	createJupyterWindow(process.argv[1]);
    } else {
	createLauncherWindow();
    }

    app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
	    createWindow();
	}
    });
})


//shutdown code
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})


