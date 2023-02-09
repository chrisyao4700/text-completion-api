import morgan from 'morgan';
import bodyParser from 'body-parser';
import {parseString} from 'xml2js';
import express, { urlencoded } from 'express';
import {
    Response as ExResponse,
    Request as ExRequest,
    NextFunction,
} from 'express';
import cors = require('cors');
require('dotenv').config();

import { loggerMiddleware } from '../util/logger';

const getUserDataAsync =  (req: ExRequest, res: ExResponse):any => {
    let temp = ''
    return new Promise((resolve, reject) => {
        req.on('data',data=>{
            temp += data.toString();
        })
        .on('end',()=>{
            resolve(temp);
        });
    });
}
const parseXML = (xml: string):any => {
    return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}
const formatMessage = (jsData: any): any => {
    let message: any = {};
    jsData = jsData.xml;

    if (typeof jsData === 'object') {
        for (let key in jsData) {
            let value = jsData[key];
            if (Array.isArray(value) && value.length > 0) {
                message[key] = value[0];
            }
        }
    }
    return message;
}
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
        app.post('/v1/wechat',async (req: ExRequest,res: ExResponse,next:NextFunction)=>{
            /*Parse XML For Wechat*/
            try
            {
                const xmlData = await getUserDataAsync(req,res);
                const jsData = await parseXML(xmlData);
                const message = formatMessage(jsData);
                // console.log(message);
                req.body = message;
                // res.send('success');
                next();
            }catch(err){
                console.log(err);
                next();
            }
            
        });


    }
}
