import * as stream from "stream";

export interface ITmpFilesystemConfig {
	tmpDirectory?: string;
}

export const FilesystemConfig = Symbol('FilesystemConfig');

export interface IFilesystem {

	createWriteStream(path: string, opts?: any): stream.Writable;

	createReadStream(path: string, opts?: any): stream.Readable;

	readFile(path: string, encoding?: string): Promise<string|Buffer>;

	exists(path: string): Promise<boolean>;

	writeStreamToFile(path: string, stream: stream.Readable, options?): Promise<any>;

	unlink(path: string): Promise<any>;

	mkdir(path: string): Promise<void>;

	readDir(path: string): Promise<string[]>

}
