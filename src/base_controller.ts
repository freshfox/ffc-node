
import {EventEmitter} from "events";
import {Sorting} from "./sorting";
import {Pagination} from "./pagination";

class BaseController extends EventEmitter {

	private defaultSortDirection: string = 'desc';
	private defaultLimit: number = 999999;

	/**
	 * Reads query parameters and creates a sorting object
	 * @param req - The incoming request
	 * @returns {Sorting}
	 *
	 */
	getSorting(req): Sorting {
		if (req.query.sort) {
			let dir = req.query.direction;
			let isValidSort = dir && (dir.toLowerCase() === 'asc' || dir.toLowerCase() === 'desc');

			return {
				column: req.query.sort,
				direction: isValidSort ? dir : this.defaultSortDirection,
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
		let limit = req.query.limit || this.defaultLimit;
		return {
			limit: limit,
			offset: req.query.page? req.query.page * limit : 0
		};
	}

}


module.exports = BaseController;
