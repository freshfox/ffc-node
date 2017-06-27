"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_repository_1 = require("../../app/base_repository");
const index_1 = require("../../app/index");
const test_case_1 = require("../../app/test_case");
const should = require("should");
describe('BaseRepository', function () {
    class User extends index_1.FFCore.Bookshelf.Model {
        //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
        get tableName() {
            return 'users';
        }
        //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
        get hasTimestamps() {
            return true;
        }
        posts() {
            return this.hasMany(Post);
        }
        static get load() {
            return ['posts'];
        }
    }
    class Post extends index_1.FFCore.Bookshelf.Model {
        //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
        get tableName() {
            return 'posts';
        }
        //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
        get hasTimestamps() {
            return true;
        }
    }
    class UserRepo extends base_repository_1.BaseRepository {
        constructor() {
            super(User);
        }
    }
    const userRepo = new UserRepo();
    test_case_1.TestCase.init(this, false, true);
    it('should save model', () => {
        let data = {
            firstname: 'Max',
            lastname: 'Pattern',
            password: 'password',
            email: 'max@pattern.com'
        };
        return userRepo.save(data)
            .then((user) => {
            return userRepo.findById(user.id);
        })
            .then((user) => {
            should(user).property('firstname', data.firstname);
            should(user).property('lastname', data.lastname);
            should(user).property('email', data.email);
            should(user).property('password', data.password);
            should(user).property('created_at');
            should(user).property('updated_at');
        });
    });
    it('should save multiple models and list them', () => {
        let data = (i) => {
            return {
                firstname: 'Max',
                lastname: 'Pattern',
                password: 'password',
                email: `max_${i}@pattern.com`
            };
        };
        return Promise.all([
            userRepo.save(data(0)),
            userRepo.save(data(1)),
            userRepo.save(data(2)),
        ])
            .then(() => {
            return userRepo.list();
        })
            .then((users) => {
            should(users).property('length', 3);
        });
    });
    it('should save a user and multiple posts', () => {
        return userRepo.save({
            firstname: 'Max',
            lastname: 'Pattern',
            password: 'password',
            email: 'max@pattern.com',
            posts: [{
                    title: 'My first post',
                    content: 'My first content'
                }, {
                    title: 'My second post',
                    content: 'My second content'
                }]
        })
            .then(() => {
            return userRepo.list();
        })
            .then((users) => {
            should(users).property('length', 1);
            should(users[0].posts).property('length', 2);
        });
    });
});
//# sourceMappingURL=base_repository_test.js.map