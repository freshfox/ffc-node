const env = require('node-env-file');
const fs = require('fs');

const path = __dirname + '/../.env';
if(fs.existsSync(path)){
	env(path);
}

// when you require the config dir this will return
// a neat appropriate env config object
module.exports = require('cnfg')(__dirname);
