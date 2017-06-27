export declare abstract class Server {
    protected app: any;
    protected port: number;
    protected server: any;
    constructor(app: any, port: number);
    abstract configure(): any;
    start(): Promise<{}>;
    stop(): any;
}
