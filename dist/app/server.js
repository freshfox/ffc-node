"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
class Server {
    constructor(app, port) {
        this.app = app;
        this.port = port;
    }
    start() {
        this.configure();
        return new Promise((resolve) => {
            let self = this;
            let server = http.createServer(this.app);
            server.listen(this.port, function () {
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
exports.Server = Server;
//# sourceMappingURL=server.js.map