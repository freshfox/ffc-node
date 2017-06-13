/// <reference types="node" />
import { EventEmitter } from "events";
export interface Route {
    method: string;
    endpoint: string;
    callback: Function;
    middleware: Function;
}
export declare class Router extends EventEmitter {
    private basePath;
    private routes;
    private nodes;
    constructor(path: any);
    get(endpoint: any, func: any, middleware: any): void;
    post(endpoint: any, func: any, middleware: any): void;
    put(endpoint: any, func: any, middleware: any): void;
    patch(endpoint: any, func: any, middleware: any): void;
    destroy(endpoint: any, func: any, middleware: any): void;
    group(endpoint: any, callback: any): void;
    crud(endpoint: any, controller: any, callback: any): void;
    getPath(endpoint: any): string;
    addRoute(method: any, endpoint: any, func: any, middleware?: any): void;
    init(app: any, controllers: any): void;
    print(): void;
}
