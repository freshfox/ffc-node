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
    static _startServer(): any;
    private static _createDatabase();
    static send(req: any, auth: any): Promise<{}>;
    static shouldNotHappen(msg?: string): (err: any) => never;
}
