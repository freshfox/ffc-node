
export class PromiseUtils {

	static async props<T>(obj: {[K in keyof T]: Promise<T[K]> | T[K]}): Promise<T> {
		const promises = [];
		const keys = Object.keys(obj);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			promises.push(obj[key as any]);
		}
		const results = await Promise.all(promises);

		return results.reduce((map, current, index) => {
			map[keys[index]] = current;
			return map;
		}, {});
	}

	async fromCallback(callback: (err?: Error, result?: any) => any, asyncTask: () => Promise<any>) {

		try {
			const result = await asyncTask();
			callback(undefined, result);
		} catch (err) {
			callback(err);
		}

	}

}
