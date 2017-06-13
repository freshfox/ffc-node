"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const request = require('supertest');
const _ = require('lodash');
class BaseTestCase {
    static init(context, useServer, useDatabase) {
        if (useServer) {
            context.beforeEach(function () {
                return this._startServer();
            });
            context.afterEach(() => {
                const app = BaseTestCase.Server;
                return app.stop();
            });
        }
        else if (useDatabase) {
            context.beforeEach(() => {
                return this._createDatabase();
            });
        }
    }
    static request() {
        return request(BaseTestCase.Server);
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
                }
                else {
                    resolve(res);
                }
            });
        });
    }
    static _startServer() {
        return this._createDatabase()
            .then(function () {
            return BaseTestCase.Server.start();
        });
    }
    static _createDatabase() {
        let name = BaseTestCase.Config.database.connection.name;
        let knex = require('knex')({
            client: 'mysql',
            connection: _.pick(BaseTestCase.Config.database.connection, 'host', 'user', 'password', 'charset')
        });
        return knex.raw('DROP DATABASE IF EXISTS ' + name)
            .then(function () {
            return knex.raw('CREATE DATABASE ' + name);
        })
            .then(function () {
            return knex.destroy();
        })
            .then(function () {
				BaseTestCase.Config.database.database = name;
            knex = require('knex')(config);
            return knex.migrate.latest();
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
        };
    }
}
exports.BaseTestCase = BaseTestCase;
//# sourceMappingURL=base_test_case.js.map
