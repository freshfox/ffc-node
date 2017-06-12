const Bookshelf = require('../../dist').FFCore.Config.Bookshelf;

class User extends Bookshelf.Model {

	//noinspection JSMethodCanBeStatic
	get tableName() {
		return 'users';
	}

	//noinspection JSMethodCanBeStatic
	get hasTimestamps() {
		return true;
	}

}

module.exports = User;
