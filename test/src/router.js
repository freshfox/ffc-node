const should = require('should');
const Router = require('../../dist/router').Router;

const fakeResponse = {

	status() {
		return this;
	},

	render() {
		return this;
	}

};

const fakeApp = {

	get(){this.addRoute.apply(this, ['get', ...arguments])},
	post(){},
	patch(){},
	delete(){},
	put(){},
	addRoute(method, path, callback) {
		this.routes = this.routes || {};
		this.routes[this.format(method, path)] = callback;
	},
	trigger(method, path) {
		this.routes[this.format(method, path)].apply(null, [null, fakeResponse]);
	},
	format(method, path) {
		return method + '.' + path;
	}

};

describe('Router', () => {

	it('should trigger error handler', (done) => {

		let router = new Router('');

		router.get('/', 'TestController.getSomething');
		router.on('error', (err) => {
			should(err).property('message', 'Internal');
			done();
		});
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

			router.get('/this', 'TestController.getSomething')

		});


		router.on('error', (err) => {
			should(err).property('message', 'Internal');
			done();
		});
		router.init(fakeApp, {
			TestController: {
				getSomething() {
					throw new Error('Internal');
				}
			}
		});

		fakeApp.trigger('get', '/test/this')

	});

});
