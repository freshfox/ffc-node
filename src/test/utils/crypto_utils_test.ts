import {CryptoUtils} from '../../app';
import * as should from 'should';

describe('CryptoUtils', function () {

	it('should generate alpha numeric strings', () => {

		const str1 = CryptoUtils.createRandomAplhaNumString(10);
		should(str1).length(10);

	});


});
