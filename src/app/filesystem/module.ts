import {LocalFilesystem} from './local_file_system';
import {TYPES} from '../core/types';
import {IFilesystem, ITmpFilesystemConfig} from './filesystem';
import {TmpFilesystem} from './tmp_file_system';
import {ContainerModule, interfaces} from 'inversify';

export class FilesystemModule {

	private module: ContainerModule;

	constructor(fs: interfaces.Newable<IFilesystem>, config?: ITmpFilesystemConfig) {
		this.module = new ContainerModule((bind) => {
			bind(TmpFilesystem).toSelf().inSingletonScope();
			bind(LocalFilesystem).toSelf().inSingletonScope();

			bind<IFilesystem>(TYPES.Filesystem).to(fs).inSingletonScope();

			if (config) {
				bind(TYPES.FilesystemConfig).toConstantValue(config);
			}
		})
	}

	static create(fs: interfaces.Newable<IFilesystem>, config?: ITmpFilesystemConfig): ContainerModule {
		let md = new FilesystemModule(fs, config);
		return md.module;
	}
}
