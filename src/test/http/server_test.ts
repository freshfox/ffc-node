import {Server} from "../../app";
import {Container} from "inversify";
import *  as express from 'express';

describe('Server', function () {

	it('should start a server', async () => {

		class TestServer extends Server {
			private container = new Container();

			configure() {
			}

			getContainer(): Container {
				return this.container;
			}
		}

		const server = new TestServer(express(), 3002);
		const r1 = await server.start();
		console.log(r1);
		const r2 = await server.stop();
		console.log(r2);
	});

});
