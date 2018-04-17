
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

	static async fromCallback(callback: (err?: Error, result?: any) => any, asyncTask: () => Promise<any>) {

		try {
			const result = await asyncTask();
			callback(undefined, result);
		} catch (err) {
			callback(err);
		}
	}

	static async parallel<T, K>(items: T[], batchSize: number,
								handler: (item: T) => Promise<K>,
								onBatchFinished?: (items: K[]) => void): Promise<K[]> {
		items = [...items];
		const all = [];
		while(items.length > 0) {
			const batch = items.splice(0, batchSize);
			const result = await Promise.all(batch.map((item) => {
				return handler(item);
			}));
			if (onBatchFinished) {
				onBatchFinished(result);
			}
		}
		return all;
	}

	static async parallelWithResult<T, K>(items: T[], batchSize: number,
								handler: (item: T) => Promise<K>): Promise<K[]> {
		const all = [];
		await this.parallel(items, batchSize, handler, (items) => {
			items.forEach((item) => {
				all.push(item);
			});
		});
		return all;
	}

}
