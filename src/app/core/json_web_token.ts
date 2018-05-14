import {injectable} from 'inversify';
import * as jwt from 'jsonwebtoken';

@injectable()
export class JsonWebToken {

	static verify(secret: string, token: string, rawDecodedData?: boolean): Promise<any> {
		return new Promise((resolve, reject) => {
			jwt.verify(token, secret, async (err, decoded) => {
				if (err) {
					return reject(err);
				}
				resolve(rawDecodedData ? decoded : decoded.data);
			});
		})
	}

	static sign(data: any, secret: string, options: JWTOptions): Promise<string> {
		return new Promise((resolve, reject) => {
			jwt.sign({
				data: data,
			}, secret, options, (err, token) => {
				if (err) {
					reject(err);
				} else {
					resolve(token);
				}
			});
		});
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
