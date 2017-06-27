import "reflect-metadata";
import {EventEmitter} from "events";
import * as BPromise from "bluebird";
import * as _ from 'lodash';
import {WebError} from "./error";
import {Pagination} from "./pagination";
import {Sorting} from "./sorting";
import {injectable, unmanaged} from 'inversify';


/**
 * A base repository to access the database of a given model
 * @param model The bookshelf model
 * @constructor
 */

export interface IModelBase {

	tableName: string;
	load: string[];

}

@injectable()
export class BaseRepository<T extends IModelBase> extends EventEmitter {

	static Bookshelf: any;

	private tableName: string;
	private modelInstance: T;


	constructor(@unmanaged() private model : any) {
		super();
		this.modelInstance = new this.model();
		this.tableName = this.modelInstance.tableName;
	}

	/**
	 * Find one model by its id
	 * @param {Number} id - The id of the model
	 * @returns {Promise<T>}
	 */
	findById(id) {
		return this.find({id: id});
	};

	/**
	 * Find one model by given attributes
	 * @param {Object} attributes - Object of attributes which the model must have
	 * @returns {Promise<T>}
	 */
	find(attributes: any) {
		return new this.model(attributes)
			.fetch({withRelated: this.model.load})
			.then(function (model) {
				if (!model) {
					return;
				}
				return model.toJSON();
			});
	};

	/**
	 * Find one model by given attributes or throw an error if it doesn't exist
	 * @param {Object} attributes - Object of attributes which the model must have
	 * @returns {Promise<T>}
	 */
	findOrThrow(attributes: any) {
		return this.find(attributes)
			.then((model) => {
				if (!model) {
					throw WebError.notFound(`Model not found in ${this.tableName}(#${attributes ? JSON.stringify(attributes) : ''})`);
				}
				return model
			});
	}

	/**
	 * List all models filtered by given attributes
	 * @param {Object} [attributes] - Object of attributes which the models must have
	 * @param {Sorting} [order]
	 * @param {Pagination} [pagination]
	 * @param {Object} [options] - Some query options
	 * @returns {Promise}
	 */
	list(attributes?: any, order?: Sorting, pagination?: Pagination, options?: any) {
		return this.query(this.createQuery(attributes, order, pagination), options);
	}

	/**
	 * List all models filtered by given {attributes}
	 * @param {Object} filter - A filter object which knex can handle
	 * @param {Object} [options] - Some query options for knex
	 * @returns {Promise}
	 */
	query(filter: any, options?: any) {
		return this.model.collection()
			.query(filter)
			.fetch({
				withRelated: (options && options.withRelated) ? options.withRelated : this.model.load
			})
			.then(function (models) {
				if (!models) {
					return [];
				}
				return models.toJSON();
			});
	}

	count(attributes?: any) {
		return this.model.forge()
			.query()
			.where(attributes || {})
			.count()
			.then((count) => {
				return count[0]['count(*)'];
			})
	}

	/**
	 * Create or update(partial) a model
	 * @param {Object} data - An object of the attributes to be saved
	 * @returns {Promise}
	 */
	save(data) {
		let self = this;
		return save(this.model, data)
			.then(function (model) {
				return self.findById(model.get('id'));
			});
	};

	saveForAccount(accountId, data) {
		data.account_id = accountId;
		let promise = data.id
			? this.findOrThrow({id: data.id, account_id: accountId})
			: Promise.resolve(true);
		return promise
			.then(() => {
				return this.save(data);
			});
	}

	/**
	 * Delete a model by id
	 * @param data
	 * @returns {Promise}
	 */
	destroy(data) {
		return this.model.forge(_.pick(data, 'id', 'account_id')).destroy();
	};

	/**
	 * Creates a filter which knex can handle
	 * @param {Object} attributes - An object of attributes for exact matches
	 * @param {Sorting} order
	 * @param {Pagination} pagination
	 * @returns {Object}
	 */
	createQuery(attributes?: Object, order?: Sorting, pagination?: Pagination) {
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
	};

	associate<U extends IModelBase>(withRepo: BaseRepository<U>, accountId, baseModelId, withModelId, resolveData) {
		let self = this;
		let data;
		let relation;
		return BPromise.props({
			baseModel: this.find({id: baseModelId, account_id: accountId}),
			withModel: withRepo.find({id: withModelId, account_id: accountId})
		})
			.then((result) => {
				if (!result.baseModel || !result.withModel) {
					throw WebError.notFound('Unable to find model')
				}
				let baseModelInstance = self.model.forge({id: baseModelId});
				let withModelInstance = withRepo.model.forge({id: withModelId});
				let relation = baseModelInstance.related(withModelInstance.tableName);
				if (!relation) {
					throw WebError.badRequest('Can not associate models');
				}
				data = result;

				return relation.attach(withModelInstance).return(relation);
			})
			.then((r) => {
				relation = r;
				if (resolveData) {
					return resolveData.call(this, data.baseModel, data.withModel);
				}
			})
			.then((pivotData) => {
				if (pivotData) {
					return relation.updatePivot(pivotData);
				}
			});
	}

	dissociate<U extends IModelBase>(withRepo: BaseRepository<U>, accountId, baseModelId, withModelId) {

		return BPromise.props({
			baseModel: this.findOrThrow({id: baseModelId, account_id: accountId}),
			withModel: withRepo.findOrThrow({id: withModelId, account_id: accountId})
		})
			.then((result) => {
				let baseModelInstance = this.model.forge({id: baseModelId});
				let withModelInstance = withRepo.model.forge({id: withModelId});
				let relation = baseModelInstance.related(withModelInstance.tableName);
				if (!relation) {
					throw WebError.badRequest('Can not dissociate models');
				}
				return relation.detach(withModelInstance);
			})

	}

	listBetween(accountId, from, to, order?: Sorting, pagination?: Pagination, column = 'date') {
		let query = this.createQuery({
			account_id: accountId
		}, order, pagination);
		query.whereBetween = [column, [from, to]];

		return this.query(query);
	}
}


function save(model, data) {
	// Extract child objects and arrays
	let result = transformAndOmitAttachedObjects(model, data);
	let attributes = result.attributes;
	let relations = result.relations;

	// Save the model itself
	return model.forge(_.pick(attributes, 'id'))
		.save(attributes)
		.then(function (savedModel) {
			return savedModel.load(_.keys(relations));
		})
		.then(function (savedModel) {
			let relationPromises = [];
			_.forOwn(relations, (value: any, key) => {
				let relation = savedModel.related(key);
				let relationIds = [];
				if (relation instanceof BaseRepository.Bookshelf.Collection) {
					let foreignAttributes = {};
					if (relation.relatedData.type !== 'belongsToMany') {
						foreignAttributes[relation.relatedData.key('foreignKey')] = relation.relatedData.parentId;
					}
					for (let i = 0; i < value.length; i++) {
						let result = transformAndOmitAttachedObjects(relation.model, value[i]);
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
				return BPromise.all(relationPromises)
					.return(savedModel);
			}

			return savedModel;
		});
}

function transformAndOmitAttachedObjects(model, data) {
	let relations = {};
	let attributes = Object.assign({}, data);
	_.forOwn(attributes, function (value, key) {
		if (_.isArray(value)) {
			relations[key] = value;
			attributes = _.omit(attributes, key);
		} else if (_.isObject(value) && !_.isDate(value)) {
			attributes = _.omit(attributes, key);
			attributes[key + '_id'] = value.id;
		} else if (value === null) {
			if (_.includes(model.load, key)) {
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

function mapIds(value) {
	return value.id;
}
