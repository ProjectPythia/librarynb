const { exec } = require("node:child_process");
const { app } = require("electron");

const protocolPrefix = "librarynb";
const os = process.platform;

function registerProtocol() {
    if(os === "linux") {
        exec(`xdg-mime default ${protocolPrefix}.desktop x-scheme-handler/${protocolPrefix}`);
    }
    app.setAsDefaultProtocolClient("librarynb");
}

module.exports = {
    registerProtocol: registerProtocol
};
