
import Chat, { ChatInput, ChatOutput } from '../model/chat.model';
import { Logger } from '../util/logger';
import User from '../model/user.model';
import { LINE_ROLE } from '../model/line.model';

import { createTextFromPrompt } from '../util/opai';
import { timeDiffMinutes } from '../util/util';
export type ChatCreateParams = Required<ChatInput>;

export type WechatCreateParams = {
    userId: string,
    text: string,
    toUserId: string
}
const CHAT_AGENT = process.env.CHAT_AGENT_NAME || 'Arclight';

const startNewChat = async (chat: Chat, text: string): Promise<string> => {
    //New message from user
    const prompt = `You are a chat agent with ${CHAT_AGENT}, please provide a response to the user. MESSAGE:\n
                ${text}`;
    const resText = await createTextFromPrompt(prompt);
    await chat.createLine({ text: text, role: LINE_ROLE.HUMAN });
    await chat.createLine({ text: resText, role: LINE_ROLE.AI });
    return resText;
}

const continueChat = async (chat: Chat, text: string): Promise<string> => {
    //History message from user
    const previousLines = await chat.getLines({ order: [['createdAt', 'DESC']], limit: 4 });
    const historyText = previousLines.reverse().map(line => `${line.role}: ${line.text}`)
        .join('\n');

    const prompt = `You are a chat responder with ${CHAT_AGENT
        }, please provide a response to the user based on CHAT HISTORY:\n\n
    ${historyText}\n\n
    NEW MESSAGE:\n
    ${text}`;
    const resText = await createTextFromPrompt(prompt);
    await chat.createLine({ text: text, role: LINE_ROLE.HUMAN });
    await chat.createLine({ text: resText, role: LINE_ROLE.AI });
    return resText;
}

const responseBuilder = (payload: WechatCreateParams, responseText: string): string => {
    const resMessage = `<xml>
<ToUserName><![CDATA[${payload.userId}]]></ToUserName>
<FromUserName><![CDATA[${payload.toUserId}]]></FromUserName>
<CreateTime>${new Date().getTime()}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${payload.text}]]></Content>
</xml>`
    return resMessage;

};

const createResponseText = async (payload: WechatCreateParams): Promise<string> => {
    try {
        // const toUserId = payload.userId;
        const count = await User.count({ where: { userId: payload.userId } });
        // console.log(count);

        if (!count) {
            //New message from user
            const chat = await Chat.create({ title: "Wechat Conversation" });
            // Create User
            await User.create({ userId: payload.userId, chatId: chat.id });
            const result = await startNewChat(chat, payload.text);
            return result;

        } else {
            //History message from user
            const user = await User.findOne({ where: { userId: payload.userId } });
            const chat = await Chat.findByPk(user!.chatId);
            // console.log(chat);
            const previousLines = await chat!.getLines({ order: [['createdAt', 'DESC']], limit: 1 });
            // console.log(previousLines);
            if (previousLines.length === 0) {
                return await startNewChat(chat!, payload.text);
            }
            const lastLine = previousLines[0];
            if (timeDiffMinutes(lastLine.createdAt, new Date()) > 5) {
                //Too long since last message, start a new chat
                const freshChat = await Chat.create({ title: "Wechat Conversation" });
                await user?.update({ chatId: freshChat.id });
                const result = await startNewChat(freshChat, payload.text);
                return result;
            }
            return await continueChat(chat!, payload.text);
        }

    } catch (error) {
        Logger.error(error);
        return 'Error, please try again later';
    }
}



export class WechatService {

    static async receiveMessage(payload: WechatCreateParams): Promise<string | undefined> {
        try {
            const responseText = await createResponseText(payload);
            const resMessage = responseBuilder(payload, responseText);
            return resMessage;
        } catch (error) {
            Logger.error(error);
            return 'Error, please try again later';
        }
    }
}