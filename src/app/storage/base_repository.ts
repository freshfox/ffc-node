import {inject, injectable} from 'inversify';
import {StorageDriver} from './storage_driver';
import {TYPES} from '../types';

@injectable()
export class BaseRepository {

	@inject(TYPES.StorageDriver)
	private dataStore: StorageDriver;

	protected model: any;

	find(data) {
		return this.dataStore.find(this.model.tableName, data);
	}

	save(data) {
		return this.dataStore.save(this.model.tableName, data);
	}

	list() {
		return this.dataStore.list(this.model.tableName);
	}



}
