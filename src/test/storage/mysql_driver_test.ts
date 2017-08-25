import * as should from 'should';
import {entity, property} from '../../app/storage/decorators';
import {KnexConfig, MySQLDriver} from '../../app/storage/mysql_driver';
import {TestCase} from '../../app/test_case';
import {Container} from 'inversify';
import {StorageDriver} from '../../app/core/storage_driver';
import {TYPES} from '../../app/core/types';

@entity('users')
class UserModel {

	@property('json') settings;

	static onSave(attributes) {
		return {
			firstname: attributes.firstname + '_saved'
		};
	}

}

@entity('accounts')
class AccountModel {

	@property('json') settings;

}

@entity('logs')
class LogModel {

}

describe('MysqlDriver', function () {

	let container = new Container();
	container.bind<KnexConfig>(TYPES.KnexConfig).toConstantValue(require('../../../config/database'));
	container.bind<StorageDriver>(TYPES.StorageDriver).to(MySQLDriver).inSingletonScope();

	let driver = container.get<StorageDriver>(TYPES.StorageDriver);
	driver.registerEntity(UserModel);
	driver.registerEntity(AccountModel);
	driver.registerEntity(LogModel);

	let testCase = TestCase.createDatabaseOnly(this, container);

	it('should save a model and call onSave', async () => {

		const user = await driver.save('users', {
			firstname: 'test',
			lastname: 'test',
			email: 'test@test.com',
			password: 'password'
		});

		should(user).property('firstname', 'test_saved');
	});

	it('should save json data', async () => {

		const account = await driver.save('accounts', {
			test: '',
			settings: {
				something: 'hello'
			}
		});
		should(account).eql({
			id: 1,
			test: '',
			settings: {
				something: 'hello'
			}
		});

		const user = await driver.save('users', {
			firstname: 'test',
			lastname: 'test',
			email: 'test@test.com',
			password: 'password',
			settings: {
				something: 'hello'
			}
		});
		should(user).properties({
			settings: {
				something: 'hello'
			}
		});
	});

	it.skip('should save a model without a primary key but an attribute called id', async () => {

		const log = await driver.save('logs', {
			id: 1,
			text: 'test',
		});

		should(log).properties({
			id: 1,
			text: 'test'
		});

	});

});
