"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const test_case_1 = require("./test_case");
const base_repository_1 = require("./base_repository");
class FFCore {
    static configure(config) {
        let knex = require('knex')(config.database);
        let cascadeDelete = require('bookshelf-cascade-delete');
        let bookshelf = require('bookshelf')(knex);
        bookshelf.plugin(cascadeDelete);
        this.Config = test_case_1.TestCase.Config = config;
        this.Bookshelf = FFCore.Config.Bookshelf = base_repository_1.BaseRepository.Bookshelf = bookshelf;
    }
}
exports.FFCore = FFCore;
var base_repository_2 = require("./base_repository");
exports.BaseRepository = base_repository_2.BaseRepository;
var test_case_2 = require("./test_case");
exports.TestCase = test_case_2.TestCase;
var base_controller_1 = require("./base_controller");
exports.BaseController = base_controller_1.BaseController;
var error_1 = require("./error");
exports.WebError = error_1.WebError;
var server_1 = require("./server");
exports.Server = server_1.Server;
__export(require("./router"));
//# sourceMappingURL=index.js.map