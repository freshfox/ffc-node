import {LocalFileSystem} from './local_filesystem';
import {TYPES} from '../core/types';
import {FilesystemConfig, FilesystemType, IFilesystem} from './file_system';
import {S3FileSystem} from './s3_file_system';
import {TmpFileSystem} from './tmp_file_system';
import {ContainerModule, interfaces} from 'inversify';

export class FilesystemModule {

	private module: ContainerModule;

	constructor(fs: interfaces.Newable<IFilesystem>, config?: FilesystemConfig) {
		this.module = new ContainerModule((bind) => {
			bind(TmpFileSystem).toSelf().inSingletonScope();
			bind(S3FileSystem).toSelf().inSingletonScope();
			bind(LocalFileSystem).toSelf().inSingletonScope();

			bind<IFilesystem>(TYPES.FileSystem).to(fs).inSingletonScope();

			if (config) {
				bind(TYPES.FilesystemConfig).toConstantValue(config);
			}
		})
	}

	static create(config?: FilesystemConfig): ContainerModule {
		let constructor: interfaces.Newable<IFilesystem>;
		switch (config.defaultType) {

			case FilesystemType.LOCAL:
				constructor = LocalFileSystem;
				break;
			case FilesystemType.TMP:
				constructor = TmpFileSystem;
				break;
			case FilesystemType.S3:
				constructor = S3FileSystem;
				break;
			default:
				throw new Error('unsupported filesystem type: ' + config.defaultType);
		}
		let md = new FilesystemModule(constructor, config);
		return md.module;
	}
}
