"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.WinstonLogger = exports.loggerMiddleware = void 0;
const cls_hooked_1 = require("cls-hooked");
const { v4: uuidv4 } = require('uuid');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const clsNamespace = (0, cls_hooked_1.createNamespace)('app');
const loggerMiddleware = (req, res, next) => {
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
exports.loggerMiddleware = loggerMiddleware;
const addCorrelationId = printf((info) => {
    let message = info.message;
    const correlationId = clsNamespace.get('correlationId');
    if (correlationId) {
        return `[${info.timestamp}]:[CORRELATION-ID: ${correlationId}] ${info.level}: ${message}`;
    }
    return message;
});
class WinstonLogger {
    constructor() {
        this.logger = createLogger({
            format: combine(timestamp(), addCorrelationId),
            transports: [new transports.Console()],
        });
    }
}
exports.WinstonLogger = WinstonLogger;
exports.Logger = new WinstonLogger().logger;
