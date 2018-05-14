import * as stream from "stream";
import {Writable} from 'stream';

export class FileUtils {

	static writeToStream(data: any): stream.Readable {
		const s = new stream.Readable();
		s._read = function noop() {};
		s.push(data);
		s.push(null);
		return s;
	}

	awaitWriteFinish(stream: Writable) {
		return new Promise((resolve, reject) => {
			stream.on('finish', resolve);
			stream.on('error', reject)
		});
	}

}
