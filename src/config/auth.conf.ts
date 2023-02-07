import AuthCheckerMiddleware from '../auth/serviceAuth';
import {Express} from 'express';

export default class AuthenticationConfig {
    static init(app: Express) {
        app.use(AuthCheckerMiddleware);
    }
}