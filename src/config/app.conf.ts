import morgan from 'morgan';
import bodyParser from 'body-parser';
import express, { urlencoded } from 'express';
import {
    Response as ExResponse,
    Request as ExRequest,
    NextFunction,
} from 'express';
import cors = require('cors');
require('dotenv').config();

import { loggerMiddleware } from '../util/logger';

export default class ApplicationConfig {
    static init(app: express.Application) {
        app.use(cors());

        app.use(
            urlencoded({
                extended: true,
            })
        );

        app.use(function loggerHandler(
            req: ExRequest,
            res: ExResponse,
            next: NextFunction
        ): void {
            loggerMiddleware(req, res, next);
        });

        app.use(bodyParser.json());

        morgan.token('user_id', function (req, res): string {
            const userId: string = req.headers['requestor-user-id']
                ? (req.headers['requestor-user-id'] as string)
                : '[no user Id provided]';
            return userId;
        });

        morgan.token('correlation_id', function (req, res): string {
            const correlationId: string = req.headers['correlation-id']
                ? (req.headers['correlation-id'] as string)
                : '[no correlationId provided]';
            return correlationId;
        });

        app.use(
            morgan(
                '[:date] :remote-user :user_id :method :url :status :req[content-length] :res[content-length] :remote-addr :response-time ms :correlation_id'
            )
        );
    }
}
