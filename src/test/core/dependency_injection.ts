import {EventEmitter} from 'events';
import {Container, decorate, injectable} from 'inversify';
import {BaseRepository} from '../../app/base_repository';
import {FFCore} from '../../app/index';
import * as should from 'should';

describe('Dependency Injection', () => {

	it('should inject a dependency', () => {

		class User extends FFCore.Bookshelf.Model {

			//noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
			get tableName() {
				return 'users';
			}

			//noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
			get hasTimestamps() {
				return true;
			}
		}

		class UserRepository extends BaseRepository<any> {

			constructor() {
				super(User);
			}

		}

		let container = new Container();

		decorate(injectable(), EventEmitter);

		container.bind(UserRepository).toSelf();

		let test = container.get(UserRepository);
		should(test).instanceOf(UserRepository);

	});

});
