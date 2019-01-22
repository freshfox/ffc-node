import * as Checkit from 'checkit';
import * as _ from 'lodash';
import {WebError} from "../error";
import {injectable} from 'inversify';
import * as moment from 'moment';

@injectable()
export class Validator {

	validate<T>(baseRules: RuleSet<T>, data: T): Promise<T> {

		let subRules = _.pickBy(baseRules, _.isPlainObject);
		const rules = _.omitBy(baseRules, _.isPlainObject);

		let validatedObject = {};
		let subErrors = {};
		let hasSubError = false;
		_.forOwn(subRules, (val: any, key) => {
			if (val._self) {
				rules[key] = val._self;
				val = _.omit(val, '_self');
			}
			if (data[key]) {
				for (let i = 0; i < data[key].length; i++) {
					let result = new Checkit(val).runSync(data[key][i]);
					validatedObject[key] = validatedObject[key] || [];
					subErrors[key] = subErrors[key] || [];
					if (result[0]) {
						let err = this.createError(result[0]);
						hasSubError = true;
						subErrors[key].push(err);
					} else {
						validatedObject[key].push(result[1]);
						subErrors[key].push({});
					}

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
			error = WebError.createValidationError(error);
		} else {
			_.defaults(validatedObject, result[1]);
		}

		return new Promise(function (resolve, reject) {

			if (error) {
				reject(error);
			} else {
				resolve(validatedObject as any);
			}

		});
	}

	static register(name, callback) {
		Checkit.Validator.prototype[name] = callback;
	};

	private createError(err) {
		let stack = {};
		err.each((fieldError) => {
			stack[fieldError.key] = [];
			fieldError.each((singleErr) => {
				stack[fieldError.key].push(this.getEnum(singleErr.rule))
			});
		});
		return stack;
	}

	getEnum(rule: string) {
		return rule;
	}

}

Validator.register('boolean', (val) => {
	return typeof val == 'boolean';
});

Validator.register('boolish', (val) => {
	return typeof val == 'boolean' || val === 1 || val === 0;
});

Validator.register('optional', () => {
	return true;
});

Validator.register('dateTime', (val) => {
	return moment(val, moment.ISO_8601, true).isValid();
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

export type RuleSet<T> = {
	[K in keyof T]: Rule;
};

export type Rule = string | string[];
