
import Chat, { ChatInput, ChatOutput } from '../model/chat.model';
import User from '../model/user.model';
import { LINE_ROLE } from '../model/line.model';

import { convertVoiceToText, GoogleLanguageCode } from '../util/google';
import { createTextFromPrompt, createImageFromPrompt } from '../util/opai';
import { delayReply, timeDiffMinutes, downloadImageFromURL, deleteFileAtPath, getRandomIntegerFromRange } from '../util/util';

import { downloadWeChatMedia, sendWechatVideoMessage, sendWeChatMessage, sendWechatVoiceMessage, sendWechatImageMessage, uploadWeChatMedia, wechatResponseBuilder, extractStringInsideImageInstruction } from '../util/wechat';
import { AmazonPollyLanguageCode, AmazonPollyVoiceId } from '../util/amazon';
import { AZURE_VOICE_NAMES, convertTextToSpeech } from '../util/azure';
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







export default abstract class WechatService {
    payload: WechatTextCreateParams | WechatVoiceCreateParams;
    abstract DRAWING_INSTRUCTION_TEXT: string;
    abstract SELF_INTERDUCTION_MEDIA_ID: string;

    abstract NEW_CHAT_PREFIX: string;;
    abstract NEW_CHAT_SUFFIX: string;
    abstract HISTORY_CHAT_PREFIX: string;
    abstract HISTORY_CHAT_MIDDLE: string;
    abstract HISTORY_CHAT_SUFFIX: string;
    abstract TEXT_REMOVERS: string[];

    abstract ERROR_TEXT: string[];
    abstract DEFAULT_VOICE_LANGUAGE: GoogleLanguageCode;
    // abstract DEFAULT_VOICE_RESPONSE_LANGUAGE: AZURE_VOICE_NAMES;
    abstract DEFAULT_VOICE_RESPONSE_VOICE: AZURE_VOICE_NAMES;
    voiceText: string | null;

    static DEFAULT_FOLDER_PATH = `db/temp/voice`;

    constructor(payload: WechatTextCreateParams | WechatVoiceCreateParams) {
        this.payload = payload;
        this.voiceText = null;;
    }

    protected getRandomErrText = () => {
        return this.ERROR_TEXT[Math.floor(Math.random() * this.ERROR_TEXT.length)];
    }

    protected startNewChat = async (chat: Chat, text: string): Promise<string> => {
        const prompt = this.NEW_CHAT_PREFIX +
            `\n${text}\n` +
            this.NEW_CHAT_SUFFIX;
        const resText = await createTextFromPrompt(prompt, this.getRandomErrText(), this.TEXT_REMOVERS);
        await chat.createLine({ text: text, role: LINE_ROLE.HUMAN });
        await chat.createLine({ text: resText, role: LINE_ROLE.AI });
        return resText;
    }

    protected continueChat = async (chat: Chat, text: string): Promise<string> => {
        const previousLines = await chat.getLines({ order: [['createdAt', 'DESC']], limit: 4 });
        const historyText = previousLines.reverse().map(line => line.text)
            .join('\n');

        const prompt = this.HISTORY_CHAT_PREFIX +
            `\n${historyText}\n` +
            this.HISTORY_CHAT_MIDDLE +
            `\n${text}\n` +
            this.HISTORY_CHAT_SUFFIX;
        const resText = await createTextFromPrompt(prompt, this.getRandomErrText(), this.TEXT_REMOVERS);
        await chat.createLine({ text: text, role: LINE_ROLE.HUMAN });
        await chat.createLine({ text: resText, role: LINE_ROLE.AI });
        return resText;
    }
    protected createDrawingInstruction = async (): Promise<void> => {
        try {
            await sendWeChatMessage(this.DRAWING_INSTRUCTION_TEXT, this.payload.userId);
        } catch (e) {
            console.log(e);
        }
    }

    protected createVideoResponse = async (): Promise<void> => {
        try {
            //TODO: Add dynamic video
            await sendWechatVideoMessage(this.SELF_INTERDUCTION_MEDIA_ID, this.payload.userId);
        } catch (e) {
            console.log(e)
        }
    }

    protected createResponseForText = async (): Promise<string | null> => {
        try {
            this.payload = this.payload as WechatTextCreateParams;
            const count = await User.count({ where: { userId: this.payload.userId } });
            if (count === 0) {
                //New message from user
                const chat = await Chat.create({ title: "Wechat Conversation" });
                // Create User
                await User.create({ userId: this.payload.userId, chatId: chat.id });
                return await this.startNewChat(chat, this.payload.text)

            } else {
                //History message from user
                const user = await User.findOne({ where: { userId: this.payload.userId } });
                const chat = await Chat.findByPk(user!.chatId);

                const previousLines = await chat!.getLines({ order: [['createdAt', 'DESC']], limit: 1 });

                if (previousLines.length === 0) {
                    return await this.startNewChat(chat!, this.payload.text);
                }
                const lastLine = previousLines[0];
                /* If last line is one minute away, then start a new chat */
                if (timeDiffMinutes(lastLine.createdAt, new Date()) > 1) {
                    const freshChat = await Chat.create({ title: "Wechat Conversation" });
                    await user?.update({ chatId: freshChat.id });
                    return await this.startNewChat(freshChat, this.payload.text);
                }
                return await this.continueChat(chat!, this.payload.text);
            }
        } catch (error) {
            const errText = 'Error, please try again later';
            return errText;
        }
    }

    protected retrieveVoiceText = async (): Promise<string> => {
        this.payload = this.payload as WechatVoiceCreateParams;

        const inputFilePath = await downloadWeChatMedia(this.payload.mediaId, WechatService.DEFAULT_FOLDER_PATH);
        await delayReply(1, '');
        const text = await convertVoiceToText(inputFilePath, this.DEFAULT_VOICE_LANGUAGE);
        this.voiceText = text;
        await deleteFileAtPath(inputFilePath);
        return text;
    }

    protected createResponseForVoice = async (): Promise<string> => {
        let hasSentRes = false;
        try {
            if (!this.voiceText) {
                await this.retrieveVoiceText();
            }
            this.payload = {
                userId: this.payload.userId,
                text: this.voiceText!,
                toUserId: this.payload.toUserId,
                messageId: this.payload.messageId
            }
            const responseText = await this.createResponseForText();
            const responseFilePath = await convertTextToSpeech(responseText!,
                this.payload.messageId,
                WechatService.DEFAULT_FOLDER_PATH,
                this.DEFAULT_VOICE_RESPONSE_VOICE
               );
            await delayReply(1, '');

            const responseMediaId = await uploadWeChatMedia(responseFilePath, 'voice', 'audio/mpeg');
            await sendWechatVoiceMessage(responseMediaId, this.payload.userId);
            hasSentRes = true;

            await deleteFileAtPath(responseFilePath);
            return responseText!;
        } catch (e) {
            console.log(e);
            const errText = this.getRandomErrText();
            if (!hasSentRes) {

                await sendWeChatMessage(errText, this.payload.userId);
                return errText;
            }
            return errText;

        }
    }

    protected createImageResponse = async (): Promise<void> => {
        try {
            this.payload = this.payload as WechatTextCreateParams;
            const imageUrl = await createImageFromPrompt(this.payload.text);
            const responseFilePath = await downloadImageFromURL(imageUrl, 'db/temp/image', this.payload.messageId);
            const responseMediaId = await uploadWeChatMedia(responseFilePath, 'image');
            await sendWechatImageMessage(responseMediaId, this.payload.userId);
            await deleteFileAtPath(responseFilePath);
        } catch (e) {
            console.log(e);
        }
    }
}