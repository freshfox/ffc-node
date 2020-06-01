import * as flat from 'flat';
import * as _ from 'lodash';
import {TranslateService} from './services/translate_service';
import {WebError} from './error';

export function shouldNotHappen(msg = 'Should not happen') {
	return (err) => {
		throw new Error(msg);
	}
}

export function checkLocalizedStrings(translateService: TranslateService) {
	let translations = translateService.getAll();
	let locales = Object.keys(translations);

	let flattened = _.mapValues(translations, (values) => {
		return flat(values);
	});

	let args = locales.map((locale) => {
		return Object.keys(flattened[locale]);
	});

	let diff = distinctSet(...args);

	diff.forEach((key) => {
		locales.forEach((locale) => {
			if (!flattened[locale][key]) {
				console.error(`${key} is not translated in ${locale}`);
			}
		})
	});
	if (diff.length) {
		throw new WebError(0, 'Not all strings are localized');
	}
}

const distinctSet = (...arrays) => {
	let diff = [];
	arrays.forEach((array1) => {
		arrays.forEach((array2) => {
			if (array1 === array2) {
				return;
			}
			_.difference(array1, array2).forEach((missing) => {
				if (diff.indexOf(missing) === -1) {
					diff.push(missing);
				}
			});
		});
	});
	return diff;
};
