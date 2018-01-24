export function entity(tableName?: string, loadEager?: string[]) {
	return (constructor: Function) => {
		tableName = tableName || constructor.name.toLowerCase() + 's';

		if (loadEager) {
			const desc = constructor as ModelDesc;
			desc.__eager = desc.__eager || [];
			loadEager.forEach((item) => {
				desc.__eager.push(item);
			});
		}
		Object.assign(constructor, {
			tableName: tableName
		})
	};
}

export function property(type, clazz?: new () => any) {
	return (target: any, propertyKey: string) => {
		addSchemaProperty(target.constructor, propertyKey, type, clazz);
	};
}

export function belongsTo(entity: string, loadEager?: boolean, foreignKey?: string) {
	return (target: any, propertyKey: string) => {

		let desc = target.constructor as ModelDesc;
		addRelationProperty(desc, foreignKey ? foreignKey : propertyKey, RelationType.BELONGS_TO, entity);
		if (loadEager) {
			desc.__eager = desc.__eager || [];
			desc.__eager.push(propertyKey);
		}
	};
}

export function timestamps() {
	return (constructor: ModelDesc | any) => {
		constructor.timestamps = true;
	};
}

export function hasOne(entity: string, loadEager?: boolean) {
	return (target: any, propertyKey: string) => {
		let desc = target.constructor as ModelDesc;
		addRelationProperty(desc, propertyKey, RelationType.HAS_ONE, entity);
		if (loadEager) {
			desc.__eager = desc.__eager || [];
			desc.__eager.push(propertyKey);
		}
	};
}

export function hasMany(entity: string, loadEager?: boolean, dependent?: boolean) {
	return (target: any, propertyKey: string) => {
		let desc = target.constructor as ModelDesc;
		addRelationProperty(desc, propertyKey, RelationType.HAS_MANY, entity);
		if (loadEager) {
			desc.__eager = desc.__eager || [];
			desc.__eager.push(propertyKey);
		}
		if (dependent) {
			addDependentRelation(desc, propertyKey);
		}
	};
}

export function belongsToMany(entity: string, loadEager?: boolean, pivotAttributes?: string[], dependent?: boolean) {
	return (target: any, propertyKey: string) => {
		let desc = target.constructor as ModelDesc;
		addRelationProperty(desc, propertyKey, RelationType.BELONGS_TO_MANY, entity, pivotAttributes);
		if (loadEager) {
			desc.__eager = desc.__eager || [];
			desc.__eager.push(propertyKey);
		}
		if (dependent) {
			addDependentRelation(desc, propertyKey);
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

function addDependentRelation(desc: ModelDesc, property: string) {
	desc.__dependents = desc.__dependents || [];
	desc.__dependents.push(property);
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

function addRelationProperty(proto: ModelDesc, propertyKey: string, type: RelationType, entity:  string, pivotAttributes?: string[]) {
	proto.__relations = proto.__relations  || new Map<string, RelationDesc>();
	proto.__relations.set(propertyKey, {
		type: type,
		entity: entity,
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
	__dependents?: string[]

}

export interface RelationDesc {

	type: RelationType,
	entity: string,
	pivotAttributes: string[]

}
