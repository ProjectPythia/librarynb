var fs = require('fs');
const path = require('path')

const home = process.env.HOME
const os = process.platform

function getConfigPath() {
    if (os === 'linux') {
	return path.join(home, '.config', 'LibraryNB', 'config.json')
    } else {
	throw "Coming soon to other operating systems";
    }
}

const configFile = fs.readFileSync(getConfigPath());
const config = JSON.parse(configFile);


condaPrefix = config.condaPrefix
condaCommand = config.condaCommand
const linuxMambaSetupScript = `
__conda_setup="\$('${condaPrefix}/bin/conda' 'shell.bash' 'hook' 2> /dev/null)"
if [ \$? -eq 0 ]; then
    eval "\$__conda_setup"
else
    if [ -f "${condaPrefix}/etc/profile.d/conda.sh" ]; then
        . "${condaPrefix}/etc/profile.d/conda.sh"
    else
        export PATH="${condaPrefix}/bin:$PATH"
    fi
fi
unset __conda_setup

if [ -f "${condaPrefix}/etc/profile.d/mamba.sh" ]; then
    . "${condaPrefix}/etc/profile.d/mamba.sh"
fi
`
const linuxLaunchScript = `
${condaCommand} activate ./env
nohup jupyter lab --no-browser >> /dev/null 2>&1 &
echo \$!`

const linuxListScript = `
${condaCommand} activate nblaunch-dev
jupyter lab list
${condaCommand} deactivate`

function displayOut(win, process) {
    process.stdout.on('data', (data) => {
	win.webContents.send('update-text', `${data}`)
    });
    return process;
}

function displayErr(win, process) {
    process.stderr.on('data', (data) => {
	win.webContents.send('update-text', `${data}`)
    });
    return process;
}

function endProcess(process){
    return new Promise((resolve, reject) => {
	process.on('close', resolve);
    });
}

function getShell() {
    if (os === 'linux'){
	return "/bin/bash";
    } else {
	throw "Coming soon to other operating systems";
    }
}

function getLaunchScript() {
    if (os === 'linux') {
	return linuxMambaSetupScript + linuxLaunchScript;
    } else {
	throw "Coming soon to other operating systems";
    }
}

function getListScript() {
    if (os === 'linux') {
	return linuxMambaSetupScript + linuxListScript;
    } else {
	throw "Coming soon to other operating systems";
    }
}

module.exports = {
    displayOut: displayOut,
    displayErr: displayErr,
    endProcess: endProcess,
    getShell: getShell,
    getListScript: getListScript,
    getLaunchScript: getLaunchScript,
    config: config
}
