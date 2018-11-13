import {Utils} from '../../app/utils/utils';
import * as should from 'should';

describe('Utils', function () {

    it('should map values of object', async () => {

    	const obj1 = {
			keyA: 'a',
			keyB: 'b',
			keyC: 'c',
		};

    	let i = 0;
    	const obj2 = Utils.mapValues(obj1, (key, value) => {
			return value + i++;
		});

    	should(obj2).eql({
			keyA: 'a0',
			keyB: 'b1',
			keyC: 'c2',
		});

    });

});
