
import { Express, Response, Request, NextFunction } from 'express';

export default class ErrorConfig {
    static init(app: Express) {
        
        app.use((error: Error, req: Request,
            res: Response,
            next: NextFunction) => {

                
                
        });
    }
}