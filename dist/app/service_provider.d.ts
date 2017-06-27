import "reflect-metadata";
import { interfaces } from 'inversify';
export declare class ServiceProvider {
    private container;
    constructor();
    resolve<T>(constructorFunction: interfaces.Newable<T>): T;
}
