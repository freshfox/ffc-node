
import {ModelDesc, RelationDesc, RelationType} from '../core/storage_driver';

export function entity(tableName?: string) {
	return (constructor: Function) => {
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

function addRelationProperty(proto: ModelDesc, propertyKey: string, type: RelationType, clazz?:  ModelDesc) {
	proto.__relations = proto.__relations  || new Map<string, RelationDesc>();
	proto.__relations.set(propertyKey, {
		type: type,
		clazz: clazz
	});
}

function addKeyProperty(proto, propertyKey: string, type: string) {
	let keys = proto.__keys || {};
	keys[type] = propertyKey;
	Object.assign(proto, {
		__keys: keys
	});
}
