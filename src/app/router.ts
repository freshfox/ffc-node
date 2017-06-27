import {EventEmitter} from "events";
import * as path from "path";
import * as BPromise from "bluebird";
import {WebError} from "./error";

export interface Route {

	name: string;
	method: Method;
	endpoint: string;
	callback: string;
}

export enum Method {

	GET = 'get' as any,
	POST = 'post' as any,
	PUT = 'put' as any,
	PATCH = 'patch' as any,
	DELETE = 'delete' as any,

}

export class Router extends EventEmitter {

	private basePath: string;
	private routes: Route[] = [];
	private nodes: Router[] = [];

	constructor(path = '') {
		super();
		this.basePath = path;
	}

	get(name: string, endpoint: string, func: string) {
		this.addRoute(Method.GET, name, endpoint, func);
	}

	post(name: string, endpoint: string, func: string) {
		this.addRoute(Method.POST, name, endpoint, func);
	}

	put(name: string, endpoint: string, func: string) {
		this.addRoute(Method.PUT, name, endpoint, func);
	}

	patch(name: string, endpoint: string, func: string) {
		this.addRoute(Method.PATCH, name, endpoint, func);
	}

	destroy(name: string, endpoint: string, func: string) {
		this.addRoute(Method.DELETE, name, endpoint, func);
	}

	group(endpoint, callback: (r: Router) => any) {
		let router = new Router(this.getPath(endpoint));
		router.on('error', (err) => {
			this.emit('error', err);
		});
		callback.call(null, router);
		this.nodes.push(router);
	}

	crud(name, endpoint, controller, callback?: Function) {
		this.group(endpoint, (router) => {

			router.get(`${name}.list`, '', `${controller}.list`);
			router.get(`${name}.find`, '/:id', `${controller}.find`);
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

	addRoute(method: Method, name: string, endpoint: string, func: string) {
		this.routes.push({
			name: name,
			method: method,
			endpoint: this.getPath(endpoint),
			callback: func
		});
	}

	init(app, controllers) {
		let router = this;
		this.routes.forEach((route) => {

			let callback = createHandler(router, route, controllers);

			app[route.method].call(app, route.endpoint, callback);

		});

		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].init(app, controllers);
		}
	}

	getRoute(name: string): Route{
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
