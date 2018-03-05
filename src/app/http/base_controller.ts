import "reflect-metadata";
import {EventEmitter} from "events";
import {injectable} from 'inversify';
import {Order, OrderDirection, Pagination} from '../core/storage_driver';

@injectable()
export class BaseController {

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
	 * @param maxLimit
	 * @returns {Pagination}
	 */
	getPagination(req, maxLimit?: number): Pagination {
		let limit = parseInt(req.query.limit);
		if (maxLimit) {
			if (limit) {
				limit = Math.min(limit, maxLimit);
			} else {
				limit = maxLimit;
			}
		}
		if (limit) {
			return {
				limit: limit,
				offset: req.query.page? req.query.page * limit : 0
			};
		}
		return null;
	}

}
