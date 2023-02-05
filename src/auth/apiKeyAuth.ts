import * as express from 'express';

export function expressAuthentication(
    request: express.Request,
    securityName: string,
    scopes?: string[]
): Promise<any> {
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
