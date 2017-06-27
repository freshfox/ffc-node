import { FFCore } from './index';
export declare class BaseModel extends FFCore.Bookshelf.Model {
    static readonly tableName: string;
    static readonly loadEager: string[];
}
