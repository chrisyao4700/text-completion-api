"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineController = void 0;
const tsoa_1 = require("tsoa");
const responseHandler_1 = require("../util/responseHandler");
const logger_1 = require("../util/logger");
const line_service_1 = require("../service/line.service");
//   // "dev": "nodemon -x tsoa spec-and-routes",
let LineController = class LineController extends tsoa_1.Controller {
    /**
     *
     * @param requestBody Body that is sent for create a Line
     * @example requestBody {
     * "text": "123",
     * "chatId": 12
     * }
     */
    create(requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createResponse = yield line_service_1.LineService.create(requestBody);
                (0, responseHandler_1.setResponseCode)(this, createResponse, 200);
                return createResponse;
            }
            catch (error) {
                logger_1.Logger.error(error);
                (0, responseHandler_1.setErrorCode)(this, 500);
                return {
                    name: 'Internal Server Error',
                    message: 'Unable to process at this time'
                };
            }
        });
    }
    getLines(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatLinesResponse = yield line_service_1.LineService.findAllChatLines(Number(chatId));
                (0, responseHandler_1.setResponseCode)(this, chatLinesResponse, 200);
                return chatLinesResponse;
            }
            catch (error) {
                logger_1.Logger.error(error);
                (0, responseHandler_1.setErrorCode)(this, 500);
                return {
                    name: 'Internal Server Error',
                    message: 'Unable to process at this time'
                };
            }
        });
    }
};
__decorate([
    (0, tsoa_1.SuccessResponse)('200', 'Created text'),
    (0, tsoa_1.Post)('/'),
    __param(0, (0, tsoa_1.Body)())
], LineController.prototype, "create", null);
__decorate([
    (0, tsoa_1.Get)('/all/{chatId}'),
    __param(0, (0, tsoa_1.Path)())
], LineController.prototype, "getLines", null);
LineController = __decorate([
    (0, tsoa_1.Route)('v1/line')
], LineController);
exports.LineController = LineController;
