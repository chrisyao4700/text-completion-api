"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = void 0;
function expressAuthentication(request, securityName, scopes) {
    if (securityName !== 'api_key') {
        return Promise.reject({});
    }
    let token;
    if (request.headers && request.headers.authorization) {
        token = request.headers.authorization;
    }
    if (token === process.env.MSVC_SENDBIRD_API_KEY) {
        return Promise.resolve({ id: 1 }); //TODO: add api key for each requestor and respond with requestor metadata
    }
    return Promise.reject({});
}
exports.expressAuthentication = expressAuthentication;
