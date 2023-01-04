var fs = require('fs');
const path = require('path')
const { app } = require('electron')
const supportedCondaProgarams = new Set(["mamba", "conda"]);

const os = process.platform
var config = null;

function getConfigPath() {
    return path.join(app.getPath('userData'), 'config.json')
}

function validate(config) {
    let errors = []
    if (errors.length === 0){
        return {success: true};
    } else {
        return {success: false, errors: errors};
    }
}

function writeConfig(config) {
    let results = validate(config)
    if (!results.success) {
        return results
    }
    try {
        fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2))
    } catch (error) {
        throw `Unable to write to config file: ${error}`
    }
    return results;
}

function createConfig(config) {
    if (!configExists()) {
        let configPath = getConfigPath()
        let directory = path.dirname(configPath)
        if (! fs.existsSync(directory)){
	        if (!fs.mkdirSync(directory, { recursive: true })) {
                throw "Config directory does not exist and unable to create it"
            }
        }
    }
    return writeConfig(config)
}

function addToWhiteList(url) {
    if (!url || typeof url != "string") {
        throw "url must be a string";
    }
    let config = getConfig();
    if (! whiteList in config){
        config.whiteList = [url];
    } else {
        config.whiteList.push(url)
    }
    writeConfig(config)
    return true
}

function configExists() {
    if(fs.existsSync(getConfigPath())) {
	return true;
    } else {
	return false;
    }
}
	
function getConfig() {
    if (config) {
	return config;
    } else if(configExists()){
	let configFile = fs.readFileSync(getConfigPath());
	config = JSON.parse(configFile);
	return config;
    } else {
	return false;
    }
}

module.exports = {
    getConfig: getConfig,
    createConfig: createConfig
}
