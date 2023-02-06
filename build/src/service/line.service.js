"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineService = void 0;
const line_model_1 = __importStar(require("../model/line.model"));
const chat_model_1 = __importDefault(require("../model/chat.model"));
const logger_1 = require("../util/logger");
const openai_1 = require("openai");
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new openai_1.OpenAIApi(configuration);
const createTextFromPrompt = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    const completion = yield openai.createCompletion({
        model: `${process.env.OPEN_API_USING_MODEL || 'texdt-davinci-003'}`,
        prompt: prompt,
        temperature: 0,
        max_tokens: 1024,
    });
    const resText = `${completion.data.choices[0].text}`.split('\n').join('');
    return resText;
});
class LineService {
    static create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { chatId, text } = payload;
                const chat = yield chat_model_1.default.findByPk(chatId);
                if (chat) {
                    /** Append previous conversation */
                    const previousLines = yield chat.getLines();
                    const prompt = previousLines.map(line => line.text)
                        .join('\n');
                    const resText = yield createTextFromPrompt(`${prompt}${prompt === '' ? '' : '\n'}${text}`);
                    yield chat.createLine({ text, role: line_model_1.LINE_ROLE.HUMAN });
                    /* Create title */
                    if (previousLines.length >= 2 && chat.title === "New Chat") {
                        const summary = yield createTextFromPrompt(`${prompt}\nPlease create a title based on the chat, and reply the title only.`);
                        yield chat.update({ title: summary });
                    }
                    const currLines = yield chat.getLines();
                    const history = currLines.map(line => `${line.role}: ${line.text}`);
                    yield chat.createLine({ text: resText, role: line_model_1.LINE_ROLE.AI });
                    const response = {
                        text: resText,
                        title: chat.title,
                        history: history
                    };
                    return response;
                }
                else {
                    const response = {
                        text: 'no response',
                        title: "unknown",
                        history: [],
                        error: `No chatId found ${chatId}`
                    };
                    return response;
                }
            }
            catch (error) {
                const err = error;
                const response = {
                    text: 'no response',
                    title: "unknown",
                    history: [],
                    error: `${err.message}`
                };
                logger_1.Logger.error(error);
                return response;
            }
        });
    }
    static findAllChatLines(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chat = yield chat_model_1.default.findByPk(chatId);
                if (chat) {
                    const results = yield chat.getLines();
                    // console.log(results);
                    const lines = results.map(line => `${line.role}: ${line.text}`);
                    return { lines: lines };
                }
                else {
                    return { lines: [] };
                }
            }
            catch (error) {
                logger_1.Logger.error(error);
                return { lines: [] };
            }
        });
    }
    static findLineDetail(lineId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const line = yield line_model_1.default.findByPk(lineId);
                if (line) {
                    return line;
                }
                else {
                    return new Error(`Cannot find line with ${lineId}`);
                }
            }
            catch (e) {
                const err = e;
                return err;
            }
        });
    }
}
exports.LineService = LineService;
