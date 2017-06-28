import {Router} from '../../app/router';
import * as should from 'should';
import {WebError} from '../../app/error';
import {TestCase} from '../../app/test_case';

class FakeResponse {

	constructor(private callback?: Function) {

	}

	status() {
		return this;
	}

	render(name, options) {
		return this.send(options.data);
	}

	send(data: any) {
		if (this.callback) {
			this.callback(data)
		}
		return this;
	}

}

class FakeApp {

	private routes = {};

	constructor(private callback?: Function) {
	}

	get(){
		this.addRoute.apply(this, ['get', ...arguments])
	}

	post(){
	}

	patch(){
	}

	delete(){
	}

	put(){
	}

	addRoute(method, path, callback) {
		this.routes[this.format(method, path)] = callback;
	}

	trigger(method, path) {
		let c = this.callback;
		return this.routes[this.format(method, path)].apply(null, [null, new FakeResponse(c)]);
	}

	format(method, path) {
		return method + '.' + path;
	}

}

describe('Router', () => {

	it('should trigger error handler', (done) => {

		let router = new Router();

		router.get('test.route', '/', 'TestController.getSomething');
		router.on('error', (err) => {
			should(err).property('message', 'Internal');
			done();
		});
		let fakeApp = new FakeApp();
		router.init(fakeApp, {
			TestController: {
				getSomething() {
					throw new Error('Internal');
				}
			}
		});

		fakeApp.trigger('get', '/')

	});

	it('should trigger error handler in a child node', (done) => {

		let router = new Router('');

		router.group('/test', (router) => {

			router.get('test.route', '/this', 'TestController.getSomething')

		});


		router.on('error', (err) => {
			should(err).property('message', 'Internal');
			done();
		});
		let fakeApp = new FakeApp();
		router.init(fakeApp, {
			TestController: {
				getSomething() {
					throw new Error('Internal');
				}
			}
		});

		fakeApp.trigger('get', '/test/this')

	});

	it('should get route by name', () => {

		let router = new Router();
		router.post('auth.login', '/auth', 'AuthController');
		router.crud('user', '/user', 'UserController');

		let route1 = router.getRoute('auth.login');
		should(route1).property('endpoint', '/auth');

		let route2 = router.getRoute('user.find');
		should(route2).property('endpoint', '/user/:id');

	});

	it('should reject the promise', (done) => {

		let router = new Router();
		// Dummy
		router.on('error', () => {});
		router.get('test.route', '/', 'TestController.getSomething');
		let fakeApp = new FakeApp((res) => {
			should(res).property('code', 500);
			done();
		});

		router.init(fakeApp, {
			TestController: {
				getSomething(req, res) {
					this.throws.an.error()
				}
			}
		});
		fakeApp.trigger('get', '/')
			.catch((err) => {
				console.log(err);
			});
	});

});
