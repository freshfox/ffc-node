const Bookshelf = require('../../dist').FFCore.Config.Bookshelf;

class Post extends Bookshelf.Model {

	//noinspection JSMethodCanBeStatic
	get tableName() {
		return 'posts';
	}

	//noinspection JSMethodCanBeStatic
	get hasTimestamps() {
		return true;
	}

}

module.exports = Post;
