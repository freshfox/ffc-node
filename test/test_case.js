const BaseTestCase = require('../index').BaseTestCase;
const env = require('node-env-file');
const fs = require('fs');

if(fs.existsSync(__dirname + '/../.env')){
	env(__dirname + '/../.env');
}

class TestCase extends BaseTestCase {

}

module.exports = TestCase;



