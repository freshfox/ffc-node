import "reflect-metadata";
import {inject, injectable} from 'inversify';
const i18n = require('i18n');


export const TranslateConfig = Symbol('TranslateConfig');

export interface ITranslateConfig {
	directory: string,
	defaultLocale: string,
	objectNotation?: boolean,
	updateFiles?: boolean;
}

@injectable()
export class TranslateService {

	private static DEFAULT_CONFIG = {
		objectNotation: true,
		updateFiles: false
	};

	private translator = {} as any;

	constructor(@inject(TranslateConfig) private config: ITranslateConfig) {

		i18n.configure(Object.assign({} as any, TranslateService.DEFAULT_CONFIG, config, {
			register: this.translator
		}));

	}

	translate(key: string, params?: any, locale?: string) {
		const options: any = {
			phrase: key,
			locale: locale || this.config.defaultLocale
		};
		if (params) {
			if (Array.isArray(params)) {
				return this.translator.__(options, ...params);
			}
			return this.translator.__(options, params);
		}
		return this.translator.__(options);
	}

	getAll() {
		return this.translator.getCatalog();
	}

}
