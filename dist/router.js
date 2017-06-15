"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const path = require("path");
const BPromise = require("bluebird");
const error_1 = require("./error");
var Method;
(function (Method) {
    Method[Method["GET"] = 'get'] = "GET";
    Method[Method["POST"] = 'post'] = "POST";
    Method[Method["PUT"] = 'put'] = "PUT";
    Method[Method["PATCH"] = 'patch'] = "PATCH";
    Method[Method["DELETE"] = 'delete'] = "DELETE";
})(Method = exports.Method || (exports.Method = {}));
class Router extends events_1.EventEmitter {
    constructor(path = '') {
        super();
        this.routes = [];
        this.nodes = [];
        this.basePath = path;
    }
    get(name, endpoint, func) {
        this.addRoute(Method.GET, name, endpoint, func);
    }
    post(name, endpoint, func) {
        this.addRoute(Method.POST, name, endpoint, func);
    }
    put(name, endpoint, func) {
        this.addRoute(Method.PUT, name, endpoint, func);
    }
    patch(name, endpoint, func) {
        this.addRoute(Method.PATCH, name, endpoint, func);
    }
    destroy(name, endpoint, func) {
        this.addRoute(Method.DELETE, name, endpoint, func);
    }
    group(endpoint, callback) {
        let router = new Router(this.getPath(endpoint));
        router.on('error', (err) => {
            this.emit('error', err);
        });
        callback.call(null, router);
        this.nodes.push(router);
    }
    crud(name, endpoint, controller, callback) {
        this.group(endpoint, (router) => {
            router.get(`${name}.list`, '', `${controller}.find`);
            router.get(`${name}.find`, '/:id', `${controller}.findOne`);
            router.post(`${name}.create`, '', `${controller}.create`);
            router.patch(`${name}.update`, '/:id', `${controller}.update`);
            router.destroy(`${name}.destroy`, '/:id', `${controller}.destroy`);
            if (callback) {
                callback.call(null, router);
            }
        });
    }
    getPath(endpoint) {
        return path.join(this.basePath, endpoint);
    }
    addRoute(method, name, endpoint, func) {
        this.routes.push({
            name: name,
            method: method,
            endpoint: endpoint,
            callback: func
        });
    }
    init(app, controllers) {
        let router = this;
        this.routes.forEach((route) => {
            let endpoint = router.getPath(route.endpoint);
            let callback = createHandler(router, route, controllers);
            app[route.method].call(app, endpoint, callback);
        });
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].init(app, controllers);
        }
    }
    getRoute(name) {
        let route = this.routes.find((route) => {
            return route.name === name;
        });
        if (route) {
            return route;
        }
        for (let i = 0; i < this.nodes.length; i++) {
            let route = this.nodes[i].getRoute(name);
            if (route) {
                return route;
            }
        }
        return null;
    }
    print() {
        for (let i = 0; i < this.routes.length; i++) {
            let route = this.routes[i];
            console.log('[%s] %s => %s', route.method, this.getPath(route.endpoint), route.callback);
        }
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].print();
        }
    }
}
exports.Router = Router;
const createHandler = (router, route, controllers) => {
    let callback = getBoundControllerFunction(route.callback, controllers);
    return (req, res, next) => {
        new BPromise((resolve, reject) => {
            try {
                let result = callback(req, res, next);
                resolve(result);
            }
            catch (err) {
                reject(err);
            }
        })
            .catch(error_1.WebError, (err) => {
            res.status(err.code).render('error', { data: err });
        })
            .catch((err) => {
            router.emit('error', err);
            res.status(500).render('error', {
                data: error_1.WebError.internalServerError()
            });
        });
    };
};
function getBoundControllerFunction(callback, controllers) {
    let args = callback.split('.');
    if (args.length !== 2) {
        throw new Error('Malformed controller function ' + callback + ' should look like Controller.function');
    }
    let controller = controllers[args[0]];
    let func = controller[args[1]];
    if (!controller) {
        throw new Error(`Controller (${args[0]}) not found`);
    }
    if (!func) {
        throw new Error(`Function (${args[1]} not found in ${args[0]}`);
    }
    return func.bind(controller);
}
//# sourceMappingURL=router.js.map