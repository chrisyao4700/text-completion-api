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
exports.ChatController = void 0;
const tsoa_1 = require("tsoa");
const responseHandler_1 = require("../util/responseHandler");
const logger_1 = require("../util/logger");
const chat_service_1 = require("../service/chat.service");
//   // "dev": "nodemon -x tsoa spec-and-routes",
let ChatController = class ChatController extends tsoa_1.Controller {
    /**
     *
     * @param requestBody Body that is sent for create a Chat
     * @example requestBody {
     *   "title":"New Chat"
     * }
     */
    create(requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createResponse = yield chat_service_1.ChatService.create(requestBody);
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
    find(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatDetailOutput = yield chat_service_1.ChatService.find(chatId);
                (0, responseHandler_1.setResponseCode)(this, chatDetailOutput, 200);
                return chatDetailOutput;
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
    (0, tsoa_1.SuccessResponse)('200', 'Created Chat'),
    (0, tsoa_1.Post)('/'),
    __param(0, (0, tsoa_1.Body)())
], ChatController.prototype, "create", null);
__decorate([
    (0, tsoa_1.SuccessResponse)('200', 'Chat Found'),
    (0, tsoa_1.Get)('/detail/{chatId}')
    /**
     *
     * @param chatId ChatId is to fetch a chat
     * @example "11"
     */
    ,
    __param(0, (0, tsoa_1.Path)())
], ChatController.prototype, "find", null);
ChatController = __decorate([
    (0, tsoa_1.Route)('v1/chat')
], ChatController);
exports.ChatController = ChatController;
