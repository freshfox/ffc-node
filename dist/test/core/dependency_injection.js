"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const inversify_1 = require("inversify");
const base_repository_1 = require("../../app/base_repository");
const index_1 = require("../../app/index");
const should = require("should");
describe('Dependency Injection', () => {
    it('should inject a dependency', () => {
        class User extends index_1.FFCore.Bookshelf.Model {
            //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
            get tableName() {
                return 'users';
            }
            //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
            get hasTimestamps() {
                return true;
            }
        }
        class UserRepository extends base_repository_1.BaseRepository {
            constructor() {
                super(User);
            }
        }
        let container = new inversify_1.Container();
        inversify_1.decorate(inversify_1.injectable(), events_1.EventEmitter);
        container.bind(UserRepository).toSelf();
        let test = container.get(UserRepository);
        should(test).instanceOf(UserRepository);
    });
});
//# sourceMappingURL=dependency_injection.js.map