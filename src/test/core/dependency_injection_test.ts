import 'reflect-metadata';
import {Container} from 'inversify';
import * as should from 'should';
import {MailerService, MailerType, ServicesModule, shouldNotHappen} from '../../app';
import {TranslateService} from '../../app/services/translate_service';

describe('DependencyInjection', () => {

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
			shouldNotHappen();
		} catch (err) {
			should(err.message).eql('No matching bindings found for serviceIdentifier: Symbol(TranslateConfig)');
		}

	});

	xit('should inject TranslateService', async () => {

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

		const text = service.translate('invoice');
		should(text).eql('Invoice');

	});

});
