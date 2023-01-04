const path = require("path");
var fs = require("fs");
const { BrowserWindow } = require("electron");
const { ipcMain, dialog } = require("electron");
const { loadBooks, createBook, launchBook, removeBook } = require("./book.js");
const { validate, createConfig, getConfig} = require("./config.js");
const { shell } =  require("electron");
const config = getConfig();

if(config) {
    var repoDir = config.repoDir;
}

async function createJupyterWindow (url) {
    url = new URL(url);
    let repoPath = path.join(url.hostname,  url.pathname);
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
                preload: path.join(__dirname, "preload", "environment.js")
            },
            show: false,
            autoHideMenuBar: true,
        });
        win.on("close", () => {
            win = null;
        });
        
        win.loadFile(path.join(__dirname, "static", "html", "environment.html"));
        await new Promise((resolve) => {
            ipcMain.on("ready", resolve);
        });
        win.show();
	
        let bookCreated = await createBook(win, url);
        if (! bookCreated) {
            throw "unable to create book";
        }
        win.close();
    }
    jupyterWindow.maximize();
    jupyterWindow.show();
    const jupyter = await launchBook(fullPath);
    jupyterWindow.loadURL(jupyter.url);    
    jupyterWindow.on("close", function(){
        jupyter.server.kill()
        jupyterWindow = null;
    }); 
}

async function createLibraryWindow() {
    let win = new BrowserWindow({
        width: 1060,
        height: 350,
        webPreferences: {
            preload: path.join(__dirname, "preload", "library.js")
        },
        autoHideMenuBar: true,
    });

    win.on("close", () => {
        win = null;
    });
    
    win.loadFile(path.join(__dirname, "static", "html", "library.html"));

    win.webContents.setWindowOpenHandler(function({ url }) {
        shell.openExternal(url);
        return { action: "deny" };
    });

    ipcMain.on("open-repo", (e, url) => {
        shell.openExternal(url);
    });

    ipcMain.on("show-folder", (e, projectDir) => {
        shell.openPath(projectDir);
    });

    ipcMain.handle("delete-book", async (e, projectDir) => {
        const answer = await dialog.showMessageBox(win, {
            "type": "question",
            "title": "Confirmation",
            "message": "Are you sure you want to delete this book? All Changes will be lost.",
            "buttons": [
                "Yes",
                "No"
            ]
        });
        // Bail if the user pressed "No" or escaped (ESC) from the dialog box
        if (answer.response !== 0) {
            return false;
        }
        // Testing.
        if (answer.response === 0) {
            const result = await removeBook(projectDir);
            return result;
        }
        
    });
    
    ipcMain.on("ready", () => {
        let books = loadBooks(path.join(repoDir));
        win.webContents.send("load-books", books);
    });

    ipcMain.on("launch-book", (event, url) => {
        createJupyterWindow(url);
    });
}

function createSetupWindow() {
    let win = new BrowserWindow({
        width: 800,
        height: 450,
        webPreferences: {
            preload: path.join(__dirname, "preload", "setup.js")
        }
    });
    win.on("close", () => {
        win = null;
    });

    ipcMain.on("save", (event, config) => {
        let results = createConfig(config)
	    if (results.success){
	    	win.close();
		} else {
			win.webContents.send('display-errors', results.errors);
		}
    });

    ipcMain.handle("dialog:selectDir", async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(win, {
            properties: ["openDirectory"]
        });
        if (canceled) {
            return;
        } else {
            return filePaths[0];
        }
    });

    win.loadFile(path.join(__dirname, "static", "html", "setup.html"));
}
module.exports = {
    createLibraryWindow: createLibraryWindow,
    createJupyterWindow: createJupyterWindow,
    createSetupWindow: createSetupWindow
};

