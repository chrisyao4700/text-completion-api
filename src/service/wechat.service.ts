
import Chat, { ChatInput, ChatOutput } from '../model/chat.model';
import { Logger } from '../util/logger';
import User from '../model/user.model';
import { LINE_ROLE } from '../model/line.model';

import { createTextFromPrompt } from '../util/opai';
import { delayReply, timeDiffMinutes, wechatResponseBuilder } from '../util/util';
import { getCacheMap, getCacheResultMap } from '../util/cache';
export type ChatCreateParams = Required<ChatInput>;

export type WechatCreateParams = {
    userId: string,
    text: string,
    toUserId: string,
    messageId: string
}
const startNewChat = async (chat: Chat, text: string): Promise<string> => {
    const prompt = `Your name is ${process.env.CHAT_AGENT_ENGLISH_NAME}(${process.env.CHAT_AGENT_CHINESE_NAME} in Chinese), 
    please provide a response to the user (without prefix).\nMESSAGE:\n${text}`;
    const resText = await createTextFromPrompt(prompt);
    await chat.createLine({ text: text, role: LINE_ROLE.HUMAN });
    await chat.createLine({ text: resText, role: LINE_ROLE.AI });
    return resText;
}

const continueChat = async (chat: Chat, text: string): Promise<string> => {
    const previousLines = await chat.getLines({ order: [['createdAt', 'DESC']], limit: 4 });
    const historyText = previousLines.reverse().map(line => `${line.role}: ${line.text}`)
        .join('\n');

    const prompt = `Your name is ${process.env.CHAT_AGENT_ENGLISH_NAME}(${process.env.CHAT_AGENT_CHINESE_NAME} in Chinese), 
    please provide a response(without prefix) to the user based on the CHAT HISTORY:\n\n
    ${historyText}\n\n
    HERE IS THE NEW MESSAGE:\n
    ${text}`;
    const resText = await createTextFromPrompt(prompt);
    await chat.createLine({ text: text, role: LINE_ROLE.HUMAN });
    await chat.createLine({ text: resText, role: LINE_ROLE.AI });
    return resText;
}

const createResponseText = async (payload: WechatCreateParams): Promise<string | null> => {
    try {
        const count = await User.count({ where: { userId: payload.userId } });
        if (count === 0) {
            //New message from user
            const chat = await Chat.create({ title: "Wechat Conversation" });
            // Create User
            await User.create({ userId: payload.userId, chatId: chat.id });
            return await startNewChat(chat, payload.text)

        } else {
            //History message from user
            const user = await User.findOne({ where: { userId: payload.userId } });
            const chat = await Chat.findByPk(user!.chatId);

            const previousLines = await chat!.getLines({ order: [['createdAt', 'DESC']], limit: 1 });

            if (previousLines.length === 0) {
                return await startNewChat(chat!, payload.text);
            }
            const lastLine = previousLines[0];
            /* If last line is one minute away, then start a new chat */
            if (timeDiffMinutes(lastLine.createdAt, new Date()) > 1) {
                const freshChat = await Chat.create({ title: "Wechat Conversation" });
                await user?.update({ chatId: freshChat.id });
                return await startNewChat(freshChat, payload.text);
            }
            return await continueChat(chat!, payload.text);
        }

    } catch (error) {
        const errText = wechatResponseBuilder(payload, 'Error, please try again later');
        return await delayReply(20, errText);
    }
}



export class WechatService {
    static async receiveMessage(payload: WechatCreateParams): Promise<string> {
        try {
            const chache = getCacheMap();
            const resultCache = getCacheResultMap();
            if (chache.has(payload.messageId)) {
                if (chache.get(payload.messageId) === 1) {
                    await delayReply(5, '');
                    if (resultCache.has(payload.messageId)) {
                        const toReturn = resultCache.get(payload.messageId);
                        resultCache.delete(payload.messageId);
                        return toReturn!;
                    } else {
                        //Giveup second approach.
                        chache.set(payload.messageId, 2);
                        await delayReply(20, '');
                        return wechatResponseBuilder(payload, 'Please wait for a response');
                    }
                }
                if(chache.get(payload.messageId) === 2) {
                    await delayReply(5, '');
                    if (resultCache.has(payload.messageId)) {
                        const toReturn = resultCache.get(payload.messageId);
                        resultCache.delete(payload.messageId);
                        return toReturn!;
                    }else{
                        return wechatResponseBuilder(payload, 'Question too hard...');
                    }
                }
            } else {
                chache.set(payload.messageId, 1);
            }

            //First time receive message
            createResponseText(payload)
                .then(responseText => {
                    const resMessage = wechatResponseBuilder(payload, responseText!);
                    resultCache.set(payload.messageId, resMessage);
                });

            //Giveup first approach.
            await delayReply(20, '');
            chache.delete(payload.messageId);
            return wechatResponseBuilder(payload, 'Please wait for a response');
        } catch (error) {
            const errText = wechatResponseBuilder(payload, 'Error, please try again later');
            return await delayReply(20, errText);
        }
    }
}