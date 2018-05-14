import {TmpFilesystem} from '../../app';
import {Container} from 'inversify';
import {FilesystemModule} from '../../app/filesystem/module';

describe('Filesystem', function () {

	const container = new Container();
	const module = FilesystemModule.create(TmpFilesystem, {
		tmpDirectory: '/tmp/ffc-node'
	});
	container.load(module);
	const fs = container.resolve(TmpFilesystem);

    it('should write a file', async () => {

		const text = 'example text ' + Date.now();

    	const file = __dirname + '/../../../test/assets/bg.jpg';
    	const stream =  fs.createWriteStream('test/image.jpg');

		stream.write(text);


    });

});
