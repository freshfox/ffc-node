import {PromiseUtils} from '../../app';
import * as should from 'should';

describe('PromiseUtils', function () {


	it('should execute Promises in parallel', async () => {

		const resolveInTo = (ms: number, value: string) => {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(value);
				}, ms)
			})
		};

		const i = (ms: number, value: string) => {
			return {ms, value};
		};

		const items = [
			i(10, '1'),
			i(1, '2'),
			i(10, '3'),
			i(20, '4'),
			i(5, '5'),
			i(0, '6'),
			i(3, '7'),
			i(3, '8'),
			i(10, '9'),
		];
		const size = items.length;

		const batchResults = [];

		await PromiseUtils.parallel(items, 2, (item) => {
			return resolveInTo(item.ms, item.value);
		}, (items) => {
			batchResults.push(items);
		});

		const result = await PromiseUtils.parallelWithResult(items, 2, (item) => {
			return resolveInTo(item.ms, item.value);
		});

		should(items).length(size);
		should(result).length(size);
		should(result).eql(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
		should(batchResults).eql([['1', '2'], ['3', '4'], ['5', '6'], ['7', '8'], ['9']]);

	});


});
