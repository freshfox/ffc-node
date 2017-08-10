import "reflect-metadata";
import {Authenticator} from '../core/authenticator';
import {Express, Request} from 'express';
import * as jwt from 'jsonwebtoken';
import {injectable} from 'inversify';
import {WebError} from '../error';

@injectable()
export abstract class JWTAuthenticator implements Authenticator {

	private unauthenticatedPaths: string[];

	setup(app: Express) {
		app.use((req, res, next) => {

			let needsAuth = this.unauthenticatedPaths && !(this.unauthenticatedPaths.find((path) => {
				return req.path.startsWith(path);
			}));

			if (!needsAuth) {
				next();
				return;
			}

			let header: string = req.headers.authorization;
			if (!header || !header.startsWith('Bearer')) {
				throw WebError.unauthorized('Unauthorized');
			}
			let token = header.split('Bearer ')[1];

			jwt.verify(token, this.getSecret(), (err, decoded) => {

				if (err) {
					console.error(err);
					let error = WebError.unauthorized('Unauthorized');
					return next(error);
				}

				Object.assign(req, {
					user: decoded
				});
				next();
			});
		})
	}

	protected setUnauthenticatedPaths(paths: string[]) {
		this.unauthenticatedPaths = paths;
	}

	protected abstract getSecret();

	protected abstract getJWTOptions(): JWTOptions;

	authenticate(req, res, next: Function) {
		return this.findUser(req)
			.then((user) => {
				jwt.sign({
					data: user,
				} as object, this.getSecret(), this.getJWTOptions(), (err, token) => {

					if (err) {
						console.error(err);
						throw WebError.unauthorized('Unauthorized');
					}
					res.send({
						token: token,
						ttt: null
					});
				});
			});
	}

	abstract findUser(req: Request): Promise<any>;
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
