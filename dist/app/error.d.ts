export declare class WebError extends Error {
    code: number;
    message: string;
    errors: any;
    constructor(code: number, message: string, errors?: any);
    static badRequest(message: any, stack?: any): WebError;
    static unauthorized(message: any): WebError;
    static notFound(message: any): WebError;
    static forbidden(message: any): WebError;
    static internalServerError(): WebError;
    static validationFailed(stack: any): WebError;
    static createValidationError(stack: any): WebError;
}
