import {BaseTestCase} from "./base_test_case";
import {BaseRepository} from "./base_repository";

export class FFCore {

	private static Config: any;
	public static Bookshelf: any;

	static configure(config) {
		let knex = require('knex')(config.database);
		let cascadeDelete = require('bookshelf-cascade-delete');
		let bookshelf = require('bookshelf')(knex);

		bookshelf.plugin(cascadeDelete);

		FFCore.Config = BaseTestCase.Config = config;
		FFCore.Bookshelf = FFCore.Config.Bookshelf = BaseRepository.Bookshelf = bookshelf;

	}
}

export { BaseRepository } from './base_repository';
export { BaseTestCase } from './base_test_case';
export { BaseController } from './base_controller';
export { Pagination } from './pagination';
export { WebError } from './error';
export { Server } from './server';
export * from './router';
