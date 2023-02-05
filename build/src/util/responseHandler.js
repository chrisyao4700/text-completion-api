"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setResponseCode = exports.setErrorCode = void 0;
/**
 * @function respondWithResult
 * @description Function that returns response with data
 * @param {Object} res - Express Framework Response Object
 * @param {Object} returnObject - response JSON object
 * @param {Number=} statusCode - Success response status code
 */
function setResponseCode(res, returnObject, statusCode) {
    statusCode = statusCode || 200;
    if (Array.isArray(returnObject) && returnObject.length === 0) {
        res.setStatus(404);
        return;
    }
    if (!returnObject || Object.keys(returnObject).length === 0) {
        res.setStatus(404);
        return;
    }
    if (returnObject) {
        res.setStatus(statusCode);
        return;
    }
}
exports.setResponseCode = setResponseCode;
/**
 * @function handleError
 * @description Function that returns response with error details
 * @param {Object} res - Express Framework Response Object
 * @param {Number=} statusCode - Failed response status code
 */
function setErrorCode(res, statusCode) {
    statusCode = statusCode || 500;
    res.setStatus(statusCode);
}
exports.setErrorCode = setErrorCode;
