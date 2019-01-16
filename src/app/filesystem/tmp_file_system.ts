import {LocalFilesystem} from './local_file_system';
import * as path from 'path';
import {inject, injectable} from 'inversify';
import {ITmpFilesystemConfig} from './filesystem';
import {CryptoUtils} from '../utils/crypto_utils';
import {TYPES} from '../core/types';

@injectable()
export class TmpFilesystem extends LocalFilesystem {

	private readonly directory = '/tmp/' + CryptoUtils.createRandomAplhaNumString(6);

	constructor(@inject(TYPES.FilesystemConfig) private config: ITmpFilesystemConfig) {
		super();
		if (this.config.tmpDirectory) {
			this.directory = this.config.tmpDirectory;
		}
	}

	getPath(file: string) {
		return path.join(this.directory, file)
	}

}
