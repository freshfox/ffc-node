import {IFilesystem, FilesystemConfig} from './file_system';
import {inject, injectable} from 'inversify';
import {S3} from 'aws-sdk';
import * as mime from 'mime-types';
import * as stream from 'stream';
import {Readable} from 'stream';
import {TYPES} from '../core/types';

@injectable()
export class S3FileSystem implements IFilesystem {

	private s3Client: S3;

	constructor(@inject(TYPES.FilesystemConfig) private config: FilesystemConfig) {
		if (!config.s3Config.bucket) {
			throw new Error('No bucket configured. Please set \'app.awsConfig.bucket\'');
		}
		this.s3Client = new S3({
			params: {
				Bucket: config.s3Config.bucket
			}
		});
	}

	createReadStream(path: string) {
		return this.s3Client.getObject({
			Key: path,
			Bucket: this.config.s3Config.bucket
		}).createReadStream();
	}

	createWriteStream(path: string, options?) {
		const s = new stream.PassThrough();
		this.writeStreamToFile(path, s, options)
			.catch((err) => {
				console.error('Error writing stream');
				throw err;
			});
		return s;
	}

	async readFile(path: string, encoding?: string) {
		const resp = await this.s3Client.getObject({
			Key: path,
			Bucket: this.config.s3Config.bucket,
			ResponseContentEncoding: encoding,
		}).promise();
		if (encoding === 'utf8') {
			return resp.Body.toString();
		}
		return resp.Body as Buffer;
	}

	async exists(path: string): Promise<boolean> {
		try {
			await this.s3Client.headObject({
				Key: path,
				Bucket: this.config.s3Config.bucket
			}).promise();
		} catch(err) {
			if (err && err.code === 'NotFound') {
				return false;
			}
			throw err;
		}
		return true;
	}

	async unlink(path: string) {
		await this.s3Client.deleteObject({
			Key: path,
			Bucket: this.config.s3Config.bucket
		}).promise()
	}

	mkdir(path: string): Promise<void> {
		return Promise.resolve();
	}

	writeStreamToFile(path: string, stream: Readable, options?) {
		return this.s3Client.upload({
			Key: path,
			Body: stream,
			ContentDisposition: 'inline;',
			ContentType: mime.lookup(path),
			Bucket: this.config.s3Config.bucket
		}).promise();
	}

	getUploadUrl(path) {
		const signedUrlExpireSeconds = 60 * 10;
		let upload = this.s3Client.getSignedUrl('putObject', {
			Bucket: this.config.s3Config.bucket,
			Key: path,
			Expires: signedUrlExpireSeconds
		});
		return {
			download: this.getDownloadUrl(path),
			upload: upload,
		}
	}

	getDownloadUrl(path) {
		let region = this.config.s3Config.region;
		let bucket = this.config.s3Config.bucket;
		return `https://s3.${region}.amazonaws.com/${bucket}/${path}`;
	}

}
