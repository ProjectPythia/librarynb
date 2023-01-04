const proc = require("./proc.js");
const config = require("./config.js").getConfig();
const { spawn } = require("node:child_process");
const repoDir = config.repoDir;
const glob = require("glob");
const YAML = require("yaml");
const path = require("path");
const fs = require("fs");
const os = process.platform;

// Functions for loading books into the library
function getLaunchUrl(projectDir) {
    let launchUrl = projectDir.replace(repoDir, "");
    return launchUrl;
}

function bookFromConfig(config, projectDir) {
    let thumbnail = false;
    if ("thumbnail" in config) {
        thumbnail = path.join(projectDir, config.thumbnail);
    }
    
    let title = "Unknown";
    if("title" in config) {
        title = config.title;
    }

    let author = "Unknown";
    if("author" in config) {
        author = config.author;
    }

    let email = "Unknown";
    if("email" in config) {
        email = config.email;
    }

    let copyright = "Unknown";
    if("copyright" in config) {
        copyright = config.copyright;
    }

    let description = "Unknown";
    if("description" in config) {
        description = config.description;
    }

    let logoPath = false;
    if ("logo" in config) {
        logoPath = path.join(projectDir, config.logo);
    }

    return {
        title: title,
        author: author,
        email: email,
        copyright: copyright,
        description: description,
        logoPath: logoPath,
        thumbnailPath: thumbnail,
        projectDir: projectDir,
        launchUrl: getLaunchUrl(projectDir)
    };
}

function loadBooks() {
    let books = [];
    let globPath = ''
    if (os === 'win32') { //Glob only uses posix paths
		let prefix = path.normalize(repoDir).replaceAll("\\", "/").substring(2);
		globPath = path.posix.join(prefix, '*', '*', '*');
	} else {
		globPath = path.join(repoDir, '*', '*', '*');
	}
    const projectDirs = glob.sync(globPath);
    for (let i in projectDirs) {
        let configFile = fs.readFileSync(path.join(projectDirs[i], "_config.yml"), "utf8");
        const config = YAML.parse(configFile);
        books.push(bookFromConfig(config, projectDirs[i]));
        fs.closeSync(configFile);
    }
    return books;
}

function removeBookDir(bookDir) {
    if (fs.existsSync(bookDir)) {
        fs.rmSync(bookDir, { recursive: true });
        return true;
    }
    return false;
}

async function removeBook(projectDir) {
    if(fs.existsSync(path.join(projectDir, "env"))) {
        const remover = spawn(proc.getRemoveScript(), {
            cwd: projectDir,
            shell: proc.getShell()
        });
        let exitCode = await proc.endProcess(remover);
        if (exitCode) {
            return false;
        }
    }
    removeBookDir(projectDir);
    return true;
}


// Functions for creating conda environments for the books to run in

function cloneBook(url, parent) {
    if (!parent) {
        parent = __dirname;
    }
    return spawn("git", ["clone", url], {
        cwd: parent,
    });
}

function createAccountDir(accountDir) {
    if (!fs.existsSync(accountDir)) {
        fs.mkdirSync(accountDir, { recursive: true });
        return true;
    }
    return false;
}

function removeAccountDir(accountDir) {
    if (fs.existsSync(accountDir)) {
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
    const gitUrl = "https://" + url.hostname + url.pathname + ".git";

    //Warning user input to child process argument
    win.webContents.send("update-text", "Creating Project...(This might take a few minutes)");
    directoryCreated = createAccountDir(accountDir);

    let cloner = cloneBook(gitUrl, accountDir);
    proc.displayOut(win, cloner);
    proc.displayErr(win, cloner);
    let exitCode = await proc.endProcess(cloner);
    if (exitCode) {
        win.webContents.send("update-text", "Err: Could not clone book");
        if (directoryCreated) {
            removeAccountDir(accountDir);
        }
        return false;
    }

    win.webContents.send("update-text", "Book cloned\n");
    win.webContents.send("update-text", "Creating environement...\n");
    const creator = spawn(proc.getEnvScript(), {
        cwd: fullPath,
        shell: proc.getShell()
    });

    proc.displayOut(win, creator);
    proc.displayErr(win, creator);
    exitCode = await proc.endProcess(creator);
    if (exitCode) {
        win.webContents.send("update-text", "Err: Unable to create environment");
        removeBookDir(fullPath);
        return false;
    }
    return true;
}





//Functions for starting jupyter server
function parseServerOutput(output) {
    let lines = output.trim().split("\n");
    lines.shift();
    let running = [];
    for (let i in lines) {
        running.push(lines[i].split("::").map(element => element.trim()));
    }
    return running;
}

async function getJupyterUrl(fullPath) {
    const lister = spawn(proc.getListScript(), {
        cwd: fullPath,
        shell: proc.getShell()
    });
    let output = "";
    for await (const chunk of lister.stdout) {
        output += chunk;
    }

    output = output.trim();
    let exitCode = await proc.endProcess(lister);
    if (exitCode) {
        throw `lister process exited with code ${exitCode}`;
    }
    if (output.length > 1) {
        let running = parseServerOutput(output);
        for (let i in running) {
            if (running[i][1] === fullPath) {
                return running[i][0];
            }
        }
    }
}

async function launchBook(fullPath) {
    const server = spawn(proc.getLaunchScript(), {
        cwd: fullPath,
        shell: proc.getShell()
    });

    //let output = "";
    //for await (const chunk of launcher.stdout) {
        //output += chunk;
    //}
    //let pid = parseInt(output.trim());

    //let exitCode = await proc.endProcess(launcher);
    //if (exitCode) {
        //throw `launcher process exited with code ${exitCode}`;
    //}
    
    let jupyterUrl = await getJupyterUrl(fullPath);
    while (!jupyterUrl) {
        await new Promise(r => setTimeout(r, 200));
        jupyterUrl = await getJupyterUrl(fullPath);
    }

    return {
        server: server,
        url: jupyterUrl
    };
}


module.exports = {
    loadBooks: loadBooks,
    createBook: createBook,
    launchBook: launchBook,
    removeBook: removeBook
};
