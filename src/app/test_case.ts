import * as request from "supertest";
import {Container, interfaces} from 'inversify';
import {Server} from './http/server';
import {StorageDriver} from './core/storage_driver';
import {TYPES} from './core/types';
import * as flat from 'flat';
import * as _ from 'lodash';
import {TranslateService} from './services/translate_service';
import {WebError} from './error';

export interface RequestOptions {

	headers?: Object

}

export class TestCase {

	private server: Server;
	private container: Container;
	public defaultOptions: RequestOptions;

	static create(context: any, server: Server, defaultOptions?: RequestOptions): TestCase {
		let testCase = new TestCase();
		testCase.defaultOptions = defaultOptions;
		context.beforeEach(async () => {
			testCase.server = server;
			const driver = testCase.getContainer().get<StorageDriver>(TYPES.StorageDriver);
			await driver.clear();
			await driver.createTables();
			return server.start();
		});
		context.afterEach(() => {
			return testCase.server.stop();
		});
		return testCase;
	}

	static createServerOnly(context: any, server: Server, defaultOptions?: RequestOptions) {
		let testCase = new TestCase();
		testCase.defaultOptions = defaultOptions;
		context.beforeEach(async () => {
			testCase.server = server;
			return server.start();
		});
		context.afterEach(() => {
			return testCase.server.stop();
		});
		return testCase;
	}

	static createDatabaseOnly(context, container: Container) {
		let testCase = new TestCase();
		testCase.container = container;
		context.beforeEach(async () => {
			const driver = testCase.getContainer().get<StorageDriver>(TYPES.StorageDriver);
			await driver.clear();
			return driver.createTables();
		});
		return testCase;
	}

	getContainer(): Container {
		if (this.server) {
			return this.server.getContainer();
		}
		return this.container;
	}

	resolve<T>(constructorFunction: interfaces.Newable<T>): T {
		return this.getContainer().resolve(constructorFunction);
	}

	private request() {
		return request(this.server.app);
	}

	public get(path, opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().get(path);
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	public post(path, data?, opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().post(path).send(data);
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	public patch(path, data, opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().patch(path).send(data);
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	public put(path, data, opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().put(path).send(data);
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	public destroy(path, opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().delete(path);
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	public file(path, file, fieldName = 'file', opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().post(path).attach(fieldName, file).send();
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	public formData(path, data, file, fileFieldName = 'file', opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().post(path);

		Object.keys(data).forEach((key) => {
			req.field(key, data[key]);
		});

		if (file) {
			req.attach(fileFieldName, file);
		}

		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	private opts(opts: RequestOptions): RequestOptions {
		return Object.assign({}, this.defaultOptions, opts)
	}

	static shouldNotHappen(msg = 'Should not happen') {
		return (err) => {
			throw new Error(msg);
		}
	}

	static checkLocalizedStrings(translateService: TranslateService) {
		let translations = translateService.getAll();
		let locales = Object.keys(translations);

	let flattened = _.mapValues(translations, (values) => {
			return flat(values);
		});

		let args = locales.map((locale) => {
			return Object.keys(flattened[locale]);
		});

		let diff = distinctSet(...args);

		diff.forEach((key) => {
			locales.forEach((locale) => {
				if (!flattened[locale][key]) {
					console.error(`${key} is not translated in ${locale}`);
				}
			})
		});
		if (diff.length) {
			throw new WebError(0, 'Not all strings are localized');
		}
	}
}


const distinctSet = (...arrays) => {
	let diff = [];
	arrays.forEach((array1) => {
		arrays.forEach((array2) => {
			if (array1 === array2) {
				return;
			}
			_.difference(array1, array2).forEach((missing) => {
				if (diff.indexOf(missing) === -1) {
					diff.push(missing);
				}
			});
		});
	});
	return diff;
};
