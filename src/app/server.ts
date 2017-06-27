import * as http from "http";

export abstract class Server {

	protected server: any;

	constructor(protected app: any, protected port: number) {
	}

	abstract configure();

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
