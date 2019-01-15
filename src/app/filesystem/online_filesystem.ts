import {IFilesystem} from './filesystem';

export interface IOnlineFilesystem extends IFilesystem {

	getUploadUrl(path: string, validUntil: Date): Promise<string>;

	getDownloadUrl(path: string, validUntil: Date): Promise<string>;

}
