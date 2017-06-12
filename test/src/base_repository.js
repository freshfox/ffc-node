const TestCase = require('../test_case');
const BaseRepository = require('../../index').BaseRepository;

const userRepo = new BaseRepository(require('../common/user_model'));

describe('BaseRepository', function () {

	TestCase.init(this, false, true);

	it('should run', () => {

	});

});
