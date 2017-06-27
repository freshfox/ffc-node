import * as http from "http";

export class Server {

	private server: any;

	constructor(private app: any, private port: number) {
	}

	start() {
		return new Promise((resolve) => {
			let self = this;
			let server = http.createServer(this.app);
			server.listen(this.port, function() {
				self.server = this;
				resolve(this);
			});
		});
	}

	stop() {
		if (this.server) {
			let result = this.server.close();
			this.server = null;
			return result;
		}
	}

}
