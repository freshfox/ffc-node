import {TranslateService} from '../../app/services/translate_service';
import *  as path from 'path';
import * as should from 'should';
import {TestCase, WebError} from '../../app';

describe('TranslateServer', function () {

	const locales = path.resolve(__dirname, '../../../test/locales');
	console.log(locales);

	const translateService = new TranslateService({
		directory: locales,
		defaultLocale: 'en'
	});

	it('should check if all locales are loaded', async () => {
		const all = translateService.getAll();
		should(Object.keys(all)).eql(['de', 'en']);

	});

	it('should translate a simple text with default locale', async () => {
		const text = translateService.translate('invoice');
		should(text).eql('Invoice');
	});

	it('should translate a simple text with de locale', async () => {
		const text = translateService.translate('invoice', null, 'de');
		should(text).eql('Rechnung');
	});

	it('should translate text with parameters', async () => {
		const text1 = translateService.translate('invoice_with_number', {number: 2}, 'de');
		should(text1).eql('Rechnung #2');
	});

	it('should check if all strings are localized', async () => {
		TestCase.checkLocalizedStrings(translateService);
	});

	it('should fail if a string isn\'t localized', async () => {

		const catalog = translateService.getAll();
		catalog['de'].test = 'monkey translation';

		let errorThrown = false;

		try {
			TestCase.checkLocalizedStrings(translateService);
		} catch (err) {
			errorThrown = true;
			should(err.code).eql(0);
		}
		delete catalog['de'].test;
		should(errorThrown).eql(true, 'Error wasn\'t thrown');
	});

});
