const glob = require('glob');
const YAML = require('yaml');
const path = require('path');
const fs = require("fs");
const config = require('./config').getConfig()
const os = process.platform;

if(config) {
    var repoDir = config.repoDir;
}
protocol = "librarynb"

function getLaunchUrl(projectDir) {
    let launchUrl = protocol + ":/" + projectDir.replace(repoDir, "")
    return launchUrl
}

function loadBooks () {
	let books = []
	let globPath = ''
    if (os === 'win32') { //Glob only uses posix paths
		let prefix = path.normalize(repoDir).replaceAll("\\", "/").substring(2);
		globPath = path.posix.join(prefix, '*', '*', '*')
	} else {
		globPath = path.join(repoDir, '*', '*', '*')
	}
	console.log(globPath)
    const projectDirs = glob.sync(globPath)
	console.log(projectDirs)
    for (let i in projectDirs) {
	configFile = fs.readFileSync(path.join(projectDirs[i], "_config.yml"), 'utf8');
	bookConfig = YAML.parse(configFile)
	let thumbnail = ''
	if (! ('thumbnail' in bookConfig)) {
	    thumbnail = false;
	} else {
	    thumbnail = path.join(projectDirs[i], bookConfig.thumbnail)
	}
	console.log(thumbnail)
	books.push({
	    title: bookConfig.title,
	    author: bookConfig.author,
	    thumbnail: thumbnail,
	    projectDir: projectDirs[i],
	    launchUrl: getLaunchUrl(projectDirs[i]) 
	})
    }
    return books
}


module.exports = {
    loadBooks: loadBooks
};
