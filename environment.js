const { displayOut, displayErr, endProcess } = require('./proc.js')
const path = require('path')
var fs = require('fs');
const { spawn } = require('node:child_process');
const repoDir = process.env.LIBRARYNB_DIR
const conda_prefix = process.env.CONDA_PREFIX

function cloneBook(url, parent) {
    if (! parent){
	parent = __dirname;
    }
    return spawn("git", ['clone', url], {
	cwd: parent,
    });
}

function removeEnvironment(parentDir) {
    return spawn(path.join(__dirname, "shell", 'remove'), [conda_prefix], {
	cwd: parentDir,
    })
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

async function createBook(win, repoPath) {
    let directoryCreated = false;
    const accountDir = path.join(repoDir, repoPath.substring(0, repoPath.lastIndexOf("/")));
    const fullPath = path.join(repoDir, repoPath);
    const repoName = path.basename(repoPath);
    const gitUrl = "https://" + repoPath + '.git';
    
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
    
    win.webContents.send('update-text', 'Book cloned\n');
    win.webContents.send('update-text', 'Creating environement...\n');

    const creator = spawn('mamba', ['env', 'create', '--prefix', './env', '-f', 'environment.yml'], {
	cwd: fullPath,
    })
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
