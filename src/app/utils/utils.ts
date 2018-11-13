
export class Utils {

	static mapValues<T, U>(object: {[K in keyof T]: T[K]}, mapper: (key: string, value: any) => U): {[K in keyof T]: U} {
		const keys = Object.keys(object);
		const obj: any = {};
		keys.forEach((key) => {
			obj[key] = mapper(key, object[key]);
		});
		return obj;
	}

}
