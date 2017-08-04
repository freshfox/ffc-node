import {Pagination} from '../http/pagination';
import {Order} from '../http/order';

export interface StorageDriver {

	find(entity: string, data, options?): Promise<any>;

	findById(entity: string, id, options?): Promise<any>;

	list(entity: string, attributes?, order?, pagination?, options?): Promise<any>;

	count(entity: string, attributes?);

	save(entity: string, data: any): Promise<any>;

	destroy(entity: string, attributes): Promise<any>;

	createQuery(attributes, order: Order, pagination: Pagination);

	query(entity: string, filter, options?);

	registerEntity(constructor: ModelDesc);

	createTables(): Promise<any>;

	clear();

}

export enum RelationType {

	BELONGS_TO = 'belongs_to' as any,
	HAS_ONE = 'has_one' as any,
	HAS_MANY = 'has_many' as any,

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
	clazz: ModelDesc

}
