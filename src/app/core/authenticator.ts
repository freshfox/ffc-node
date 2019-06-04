import {Request, Response} from 'express';

export interface Authenticator {

	getMiddleware(): (req: Request, res: Response, next?: Function) => any;

	authenticate(req: Request, res: Response, next: Function);

}
