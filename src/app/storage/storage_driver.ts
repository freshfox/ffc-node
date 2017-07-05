
export interface StorageDriver {

	find(entity: string, data): Promise<any>;

	list(entity: string): Promise<any>;

	save(entity: string, data: any): Promise<any>;

	registerEntity(constructor: Function);

	createTables(): Promise<any>;

	clear();

}
