"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Checkit = require("checkit");
const BPromise = require("bluebird");
const _ = require("lodash");
const error_1 = require("./error");
class Validator {
    /**
     * Validates a given data set against the rules
     * @param rules
     * @param data
     * @return {Promise}
     */
    static validate(rules, data) {
        let subRules = _.pickBy(rules, _.isPlainObject);
        rules = _.omitBy(rules, _.isPlainObject);
        let validatedObject = {};
        let subErrors = {};
        let hasSubError = false;
        _.forOwn(subRules, function (val, key) {
            if (val._self) {
                rules[key] = val._self;
                val = _.omit(val, '_self');
            }
            for (let i = 0; i < data[key].length; i++) {
                let result = new Checkit(val).runSync(data[key][i]);
                validatedObject[key] = validatedObject[key] || [];
                subErrors[key] = subErrors[key] || [];
                if (result[0]) {
                    let err = this.createError(result[0]);
                    hasSubError = true;
                    subErrors[key].push(err);
                }
                else {
                    validatedObject[key].push(result[1]);
                    subErrors[key].push({});
                }
            }
        });
        let checkit = new Checkit(rules);
        let result = checkit.runSync(data);
        let error;
        if (result[0]) {
            error = this.createError(result[0]);
        }
        if (hasSubError) {
            error = error || {};
            _.defaults(error, subErrors);
        }
        if (error) {
            error = error_1.WebError.createValidationError(error);
        }
        else {
            _.defaults(validatedObject, result[1]);
        }
        return new BPromise(function (resolve, reject) {
            if (error) {
                reject(error);
            }
            else {
                resolve(validatedObject);
            }
        });
    }
    static register(name, callback) {
        Checkit.Validator.prototype[name] = callback;
    }
    ;
    static createError(err) {
        let stack = {};
        err.each(function (fieldError) {
            stack[fieldError.key] = [];
            fieldError.each(function (singleErr) {
                stack[fieldError.key].push(singleErr.rule);
            });
        });
        return stack;
    }
}
exports.Validator = Validator;
Validator.register('boolean', (val) => {
    return typeof val == 'boolean';
});
Validator.register('dateString', (dateString) => {
    // First check for the pattern
    let regex_date = /^\d{4}-\d{1,2}-\d{1,2}$/;
    if (!regex_date.test(dateString)) {
        return false;
    }
    // Parse the date parts to integers
    let parts = dateString.split("-");
    let day = parseInt(parts[2], 10);
    let month = parseInt(parts[1], 10);
    let year = parseInt(parts[0], 10);
    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12) {
        return false;
    }
    let monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
        monthLength[1] = 29;
    }
    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
});
//# sourceMappingURL=validator.js.map