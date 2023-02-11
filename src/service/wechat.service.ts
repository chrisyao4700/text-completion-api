
import Chat, { ChatInput, ChatOutput } from '../model/chat.model';
import User from '../model/user.model';
import { LINE_ROLE } from '../model/line.model';

import { createTextFromPrompt } from '../util/opai';
import { delayReply, timeDiffMinutes } from '../util/util';
import { getCacheMap, getCacheResultMap } from '../util/cache';
import { sendWeChatMessage, wechatResponseBuilder } from '../util/wechat';
export type ChatCreateParams = Required<ChatInput>;

export type WechatCreateParams = {
    userId: string,
    text: string,
    toUserId: string,
    messageId: string
}
const startNewChat = async (chat: Chat, text: string): Promise<string> => {
    const prompt = `Your name is ${process.env.CHAT_AGENT_ENGLISH_NAME}(${process.env.CHAT_AGENT_CHINESE_NAME} in Chinese), 
    please provide a response.\\nMESSAGE:\\n${text}`;
    const resText = await createTextFromPrompt(prompt);
    await chat.createLine({ text: text, role: LINE_ROLE.HUMAN });
    await chat.createLine({ text: resText, role: LINE_ROLE.AI });
    return resText;
}

const continueChat = async (chat: Chat, text: string): Promise<string> => {
    const previousLines = await chat.getLines({ order: [['createdAt', 'DESC']], limit: 4 });
    const historyText = previousLines.reverse().map(line => line.text)
        .join('\n');

    const prompt = `Your name is ${process.env.CHAT_AGENT_ENGLISH_NAME}(${process.env.CHAT_AGENT_CHINESE_NAME} in Chinese), 
    please provide a response based on the CHAT HISTORY:\\n\\n
    ${historyText}\\n\\n
    HERE IS THE NEW MESSAGE:\\n
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
            console.log(payload);
            const cache = getCacheMap();
            const resultCache = getCacheResultMap();
            if (cache.has(payload.messageId)) {
                //Already pinged.
                if (cache.get(payload.messageId) === 1) {
                    cache.set(payload.messageId, 2);
                    await delayReply(3, '');
                    if (resultCache.has(payload.messageId)) {
                        const toReturn = resultCache.get(payload.messageId);
                        resultCache.delete(payload.messageId);
                        return toReturn!;
                    } else {
                        //Giveup second approach.
                        await delayReply(20, '');
                        return wechatResponseBuilder(payload, 'Please wait for a response');
                    }
                }
                if (cache.get(payload.messageId) === 2) {
                    await delayReply(2, '');
                    if (resultCache.has(payload.messageId)) {
                        const toReturn = resultCache.get(payload.messageId);
                        resultCache.delete(payload.messageId);
                        return toReturn!;
                    } else {
                        cache.set(payload.messageId, 3);
                        return wechatResponseBuilder(payload, 'Major Brain is still thinking... However, WeChat won\'t wait...Will notifiy you when I have a better answer.');
                    }
                }
            } else {
                cache.set(payload.messageId, 1);
            }

            //First time receive message
            createResponseText(payload)
                .then(responseText => {
                    const resMessage = wechatResponseBuilder(payload, responseText!);
                    resultCache.set(payload.messageId, resMessage);
                    return responseText;
                })
                .then(responseText => {
                    if (cache.get(payload.messageId) === 3) {
                        sendWeChatMessage(payload.userId, responseText!)
                            .then();
                    }
                });

            //Giveup first approach.
            await delayReply(20, '');
            cache.delete(payload.messageId);
            return wechatResponseBuilder(payload, 'Please wait for a response');
        } catch (error) {
            const errText = wechatResponseBuilder(payload, 'Error, please try again later');
            return await delayReply(20, errText);
        }
    }
}