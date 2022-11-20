const glob = require('glob');
const YAML = require('yaml');
const path = require('path');
const fs = require("fs");
protocol = "nblaunch"

function getLaunchUrl(launchRepoDir, projectDir) {
    launchUrl = protocol + ":/" + projectDir.replace(launchRepoDir, "")
    return launchUrl
}

function loadBooks (launchRepoDir) {
    books = [];
    const projectDirs = glob.sync(path.join(launchRepoDir, "*", "*", "*"))
    for (let i in projectDirs) {
	configFile = fs.readFileSync(path.join(projectDirs[i], "_config.yml"), 'utf8');
	config = YAML.parse(configFile)
	let thumbnail = ''
	if (! ('thumbnail' in config)) {
	    thumbnail = false;
	} else {
	    thumbnail = path.join(projectDirs[i], config.thumbnail)
	}
	books.push({
	    title: config.title,
	    author: config.author,
	    thumbnail: thumbnail,
	    projectDir: projectDirs[i],
	    launchUrl: getLaunchUrl(launchRepoDir, projectDirs[i]) 
	})
    }
    return books
}


module.exports = {
    loadBooks: loadBooks
};
