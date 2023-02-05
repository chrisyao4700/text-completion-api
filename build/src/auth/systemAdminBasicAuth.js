"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemAdminBasicAuth = void 0;
const auth = require('http-auth');
exports.systemAdminBasicAuth = auth.basic({ realm: 'System Admin' }, function (username, pass, callback) {
    callback(username === process.env.ADMIN_USERNAME &&
        pass === process.env.ADMIN_PASSWORD);
});
