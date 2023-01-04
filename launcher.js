const { spawn } = require('node:child_process');
const path = require('path')
var fs = require('fs');
const proc = require('./proc.js')

function parseServerOutput(output) {
    lines = output.trim().split('\n');
    lines.shift()
    let running = []
    for (i in lines) {
	running.push(lines[i].split('::').map(element => element.trim()))
    }
    return running
}

async function getJupyterUrl(fullPath) {
    const lister = spawn(proc.getListScript(),{
	cwd: fullPath,
	shell: proc.getShell()
    })
    lister.stderr.on('data', (data) => {
	console.log(`${data}`)
    });
    let output = ''
    for await (const chunk of lister.stdout) {
	output += chunk;
    }

    output = output.trim();
    exitCode = await proc.endProcess(lister);

    if (exitCode) {
	throw `lister process exited with code ${exitCode}`;
    }
    if (output.length > 1) {
	let running = parseServerOutput(output)
	for (i in running) {
	    if (running[i][1] === fullPath) {
		return running[i][0]
	    }
	}
    }	
}

async function launchBook(fullPath) {
    const launcher = spawn(proc.getLaunchScript(),{
	cwd: fullPath,
	shell: proc.getShell()
    });

    launcher.stderr.on('data', (data) => {
	console.log(`${data}`)
    });

    //let output = '';
    //for await (const chunk of launcher.stdout) {
	//output += chunk
    //} 
    //let pid = parseInt(output.trim())

    //let exitCode = await proc.endProcess(launcher)
    //if (exitCode) {
	//console.log(`launcher process exited with code ${exitCode}`);
    //}

    let jupyterUrl = await getJupyterUrl(fullPath)
    while (! jupyterUrl){
	await new Promise(r => setTimeout(r, 200));
	jupyterUrl = await getJupyterUrl(fullPath)
    }

    return {launcher: launcher,
	    url: jupyterUrl}
}

module.exports = {
    launchBook: launchBook
};
