import * as should from 'should';
import {OldValidator, WebError} from '../../app';

describe('Validator', function () {

	class CustomValidator extends OldValidator {

		getEnum(rule: string) {
			return 'custom';
		}

	}

	it('should test if getEnum() can be overridden', async () => {

		const validator = new CustomValidator();

		try {
			await validator.validate({
				name: ['required', 'string']
			}, {
				name: 123
			});
			// noinspection ExceptionCaughtLocallyJS
			throw Error('should not happen');
		} catch (err) {
			should(err).instanceOf(WebError);
			should(err.errors.name[0]).eql('custom');
		}


	});


});
