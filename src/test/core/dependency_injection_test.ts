import 'reflect-metadata';
import {Container} from 'inversify';
import {StorageDriver} from '../../app/core/storage_driver';
import {TYPES} from '../../app/core/types';
import {MySQLDriver} from '../../app/storage/mysql_driver';
import * as should from 'should';
const config = require('../../../config/database');

describe('DependencyInjection', () => {

	it('should test types of DI', () => {

		let container = new Container();

		class FakeDriver extends MySQLDriver {
			protected getKnexConfig() {
				return config;
			}

		}

		container.bind<StorageDriver>(TYPES.StorageDriver).to(FakeDriver).inSingletonScope();

		const driver = container.get<StorageDriver>(TYPES.StorageDriver);
		should(driver).instanceOf(FakeDriver);

	})

});
