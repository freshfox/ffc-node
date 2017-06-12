import {EventEmitter} from "events";
import * as path from "path";
import * as BPromise from "bluebird";
import {WebError} from "./error";

export interface Route {

	method: string;
	endpoint: string,
	callback: Function,
	middleware: Function

}

export class Router extends EventEmitter {

	private basePath: string;
	private routes: Route[];
	private nodes: Router[];

	constructor(path) {
		super();
		this.basePath = path || '';
		this.routes = [];
		this.nodes = [];
	}

	get(endpoint, func, middleware) {
		this.addRoute('GET', endpoint, func, middleware);
	}

	post(endpoint, func, middleware) {
		this.addRoute('POST', endpoint, func, middleware);
	}

	put(endpoint, func, middleware) {
		this.addRoute('PUT', endpoint, func, middleware);
	}

	patch(endpoint, func, middleware) {
		this.addRoute('PATCH', endpoint, func, middleware);
	}

	destroy(endpoint, func, middleware) {
		this.addRoute('DELETE', endpoint, func, middleware);
	}

	group(endpoint, callback) {
		let router = new Router(this.getPath(endpoint));
		router.on('error', (err) => {
			this.emit('error', err);
		});
		callback.call(null, router);
		this.nodes.push(router);
	}

	crud(endpoint, controller, callback) {
		this.group(endpoint, function () {

			this.get('', controller + '.find');
			this.get('/:id', controller + '.findOne');
			this.post('', controller + '.create');
			this.patch('/:id', controller + '.update');
			this.destroy('/:id', controller + '.destroy');

			if (callback) {
				callback.apply(this);
			}
		});
	}

	getPath(endpoint) {
		return path.join(this.basePath, endpoint);
	}

	addRoute(method, endpoint, func, middleware = null) {
		this.routes.push({
			method: method,
			endpoint: endpoint,
			callback: func,
			middleware: middleware
		});
	}

	init(app, controllers) {
		let router = this;
		this.routes.forEach((route) => {

			let method = route.method.toLowerCase();
			let endpoint = router.getPath(route.endpoint);

			let callback = createHandler(router, route, controllers);

			if (route.middleware) {
				app[method].call(app, endpoint, route.middleware, callback);
			} else {
				app[method].call(app, endpoint, callback);
			}
		});

		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].init(app, controllers);
		}
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

const createHandler = (router: Router, route: Route, controllers) => {

	let callback = getBoundControllerFunction(route.callback, controllers);

	return (req, res, next) => {
		new BPromise((resolve, reject) => {

			try {
				let result = callback(req, res, next);
				resolve(result);
			} catch (err) {
				reject(err);
			}
		})
			.catch(WebError, (err) => {
				res.status(err.code).render('error', {data: err});
			})
			.catch((err) => {
				router.emit('error', err);
				res.status(500).render('error', {
					data: WebError.internalServerError()
				})
			});
	}
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
