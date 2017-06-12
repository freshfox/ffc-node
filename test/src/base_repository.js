const should = require('should');
const TestCase = require('../test_case');
const BaseRepository = require('../../dist').BaseRepository;

const userRepo = new BaseRepository(require('../common/user_model'));

describe('BaseRepository', function () {

	TestCase.init(this, false, true);

	it('should save model', () => {

		let data = {
			firstname: 'Max',
			lastname: 'Pattern',
			password: 'password',
			email: 'max@pattern.com'
		};

		return userRepo.save(data)
			.then((user) => {
				return userRepo.findById(user.id)
			})
			.then((user) => {
				should(user).property('firstname', data.firstname);
				should(user).property('lastname', data.lastname);
				should(user).property('email', data.email);
				should(user).property('password', data.password);
				should(user).property('created_at');
				should(user).property('updated_at');
			});

	});

	it('should save multiple models and list them', () => {

		let data = (i) => {
			return {
				firstname: 'Max',
				lastname: 'Pattern',
				password: 'password',
				email: `max_${i}@pattern.com`
			};
		};

		return Promise.all([
			userRepo.save(data(0)),
			userRepo.save(data(1)),
			userRepo.save(data(2)),
		])
			.then(() => {
				return userRepo.list();
			})
			.then((users) => {
				should(users).property('length', 3);
			})
	});

});
