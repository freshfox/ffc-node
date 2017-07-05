
export function entity(tableName?: string) {
	return (constructor: Function) => {
		Object.assign(constructor, {
			tableName: tableName || constructor.name.toLowerCase() + 's'
		})
	};
}

export function property(type) {
	return (target: any, propertyKey: string) => {
		let schema = target.constructor.__schema || {};
		schema[propertyKey] = type;
		Object.assign(target.constructor, {
			__schema: schema
		});
	};
}

