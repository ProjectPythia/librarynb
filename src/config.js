var fs = require("fs");
const path = require("path");
const { app } = require("electron");


const os = process.platform;
var config = null;

function getConfigPath() {
    return path.join(app.getPath("userData"), "config.json");
}

function validate(config) {
    return true;
}

function createConfig(config) {
    let configPath = getConfigPath();
    let directory = path.dirname(configPath);
    console.log(directory);
    if (! fs.existsSync(directory)){
        console.log("creating directory");
        fs.mkdirSync(directory, { recursive: true });
    }
    fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2));
    return true;
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
    validate: validate,
    createConfig: createConfig
};
