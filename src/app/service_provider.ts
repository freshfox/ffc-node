import "reflect-metadata";
import {Container, interfaces, decorate, injectable} from 'inversify';
import Newable = interfaces.Newable;
import {EventEmitter} from 'events';
import {BaseRepository} from './base_repository';

@injectable()
class UserRepository extends BaseRepository<any>{

}

export class ServiceProvider {

	private container: Container = new Container();

	constructor() {
		// Decorate third party classes

		decorate(injectable(), EventEmitter);

		this.container.bind(UserRepository).toSelf();

		let test = this.container.get(UserRepository);
		console.log(test);
	}

	resolve<T>(constructorFunction: interfaces.Newable<T>): T {
		return this.container.resolve(constructorFunction);
	}

}

