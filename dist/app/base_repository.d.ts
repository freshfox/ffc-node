/// <reference types="node" />
import "reflect-metadata";
import { EventEmitter } from "events";
import * as BPromise from "bluebird";
import { Pagination } from "./pagination";
import { Sorting } from "./sorting";
/**
 * A base repository to access the database of a given model
 * @param model The bookshelf model
 * @constructor
 */
export interface IModelBase {
    tableName: string;
    load: string[];
}
export declare class BaseRepository<T extends IModelBase> extends EventEmitter {
    private model;
    static Bookshelf: any;
    private tableName;
    private modelInstance;
    constructor(model: any);
    /**
     * Find one model by its id
     * @param {Number} id - The id of the model
     * @returns {Promise<T>}
     */
    findById(id: any): any;
    /**
     * Find one model by given attributes
     * @param {Object} attributes - Object of attributes which the model must have
     * @returns {Promise<T>}
     */
    find(attributes: any): any;
    /**
     * Find one model by given attributes or throw an error if it doesn't exist
     * @param {Object} attributes - Object of attributes which the model must have
     * @returns {Promise<T>}
     */
    findOrThrow(attributes: any): any;
    /**
     * List all models filtered by given attributes
     * @param {Object} [attributes] - Object of attributes which the models must have
     * @param {Sorting} [order]
     * @param {Pagination} [pagination]
     * @param {Object} [options] - Some query options
     * @returns {Promise}
     */
    list(attributes?: any, order?: Sorting, pagination?: Pagination, options?: any): any;
    /**
     * List all models filtered by given {attributes}
     * @param {Object} filter - A filter object which knex can handle
     * @param {Object} [options] - Some query options for knex
     * @returns {Promise}
     */
    query(filter: any, options?: any): any;
    count(attributes?: any): any;
    /**
     * Create or update(partial) a model
     * @param {Object} data - An object of the attributes to be saved
     * @returns {Promise}
     */
    save(data: any): any;
    saveForAccount(accountId: any, data: any): any;
    /**
     * Delete a model by id
     * @param data
     * @returns {Promise}
     */
    destroy(data: any): any;
    /**
     * Creates a filter which knex can handle
     * @param {Object} attributes - An object of attributes for exact matches
     * @param {Sorting} order
     * @param {Pagination} pagination
     * @returns {Object}
     */
    createQuery(attributes?: Object, order?: Sorting, pagination?: Pagination): any;
    associate<U extends IModelBase>(withRepo: BaseRepository<U>, accountId: any, baseModelId: any, withModelId: any, resolveData: any): BPromise<any>;
    dissociate<U extends IModelBase>(withRepo: BaseRepository<U>, accountId: any, baseModelId: any, withModelId: any): BPromise<any>;
    listBetween(accountId: any, from: any, to: any, order?: Sorting, pagination?: Pagination, column?: string): any;
}
