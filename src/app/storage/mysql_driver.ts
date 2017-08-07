import "reflect-metadata";
import {injectable} from 'inversify';
import {ModelDesc, RelationType, StorageDriver} from '../core/storage_driver';
import * as knex from 'knex';
import * as bookshelf from 'bookshelf';
import * as _ from 'lodash';
import {Order} from '../http/order';
import {Pagination} from '../http/pagination';

@injectable()
export abstract class MySQLDriver implements StorageDriver {

	private knex;
	private bookshelf;
	private models = {};

	constructor() {
		this.knex = knex(this.getKnexConfig());
		this.bookshelf = bookshelf(this.knex);
	}

	protected abstract getKnexConfig();

	findById(entity, id, options?) {
		return this.find(entity, { id: id }, options);
	}

	find(entity: string, data: any, options?): Promise<any> {
		return this.models[entity].forge(data)
			.fetch({
				withRelated: (options && options.withRelated) ? options.withRelated : this.models[entity].__eager
			})
			.then(function (model) {
				if (!model) {
					return;
				}
				return model.toJSON();
			});
	}

	list(entity: string, attributes, order: Order, pagination: Pagination, options): Promise<any> {
		return this.query(entity, this.createQuery(attributes, order, pagination), options);
	}

	save(entity: string, data: any): Promise<any> {
		return this.internalSave(this.models[entity], data)
			.then((model) => {
				return this.findById(entity, model.get('id'));
			});
	}

	async createTables(): Promise<any> {
		const dbConfig = this.getKnexConfig();

		let instance = this.bootStrapConfig(dbConfig);
		const name = dbConfig.connection.database;
		await instance.raw(`CREATE DATABASE IF NOT EXISTS ${name}`);

		instance = knex(dbConfig);
		await instance.migrate.latest();
		await instance.destroy();
	}

	async clear() {
		let name = this.getKnexConfig().connection.database;
		let instance = this.bootStrapConfig(this.getKnexConfig());
		await instance.raw('DROP DATABASE IF EXISTS ' + name);
		await instance.raw('CREATE DATABASE ' + name);
		await instance.destroy();
	}

	private bootStrapConfig(dbConfig: any) {
		return knex({
			client: 'mysql',
			connection: _.pick(dbConfig.connection, 'host', 'user', 'password', 'charset')
		});
	}

	count(entity: string, attributes?) {
		return this.models[entity].forge()
			.query()
			.where(attributes || {})
			.count()
			.then((count) => {
				return count[0]['count(*)'];
			})
	}

	destroy(entity: string, attributes) {
		return this.models[entity].forge(attributes).destroy();
	};

	query(entity: string, filter, options?) {
		return this.models[entity].collection()
			.query(filter)
			.fetch({
				withRelated: (options && options.withRelated) ? options.withRelated : this.models[entity].__eager
			})
			.then(function (models) {
				if (!models) {
					return [];
				}
				return models.toJSON();
			});
	}

	createQuery(attributes, order: Order, pagination: Pagination) {
		let filter = attributes ? {where: attributes} : {} as any;
		if (order) {
			filter.orderBy = [order.column, order.direction];
		}
		if (pagination) {
			if (pagination.limit) {
				filter.limit = pagination.limit;
			}
			if (pagination.offset) {
				filter.offset = pagination.offset;
			}
		}
		return filter;
	}

	registerEntity(desc: ModelDesc) {
		let schema = {
			tableName: desc.tableName,
		};
		if (desc.__relations) {
			desc.__relations.forEach((value, key) => {
				switch (value.type) {

					case RelationType.BELONGS_TO:
						schema[key] = this.createBelongsTo(key, value.clazz);
						break;

					case RelationType.HAS_ONE:
						schema[key] = this.createHasOne(key, value.clazz);
						break;

					case RelationType.HAS_MANY:
						schema[key] = this.createHasMany(key, value.clazz);
						break;
				}
			})
		}
		if (desc.timestamps) {
			schema['hasTimestamps'] = true;
		}
		this.models[desc.tableName] = this.bookshelf.Model.extend(schema, {
			__eager: desc.__eager
		});
	}

	private createBelongsTo(property: string, clazz: ModelDesc) {
		let self = this;
		return function () {
			return this.belongsTo(self.models[clazz.tableName], `${property}_id`)
		}
	}

	private createHasOne(property: string, clazz: ModelDesc) {
		let self = this;
		return function () {
			return this.hasOne(self.models[clazz.tableName])
		}
	}

	private createHasMany(property: string, clazz: ModelDesc) {
		let self = this;
		return function () {
			return this.hasMany(self.models[clazz.tableName])
		}
	}

	private internalSave(model, data) {
		// Extract child objects and arrays
		let result = this.transformAndOmitAttachedObjects(model, data);
		let attributes = result.attributes;
		let relations = result.relations;
		// Save the model itself
		return model.forge(_.pick(attributes, 'id'))
			.save(attributes)
			.then(function (savedModel) {
				return savedModel.load(_.keys(relations));
			})
			.then((savedModel) => {
				let relationPromises = [];
				_.forOwn(relations, (value, key) =>{
					let relation = savedModel.related(key);
					let relationIds = [];
					if (relation instanceof this.bookshelf.Collection) {
						let foreignAttributes = {};
						if (relation.relatedData.type !== 'belongsToMany') {
							foreignAttributes[relation.relatedData.key('foreignKey')] = relation.relatedData.parentId;
						}
						for (let i = 0; i < value['length']; i++) {
							let result = this.transformAndOmitAttachedObjects(relation.model, value[i]);
							let p = relation.model.forge(result.attributes).save(foreignAttributes);
							relationPromises.push(p);
							if (result.attributes.id) {
								relationIds.push(result.attributes.id);
							}
						}
						let existingIds = _.map(relation.toJSON(), mapIds);
						let toDelete = _.difference(existingIds, relationIds);
						if (toDelete.length > 0) {
							relationPromises.push(relation.model.query().whereIn('id', toDelete).del());
						}
					}
				});
				if (relationPromises.length > 0) {
					return Promise.all(relationPromises)
						.then(() => {
							return savedModel;
						})
				}
				return savedModel;
			});
	}

	private transformAndOmitAttachedObjects(model, data) {
		let relations = {};
		let attributes = Object.assign({}, data);
		_.forOwn(attributes, function (value, key) {
			if (_.isArray(value)) {
				relations[key] = value;
				attributes = _.omit(attributes, key);
			}
			else if (_.isObject(value) && !_.isDate(value)) {
				attributes = _.omit(attributes, key);
				if (value.id) {
					attributes[key + '_id'] = value.id;
				}
			}
			else if (value === null) {
				if (_.includes(model.__eager, key)) {
					attributes = _.omit(attributes, key);
					attributes[key + '_id'] = null;
				}
			}
		});
		return {
			relations: relations,
			attributes: attributes
		};
	}
}

function mapIds(value) {
	return value.id;
}
