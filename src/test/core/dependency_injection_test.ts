import 'reflect-metadata';
import {Container} from 'inversify';
import {StorageDriver} from '../../app/core/storage_driver';
import {TYPES} from '../../app/core/types';
import {KnexConfig, MySQLDriver} from '../../app/storage/mysql_driver';
import * as should from 'should';
const config = require('../../../config/database');

describe('DependencyInjection', () => {

	it('should test types of DI', () => {

		let container = new Container();
		container.bind<KnexConfig>(TYPES.KnexConfig).toConstantValue(config);
		container.bind<StorageDriver>(TYPES.StorageDriver).to(MySQLDriver).inSingletonScope();

		const driver = container.get<StorageDriver>(TYPES.StorageDriver);
		should(driver).instanceOf(MySQLDriver);

	})

});
