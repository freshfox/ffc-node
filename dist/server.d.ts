export declare class Server {
    private app;
    private port;
    private server;
    constructor(app: any, port: number);
    start(): Promise<{}>;
    stop(): any;
}
