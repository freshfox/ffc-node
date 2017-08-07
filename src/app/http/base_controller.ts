import "reflect-metadata";
import {EventEmitter} from "events";
import {Order, OrderDirection} from './order';
import {Pagination} from "./pagination";
import {injectable} from 'inversify';

@injectable()
export class BaseController extends EventEmitter {

	/**
	 * Reads query parameters and creates a sorting object
	 * @param req - The incoming request
	 * @returns {Order}
	 *
	 */
	getOrder(req): Order {
		if (req.query.sort) {
			let dir = req.query.direction;
			let isValidSort = dir && (dir.toLowerCase() === 'asc' || dir.toLowerCase() === 'desc');

			return {
				column: req.query.sort,
				direction: isValidSort ? dir : OrderDirection.ASC,
			};
		}
		return null;
	}

	/**
	 * Reads query parameters and creates a pagination object
	 * @param req - The incoming request
	 * @returns {Pagination}
	 */
	getPagination(req): Pagination {
		let limit = req.query.limit;
		if (limit) {
			return {
				limit: limit,
				offset: req.query.page? req.query.page * limit : 0
			};
		}
		return null;
	}

}
