import {Kernel} from './kernel';
import {Container, interfaces} from 'inversify';

export abstract class BaseServiceProvider {

	protected kernel = new Kernel();

	constructor(overrides?: Kernel) {
		this.registerDependencies();
		if (overrides) {
			overrides.setParent(this.kernel);
			this.kernel = overrides;
		}

	}

	protected abstract registerDependencies();

	resolve<T>(constructorFunction: interfaces.Newable<T>): T {
		return this.kernel.resolve(constructorFunction);
	}

	getContainer(): Container {
		return this.kernel.getContainer();
	}

}
