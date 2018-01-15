export function entity(tableName?: string, loadEager?: string[]) {
	return (constructor: Function) => {
		if (loadEager) {
			const desc = constructor as ModelDesc;
			desc.__eager = desc.__eager || [];
			loadEager.forEach((item) => {
				desc.__eager.push(item);
			});
		}
		Object.assign(constructor, {
			tableName: tableName || constructor.name.toLowerCase() + 's'
		})
	};
}

export function property(type, clazz?: new () => any) {
	return (target: any, propertyKey: string) => {
		addSchemaProperty(target.constructor, propertyKey, type, clazz);
	};
}

export function belongsTo(clazz: ModelDesc, loadEager?: boolean) {
	return (target: any, propertyKey: string) => {
		let desc = target.constructor as ModelDesc;
		addRelationProperty(desc, propertyKey, RelationType.BELONGS_TO, clazz);
		if (loadEager) {
			desc.__eager = desc.__eager || [];
			desc.__eager.push(propertyKey);
		}
	};
}

export function timestamps() {
	return (constructor: ModelDesc) => {
		constructor.timestamps = true;
	};
}

export function hasOne(clazz: ModelDesc, loadEager?: boolean) {
	return (target: any, propertyKey: string) => {
		let desc = target.constructor as ModelDesc;
		addRelationProperty(desc, propertyKey, RelationType.HAS_ONE, clazz);
		if (loadEager) {
			desc.__eager = desc.__eager || [];
			desc.__eager.push(propertyKey);
		}
	};
}

export function hasMany(clazz: ModelDesc, loadEager?: boolean) {
	return (target: any, propertyKey: string) => {
		let desc = target.constructor as ModelDesc;
		addRelationProperty(desc, propertyKey, RelationType.HAS_MANY, clazz);
		if (loadEager) {
			desc.__eager = desc.__eager || [];
			desc.__eager.push(propertyKey);
		}
	};
}

export function belongsToMany(clazz: ModelDesc, loadEager?: boolean, pivotAttributes?: string[]) {
	return (target: any, propertyKey: string) => {
		let desc = target.constructor as ModelDesc;
		addRelationProperty(desc, propertyKey, RelationType.BELONGS_TO_MANY, clazz, pivotAttributes);
		if (loadEager) {
			desc.__eager = desc.__eager || [];
			desc.__eager.push(propertyKey);
		}
	};
}

export function primary() {
	return (target: any, propertyKey: string) => {
		addSchemaProperty(target.constructor, propertyKey, 'uuid');
		addKeyProperty(target.constructor, propertyKey, 'primary')
	};
}

export function key(type) {
	return (target: any, propertyKey: string) => {
		addKeyProperty(target.constructor, propertyKey, type)
	};
}

function addSchemaProperty(proto, propertyKey: string, type: string, clazz?:  new () => any) {
	let schema = proto.__schema || {};
	schema[propertyKey] = {
		type: type,
		clazz: clazz
	};
	Object.assign(proto, {
		__schema: schema
	});
}

function addRelationProperty(proto: ModelDesc, propertyKey: string, type: RelationType, clazz?:  ModelDesc, pivotAttributes?: string[]) {
	proto.__relations = proto.__relations  || new Map<string, RelationDesc>();
	proto.__relations.set(propertyKey, {
		type: type,
		clazz: clazz,
		pivotAttributes: pivotAttributes
	});
}

function addKeyProperty(proto, propertyKey: string, type: string) {
	let keys = proto.__keys || {};
	keys[type] = propertyKey;
	Object.assign(proto, {
		__keys: keys
	});
}

export enum RelationType {

	BELONGS_TO = 'belongs_to' as any,
	HAS_ONE = 'has_one' as any,
	HAS_MANY = 'has_many' as any,
	BELONGS_TO_MANY = 'belongs_to_many' as any,

}

export interface ModelDesc {

	tableName?: string;
	timestamps?: boolean;
	__schema?: object;
	__relations?: Map<string, RelationDesc>
	__keys?: object;
	__eager?: string[]

}

export interface RelationDesc {

	type: RelationType,
	clazz: ModelDesc,
	pivotAttributes: string[]

}
