import "reflect-metadata";
import {inject, injectable} from 'inversify';
const i18n = require('i18n');


export const TranslateConfig = Symbol('TranslateConfig');

export interface ITranslateConfig {
	directory?: string,
	defaultLocale?: string,
	objectNotation?: boolean,
	updateFiles?: boolean;
}

@injectable()
export class TranslateService {

	private static DEFAULT_CONFIG: ITranslateConfig = {
		objectNotation: true,
		updateFiles: false
	};

	constructor(@inject(TranslateConfig) config: ITranslateConfig) {
		i18n.configure(Object.assign({} as any, TranslateService.DEFAULT_CONFIG, config));
	}

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
