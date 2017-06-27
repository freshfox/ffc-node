/// <reference types="node" />
import { EventEmitter } from "events";
export interface Route {
    name: string;
    method: Method;
    endpoint: string;
    callback: string;
}
export declare enum Method {
    GET,
    POST,
    PUT,
    PATCH,
    DELETE,
}
export declare class Router extends EventEmitter {
    private basePath;
    private routes;
    private nodes;
    constructor(path?: string);
    get(name: string, endpoint: string, func: string): void;
    post(name: string, endpoint: string, func: string): void;
    put(name: string, endpoint: string, func: string): void;
    patch(name: string, endpoint: string, func: string): void;
    destroy(name: string, endpoint: string, func: string): void;
    group(endpoint: any, callback: (r: Router) => any): void;
    crud(name: any, endpoint: any, controller: any, callback?: Function): void;
    getPath(endpoint: any): string;
    addRoute(method: Method, name: string, endpoint: string, func: string): void;
    init(app: any, controllers: any): void;
    getRoute(name: string): Route;
    print(): void;
}
