/// <reference types="node" />
import { EventEmitter } from "events";
import { Sorting } from "./sorting";
import { Pagination } from "./pagination";
export declare class BaseController extends EventEmitter {
    private defaultSortDirection;
    private defaultLimit;
    /**
     * Reads query parameters and creates a sorting object
     * @param req - The incoming request
     * @returns {Sorting}
     *
     */
    getSorting(req: any): Sorting;
    /**
     * Reads query parameters and creates a pagination object
     * @param req - The incoming request
     * @returns {Pagination}
     */
    getPagination(req: any): Pagination;
}
