import 'reflect-metadata';
import {Container} from 'inversify';
import {StorageDriver} from '../../app/core/storage_driver';
import {TYPES} from '../../app/core/types';
import {KnexConfig, MySQLDriver} from '../../app/storage/mysql_driver';
import * as should from 'should';
import {MailerService, MailerType, ServicesModule, TestCase} from '../../app';
import {TranslateService} from '../../app/services/translate_service';
const config = require('../../../config/database');

describe('DependencyInjection', () => {

	it('should test types of DI', () => {

		let container = new Container();
		container.bind<KnexConfig>(TYPES.KnexConfig).toConstantValue(config);
		container.bind<StorageDriver>(TYPES.StorageDriver).to(MySQLDriver).inSingletonScope();

		const driver = container.get<StorageDriver>(TYPES.StorageDriver);
		should(driver).instanceOf(MySQLDriver);

	});

	it('should resolve MailerService from module', async () => {

		const container = new Container();

		const module = ServicesModule.create()
			.setMailerConfig({
				type: MailerType.STUB,
				options: null
			})
			.build();

		container.load(module);

		const service = container.resolve(MailerService);
		should(service).instanceOf(MailerService);

	});

	it('should fail to inject TranslateService without config', async () => {

		const container = new Container();

		const module = ServicesModule.create()
			.build();
		container.load(module);

		try {
			container.resolve(TranslateService);
			TestCase.shouldNotHappen();
		} catch (err) {
			should(err.message).eql('No matching bindings found for serviceIdentifier: Symbol(TranslateConfig)');
		}

	});

	it('should inject TranslateService', async () => {

		const container = new Container();

		const module = ServicesModule.create()
			.setTranslationConfig({
				defaultLocale: 'en',
				directory: __dirname + '/../locales'
			})
			.build();

		container.load(module);

		const service = container.resolve(TranslateService);
		should(service).instanceOf(TranslateService);

		const text = service.translate('test');
		should(text).eql('This is a test');

	});

});
