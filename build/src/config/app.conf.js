"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = require("express");
const cors = require("cors");
require('dotenv').config();
const logger_1 = require("../util/logger");
class ApplicationConfig {
    static init(app) {
        app.use(cors());
        app.use((0, express_1.urlencoded)({
            extended: true,
        }));
        app.use(function loggerHandler(req, res, next) {
            (0, logger_1.loggerMiddleware)(req, res, next);
        });
        app.use(body_parser_1.default.json());
        morgan_1.default.token('user_id', function (req, res) {
            const userId = req.headers['requestor-user-id']
                ? req.headers['requestor-user-id']
                : '[no user Id provided]';
            return userId;
        });
        morgan_1.default.token('correlation_id', function (req, res) {
            const correlationId = req.headers['correlation-id']
                ? req.headers['correlation-id']
                : '[no correlationId provided]';
            return correlationId;
        });
        app.use((0, morgan_1.default)('[:date] :remote-user :user_id :method :url :status :req[content-length] :res[content-length] :remote-addr :response-time ms :correlation_id'));
    }
}
exports.default = ApplicationConfig;
