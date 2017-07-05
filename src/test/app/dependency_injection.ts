import "reflect-metadata";
import {EventEmitter} from 'events';
import {Container, decorate, injectable} from 'inversify';
import {BaseRepository} from '../../app/storage/base_repository';
import * as should from 'should';
import {StorageDriver} from '../../app/storage/storage_driver';
import {TYPES} from '../../app/types';

describe('Dependency Injection', () => {

	it('should inject a dependency', () => {


		@injectable()
		class UserRepository extends BaseRepository {

		}

		@injectable()
		class FakeStorageDriver implements StorageDriver {
			find(entity: string, data): Promise<any> {
				return undefined;
			}

			list(entity: string): Promise<any> {
				return undefined;
			}

			save(entity: string, data: any): Promise<any> {
				return undefined;
			}

			registerEntity(constructor: Function) {
			}

			createTables(): Promise<any> {
				return undefined;
			}

			clear() {
			}

		}

		let container = new Container();

		decorate(injectable(), EventEmitter);

		container.bind<StorageDriver>(TYPES.StorageDriver).to(FakeStorageDriver);
		container.bind(UserRepository).toSelf();

		let repo = container.get(UserRepository);
		let driver = container.get<StorageDriver>(TYPES.StorageDriver);

		should(repo).instanceOf(UserRepository);
		should(driver).instanceOf(FakeStorageDriver);

	});

});
