"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const base_test_case_1 = require("./base_test_case");
class FFCore {
    static configure(config) {
        let knex = require('knex')(config.database);
        let cascadeDelete = require('bookshelf-cascade-delete');
        let bookshelf = require('bookshelf')(knex);
        bookshelf.plugin(cascadeDelete);
        FFCore.Config = base_test_case_1.BaseTestCase.Config = config;
        FFCore.Config.Bookshelf = bookshelf;
    }
}
exports.FFCore = FFCore;
var base_repository_1 = require("./base_repository");
exports.BaseRepository = base_repository_1.BaseRepository;
var base_test_case_2 = require("./base_test_case");
exports.BaseTestCase = base_test_case_2.BaseTestCase;
var error_1 = require("./error");
exports.WebError = error_1.WebError;
__export(require("./router"));
//# sourceMappingURL=index.js.map