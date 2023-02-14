
import Chat, { ChatInput, ChatOutput } from '../model/chat.model';
import User from '../model/user.model';
import { LINE_ROLE } from '../model/line.model';

import { convertVoiceToText } from '../util/google';
import { createTextFromPrompt, createImageFromPrompt } from '../util/opai';
import { delayReply, timeDiffMinutes, downloadImageFromURL, deleteFileAtPath, getRandomIntegerFromRange } from '../util/util';

import { downloadWeChatMedia, sendWechatVideoMessage, sendWeChatMessage, sendWechatVoiceMessage, sendWechatImageMessage, uploadWeChatMedia, wechatResponseBuilder, extractStringInsideImageInstruction } from '../util/wechat';
import { convertTextToSpeech } from '../util/amazon';
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
const errText = ['很抱歉，我现在无法回答你的问题。然而，我仍然非常高兴有机会与您聊天。我可以做很多事情，例如与您交谈，回答您的日常问题。此外，我还可以帮助您处理一些文字工作，例如翻译和整理文件。在科学方面，解决数学问题，甚至 LeetCode 问题对我来说都是小菜一碟。随时与我讨论其他话题。',
    '很抱歉，我现在无法回答你的问题，但是我还是非常高兴跟你聊天。我可以做很多东西，比如跟你聊天、回答你的日常问题。此外，我还可以帮助你一些文本工作，比如翻译、整理文件。在科学方面，算数题、LeetCode 问题这些小事我还是能搞定的。来跟我聊点别的话题吧。',
    '非常抱歉，我暂时无法回答你的问题。不过我还是很高兴能跟你聊天。我可以帮你做很多事情，如回答你的日常问题和陪你聊天。此外，我也可以帮你处理一些文本工作，比如翻译和整理文件。至于科学方面，解决数学问题和 LeetCode 问题对我来说是小菜一碟。如果你想聊其他话题也可以找我哦。',
    '非常抱歉，我目前无法回答你的问题。但我非常高兴有机会和你聊天。我可以做很多事情，例如与你交谈，回答你的日常问题。此外，我还可以帮助你处理一些文本工作，例如翻译和组织文件。在科学方面，解决数学问题和 LeetCode 问题对我而言都是小菜一碟。如果你愿意，我们可以聊些其他话题。'];


const getRandomErrText = () => {
    return errText[Math.floor(Math.random() * errText.length)];
}


const startNewChat = async (chat: Chat, text: string): Promise<string> => {
    const prompt = `你是一个AI助手，名字叫${process.env.CHAT_AGENT_CHINESE_NAME}` +
        `(${process.env.CHAT_AGENT_ENGLISH_NAME})` +
        `请根据收到的信息聊天。\n` +
        '*信息开始*' +
        `\n${text}\n` +
        '*信息结束*' +
        `\n请你直接回复新信息.\n`;
    const resText = await createTextFromPrompt(prompt, getRandomErrText());
    await chat.createLine({ text: text, role: LINE_ROLE.HUMAN });
    await chat.createLine({ text: resText, role: LINE_ROLE.AI });
    return resText;
}

const continueChat = async (chat: Chat, text: string): Promise<string> => {
    const previousLines = await chat.getLines({ order: [['createdAt', 'DESC']], limit: 4 });
    const historyText = previousLines.reverse().map(line => line.text)
        .join('\n');

    const prompt = `你是一个AI助手，名字叫${process.env.CHAT_AGENT_CHINESE_NAME}` +
        `(${process.env.CHAT_AGENT_ENGLISH_NAME})` +
        `请根据聊天记录回复新信息，\n` +
        '*聊天记录开始*' +
        `\n${historyText}\n` +
        '*聊天记录结束*' +
        '*信息开始*' +
        `\n${text}\n` +
        '*信息结束*' +
        `\n请你直接回复新信息.\n`;
    const resText = await createTextFromPrompt(prompt, getRandomErrText());
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
    let hasSentRes = false;
    try {
        const foderPath = `db/temp/voice`;
        const inputFilePath = await downloadWeChatMedia(payload.mediaId, foderPath);
        await delayReply(1, '');
        const text = await convertVoiceToText(inputFilePath);
        const textPayload: WechatTextCreateParams = {
            userId: payload.userId,
            text: text,
            toUserId: payload.toUserId,
            messageId: payload.messageId
        }
        const responseText = await createResponseForText(textPayload);
        const responseFilePath = await convertTextToSpeech(responseText!, foderPath, payload.messageId);
        await delayReply(1, '');

        const responseMediaId = await uploadWeChatMedia(responseFilePath, 'audio');
        await sendWechatVoiceMessage(responseMediaId, payload.userId);
        hasSentRes = true;
        await deleteFileAtPath(inputFilePath);
        await deleteFileAtPath(responseFilePath);
    } catch (e) {
        if (!hasSentRes) {
            await sendWeChatMessage(getRandomErrText(), payload.userId);
        }
        console.log(e);
    }
}
const createImageResponse = async (payload: WechatTextCreateParams): Promise<void> => {
    try {
        const imageUrl = await createImageFromPrompt(payload.text);
        const responseFilePath = await downloadImageFromURL(imageUrl, 'db/temp/image', payload.messageId);
        const responseMediaId = await uploadWeChatMedia(responseFilePath, 'image');
        await sendWechatImageMessage(responseMediaId, payload.userId);
        await deleteFileAtPath(responseFilePath);
    } catch (e) {
        console.log(e);
    }
}



const createVideoResponse = async (payload: WechatTextCreateParams): Promise<void> => {
    try {
        const SELF_INTERDUCTION_MEDIA_ID = "Op-N2vbdDgVOPp-cojDvKBlNmzw3DS3I1TuaKAdeR4CZnPEhyOtzbw9ohcaoR42l";
        //TODO: Add dynamic video
        await sendWechatVideoMessage(SELF_INTERDUCTION_MEDIA_ID, payload.userId);
    } catch (e) {
        console.log(e)
    }
}

const DRAWING_INSTRUCTION_TEXT = "哦！对了！我刚刚从0-1000的随机数字里抽中了666，" +
    "说明你是幸运用户呢！你解锁了一项我的秘密技能哦！输入" +
    "画画<你想画的内容>，我就会帮你画画哦！";
const createDrawingInstruction = async (payload: WechatTextCreateParams): Promise<void> => {
    try {
        await sendWeChatMessage(DRAWING_INSTRUCTION_TEXT, payload.userId);
    } catch (e) {
        console.log(e);
    }
}

export class WechatService {
    static async receiveMessage(payload: WechatTextCreateParams): Promise<string> {
        try {
            //First time receive message
            if(getRandomIntegerFromRange(0,1000) === 666){
                await createDrawingInstruction(payload).then();
            }
            const pulledText = extractStringInsideImageInstruction(payload.text);
            if (pulledText !== "") {
                payload.text = pulledText;
                createImageResponse(payload).then();
                return 'success';
            }
            if (payload.text === "视频自我介绍") {
                createVideoResponse(payload).then();
                return 'success';
            }

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