import {TestCase} from "./test_case";
import {BaseRepository} from "./base_repository";

export class FFCore {

	private static Config: any;
	public static Bookshelf: any;
	public static BaseModel;

	static configure(config: FFCoreConfig) {
		if (config.database) {
			let knex = require('knex')(config.database);
			let cascadeDelete = require('bookshelf-cascade-delete');
			let bookshelf = require('bookshelf')(knex);

			bookshelf.plugin(cascadeDelete);
			this.Bookshelf = FFCore.Config.Bookshelf = BaseRepository.Bookshelf = bookshelf;
			this.BaseModel = require('./base_model').BaseModel;
		}

		this.Config = TestCase.Config = config;
	}
}

export interface FFCoreConfig {

	database?: any

}

export { BaseRepository } from './base_repository';
export { TestCase } from './test_case';
export { BaseController } from './base_controller';
export { Pagination } from './pagination';
export { WebError } from './error';
export { Server } from './server';
export * from './router';
