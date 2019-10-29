import {createFilesystemTestSuite, TmpFilesystem} from '../../app';
import {Container} from 'inversify';
import {FilesystemModule} from '../../app/filesystem/module';
import * as should from 'should';

describe('Filesystem', function () {

	const container = new Container();
	const module = FilesystemModule.create(TmpFilesystem, {
		tmpDirectory: '/tmp/ffc-node'
	});
	container.load(module);
	const fs = container.resolve(TmpFilesystem);

	createFilesystemTestSuite('tmp_fs', fs);

	it('should get file stats', async () => {

		const file = 'fixed_size_file.txt';
		const content = 'The content of this file should not change';

		await fs.writeDataToFile(file, content);

		const stats = await fs.lstat(file);
		should(stats.size).eql(content.length);

	});

	it('should get directory stats', async () => {

		const dir = 'some-dir';
		const subDir = `${dir}/some-sub-dir`;
		let data = 'The content of this file should not change';
		await fs.writeDataToFile(`${dir}/fixed_size_file_0.txt`, data);
		await fs.writeDataToFile(`${dir}/fixed_size_file_1.txt`, data);
		await fs.writeDataToFile(`${dir}/fixed_size_file_2.txt`, data);
		await fs.writeDataToFile(`${dir}/fixed_size_file_3.txt`, data);

		await fs.writeDataToFile(`${subDir}/fixed_size_file_4.txt`, data);
		await fs.writeDataToFile(`${subDir}/fixed_size_file_5.txt`, data);
		await fs.writeDataToFile(`${subDir}/fixed_size_file_6.txt`, data);
		await fs.writeDataToFile(`${subDir}/fixed_size_file_7.txt`, data);

		const start = Date.now();
		const size = await fs.dirSize(dir);
		should(size).eql(8 * data.length);

	});

});
