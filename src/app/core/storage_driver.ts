import {ModelDesc} from '../storage/decorators';
import {QueryBuilder as KnexQueryBuilder} from 'knex';

export interface StorageDriver {

	find(entity: string, data, options?): Promise<any>;

	findById(entity: string, id, options?): Promise<any>;

	list(entity: string, attributes?, order?, pagination?, options?): Promise<any>;

	count(entity: string, attributes?);

	countQuery(entity: string, query: Query);

	save(entity: string, data: any): Promise<any>;

	destroy(entity: string, attributes): Promise<any>;

	createQuery(attributes, order: Order, pagination: Pagination);

	query(entity: string, filter: Query, options?);

	registerEntity(constructor: ModelDesc);

	getEntity(entity: string);

	createTables(): Promise<any>;

	associate(entity: string, withEntity: string, entityId, withEntityId, resolveData?): Promise<any>

	dissociate(entity: string, withEntity: string, entityId, withEntityId): Promise<any>

	clear();

}

export type Query = (qb: QueryBuilder) => void;

export type QueryBuilder = KnexQueryBuilder;

export interface Order {

	column: string;
	direction: 'asc' | 'desc';

}

export interface Pagination {

	limit: number;
	offset: number;

}
