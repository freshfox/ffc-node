import {TranslateService} from '../../app/services/translate_service';
import *  as path from 'path';
import * as should from 'should';
import {TestCase} from '../../app';

describe('TranslateService', function () {

	const translateService = new TranslateService({
		directory: path.resolve(__dirname, '../locales'),
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

	it('should translate with special characters', async () => {
		should(translateService.translate('test1')).eql('Hello \' <> " characters');
		should(translateService.translate('test2', {replace: '<> \' "'})).eql('Hello <> \' "');
	});

	it('should be able to create multiple instances of TranslateService', async () => {

		const t2 = new TranslateService({
			directory: path.resolve(__dirname, '../locales'),
			defaultLocale: 'en'
		});

		const c1 = translateService.getAll();
		const c2 = t2.getAll();

		should(Object.keys(c1)).eql(['de', 'en']);
		should(Object.keys(c2)).eql(['de', 'en']);

	});

});
