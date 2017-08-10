import {injectable} from 'inversify';
import {Order, Pagination, StorageDriver} from '../core/storage_driver';
import * as knex from 'knex';
import * as bookshelf from 'bookshelf';
import * as _ from 'lodash';
import {WebError} from '../error';
import {ModelDesc, RelationDesc, RelationType} from './decorators';

@injectable()
export class MySQLDriver implements StorageDriver {

	private knex;
	private bookshelf;
	private models = {};

	constructor(private config: KnexConfig) {
		this.knex = knex(config);
		this.bookshelf = bookshelf(this.knex);
	}

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

		let instance = this.bootStrapConfig(this.config);
		const name = this.config.connection.database;
		await instance.raw(`CREATE DATABASE IF NOT EXISTS ${name}`);

		instance = knex(this.config);
		await instance.migrate.latest();
		await instance.destroy();
	}

	async clear() {
		let name = this.config.connection.database;
		let instance = this.bootStrapConfig(this.config);
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

	async associate(entity: string, withEntity: string, entityId, withEntityId, resolveData?) {
		const model = await this.findById(entity, entityId);
		const withModel = await this.findById(withEntity, withEntityId);
		if (!model || !withModel) {
			throw WebError.notFound('Unable to find model')
		}

		const instance = this.models[entity].forge({id: entityId});
		const withInstance = this.models[withEntity].forge({id: withEntityId});

		const relation = instance.related(withInstance.tableName);
		if (!relation) {
			throw WebError.badRequest('Can not associate unrelated models');
		}
		const key = relation.relatedData.key('otherKey');
		const existingAssociation = await relation
			.query((qb) => {
				qb.where(key, withInstance.id);
			}).fetch();
		if (!existingAssociation.length) {
			await relation.attach(withInstance)
		}
		if (resolveData) {
			const pivotData = await resolveData(model, withModel);
			const where = {};
			where[key] = withInstance.id;
			return relation.updatePivot(pivotData, {query: {where: where}});
		}
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

					case RelationType.BELONGS_TO_MANY:
						schema[key] = this.createBelongsToMany(key, value.clazz, value);
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
			return this.hasMany(self.models[clazz.tableName]);
		}
	}

	private createBelongsToMany(property: string, clazz: ModelDesc, relation: RelationDesc) {
		let self = this;
		return function () {
			let rel = this.belongsToMany(self.models[clazz.tableName]);
			if (relation.pivotAttributes) {
				rel.withPivot(relation.pivotAttributes);
			}
			return rel;
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

export interface KnexConfig  {
	client: string,
	debug: boolean,
	connection: {
		host: string,
		user: string,
		password: string,
		database: string,
		charset: string,
	},
	migrations: {
		directory: string
	},
	seeds: {
		directory: string
	}
}

function mapIds(value) {
	return value.id;
}
