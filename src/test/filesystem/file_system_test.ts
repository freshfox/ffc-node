import {FilesystemType, LocalFileSystem, TmpFileSystem} from '../../app';
import {Container} from 'inversify';
import {FilesystemModule} from '../../app/filesystem/module';

describe('FileSystem', function () {

	const container = new Container();
	const module = FilesystemModule.create({
		defaultType: FilesystemType.TMP,
		tmpDirectory: '/tmp/ffc-node'
	});
	container.load(module);
	const fs = container.resolve(TmpFileSystem);
	const local = container.resolve(LocalFileSystem);

    it('should write a file', async () => {

		const text = 'example text ' + Date.now();

    	const file = __dirname + '/../../../test/assets/bg.jpg';
    	const stream =  fs.createWriteStream('test/image.jpg');

		stream.write(text);

		return new Promise((resolve) => {
			stream.end(resolve);
		})


    });

});
