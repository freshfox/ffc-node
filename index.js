const BaseRepository = require('./src/base_repository');
const BaseTestCase = require('./src/base_test_case');

class FFCore {

	static configure(config) {
		let knex = require('knex')(config.database);
		let cascadeDelete = require('bookshelf-cascade-delete');
		let bookshelf = require('bookshelf')(knex);

		bookshelf.plugin(cascadeDelete);

		FFCore.Config = BaseTestCase.Config = config;
		BaseRepository.Bookshelf = FFCore.Config.Bookshelf = bookshelf;
	}

}

FFCore.BaseRepository = BaseRepository;
FFCore.WebError = require('./src/error');
FFCore.BaseTestCase = BaseTestCase;

module.exports = FFCore;
