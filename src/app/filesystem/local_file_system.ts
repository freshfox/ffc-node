import 'reflect-metadata';
import * as fs from 'fs';
import {injectable} from 'inversify';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import {IFilesystem} from './filesystem';
import * as stream from "stream";

@injectable()
export class LocalFilesystem implements IFilesystem {

	exists(path: string): Promise<boolean> {
		return new Promise((resolve) => {
			fs.access(this.getPath(path), (err) => {
				resolve(!err);
			})
		});
	}

	mkdir(path: string): Promise<any> {
		return this.ensureDirectoryExists(path);
	}

	createWriteStream(file: string) {
		file = this.getPath(file);
		mkdirp.sync(path.dirname(file));
		return fs.createWriteStream(file);
	}

	createReadStream(path: string) {
		return fs.createReadStream(this.getPath(path));
	}

	readFile(path: string, encoding): Promise<string | Buffer> {
		return new Promise((resolve, reject) => {
			fs.readFile(this.getPath(path), encoding, (err, content) => {
				if (err) {
					reject(err);
				} else {
					resolve(content);
				}
			})
		});
	}

	writeStreamToFile(file: string, stream: stream.Readable, options?) {
		const absPath = this.getPath(file);
		return new Promise(async (resolve, reject) => {
			await this.ensureDirectoryExists(file);
			let fileStream = fs.createWriteStream(absPath, options);
			stream.pipe(fileStream);
			stream.on('end', () => {
				resolve(file);
			});
			stream.on('error', reject);
		});
	}

	async writeDataToFile(file: string, data, options?) {
		const absPath = this.getPath(file);
		await this.ensureDirectoryExists(file);
		return new Promise((resolve, reject) => {
			fs.writeFile(absPath, data, options, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(absPath);
				}
			});
		});
	}

	unlink(path: string) {
		return new Promise((resolve, reject) => {
			fs.unlink(this.getPath(path), (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	// noinspection JSMethodCanBeStatic
	getPath(path: string) {
		return path;
	}

	async readDir(path: string): Promise<string[]> {
		const dirExists = await this.exists(path);
		if (!dirExists) {
			return [];
		}
		return new Promise((resolve, reject) => {
			fs.readdir(this.getPath(path), (err, files) => {
				if (err) {
					reject(err);
				} else {
					resolve(files);
				}
			});
		});
	}

	ensureDirectoryExists(file: string) {
		const dir = path.dirname(this.getPath(file));
		return new Promise((resolve, reject) => {
			mkdirp(dir, (err) => {
				if (err) {
					return reject(err);
				}
				return resolve();
			});
		});
	}
}
