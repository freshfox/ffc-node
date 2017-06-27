import {BaseRepository} from '../../app/base_repository';
import {FFCore} from '../../app/index';

describe('UserRepository', () => {

	it('should test something', () => {

		let core = FFCore;

		class User extends FFCore.Bookshelf.Model {

		}

		class UserRepo extends BaseRepository<any> {

			constructor() {
				super(User);
			}

		}

		console.log(new UserRepo());

	});

});
