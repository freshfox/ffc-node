import {createFilesystemTestSuite, TmpFilesystem} from '../../app';
import {Container} from 'inversify';
import {FilesystemModule} from '../../app/filesystem/module';

describe('Filesystem', function () {

	const container = new Container();
	const module = FilesystemModule.create(TmpFilesystem, {
		tmpDirectory: '/tmp/ffc-node'
	});
	container.load(module);
	const fs = container.resolve(TmpFilesystem);

	createFilesystemTestSuite('tmp_fs', fs)

});
