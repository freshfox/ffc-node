import * as request from "supertest";
import * as _ from "lodash";

export class TestCase {

	public static Config: any;
	public static Server: any;

	static init(context, useServer, useDatabase) {
		if (useServer) {
			context.beforeEach(() => {
				return this._startServer();
			});
			context.afterEach(() => {
				const app = this.Server;
				return app.stop();
			});
		} else if (useDatabase) {
			context.beforeEach(() => {
				return this._createDatabase();
			});
		}
	}

	static request() {
		return request(this.Server);
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
		return new Promise(function (resolve, reject) {

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
		return this._createDatabase()
			.then(() => {
				return this.Server.start();
			});
	}

	private static _createDatabase() {
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
				//return knex.seed.run();
			});
	}

	static send(req, auth) {
		return this._send(req);
	}

	static shouldNotHappen(msg = 'Should not happen') {
		return (err) => {
			throw new Error(msg);
		}
	}
}
