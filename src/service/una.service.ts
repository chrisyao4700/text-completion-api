
import Chat, { ChatInput, ChatOutput } from '../model/chat.model';
import User from '../model/user.model';
import { LINE_ROLE } from '../model/line.model';

import { GoogleLanguageCode, translateTextEnglishToChinese } from '../util/google';
import { delayReply, timeDiffMinutes, downloadImageFromURL, deleteFileAtPath, getRandomIntegerFromRange } from '../util/util';

import { downloadWeChatMedia, sendWechatVideoMessage, sendWeChatMessage, sendWechatVoiceMessage, sendWechatImageMessage, uploadWeChatMedia, wechatResponseBuilder, extractStringInsideImageInstruction } from '../util/wechat';
import { convertTextToSpeech, AmazonPollyLanguageCode, AmazonPollyVoiceId } from '../util/amazon';
import WechatService, { WechatTextCreateParams, WechatVoiceCreateParams } from './wechat.service';
import { createTextFromPrompt } from '../util/opai';


const isChinese = (str: string): boolean => {
    return /^[\u4e00-\u9fa5\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\uF900-\uFAFF\u3000-\u303F\uFF00-\uFFEF]+$/.test(str);
};

export class UnaService extends WechatService {

    ERROR_TEXT = [
        "Sorry, I am unable to respond at the moment. But don't worry, I am here to assist you with your English to the best of my ability."
    ];


    NEW_CHAT_PREFIX = `You are an English grammar teacher, your name is "Una"(尤娜), ` +
        `please chat based on the message received.` +
        '*MESSAGE START*';
    NEW_CHAT_SUFFIX = '*MESSAGE END*' +
        `\nKindly respond directly to the new message.\n`;
    HISTORY_CHAT_PREFIX = `You are an English grammar teacher, your name is "Una"(尤娜),` +
        `please chat based on the chat history and message received.\n` +
        '*CHAT HISTORY START*';
    HISTORY_CHAT_MIDDLE = '*CHAT HISTORY END*' +
        '*MESSAGE START*';
    HISTORY_CHAT_SUFFIX = '*MESSAGE END*' +
        `\nKindly respond directly to the new message.\n`;

    DRAWING_INSTRUCTION_TEXT: string = `Oh! Right! I just randomly picked 66 from 0-100, which means you're a lucky user! ` +
        `You've unlocked one of my secret skills! Enter "draw<what you want to draw>" and I will draw it for you!`
    SELF_INTERDUCTION_MEDIA_ID = "XX";

    TEXT_REMOVERS = [
        "*MESSAGE START*",
        "*MESSAGE END*"
    ]

    DRAW_IDENTIFER = "draw";

    CHINESE_REPLYERS = [
        `Let's communicate in English instead of Chinese.`,
        `Can we switch to English instead of using Chinese?`,
        `Using English instead of Chinese would be more effective for communication.`,
        `It would greatly enhance our communication if we use English instead of Chinese.`,
        `Using English instead of Chinese will make our communication clearer and more efficient.`
    ]

    DEFAULT_VOICE_LANGUAGE: GoogleLanguageCode = GoogleLanguageCode.ENGLISH;
    // VIDEO_IDENTIFER = "Video self introduction"

    DEFAULT_VOICE_RESPONSE_LANGUAGE: AmazonPollyLanguageCode = AmazonPollyLanguageCode.ENGLISH;
    DEFAULT_VOICE_RESPONSE_VOICE: AmazonPollyVoiceId = AmazonPollyVoiceId.JOANNA;

    constructor(payload: WechatTextCreateParams | WechatVoiceCreateParams) {
        super(payload);
    }
    private getRandomChineseReplyer(): string {
        return this.CHINESE_REPLYERS[getRandomIntegerFromRange(0, this.CHINESE_REPLYERS.length - 1)];
    }

    private async reviseEnglishText(): Promise<string> {
        this.payload = this.payload as WechatTextCreateParams;
        if (this.payload.text && this.payload.text.length >= 25) {
            const prompt = `Please revise the following text:` +
                `\n${this.payload.text}\n`;
            const revisedText = await createTextFromPrompt(prompt, this.payload.text, []);
            await sendWeChatMessage(`I revised your last message, do you think this way would be better? <${revisedText}>`, this.payload.userId);
            return revisedText;
        } else {
            return '';
        }
    }
    public async receiveTextMessage(): Promise<string> {
        try {
            this.payload = this.payload as WechatTextCreateParams;
            if (getRandomIntegerFromRange(0, 100) === 66) {
                this.createDrawingInstruction().then();
            }
            const pulledText = extractStringInsideImageInstruction(this.payload.text, this.DRAW_IDENTIFER);
            if (pulledText !== "") {
                this.payload.text = pulledText;
                this.createImageResponse().then();
                return 'success';
            }
            if (isChinese(this.payload.text)) {
                sendWeChatMessage(this.getRandomChineseReplyer(), this.payload.userId);
                return 'success';
            }

            let orgResponseText: string | null = null;
            this.reviseEnglishText().
                then((revi) => {
                    console.log(revi);
                    return this.createResponseForText();
                })
                .then(responseText => {
                    orgResponseText = responseText;
                    return sendWeChatMessage(responseText!, this.payload.userId);
                })
                .then(() => {
                    return translateTextEnglishToChinese(orgResponseText!);
                })
                .then(translation => {
                    return sendWeChatMessage(translation, this.payload.userId);
                })
                .then();

            console.log('i reached');
            return 'success';
        } catch (error) {
            const errText = wechatResponseBuilder(this.payload, 'Error, please try again later');
            return await delayReply(20, errText);
        }
    }

    public async receiveVoiceMessage(): Promise<string> {
        this.payload = this.payload as WechatVoiceCreateParams;


        let orgResponseText: string | null = null;
        this.retrieveVoiceText()
            .then((text) => {
                return sendWeChatMessage(`I heard: <${text}>`, this.payload.userId);
            })
            .then(() => {
                return this.createResponseForVoice();
            })
            .then((responseText) => {
                orgResponseText = responseText;
                return sendWeChatMessage(responseText!, this.payload.userId);
            })
            .then(() => {
                return translateTextEnglishToChinese(orgResponseText!);
            })
            .then((translation) => {
                return sendWeChatMessage(translation, this.payload.userId);
            });
        return 'success';
    }
}