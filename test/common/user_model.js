const Bookshelf = require('../../dist').FFCore.Config.Bookshelf;
const Post = require('./post_model');

class User extends Bookshelf.Model {

	//noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
	get tableName() {
		return 'users';
	}

	//noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
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
