import * as bodyParser from 'body-parser';
import {Server} from '../../app/http/server';
import {Container} from 'inversify';
import {KnexConfig, MySQLDriver} from '../../app/storage/mysql_driver';
import {TYPES} from '../../app/core/types';
import {StorageDriver} from '../../app/core/storage_driver';
import {TestCase} from '../../app/test_case';
import * as should from 'should';
import * as express from 'express';
import {JWTAuthenticator, JWTOptions} from '../../app/http/jwt_authenticator';
import {WebError} from '../../app/error';
import {Authenticator} from '../../app/core/authenticator';

describe('JWTAuthenticator', function () {

	class TestServer extends Server {

		private container: Container;

		constructor() {
			super(express(), 3002);
			this.container = new Container();
			this.container.bind<KnexConfig>(TYPES.KnexConfig).toConstantValue(require('../../../config/database'));
			this.container.bind<StorageDriver>(TYPES.StorageDriver).to(MySQLDriver).inSingletonScope();
			this.container.bind<Authenticator>(TYPES.Authenticator).to(UserAuthenticator).inSingletonScope();
		}

		getContainer(): Container {
			return this.container;
		}

		configure() {
			this.app.use(bodyParser.json({
				strict: false
			}));

			let auth = this.container.get<Authenticator>(TYPES.Authenticator);
			auth.setup(this.app);

			this.app.post('/auth', (req, res, next) => {
				return auth.authenticate(req, res, next)
			});

			this.app.get('/', (req, res) => {
				res.send(req.user);
			});

		}
	}

	class UserAuthenticator extends JWTAuthenticator {

		constructor() {
			super();
			this.setUnauthenticatedPaths(['/auth']);
		}

		protected getSecret() {
			return 'secret'
		}

		protected getJWTOptions(): JWTOptions {
			return {
				expiresIn: 60 * 60
			};
		}

		serialize(user) {
			return user.id;
		}

		deserialize(id) {
			if (id === 1) {
				return {
					id: 1,
					username: 'test_user'
				}
			}
			throw WebError.unauthorized('User not found')
		}

		async findUser(req): Promise<any> {
			if (req.body.username === 'test_user') {
				return {
					id: 1,
					username: 'test_user'
				}
			}
			throw WebError.unauthorized('User not found');
		}
	}

	const testCase = TestCase.create(this, new TestServer());

	it('should authenticate and serialize user', async () => {

		const res1 = await testCase.post('/auth', {
			username: 'test_user'
		});
		should(res1.status).eql(200);
		should(res1.body).property('token');

		const res2 = await testCase.get('/', {
			headers: {
				Authorization: 'Bearer ' + res1.body.token
			}
		});
		should(res2.status).eql(200);
		should(res2.body).eql({
			id: 1,
			username: 'test_user'
		});

	});


});