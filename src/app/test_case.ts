import * as request from "supertest";
import * as _ from "lodash";
import {Server} from './server';

export interface RequestOptions {

	headers?: Object

}

export class TestCase {

	public static Config: any;
	public static server: Server;
	public static defaultOptions: RequestOptions;

	static init(context, useServer, useDatabase) {
		if (useServer) {
			context.beforeEach(() => {
				return this.startServer();
			});
			context.afterEach(() => {
				const app = this.server;
				return app.stop();
			});
		} else if (useDatabase) {
			context.beforeEach(() => {
				return this.createDatabase();
			});
		}
	}

	static request() {
		return request(this.server.app);
	}

	static get(path, opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().get(path);
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	static post(path, data, opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().post(path).send(data);
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	static patch(path, data, opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().patch(path).send(data);
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	static put(path, data, opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().put(path).send(data);
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	static destroy(path, opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().delete(path);
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	static file(path, file, fieldName = 'file', opts?: RequestOptions) {
		let options = this.opts(opts);
		let req = this.request().post(path).attach(fieldName, file).send();
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				req.set(key, options.headers[key]);
			});
		}
		return req;
	}

	private static opts(opts: RequestOptions): RequestOptions {
		return Object.assign({}, this.defaultOptions, opts)
	}

	protected static startServer() {
		return this.createDatabase()
			.then(() => {
				return this.server.start();
			});
	}

	protected static createDatabase() {
		if (!this.Config || !this.Config.database) {
			return Promise.resolve();
		}
		let config = this.Config.database;
		let name = config.connection.database;

		let knex = require('knex')({
			client: 'mysql',
			connection: _.pick(config.connection, 'host', 'user', 'password', 'charset')
		});
		return knex.raw('DROP DATABASE IF EXISTS ' + name)
			.then(function () {
				return knex.raw('CREATE DATABASE ' + name);
			})
			.then(function () {
				return knex.destroy();
			})
			.then(function () {
				config.connection.database = name;
				knex = require('knex')(config);
				return knex.migrate.latest()
			})
			.then(function () {
				return knex.seed.run();
			});
	}

	static shouldNotHappen(msg = 'Should not happen') {
		return (err) => {
			throw new Error(msg);
		}
	}
}
