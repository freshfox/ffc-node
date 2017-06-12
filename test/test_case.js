const BaseTestCase = require('../src/base_test_case');
const env = require('node-env-file');
const fs = require('fs');

if(fs.existsSync(__dirname + '/../.env')){
	env(__dirname + '/../.env');
}

class TestCase extends BaseTestCase {

	static getConfig() {
		return require('../config/database')
	}

}

module.exports = TestCase;



