const Bookshelf = require('../../index').Config.Bookshelf;

class User extends Bookshelf.Model{

	get tableName() {
		return 'users';
	}

	get hasTimestamps() {
		return true;
	}

}

module.exports = User;
