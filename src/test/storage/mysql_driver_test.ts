import {entity} from '../../app/storage/decorators';
import {MySQLDriver} from '../../app/storage/mysql_driver';

@entity('users')
class UserModel {

	static onSave(attributes, options) {
		attributes.firstname += '_saved';
	}

}


describe('MysqlDriver', function () {

	const driver = new MySQLDriver(require('../../../config/database'));
	driver.registerEntity(UserModel);

    it('should save a model and call onSave', async () => {

	    const user = await driver.save('users', {
		    firstname: 'test',
		    lastname: 'test',
		    email: 'test4@test.com',
		    password: 'password'
	    });

	    console.log(user);
    });

});
