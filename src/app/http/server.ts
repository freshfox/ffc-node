import * as http from "http";
import {Container} from 'inversify';
import {Server as HttpServer} from "http";

export abstract class Server {

	protected server: HttpServer;

	constructor(public app: any, protected port: number) {
	}

	abstract configure();

	start() {
		this.configure();
		return this.boot();
	}

	boot(): Promise<void> {
		return new Promise((resolve) => {
			let self = this;
			let server = http.createServer(this.app);
			server.listen(this.port, function() {
				self.server = this;
				resolve();
			});
		});
	}

	stop() {
		if (this.server) {
			return new Promise((resolve) => {
				this.server.close(resolve);
				this.server = null;
			});
		}
		return Promise.resolve();
	}

	abstract getContainer(): Container;

	getServer() {
		return this.server;
	}

}
