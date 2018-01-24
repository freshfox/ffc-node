import {inject, injectable} from 'inversify';
import {Order, Pagination, StorageDriver, TYPES} from '../';
import {WebError} from '../error';
import {ModelDesc} from './decorators';

@injectable()
export abstract class BaseRepository<T> {

	@inject(TYPES.StorageDriver)
	protected dataStore: StorageDriver;

	protected model: any;

	find(data: T, options?): Promise<T> {
		return this.dataStore.find(this.model.tableName, data, options);
	}

	findById(id, options?): Promise<T> {
		return this.dataStore.findById(this.model.tableName, id, options);
	}

	async findByIdOrThrow(id, options?): Promise<T> {
		const model = await this.dataStore.findById(this.model.tableName, id, options);
		if (!model) {
			throw WebError.notFound('not found');
		}
		return model;
	}

	findOrThrow(data: T, options?): Promise<T> {
		return this.find(data, options)
			.then((model) => {
				if (!model) {
					throw WebError.notFound('not found');
				}
				return model;
			})
	}

	count(attributes?: T): Promise<number> {
		return this.dataStore.count(this.model.tableName, attributes);
	}

	save(data: T): Promise<T> {
		return this.dataStore.save(this.model.tableName, data);
	}

	list(attributes?: T, order?: Order, pagination?: Pagination, options?): Promise<T[]> {
		return this.dataStore.list(this.model.tableName, attributes, order, pagination, options);
	}

	query(filter?, options?): Promise<T[]> {
		return this.dataStore.query(this.model.tableName, filter, options);
	}

	batchQuery(callback: (items: T[]) => Promise<any>, queryBuilderCallback: (qb) => any, batchSize: number, options?) {
		const doBatch = async (i) => {
			let entries = await this.query((qb) => {
				qb.limit(batchSize);
				qb.offset(i * batchSize);
				queryBuilderCallback(qb);
			});

			if (entries.length === 0) {
				return;
			}
			await callback(entries);

			if (entries.length === batchSize) {
				return doBatch(i + 1);
			}
			return;
		};

		return doBatch(0);
	}

	destroy(attributes: T): Promise<null> {
		return this.dataStore.destroy(this.model.tableName, attributes);
	}

	batch(callback: (items: T[]) => Promise<any>, batchSize: number, attributes?, order?: Order, options?): Promise<T[]> {

		const doBatch = async (i) => {
			let entries = await this.list(attributes, order, {
				limit: batchSize,
				offset: i * batchSize
			}, options);

			if (entries.length === 0) {
				return;
			}
			await callback(entries);

			if (entries.length === batchSize) {
				return doBatch(i + 1);
			}
			return;
		};

		return doBatch(0);
	}

	associate(model, id, withId, resolveData?) {
		return this.dataStore.associate(this.model.tableName, model.tableName, id, withId, resolveData);
	}

	dissociate(model, id, withId) {
		return this.dataStore.dissociate(this.model.tableName, model.tableName, id, withId);
	}

	getEntity(model: ModelDesc) {
		return this.dataStore.getEntity(model.tableName);
	}

}
