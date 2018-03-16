import * as stream from "stream";

export interface FilesystemConfig {
	defaultType: FilesystemType,
	tmpDirectory?: string;
	s3Config?: {
		bucket: string,
		region: string,
		uploadUrlExpireSeconds? : number
	},
	firebaseConfig?: {
		bucket: string
	}
}

export enum FilesystemType {
	LOCAL = 'local',
	S3 = 's3',
	FIREBASE = 'firebase',
	TMP = 'tmp'
}

export interface IFilesystem {

	createWriteStream(path: string): stream.Writable;

	createReadStream(path: string): stream.Readable;

	readFile(path: string, encoding?: string): Promise<string|Buffer>;

	exists(path: string): Promise<boolean>;

	writeStreamToFile(path: string, stream: stream.Readable, options?): Promise<any>;

	getUploadUrl(path: string): string;

	unlink(path: string): Promise<any>;

	mkdir(path: string): Promise<void>;

}
