const Bookshelf = require('../../dist').FFCore.Config.Bookshelf;

class Post extends Bookshelf.Model {

	//noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
	get tableName() {
		return 'posts';
	}

	//noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
	get hasTimestamps() {
		return true;
	}

}

module.exports = Post;
