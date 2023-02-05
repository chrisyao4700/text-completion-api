"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const systemAdminBasicAuth_1 = require("../auth/systemAdminBasicAuth");
class StatusConfig {
    static init(app) {
        const statusMonitor = require('express-status-monitor')({
            title: process.env.APP_NAME,
            path: '',
            spans: [
                {
                    interval: 1,
                    retention: 60, // Keep 60 datapoints in memory
                },
                {
                    interval: 5,
                    retention: 60,
                },
                {
                    interval: 15,
                    retention: 60,
                },
            ],
            healthChecks: [
                {
                    protocol: 'http',
                    host: 'localhost',
                    port: 3000,
                    path: '/health',
                    headers: {},
                },
                {
                    protocol: 'http',
                    host: 'localhost',
                    port: 3000,
                    path: '/badRoute',
                    headers: {},
                },
            ],
        });
        app.use(statusMonitor.middleware);
        app.get('/status', systemAdminBasicAuth_1.systemAdminBasicAuth.check(statusMonitor.pageRoute));
    }
}
exports.default = StatusConfig;
