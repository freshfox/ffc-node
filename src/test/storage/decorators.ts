import {entity, hasMany, ModelDesc} from '../../app';
import {StorageDriver} from '../../app';
import {TYPES} from '../../app';
import {Container} from 'inversify';
import {KnexConfig, MySQLDriver} from '../../app';
import * as should from 'should';

@entity('posts')
class PostModel {

}


@entity('threads', ['posts.author'])
class ThreadModel {

	@hasMany('posts', {
		loadEager: true
	}) posts: any[];

}


describe('Decorators', function () {

	let container = new Container();
	container.bind<KnexConfig>(TYPES.KnexConfig).toConstantValue(require('../../../config/database'));
	container.bind<StorageDriver>(TYPES.StorageDriver).to(MySQLDriver).inSingletonScope();

	let driver = container.get<StorageDriver>(TYPES.StorageDriver);
	driver.registerEntity(PostModel as ModelDesc);
	driver.registerEntity(ThreadModel as ModelDesc);

	it('should decorate a class', () => {

		should((ThreadModel as ModelDesc).__eager).eql(['posts', 'posts.author']);

	});

});
