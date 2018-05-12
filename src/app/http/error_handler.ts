import {injectable} from 'inversify';
import {WebError} from '../error';

@injectable()
export class ErrorMiddleware {

	private readonly middleware: (req, res, next) => void;

	constructor() {
		this.middleware = this.handle.bind(this);
	}

	getMiddleware() {
		return this.middleware;
	}

	handle(err, req, res, next) {
		if (err instanceof WebError) {
			return res.status(err.code).render('error', {data: err});
		} else {
			console.error('Error:', err);
			this.onError(err);
			const error = WebError.internalServerError();
			return res.status(error.code).render('error', {data: error});
		}
	}

	onError(err) {}

}
