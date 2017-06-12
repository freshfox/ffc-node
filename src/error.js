const util = require('util');

class WebError extends Error {

	constructor(code, message, stack) {
		super(message);
		this.code = code;
		this.message = message;
		this.errors = stack;

		this.name = this.constructor.name;
	}

	static badRequest (message, stack) {
		return new WebError(400, message || 'Bad Request', stack);
	}

	static unauthorized (message) {
		return new WebError(401, message || 'Unauthorized');
	}

	static notFound (message) {
		return new WebError(404, message || 'Not Found');
	}

	static forbidden (message) {
		return new WebError(403, message || 'Forbidden');
	}

	static internalServerError() {
		return new WebError(500, 'internal_server_error', 'We messed up.')
	}

	static validationFailed (stack) {
		return this.createValidationError(stack);
	}

	static createValidationError (stack) {
		return new WebError(400, 'Validation error', stack)
	}
}

module.exports = WebError;