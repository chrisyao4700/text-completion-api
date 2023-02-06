"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const app_conf_1 = __importDefault(require("./config/app.conf"));
const swagger_conf_1 = __importDefault(require("./config/swagger.conf"));
const routes_config_1 = __importDefault(require("./config/routes.config"));
const status_config_1 = __importDefault(require("./config/status.config"));
// import AmqpSubscriberConfig from './config/amqpSubscriber.config';
const database_config_1 = __importDefault(require("./config/database.config"));
exports.app = (0, express_1.default)();
status_config_1.default.init(exports.app);
app_conf_1.default.init(exports.app);
swagger_conf_1.default.init(exports.app);
routes_config_1.default.init(exports.app);
database_config_1.default.config();
