import {LocalFileSystem} from './local_file_system';
import * as path from 'path';
import {inject, injectable} from 'inversify';
import {FilesystemConfig} from './file_system';
import {CryptoUtils} from '../utils/crypto_utils';
import {TYPES} from '../core/types';

@injectable()
export class TmpFileSystem extends LocalFileSystem {

	private directory = '/tmp/' + CryptoUtils.createRandomAplhaNumString(6);

	constructor(@inject(TYPES.FilesystemConfig) private config: FilesystemConfig) {
		super();
		if (this.config.tmpDirectory) {
			this.directory = this.config.tmpDirectory;
		}
	}

	protected getPath(file: string) {
		return path.join(this.directory, file)
	}

}
