import express from 'express';
require('dotenv').config();

import { systemAdminBasicAuth } from '../auth/systemAdminBasicAuth';

export default class StatusConfig {
    static init(app: express.Application) {
        const statusMonitor = require('express-status-monitor')({
            title: process.env.APP_NAME,
            path: '',
            spans: [
                {
                    interval: 1, // Every second
                    retention: 60, // Keep 60 datapoints in memory
                },
                {
                    interval: 5, // Every 5 seconds
                    retention: 60,
                },
                {
                    interval: 15, // Every 15 seconds
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
        app.get('/status', systemAdminBasicAuth.check(statusMonitor.pageRoute));
    }
}
