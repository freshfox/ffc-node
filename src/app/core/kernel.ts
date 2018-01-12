import "reflect-metadata";
import {interfaces as expressInterfaces, TYPE} from 'inversify-express-utils';
import {Container, ContainerModule, decorate, injectable, interfaces} from 'inversify';

export class Kernel {

	private container = new Container();

	public singleton(classes: interfaces.Newable<any>[]) {
		classes.forEach((clazz) => {
			this.container.bind(clazz).toSelf().inSingletonScope();
		});
	}

	public bindSingleton<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, clazz: interfaces.Newable<any>) {
		this.container.bind<T>(serviceIdentifier).to(clazz).inSingletonScope();
	};

	load(...modules: ContainerModule[]) {
		this.container.load(...modules);
	}

	bindExpressController(clazz: interfaces.Newable<any>) {
		this.getContainer().bind<expressInterfaces.Controller>(TYPE.Controller)
			.to(clazz).whenTargetNamed(clazz.name);
	}

	public getContainer() {
		return this.container;
	}

	public setParent(kernel: Kernel) {
		this.container.parent = kernel.container;
	}

	static decorate(clazz: any) {
		if (!Reflect.hasOwnMetadata('inversify:paramtypes', clazz)) {
			decorate(injectable(), clazz);
		}
	}

	resolve<T>(constructorFunction: interfaces.Newable<T>): T {
		return this.container.resolve(constructorFunction);
	}

}
