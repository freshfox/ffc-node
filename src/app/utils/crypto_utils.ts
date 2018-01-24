import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt-nodejs';
import * as uuid from 'uuid/v4';

export class CryptoUtils {

	/**
	 * Generates a random hash based on the given arguments
	 * @param {...*} arg -List of arguments to hash
	 * @returns {String} A random hash
	 */
	static generateRandomKey(...arg: string[]) {
		let args = Array.prototype.slice.call(arguments);
		args.push(this.millis());
		return this.generateKey.apply(this, args);
	}

	/**
	 * Generates a static hash based on the given arguments
	 * @param {...*} arg -List of arguments to hash
	 * @returns {String} A hash
	 */
	static generateKey(...arg: string[]) {
		let args = Array.prototype.slice.call(arguments);
		let hashStr = args.join('-');
		return crypto.createHash('md5').update(hashStr).digest('hex');
	}

	/**
	 * Returns the current time in milliseconds
	 * @returns {number}
	 */
	static millis() {
		return new Date().getTime();
	}

	static hashPassword(password: string) {
		return bcrypt.hashSync(password);
	}

	static isPasswordEqualToHash(password: string, hashedPassword: string) {
		return bcrypt.compareSync(password, hashedPassword);
	}

	static generateApiKey(string: string) {
		const hashStr = [
			string,
			this.millis(),
			'api-key0'
		].join('-');
		return crypto.createHash('sha256').update(hashStr).update('salt').digest('hex');
	}

	static hashApiKey(apiKey: string) {
		return this.generateKey(apiKey);
	}

	static createRandomAplhaNumString(len: number) {
		return uuid().substring(0, len).toUpperCase();
	}

}
