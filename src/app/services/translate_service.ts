import "reflect-metadata";
import {injectable} from 'inversify';
const i18n = require('i18n');
i18n.configure({
	directory: __dirname + '/../locales',
	defaultLocale: 'de',
	objectNotation: true,
	updateFiles: false //Pls why?
});

@injectable()
export class TranslateService {

	translate(key: string, params?: any, locale?: string) {
		if (locale) {
			if (params) {
				return i18n.__({phrase: key, locale: locale}, ...params);
			} else {
				return i18n.__({phrase: key, locale: locale});
			}
		}
		if (params) {
			if (Array.isArray(params)) {
				return i18n.__(key, ...params);
			}
			return i18n.__(key, params);
		}
		return i18n.__(key);
	}

	getAll() {
		return i18n.getCatalog();
	}

}
