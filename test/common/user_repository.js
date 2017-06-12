const BaseRepository = require('../../index').BaseRepository;
const User = require("./user_model");

class UserRepository extends BaseRepository {

	constructor() {
		super(User);
	}

}

module.exports = new UserRepository();
