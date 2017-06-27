
import {FFCore} from './index';

export class BaseModel extends FFCore.Bookshelf.Model {

	static get tableName(): string {
		return undefined;
	}

	static get loadEager(): string[] {
		return undefined;
	}
}
