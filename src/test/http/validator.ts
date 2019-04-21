import {Validator} from "../../app";
import * as should from 'should';

describe('Validator', function () {

	const schema = Validator.compile({
		email: Validator.schema.string().required().email(),
		password: Validator.schema.string().required().min(6),
		firstname: Validator.schema.string().required(),
		lastname: Validator.schema.string().required(),
		company: Validator.schema.string()
	});

	it('should check some data', async  () => {

		const data = {
			email: 'test@example.com',
			password: '123456',
			firstname: 'John',
			lastname: 'Doe',
		};
		const res = await Validator.validate(data, schema);
		should(res).eql(data);

	});

	it('should fail to validate wrong data', () => {

		return Validator.validate({}, schema).should.be.rejected();

	});

});
