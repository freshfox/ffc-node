"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class BaseController extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.defaultSortDirection = 'desc';
        this.defaultLimit = 999999;
    }
    /**
     * Reads query parameters and creates a sorting object
     * @param req - The incoming request
     * @returns {Sorting}
     *
     */
    getSorting(req) {
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
    getPagination(req) {
        let limit = req.query.limit || this.defaultLimit;
        return {
            limit: limit,
            offset: req.query.page ? req.query.page * limit : 0
        };
    }
}
module.exports = BaseController;
//# sourceMappingURL=base_controller.js.map