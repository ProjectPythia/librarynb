const { displayOut, displayErr, endProcess, getEnvScript, getShell } = require('./proc.js')
const path = require('path')
var fs = require('fs');
const config = require('./config.js').getConfig();
const { spawn } = require('node:child_process');
const repoDir = config.repoDir

function cloneBook(url, parent) {
    if (! parent){
	parent = __dirname;
    }
    return spawn("git", ['clone', url], {
	cwd: parent,
    });
}


function removeBookDir(bookDir) {
    if (fs.existsSync(bookDir)){
	fs.rmdirSync(bookDir, { recursive: true });
	return true;
    }
    return false;
}

function createAccountDir(accountDir) {
    if (! fs.existsSync(accountDir)){
	fs.mkdirSync(accountDir, { recursive: true });
	return true;
    }
    return false;
}

function removeAccountDir(accountDir) {
    if (fs.existsSync(accountDir)){
	fs.rmdirSync(accountDir, { recursive: true });
	return true;
    }
    return false;
}

async function createBook(win, url) {
    let repoPath = path.join(url.hostname,  url.pathname);
    let directoryCreated = false;
    const accountDir = path.join(repoDir, path.dirname(repoPath));
    const fullPath = path.join(repoDir, repoPath);
    const repoName = path.basename(repoPath);
    const gitUrl = "https://" + url.hostname + url.pathname + ".git";
    
    //Warning user input to child process argument
    win.webContents.send('update-text', "Creating Project...(This might take a few minutes)");
    directoryCreated = createAccountDir(accountDir);
    cloner = cloneBook(gitUrl, accountDir);
    displayOut(win, cloner);
    displayErr(win, cloner);
    let exitCode = await endProcess(cloner)
    if (exitCode) {
	    win.webContents.send('update-text', "Err: Could not clone book")
	if (directoryCreated) {
	    removeAccountDir(accountDir);
	}
	return false;
    }
    console.log(fullPath);
    win.webContents.send('update-text', 'Book cloned\n');
    win.webContents.send('update-text', 'Creating environement...\n');
    console.log(getEnvScript()); 
    const creator = spawn(getEnvScript(), {
	cwd: fullPath,
	shell: getShell()
    });
    
    displayOut(win, creator)
    displayErr(win, creator).
    exitCode = await endProcess(creator);
    if (exitCode) {
	win.webContents.send('update-text', "Err: Unable to create environment")
	removeBookDir(fullPath)
	return false
    }
    return true;
}

module.exports = {
    createBook: createBook
}
