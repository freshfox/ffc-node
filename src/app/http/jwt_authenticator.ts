import "reflect-metadata";
import {Authenticator} from '../core/authenticator';
import {Express, Request} from 'express';
import {injectable} from 'inversify';
import {WebError} from '../error';
import {JsonWebToken, JWTOptions} from '../core/json_web_token';

@injectable()
export abstract class JWTAuthenticator<S = any, D = any> implements Authenticator {

	private unauthenticatedPaths: string[];
	private readonly middleware: (req, res, next) => void;

	protected constructor() {
		this.middleware = this.handle.bind(this);
	}


	/**
	 * @deprecated Use #getMiddleware() instead
	 */
	setup(app: Express) {
		app.use(this.getMiddleware());
	}

	async handle(req, res, next) {
		let needsAuth = this.unauthenticatedPaths && !(this.unauthenticatedPaths.find((path) => {
			return req.path.startsWith(path);
		}));

		if (!needsAuth) {
			next();
			return;
		}

		let header: string = req.headers.authorization;
		if (!header || !header.startsWith('Bearer')) {
			const err = WebError.unauthorized('Unauthorized');
			return next(err);
		}
		let token = header.split('Bearer ')[1];

		try  {
			const decoded = await this.verify(token);
			const data = await this.deserialize(decoded);
			Object.assign(req, {
				user: data
			});
			next();
		} catch (err) {
			console.error(err);
			let error = WebError.unauthorized('Unauthorized');
			return next(error);
		}

	}

	verify(token: string): Promise<S> {
		return JsonWebToken.verify(this.getSecret(), token);
	}

	getMiddleware(): (req, res, next) => void {
		return this.middleware;
	}

	protected setUnauthenticatedPaths(paths: string[]) {
		this.unauthenticatedPaths = paths;
	}

	protected abstract getSecret();

	protected abstract getJWTOptions(): JWTOptions;

	async authenticate(req, res, next: Function) {
		const user = await this.findUser(req);
		const data = await this.serialize(user);

		try {
			const token = await this.sign(data, this.getJWTOptions());
			res.send({
				token: token,
				ttt: null
			});
		} catch(err) {
			console.error(err);
			next(WebError.unauthorized('Unauthorized'));
		}
	}

	sign(data, options: JWTOptions): Promise<string> {
		return JsonWebToken.sign(data, this.getSecret(), options);
	}

	abstract findUser(req: Request): Promise<D>;

	serialize(data: D): Promise<S> {
		return Promise.resolve(data as any);
	}

	deserialize(data: S): Promise<D> {
		return Promise.resolve(data as any);
	}
}
