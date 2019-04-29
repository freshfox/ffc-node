import {Request, Response, NextFunction} from 'express';
import {injectable} from 'inversify';

@injectable()
export class RequestLogger {

	constructor() {

	}

	getMiddleWare() {
		return this.log.bind(this);
	}

	private log(req: Request | any, res: Response, next: NextFunction) {
		const start = Date.now();
		// The 'finish' event will emit once the response is done sending
		res.once('finish', () => {

			const time = Date.now() - start;
			const code = res.statusCode;
			const line = `${req.method} ${code} ${req.path} ${time}ms`;

			if (code < 400) {
				console.log(line);
			} else {
				console.error(line);
			}
		});
		next();
	}

}
