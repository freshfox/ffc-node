const fs = require('fs');
const request = require('supertest');
const Promise = require('bluebird');
const _ = require('lodash');

class BaseTestCase {

	static getConfig() {
		return BaseTestCase.Config.database;
	}

	static getServer() {
		throw new Error('BaseTestCase.getServer() must be implemented');
	}

	static init(context, useServer, useDatabase) {
		if (useServer) {
			context.beforeEach(function () {
				return this._startServer();
			});
			context.afterEach(() => {
				const app = BaseTestCase.getServer();
				return app.stop();
			});
		} else if (useDatabase) {
			context.beforeEach(() => {
				return this._createDatabase();
			});
		}
	}

	static request() {
		return request(BaseTestCase.get());
	}

	static get(path) {
		return this.request().get(path);
	}

	static post(path, data) {
		return this.request().post(path).send(data);
	}

	static patch(path, data) {
		return this.request().patch(path).send(data);
	}

	static put(path, data) {
		return this.request().put(path).send(data);
	}

	static destroy(path) {
		return this.request().delete(path);
	}

	static file(path, file, fieldName = 'file') {
		return this.request().post(path).attach(fieldName, file).send();
	}

	static _send(req) {
		return new Promise(function(resolve, reject) {

			req.end(function (err, res) {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			})
		});
	}

	static _startServer() {
		const app = BaseTestCase.getServer();
		return this._createDatabase()
			.then(function () {
				return app.start();
			});
	}

	static _createDatabase() {
		let config = this.getConfig();
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
				//return knex.seed.run();
			});
	}

	static send(req, auth) {
		if (auth) {
			req.set('Authorization', 'Bearer ' + Config.app.test.token);
		}
		return this._send(req);
	}

	static shouldNotHappen(msg = 'Should not happen') {
		return (err) => {
			throw new Error(msg);
		}
	}
}

module.exports = BaseTestCase;
