import AuthCheckerMiddleware from '../auth/serviceAuth';
import { Express, Response, Request, NextFunction } from 'express';

export default class AuthenticationConfig {
    static init(app: Express) {
        app.use((error: Error, req: Request,
            res: Response,
            next: NextFunction) => {

                
        });
    }
}