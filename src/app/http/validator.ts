import * as Joi from 'joi';
import {ValidationOptions, SchemaLike} from 'joi';
import {WebError} from "../error";

export class Validator {

	private static DEFAULT_OPTIONS: ValidationOptions = {
		abortEarly: false,
		allowUnknown: true,
		stripUnknown: true,
	};

	static async validate<T>(value: T, schema: SchemaLike): Promise<T> {
		try {
			// Await is required here
			return await Joi.validate<T>(value, schema, this.DEFAULT_OPTIONS) as any;
		} catch (err) {
			throw new WebError(400, err.message, err.details);
		}
	}

	static get schema(): Joi {
		return Joi;
	}

	static compile<T>(schema: SchemaMap<T>) {
		return Joi.compile(schema)
	}
}

export type SchemaMap<T> = {
	[K in keyof T]: SchemaLike | SchemaLike[];
}
