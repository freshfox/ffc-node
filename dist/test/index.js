"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../app/index");
console.log('Running index ', __filename);
const config = require('../../config/database');
index_1.FFCore.configure({
    database: config
});
//# sourceMappingURL=index.js.map