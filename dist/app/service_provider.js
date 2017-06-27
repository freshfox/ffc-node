"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const events_1 = require("events");
const base_repository_1 = require("./base_repository");
let UserRepository = class UserRepository extends base_repository_1.BaseRepository {
};
UserRepository = __decorate([
    inversify_1.injectable()
], UserRepository);
class ServiceProvider {
    constructor() {
        // Decorate third party classes
        this.container = new inversify_1.Container();
        inversify_1.decorate(inversify_1.injectable(), events_1.EventEmitter);
        this.container.bind(UserRepository).toSelf();
        let test = this.container.get(UserRepository);
        console.log(test);
    }
    resolve(constructorFunction) {
        return this.container.resolve(constructorFunction);
    }
}
exports.ServiceProvider = ServiceProvider;
//# sourceMappingURL=service_provider.js.map