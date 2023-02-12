
import Chat, { ChatInput, ChatOutput } from '../model/chat.model';
import User from '../model/user.model';
import { LINE_ROLE } from '../model/line.model';

import { convertVoiceToText } from '../util/google';
import { createTextFromPrompt } from '../util/opai';
import { delayReply, timeDiffMinutes ,saveAMRToTempFile, deleteFileAtPath} from '../util/util';

import { downloadWeChatMedia, fetchWeChatMedia, sendWeChatMessage, wechatResponseBuilder } from '../util/wechat';
export type ChatCreateParams = Required<ChatInput>;

export type WechatTextCreateParams = {
    userId: string,
    text: string,
    toUserId: string,
    messageId: string
}

export type WechatVoiceCreateParams = {
    userId: string,
    mediaId: string,
    mediaFormat: string,
    toUserId: string,
    messageId: string
}
const startNewChat = async (chat: Chat, text: string): Promise<string> => {
    const prompt = `你的名字是 ${process.env.CHAT_AGENT_CHINESE_NAME}`+ 
    `(${process.env.CHAT_AGENT_ENGLISH_NAME})`+
    `请回复以下信息，\n`+
    '*信息开始*'+
    `\n${text}\n`+
    '*信息结束*';
    const resText = await createTextFromPrompt(prompt);
    await chat.createLine({ text: text, role: LINE_ROLE.HUMAN });
    await chat.createLine({ text: resText, role: LINE_ROLE.AI });
    return resText;
}

const continueChat = async (chat: Chat, text: string): Promise<string> => {
    const previousLines = await chat.getLines({ order: [['createdAt', 'DESC']], limit: 4 });
    const historyText = previousLines.reverse().map(line => line.text)
        .join('\n');

    const prompt =  `你的名字是 ${process.env.CHAT_AGENT_CHINESE_NAME}`+ 
    `(${process.env.CHAT_AGENT_ENGLISH_NAME})`+
    `请基于聊天记录回复新信息，\n`+
    '*聊天记录开始*'+
    `\n${historyText}\n`+
    '*聊天记录结束*'+
    '*新信息开始*'+
    `\n${text}\n`+
    '*新信息结束*';
    const resText = await createTextFromPrompt(prompt);
    await chat.createLine({ text: text, role: LINE_ROLE.HUMAN });
    await chat.createLine({ text: resText, role: LINE_ROLE.AI });
    return resText;
}

const createResponseForText = async (payload: WechatTextCreateParams): Promise<string | null> => {
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
        const errText = 'Error, please try again later';
        return errText;
    }
}

const createResponseForVoice = async (payload: WechatVoiceCreateParams): Promise<void> => {
    // const mediaInfo = await fetchWeChatMedia(payload.mediaId);

    // const filePath = await saveAMRToTempFile(mediaInfo, payload.messageId);
    const foderPath = `db/temp/voice`;
    const filePath = await downloadWeChatMedia(payload.mediaId,foderPath);
    await delayReply(1,'');
    const text = await convertVoiceToText(filePath);
    const textPayload: WechatTextCreateParams = {
        userId: payload.userId,
        text: text,
        toUserId: payload.toUserId,
        messageId: payload.messageId
    }
    const responseText = await createResponseForText(textPayload);
    await sendWeChatMessage(responseText!, payload.userId);
    await deleteFileAtPath(filePath);
}

export class WechatService {
    static async receiveMessage(payload: WechatTextCreateParams): Promise<string> {
        try {
            //First time receive message
            createResponseForText(payload)
                .then(responseText => {
                    // const resMessage = wechatResponseBuilder(payload, responseText!);
                    return sendWeChatMessage(responseText!, payload.userId)
                })
                .then()
            return 'success';
        } catch (error) {
            const errText = wechatResponseBuilder(payload, 'Error, please try again later');
            return await delayReply(20, errText);
        }
    }

    static async receiveVoice(payload: WechatVoiceCreateParams): Promise<string> {
        createResponseForVoice(payload).then();
        return 'success';
    }
}