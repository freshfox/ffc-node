export declare class FFCore {
    private static Config;
    static Bookshelf: any;
    static BaseModel: any;
    static configure(config: FFCoreConfig): void;
}
export interface FFCoreConfig {
    database: any;
}
export { BaseRepository } from './base_repository';
export { TestCase } from './test_case';
export { BaseController } from './base_controller';
export { Pagination } from './pagination';
export { WebError } from './error';
export { Server } from './server';
export * from './router';
