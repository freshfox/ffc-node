/// <reference types="bookshelf" />
import { Model } from 'bookshelf';
export declare class BaseModel extends Model<Model<any>> {
    static load: string[];
}
