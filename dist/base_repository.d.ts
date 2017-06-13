/// <reference types="node" />
import { EventEmitter } from "events";
import { Pagination } from "./pagination";
/**
 * A base repository to access the database of a given model
 * @param model The bookshelf model
 * @constructor
 */
export declare class BaseRepository extends EventEmitter {
    private model;
    private tableName;
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
    list(attributes: any, order: any, pagination: any, options: any): any;
    /**
     * List all models filtered by given {attributes}
     * @param {Object} filter - A filter object which knex can handle
     * @param {Object} [options] - Some query options for knex
     * @returns {Promise}
     */
    query(filter: any, options?: any): any;
    count(attributes: any): any;
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
    createQuery(attributes: any, order: any, pagination: Pagination): any;
    associate(withRepo: any, accountId: any, baseModelId: any, withModelId: any, resolveData: any): any;
    dissociate(withRepo: any, accountId: any, baseModelId: any, withModelId: any): any;
    listBetween(accountId: any, from: any, to: any, order: any, pagination: any, column?: string): any;
}
