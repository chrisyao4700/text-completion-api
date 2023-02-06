"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const chat_model_1 = __importDefault(require("../model/chat.model"));
const logger_1 = require("../util/logger");
class ChatService {
    static create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chat = yield chat_model_1.default.create(payload);
                return chat;
            }
            catch (error) {
                logger_1.Logger.error(error);
            }
        });
    }
    static find(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chat = yield chat_model_1.default.findByPk(Number(chatId));
                if (chat) {
                    const lines = yield chat.getLines();
                    return {
                        chat,
                        lines
                    };
                }
                else {
                    return;
                }
            }
            catch (e) {
                logger_1.Logger.error(e);
            }
        });
    }
}
exports.ChatService = ChatService;
