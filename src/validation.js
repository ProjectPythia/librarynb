const protocolPrefix = require('./protocol.js').protocolPrefix
const supportedHosts = new Set(["github.com"])

function validateURL(url) {
    [host, account, book] = (url.hostname + url.pathname).split("/")
    if(host && account && book &&
        supportedHosts.has('host'))
}

function isWhiteListed(url) {

}