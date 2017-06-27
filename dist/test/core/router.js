"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("../../app/router");
const should = require("should");
const fakeResponse = {
    status() {
        return this;
    },
    render() {
        return this;
    }
};
const fakeApp = {
    get() {
        this.addRoute.apply(this, ['get', ...arguments]);
    },
    post() {
    },
    patch() {
    },
    delete() {
    },
    put() {
    },
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
        let router = new router_1.Router('');
        router.get('test.route', '/', 'TestController.getSomething');
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
        fakeApp.trigger('get', '/');
    });
    it('should trigger error handler in a child node', (done) => {
        let router = new router_1.Router('');
        router.group('/test', (router) => {
            router.get('test.route', '/this', 'TestController.getSomething');
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
        fakeApp.trigger('get', '/test/this');
    });
    it('should get route by name', () => {
        let router = new router_1.Router();
        router.post('auth.login', '/auth', 'AuthController');
        router.crud('user', '/user', 'UserController');
        let route1 = router.getRoute('auth.login');
        should(route1).property('endpoint', '/auth');
        let route2 = router.getRoute('user.find');
        should(route2).property('endpoint', '/user/:id');
    });
});
//# sourceMappingURL=router.js.map