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
import { parseWeChatBody, verifyWechatSignature } from '../util/wechat';


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
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(
            morgan('combined')
        );
        app.post('/v1/wechat', async (req: ExRequest, res: ExResponse, next: NextFunction) => {
            /*Parse XML For Wechat*/
            try {
                const parsedBody = await parseWeChatBody(req);
                req.body = parsedBody;
                next();
            } catch (err) {
                console.warn(err);
                req.body = {};
                next();
            }

        });

        app.get('/v1/wechat', async (req: ExRequest, res: ExResponse, next: NextFunction) => {
            try {
                const [sha, signature, echostr] = await verifyWechatSignature(req);
                if (sha === signature) {
                    res.send(echostr)
                } else {
                    res.send('error')
                }
                res.send()
            } catch (err) {
                console.log('Wechat verify fail', err);
                next();
            }
        });

    }
}
