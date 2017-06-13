const Bookshelf = require('../../dist').FFCore.Config.Bookshelf;
const Post = require('./post_model');

class User extends Bookshelf.Model {

	//noinspection JSMethodCanBeStatic
	get tableName() {
		return 'users';
	}

	//noinspection JSMethodCanBeStatic
	get hasTimestamps() {
		return true;
	}

	posts () {
		return this.hasMany(Post);
	}

	static get load() {
		return ['posts'];
	}

}

module.exports = User;
