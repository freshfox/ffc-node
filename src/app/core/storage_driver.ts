import {ModelDesc} from '../storage/decorators';

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

	associate(entity: string, withEntity: string, entityId, withEntityId, resolveData?): Promise<any>

	clear();

}

export interface Query {

	order?: Order;
	pagination?: Pagination;


}

export interface Order {

	column: string;
	direction: OrderDirection;

}

export enum OrderDirection {

	ASC = 'asc' as any,
	DESC = 'desc' as any

}

export interface Pagination {

	limit: number;
	offset: number;

}
