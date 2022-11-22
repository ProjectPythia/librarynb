const path = require('path')
var fs = require('fs');
const { BrowserWindow } = require('electron')
const { ipcMain, dialog } = require('electron')
const { createBook } = require('./environment.js')
const { launchBook } = require('./launcher.js')
const proc = require('./proc.js')
const { loadBooks } = require('./book.js')
const { validate, createConfig, getConfig} = require('./config.js');

const config = getConfig()

if(config) {
    var repoDir = config.repoDir;
}

async function createJupyterWindow (url) {
    url = new URL(url);
    repoPath = path.join(url.hostname,  url.pathname);
    const fullPath = path.join(repoDir, repoPath);
    
    let jupyterWindow = new BrowserWindow({
	width: 800,
	height: 450,
	show: false,
	title: "LibraryNB",
	autoHideMenuBar: true,
    });
    
    if (! fs.existsSync(fullPath)) {
	let win = new BrowserWindow({
	    width: 800,
	    height: 450,
	    webPreferences: {
		preload: path.join(__dirname, 'preload', 'environment.js')
	    },
	    show: false,
	    autoHideMenuBar: true,
	});
	win.on('close', () => {
	    win = null;
	});
	win.loadFile(path.join(__dirname, 'static', 'html', 'environment.html'));
	await new Promise((resolve, reject) => {
	    ipcMain.on('ready', resolve);
	});
	win.show()
	
	let bookCreated = await createBook(win, repoPath);
	if (! bookCreated) {
	    throw 'unable to create book';
	}
	win.close()
    }
    jupyterWindow.maximize()
    jupyterWindow.show()
    const jupyter = await launchBook(fullPath)
    jupyterWindow.loadURL(jupyter.url)    
    jupyterWindow.on('close', function(){
	process.kill(jupyter.pid)
	jupyterWindow = null
    }); 
}

async function createLauncherWindow() {
    let win = new BrowserWindow({
	width: 800,
	height: 450,
	webPreferences: {
	    preload: path.join(__dirname, 'preload', 'launcher.js')
	},
	autoHideMenuBar: true,
    });

    win.on('close', () => {
	win = null;
    });
    
    win.loadFile(path.join(__dirname, 'static', 'html', 'launcher.html'));
    
    ipcMain.on('ready', () => {
	books = loadBooks(path.join(repoDir))
	win.webContents.send('load-books', books)
    });

    ipcMain.on('launch-book', (event, url) => {
	createJupyterWindow(url)
    });
}

function createSetupWindow() {
    let win = new BrowserWindow({
	width: 800,
	height: 450,
	webPreferences: {
	    preload: path.join(__dirname, 'preload', 'setup.js')
	}
    });
    win.on('close', () => {
	win = null;
    });

    ipcMain.on('save', (event, config) => {
	if (validate(config)) {
	    createConfig(config);
	    win.close();
	} else {
	    throw "Invalid Config"
	}
    });

    ipcMain.handle('dialog:selectDir', async () => {
	const { canceled, filePaths } = await dialog.showOpenDialog(win, {
	    properties: ['openDirectory']
	})
	if (canceled) {
	    return
	} else {
	    return filePaths[0]
	}
    })

    win.loadFile(path.join(__dirname, 'static', 'html', 'setup.html'));
}
module.exports = {
    createLauncherWindow: createLauncherWindow,
    createJupyterWindow: createJupyterWindow,
    createSetupWindow: createSetupWindow
}
