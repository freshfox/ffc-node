import * as should from 'should';
import {entity} from '../../app/storage/decorators';
import {KnexConfig, MySQLDriver} from '../../app/storage/mysql_driver';
import {TestCase} from '../../app/test_case';
import {Container} from 'inversify';
import {StorageDriver} from '../../app/core/storage_driver';
import {TYPES} from '../../app/core/types';

@entity('users')
class UserModel {

	static onSave(attributes) {
		attributes.firstname += '_saved';
	}

}

describe('MysqlDriver', function () {

	let container = new Container();
	container.bind<KnexConfig>(TYPES.KnexConfig).toConstantValue(require('../../../config/database'));
	container.bind<StorageDriver>(TYPES.StorageDriver).to(MySQLDriver).inSingletonScope();

	let driver = container.get<StorageDriver>(TYPES.StorageDriver);
	driver.registerEntity(UserModel);

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

});
