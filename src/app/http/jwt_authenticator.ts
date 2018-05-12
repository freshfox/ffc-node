import "reflect-metadata";
import {Authenticator} from '../core/authenticator';
import {Express, Request} from 'express';
import * as jwt from 'jsonwebtoken';
import {injectable} from 'inversify';
import {WebError} from '../error';

@injectable()
export abstract class JWTAuthenticator implements Authenticator {

	private unauthenticatedPaths: string[];
	private readonly middleware: (req, res, next) => void;

	constructor() {
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
			const data = await this.deserialize(decoded.data);
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

	verify(token: string): Promise<any> {
		return new Promise((resolve, reject) => {
			jwt.verify(token, this.getSecret(), async (err, decoded) => {

				if (err) {
					return reject(err);
				}
				resolve(decoded);
			});
		})
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

	sign(data, options: JWTOptions) {
		return new Promise((resolve, reject) => {
			jwt.sign({
				data: data,
			} as object, this.getSecret(), options, (err, token) => {
				if (err) {
					reject(err);
				} else {
					resolve(token);
				}
			});
		});
	}

	abstract findUser(req: Request): Promise<any>;

	serialize(data) {
		return data;
	}

	deserialize(data) {
		return data;
	}
}

export interface JWTOptions {

	/**
	 * default: HS256
	 */
	algorithm?: string;
	/**
	 * Expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
	 */
	expiresIn?: number|string;
	/**
	 * Expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
	 */
	notBefore?: number|string;
	audience?: string;
	issuer?: string;
	jwtid?: string;
	subject?: string;
	noTimestamp?: string;
	header?: string;
	keyid?: string;
}
