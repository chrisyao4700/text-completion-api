import { NextFunction } from 'express';
import { createNamespace } from 'cls-hooked';
const { v4: uuidv4 } = require('uuid');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const clsNamespace = createNamespace('app');

export const loggerMiddleware = (req: any, res: any, next: NextFunction) => {
    clsNamespace.bind(req);
    clsNamespace.bind(res);

    const correlationId = req.headers['correlation-id']
        ? req.headers['correlation-id']
        : uuidv4();

    clsNamespace.run(() => {
        clsNamespace.set('correlationId', correlationId);

        next();
    });
};

const addCorrelationId = printf((info: any) => {
    let message = info.message;
    const correlationId = clsNamespace.get('correlationId');
    if (correlationId) {
        return `[${info.timestamp}]:[CORRELATION-ID: ${correlationId}] ${info.level}: ${message}`;
    }
    return message;
});

export class WinstonLogger {
    logger;

    constructor() {
        this.logger = createLogger({
            format: combine(timestamp(), addCorrelationId),
            transports: [new transports.Console()],
        });
    }
}

export const Logger = new WinstonLogger().logger;
