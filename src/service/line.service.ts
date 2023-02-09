
import Line, { LineOutput, LINE_ROLE } from '../model/line.model';
import Chat from '../model/chat.model';
import { Logger } from '../util/logger';

import{createTextFromPrompt} from '../util/opai';
// export type LineCreateParams = Required<LineInput>;
export type LineGenerateParams = {
    chatId: number,
    text: string
}
export type LineGenerateResponse = {
    text: string;
    title: string;
    history: string[];
    error?: string;
}
export type ChatLinesResponse = {
    lines: string[];
}



export class LineService {

    static async create(payload: LineGenerateParams): Promise<LineGenerateResponse> {
        try {
            const { chatId, text } = payload;
            const chat = await Chat.findByPk(chatId);
            if (chat) {

                /** Append previous conversation */
                const previousLines = await chat.getLines({order: [['createdAt', 'DESC']], limit: 4});
                const historyText = previousLines.reverse().map(line => `${line.role}: ${line.text}`)
                    .join('\n');

                const prompt = `${previousLines.length > 0 ? "Please provide response base on the chat history and the new message\nCHAT HISTORY:\n\n" : ''}${historyText}${previousLines.length > 0 ? "\n\nNEW MESSAGE:\n" : ''}${text}`;
                const resText = await createTextFromPrompt(prompt);

                await chat.createLine({ text, role: LINE_ROLE.HUMAN });

                /* Create title */
                if (previousLines.length >= 2 && chat.title === "New Chat") {
                    const summary = await createTextFromPrompt(`${historyText}\n\nPlease create a title based on the chat, and reply the title only.`);
                    await chat.update({ title: summary });
                }

                const currLines = await chat.getLines();
                const history = currLines.map(line => `${line.role}: ${line.text}`)

                await chat.createLine({ text: resText, role: LINE_ROLE.AI });

                const response: LineGenerateResponse = {
                    text: resText,
                    title: chat.title,
                    history: history
                };
                return response;
            } else {
                const response: LineGenerateResponse = {
                    text: 'no response',
                    title: "unknown",
                    history: [],
                    error: `No chatId found ${chatId}`
                };
                return response;
            }

        } catch (error) {
            const err = error as Error;
            const response: LineGenerateResponse = {
                text: 'no response',
                title: "unknown",
                history: [],
                error: `${err.message}`
            };

            Logger.error(error);
            return response;
        }
    }

    static async findAllChatLines(chatId: number): Promise<ChatLinesResponse> {
        try {
            const chat = await Chat.findByPk(chatId);
            if (chat) {
                const results = await chat.getLines();
                // console.log(results);
                const lines = results.map(line => `${line.role}: ${line.text}`);
                return { lines: lines };
            } else {
                return { lines: [] };
            }
        } catch (error) {
            Logger.error(error);
            return { lines: [] };
        }
    }

    static async findLineDetail(lineId: number): Promise<LineOutput | Error> {
        try {
            const line = await Line.findByPk(lineId);
            if (line) {
                return line;
            } else {
                return new Error(`Cannot find line with ${lineId}`)
            }
        } catch (e) {
            const err = e as Error;
            return err;
        }
    }
}
