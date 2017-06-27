"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
class BaseModel extends index_1.FFCore.Bookshelf.Model {
    static get tableName() {
        return undefined;
    }
    static get loadEager() {
        return undefined;
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=base_model.js.map