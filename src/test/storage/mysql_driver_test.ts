import * as should from 'should';
import {entity, ModelDesc, property} from '../../app/storage/decorators';
import {KnexConfig, MySQLDriver} from '../../app/storage/mysql_driver';
import {TestCase} from '../../app/test_case';
import {Container} from 'inversify';
import {StorageDriver} from '../../app/core/storage_driver';
import {TYPES} from '../../app/core/types';
import {belongsTo, belongsToMany, hasMany, WebError} from '../../app';

@entity('users')
class UserModel {

	@property('json') settings;

	static onSave(attributes) {
		return {
			firstname: attributes.firstname + '_saved'
		};
	}

	@belongsTo('accounts') account;

}

@entity('accounts')
class AccountModel {

	@property('json') settings;

	@hasMany('users') users;

}

@entity('logs')
class LogModel {

}

@entity('model_a')
class ModelA {

	@belongsToMany('model_b', true) private model_b;

}

@entity('model_b')
class ModelB {

	@belongsToMany('model_a', true) private model_a;

}


describe('MysqlDriver', function () {

	let container = new Container();
	container.bind<KnexConfig>(TYPES.KnexConfig).toConstantValue(require('../../../config/database'));
	container.bind<StorageDriver>(TYPES.StorageDriver).to(MySQLDriver).inSingletonScope();

	let driver = container.get<StorageDriver>(TYPES.StorageDriver);
	driver.registerEntity(UserModel as ModelDesc);
	driver.registerEntity(AccountModel as ModelDesc);
	driver.registerEntity(LogModel as ModelDesc);
	driver.registerEntity(ModelA as ModelDesc);
	driver.registerEntity(ModelB as ModelDesc);

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



	it('should test if 2 models can depend on each other', async () => {

		const a1 = await driver.save('model_a', {
			text: 'A1',
		});

		const a2 = await driver.save('model_a', {
			text: 'A2',
		});

		const b1 = await driver.save('model_b', {
			text: 'B1',
		});

		const b2 = await driver.save('model_b', {
			text: 'B2',
		});

		await driver.associate('model_a', 'model_b', a1.id, b2.id);
		await driver.associate('model_b', 'model_a', b1.id, a2.id);

		const listA = await driver.list('model_a');
		should(listA[0]).property('id', a1.id);
		should(listA[0].model_b[0]).property('id', b2.id);
		should(listA[1]).property('id', a2.id);
		should(listA[1].model_b[0]).property('id', b1.id);

		const listB = await driver.list('model_b');
		should(listB[0]).property('id', b1.id);
		should(listB[0].model_a[0]).property('id', a2.id);
		should(listB[1]).property('id', b2.id);
		should(listB[1].model_a[0]).property('id', a1.id);

	});

	it('should destroy a model without an id', async () => {

		await driver.save('model_a', { text: 'u1' });
		await driver.save('model_a', { text: 'u2' });
		await driver.save('model_a', { text: 'u3' });
		await driver.save('model_a', { text: 'u1' });

		await driver.destroy('model_a', {text: 'u1'});

		const all = await driver.list('model_a');
		should(all).length(2);

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

	it('should save and query data', async () => {

		await driver.save('model_a', {text: 'u1'});

		const list = await driver.query('model_a', (qb) => {
			return qb.where('text', '=', 'u1');
		});

		should(list).length(1);
		should(list[0].text).eql('u1');

	});

	it('should throw an error of model can not be found', async () => {

		try {
			await driver.save('model_xxx', {text: 'u1'});
			// noinspection ExceptionCaughtLocallyJS
			throw new Error('should not happen');
		} catch (err) {
			should(err).instanceOf(WebError);
			should(err.code).eql(500);
		}

	});

});
