import {injectable} from 'inversify';

@injectable()
export class Validator2 {


	validate(rules, data) {

	}

}

const v = new Validator2();

const result = v.validate({

}, {
	id: 1,
	description: 'text',
	price: '100',

});
