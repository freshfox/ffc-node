import 'reflect-metadata';
import {inject, injectable} from 'inversify';
import {Order, Pagination, StorageDriver, Query} from '../core/storage_driver';
import * as knex from 'knex';
import * as bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as jsonColumns from 'bookshelf-json-columns';
import * as dependents from 'bookshelf-cascade-delete';
import {WebError} from '../error';
import {ModelDesc, RelationDesc, RelationType} from './decorators';
import {TYPES} from '../core/types';
import Bookshelf = require('bookshelf');

@injectable()
export class MySQLDriver implements StorageDriver {

	private readonly knex;
	private bookshelf;
	private models = {};

	constructor(@inject(TYPES.KnexConfig) private config: KnexConfig) {
		this.knex = knex(config);
		this.bookshelf = bookshelf(this.knex);
		if (config.plugins) {
			if (config.plugins.cascadeDelete) {
				this.bookshelf.plugin(dependents);
			}
			if (config.plugins.jsonColumns) {
				this.bookshelf.plugin(jsonColumns);
			}
		}
	}

	findById(entity, id, options?) {
		return this.find(entity, {id: id}, options);
	}

	find(entity: string, data: any, options?): Promise<any> {
		return MySQLDriver.getModel(this, entity).forge(data)
			.fetch({
				withRelated: (options && options.withRelated) ? options.withRelated : MySQLDriver.getModel(this, entity).__eager
			})
			.then((model) => {
				if (!model) {
					return null;
				}
				return model.toJSON();
			});
	}

	list(entity: string, attributes, order: Order, pagination: Pagination, options): Promise<any> {
		return this.query(entity, this.createQuery(attributes, order, pagination), options);
	}

	save(entity: string, data: any): Promise<any> {
		return this.internalSave(MySQLDriver.getModel(this, entity), data)
			.then((model) => {
				return this.findById(entity, model.get('id'));
			});
	}

	async createTables(): Promise<any> {

		let instance = MySQLDriver.bootStrapConfig(this.config);
		const name = this.config.connection.database;
		await instance.raw(`CREATE DATABASE IF NOT EXISTS ${name}`);
		await instance.destroy();

		instance = knex(this.config);
		await instance.migrate.latest();
		await instance.destroy();
	}

	async clear() {
		let name = this.config.connection.database;
		let instance = MySQLDriver.bootStrapConfig(this.config);
		await instance.raw('DROP DATABASE IF EXISTS ' + name);
		await instance.raw('CREATE DATABASE ' + name);
		await instance.destroy();
	}

	private static bootStrapConfig(dbConfig: any) {
		return knex({
			client: 'mysql',
			connection: _.pick(dbConfig.connection, 'host', 'user', 'password', 'charset')
		});
	}

	count(entity: string, attributes?) {
		return MySQLDriver.getModel(this, entity).forge()
			.query()
			.where(attributes || {})
			.count()
			.then((count) => {
				return count[0]['count(*)'];
			})
	}

	countQuery(entity: string, query: (qb) => any) {
		return MySQLDriver.getModel(this, entity).forge()
			.query(query)
			.count()
			.then((count) => {
				if (typeof count === 'number') {
					return count;
				}
				return count[0]['count(*)'];
			})
	}

	destroy(entity: string, attributes) {
		const where = _.omit(attributes, 'id');
		let model = MySQLDriver.getModel(this, entity).forge(_.pick(attributes, 'id'));
		if (Object.keys(where).length) {
			model = model.where(where);
		}
		return model.destroy();
	};

	query(entity: string, filter: Query, options?) {
		return MySQLDriver.getModel(this, entity).collection()
			.query(filter)
			.fetch({
				withRelated: (options && options.withRelated) ? options.withRelated : MySQLDriver.getModel(this, entity).__eager
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

		const instance = MySQLDriver.getModel(this, entity).forge({id: entityId});
		const withInstance = MySQLDriver.getModel(this, withEntity).forge({id: withEntityId});

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

	dissociate(entity: string, withEntity: string, entityId, withEntityId) {
		const instance = MySQLDriver.getModel(this, entity).forge({id: entityId});
		const withInstance = MySQLDriver.getModel(this, withEntity).forge({id: withEntityId});

		let relation = instance.related(withInstance.tableName);
		if (!relation) {
			throw WebError.badRequest('Can not dissociate models');
		}
		return relation.detach(withInstance);
	}

	registerEntity(desc: ModelDesc) {
		let schema = {
			tableName: desc.tableName,
		};
		const jsonColumns = [];

		if (desc.__schema) {
			Object.keys(desc.__schema).forEach((key) => {
				const property = desc.__schema[key];
				switch (property.type) {
					case 'json':
						jsonColumns.push(key);
						break;
				}
			});
		}

		if (desc.__relations) {
			desc.__relations.forEach((value, key) => {
				switch (value.type) {

					case RelationType.BELONGS_TO:
						schema[key] = this.createBelongsTo(key, value.entity);
						break;

					case RelationType.HAS_ONE:
						schema[key] = this.createHasOne(key, value.entity);
						break;

					case RelationType.HAS_MANY:
						schema[key] = this.createHasMany(key, value.entity, value.order);
						break;

					case RelationType.BELONGS_TO_MANY:
						schema[key] = this.createBelongsToMany(key, value.entity, value);
						break;
				}
			})
		}

		let saveEventCallback = desc['onSave'];
		if (saveEventCallback && typeof saveEventCallback === 'function') {
			const self = this;
			schema['initialize'] = function () {
				self.bookshelf.Model.prototype.initialize.apply(this, arguments);
				this.on('saving', async (model, attributes, options) => {
					let overrides = await saveEventCallback(Object.assign({}, attributes), options);
					if (overrides) {
						model.set(overrides);
					}
				});
			}
		}

		if (desc.timestamps) {
			schema['hasTimestamps'] = true;
		}

		this.models[desc.tableName] = this.bookshelf.Model.extend(schema, {
			__eager: desc.__eager,
			jsonColumns: jsonColumns,
			dependents: desc.__dependents
		});
	}

	getEntity(entity: string) {
		return MySQLDriver.getModel(this, entity);
	}



	private createBelongsTo(property: string, entity: string) {
		let self = this;
		return function () {
			return this.belongsTo(MySQLDriver.getModel(self, entity), `${property}_id`)
		}
	}

	private createHasOne(property: string, entity: string) {
		let self = this;
		return function () {
			return this.hasOne(MySQLDriver.getModel(self, entity))
		}
	}

	private createHasMany(property: string, entity: string, order?: Order) {
		let self = this;
		return function () {
			let rel = this.hasMany(MySQLDriver.getModel(self, entity));
			if (order) {
				rel = rel.query('orderBy', order.column, order.direction);
			}
			return rel;
		}
	}

	private createBelongsToMany(property: string, entity: string, relation: RelationDesc) {
		let self = this;
		return function () {
			let rel = this.belongsToMany(MySQLDriver.getModel(self, entity));
			if (relation.pivotAttributes) {
				rel = rel.withPivot(relation.pivotAttributes);
			}
			if (relation.order) {
				rel = rel.query('orderBy', relation.order.column, relation.order.direction);
			}
			return rel;
		}
	}

	private static getModel(self: MySQLDriver, entity: string) {
		const model = self.models[entity];
		if (!model) {
			console.error('Unable to find entity ' + entity);
			throw WebError.internalServerError()
		}
		return model;
	}

	private async internalSave(model, data) {
		// Extract child objects and arrays
		let result = this.transformAndOmitAttachedObjects(model, data);
		let attributes = result.attributes;
		let relations = result.relations;

		// Save the model itself

		const instance = model.forge();
		const idAttribute = instance.idAttribute;

		const modelOnly = await model.forge(_.pick(attributes, 'id'))
			.save(attributes);
		const savedModel = await modelOnly.load(_.keys(relations));

		await this.saveRelations(savedModel, relations);

		return savedModel;
	}

	private async saveRelations(savedModel, relations) {
		const relationPromises = [];
		const keys = Object.keys(relations);
		for (const key of keys) {
			const value = relations[key];
			let relation = savedModel.related(key);
			let relationIds = [];
			if (relation instanceof this.bookshelf.Collection) {
				let foreignAttributes = {};
				if (relation.relatedData.type !== 'belongsToMany') {
					foreignAttributes[relation.relatedData.key('foreignKey')] = relation.relatedData.parentId;
				}
				for (let i = 0; i < value['length']; i++) {
					let result = this.transformAndOmitAttachedObjects(relation.model, value[i]);
					let p = await relation.model.forge(result.attributes).save(foreignAttributes);
					relationPromises.push(p);
					if (result.attributes.id) {
						relationIds.push(result.attributes.id);
					}
					await this.saveRelations(p, result.relations);
				}
				let existingIds = _.map(relation.toJSON(), mapIds);
				const loaded = await relation.load();
				console.log(loaded);
				let toDelete = _.difference(existingIds, relationIds);
				if (toDelete.length > 0) {
					relationPromises.push(relation.model.query().whereIn('id', toDelete).del());
				}
			}
		}

		if (relationPromises.length > 0) {
			await Promise.all(relationPromises)
		}
	}

	private transformAndOmitAttachedObjects(model, data) {
		let relations = {};
		let attributes = Object.assign({}, data);
		_.forOwn(attributes, function (value, key) {
			if (!_.isArray(model.jsonColumns) || (model.jsonColumns as string[]).indexOf(key) === -1) {
				if (_.isArray(value)) {
					relations[key] = value;
					attributes = _.omit(attributes, key);
				} else if (_.isObject(value) && !_.isDate(value)) {
					attributes = _.omit(attributes, key);
					if (value.id) {
						attributes[key + '_id'] = value.id;
					}

				} else if (value === null) {
					if (_.includes(model.__eager, key)) {
						attributes = _.omit(attributes, key);
						attributes[key + '_id'] = null;
					}
				}
			}
		});
		return {
			relations: relations,
			attributes: attributes
		};
	}
}

export interface KnexConfig {
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
	},
	plugins?: {
		cascadeDelete?: boolean,
		jsonColumns?: boolean
	}
}

function mapIds(value) {
	return value.id;
}
