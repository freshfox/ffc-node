
import {Express, Request, Response} from 'express';
export interface Authenticator {

	setup(app: Express);

	authenticate(req: Request, res: Response, next: Function);

}
