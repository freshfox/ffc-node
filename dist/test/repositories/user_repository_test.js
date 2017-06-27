"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_repository_1 = require("../../app/base_repository");
const index_1 = require("../../app/index");
describe('UserRepository', () => {
    it('should test something', () => {
        let core = index_1.FFCore;
        class User extends index_1.FFCore.Bookshelf.Model {
        }
        class UserRepo extends base_repository_1.BaseRepository {
            constructor() {
                super(User);
            }
        }
        console.log(new UserRepo());
    });
});
//# sourceMappingURL=user_repository_test.js.map