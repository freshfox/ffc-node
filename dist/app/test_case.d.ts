import { Server } from './server';
export interface RequestOptions {
    headers?: Object;
}
export declare class TestCase {
    static Config: any;
    static server: Server;
    static defaultOptions: RequestOptions;
    static init(context: any, useServer: any, useDatabase: any): void;
    static request(): any;
    static get(path: any, opts?: RequestOptions): any;
    static post(path: any, data: any, opts?: RequestOptions): any;
    static patch(path: any, data: any, opts?: RequestOptions): any;
    static put(path: any, data: any, opts?: RequestOptions): any;
    static destroy(path: any, opts?: RequestOptions): any;
    static file(path: any, file: any, fieldName?: string, opts?: RequestOptions): any;
    private static opts(opts);
    protected static startServer(): any;
    protected static createDatabase(): any;
    static shouldNotHappen(msg?: string): (err: any) => never;
}
