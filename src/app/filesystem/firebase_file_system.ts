import * as admin from 'firebase-admin';
import {Bucket} from 'google-cloud__storage';
import {WriteStream} from 'fs';
import {inject, injectable} from 'inversify';
import {FilesystemConfig, IFilesystem} from './file_system';
import * as stream from 'stream';
import {TYPES} from '../core/types';

@injectable()
export class FirebaseFileSystem implements IFilesystem {

	private bucket: Bucket;

	constructor(@inject(TYPES.FilesystemConfig) private config: FilesystemConfig, private storage: admin.storage.Storage) {
		this.bucket = this.storage.bucket(config.firebaseConfig.bucket);
	}

	createWriteStream(path: string) {
		return this.bucket.file(path).createWriteStream();
	}

	createReadStream(path: string): stream.Readable {
		return this.bucket.file(path).createReadStream();
	}

	async readFile(path: string, encoding?: string): Promise<string | Buffer> {
		const result = await this.bucket.file(path).download();
		return result[0];
	}

	async exists(path: string): Promise<boolean> {
		const result = await this.bucket.file(path).exists();
		return result[0];
	}

	writeStreamToFile(path: string, stream: stream.Readable, options?): Promise<any> {
		return undefined;
	}

	getUploadUrl(path: string): string {
		return null;
	}

	unlink(path: string): Promise<any> {
		return this.bucket.file('path').delete();
	}

	mkdir(path: string): Promise<void> {
		return Promise.resolve();
	}

}
