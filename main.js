const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const { createLauncherWindow, createJupyterWindow, createSetupWindow } = require('./windows.js')
const config = require('./config.js').getConfig()
const { dialog } = require('electron')
const { registerProtocol } = require('./protocol.js');

if (require('electron-squirrel-startup')) return;

app.whenReady().then(() => {
    if(! config) {
	createSetupWindow();
	registerProtocol()
    }
    else if(process.argv[1]) {
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
    if (process.platform !== 'darwin') app.quit();
})


