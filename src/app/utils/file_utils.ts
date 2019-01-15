import * as stream from "stream";
import {Writable} from 'stream';
import {IFilesystem} from '..';
import * as http from "https";

export class FileUtils {

	static writeToStream(data: any): stream.Readable {
		const s = new stream.Readable();
		s._read = function noop() {};
		s.push(data);
		s.push(null);
		return s;
	}

	static awaitWriteFinish(stream: Writable) {
		return new Promise((resolve, reject) => {
			stream.on('finish', resolve);
			stream.on('error', reject)
		});
	}

	static downloadFile(fs: IFilesystem, url: string, destination: string) {
		return new Promise((resolve, reject) => {
			const stream = fs.createWriteStream(destination);
			const request = http.get(url, (response) => {
				const statusCode = response.statusCode;
				if (statusCode >= 400) {
					reject(new Error(`Failed to download [${statusCode}] ${url}`));
				} else {
					response.pipe(stream);
				}
			});
			stream.on('close', () => {
				resolve(destination);
			});
			stream.on('error', reject);
			request.on('error', reject);
		});
	}

}
