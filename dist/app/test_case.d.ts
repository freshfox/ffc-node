import { Server } from './server';
export declare class TestCase {
    static Config: any;
    static server: Server;
    static init(context: any, useServer: any, useDatabase: any): void;
    static request(): any;
    static get(path: any): any;
    static post(path: any, data: any): any;
    static patch(path: any, data: any): any;
    static put(path: any, data: any): any;
    static destroy(path: any): any;
    static file(path: any, file: any, fieldName?: string): any;
    static _send(req: any): Promise<{}>;
    protected static startServer(): any;
    protected static createDatabase(): any;
    static send(req: any, auth: any): Promise<{}>;
    static shouldNotHappen(msg?: string): (err: any) => never;
}
