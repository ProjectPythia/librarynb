const path = require('path')
var fs = require('fs');
const { BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const { createBook } = require('./environment.js')
const { launchBook } = require('./launcher.js')
const { dialog } = require('electron')
const proc = require('./proc.js')
const repoDir = proc.config.repoDir

async function createJupyterWindow (url) {
    url = new URL(url);
    repoPath = path.join(url.hostname,  url.pathname);
    const fullPath = path.join(repoDir, repoPath);
    console.log(fullPath)
    
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
		preload: path.join(__dirname, 'preload', 'environment.js'),
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
	    preload: path.join(__dirname, 'launchPreload.js'),
	},
	autoHideMenuBar: true,
    });

    win.on('close', () => {
	win = null;
    });
    
    win.loadFile('static/html/launcher.html');
    
    ipcMain.on('ready', () => {
	books = loadBooks(path.join(repoDir))
	win.webContents.send('load-books', books)
    });

    ipcMain.on('launch-book', (event, url) => {
	createJupyterWindow(url)
    });
}

module.exports = {
    createLauncherWindow: createLauncherWindow,
    createJupyterWindow: createJupyterWindow
}
