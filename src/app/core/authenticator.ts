import {Express, Request, Response} from 'express';

export interface Authenticator {

	setup(app: Express);

	getMiddleware(): (req: Request, res: Response, next?: Function) => any;

	authenticate(req: Request, res: Response, next: Function);

}
