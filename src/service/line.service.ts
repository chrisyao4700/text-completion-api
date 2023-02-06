
import Line, { LINE_ROLE } from '../model/line.model';
import Chat from '../model/chat.model';
import { Logger } from '../util/logger';

import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);
// export type LineCreateParams = Required<LineInput>;
export type LineGenerateParams = {
    chatId: number,
    text: string
}
export type LineGenerateResponse = {
    text: string;
    history: string[];
    error?: string;
}
export type ChatLinesResponse = {
    lines: string[];
}

const createTextFromPrompt = async (prompt: string): Promise<string> => {
    const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        temperature: 0,
        max_tokens: 1024,
    });
    const resText = `${completion.data.choices[0].text}`.split('\n').join('');
    return resText;
}

export class LineService {

    static async create(payload: LineGenerateParams): Promise<LineGenerateResponse> {
        try {
            const { chatId, text } = payload;
            const chat = await Chat.findByPk(chatId);
            if (chat) {

                /** Append previous conversation */
                const previousLines = await chat.getLines();
                const prompt = previousLines.map(line => `${line.role}: ${line.text}`)
                    .join('\n');
                
                const resText = await createTextFromPrompt(`${prompt}${prompt === '' ? '' : '\n'}${text}`);

                await chat.createLine({ text, role: LINE_ROLE.HUMAN });

                /* Create title */
                if (previousLines.length >= 2 && chat.title === "New Chat") {
                    const summary = await createTextFromPrompt(`${prompt}\nPlease create a title based on the chat, reply title only.`);
                    await chat.update({ title: summary });
                }

                const currLines = await chat.getLines();
                const history = currLines.map(line => `${line.role}: ${line.text}`)

                await chat.createLine({ text: resText, role: LINE_ROLE.AI });

    
                
                const response: LineGenerateResponse = {
                    text: resText,
                    history: history
                };
                return response;
            } else {
                const response: LineGenerateResponse = {
                    text: 'no response',
                    history: [],
                    error: `No chatId found ${chatId}`
                };
                return response;
            }

        } catch (error) {
            const err = error as Error;
            const response: LineGenerateResponse = {
                text: 'no response',
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
}
