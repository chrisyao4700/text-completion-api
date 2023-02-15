
import Chat, { ChatInput, ChatOutput } from '../model/chat.model';
import User from '../model/user.model';
import { LINE_ROLE } from '../model/line.model';

import { GoogleLanguageCode } from '../util/google';
import { createTextFromPrompt, createImageFromPrompt } from '../util/opai';
import { delayReply, timeDiffMinutes, downloadImageFromURL, deleteFileAtPath, getRandomIntegerFromRange } from '../util/util';

import { downloadWeChatMedia, sendWechatVideoMessage, sendWeChatMessage, sendWechatVoiceMessage, sendWechatImageMessage, uploadWeChatMedia, wechatResponseBuilder, extractStringInsideImageInstruction } from '../util/wechat';
import { convertTextToSpeech, AmazonPollyLanguageCode, AmazonPollyVoiceId } from '../util/amazon';
import WechatService, { WechatTextCreateParams, WechatVoiceCreateParams } from './wechat.service';



export class SilverService extends WechatService {

    ERROR_TEXT = ["哦，我不知道你在说什么呢，你可以换个说法吗？",
        '很抱歉，我现在无法回答你的问题，但是我还是非常高兴跟你聊天。我可以做很多东西，比如跟你聊天、回答你的日常问题。此外，我还可以帮助你一些文本工作，比如翻译、整理文件。在科学方面，算数题、LeetCode 问题这些小事我还是能搞定的。来跟我聊点别的话题吧。',
        '非常抱歉，我暂时无法回答你的问题。不过我还是很高兴能跟你聊天。我可以帮你做很多事情，如回答你的日常问题和陪你聊天。此外，我也可以帮你处理一些文本工作，比如翻译和整理文件。至于科学方面，解决数学问题和 LeetCode 问题对我来说是小菜一碟。如果你想聊其他话题也可以找我哦。',
        '非常抱歉，我目前无法回答你的问题。但我非常高兴有机会和你聊天。我可以做很多事情，例如与你交谈，回答你的日常问题。此外，我还可以帮助你处理一些文本工作，例如翻译和组织文件。在科学方面，解决数学问题和 LeetCode 问题对我而言都是小菜一碟。如果你愿意，我们可以聊些其他话题。'];


    NEW_CHAT_PREFIX = `你是一个AI助手，名字叫银酱` +
        `(Silver)` +
        `请根据收到的信息聊天。\n` +
        '*信息开始*';
    NEW_CHAT_SUFFIX = '*信息结束*' +
        `\n请你直接回复新信息.\n`;
    HISTORY_CHAT_PREFIX = `你是一个AI助手，名字叫银酱` +
        `(Silver)` +
        `请根据聊天记录回复新信息，\n` +
        '*聊天记录开始*';
    HISTORY_CHAT_MIDDLE = '*聊天记录结束*' +
        '*信息开始*';
    HISTORY_CHAT_SUFFIX = '*信息结束*' +
        `\n请你直接回复新信息.\n`;

    DRAWING_INSTRUCTION_TEXT: string = "哦！对了！我刚刚从0-100的随机数字里抽中了66，" +
        "说明你是幸运用户呢！你解锁了一项我的秘密技能哦！输入" +
        "画画<你想画的内容>，我就会帮你画画哦！";
    SELF_INTERDUCTION_MEDIA_ID = "Op-N2vbdDgVOPp-cojDvKBlNmzw3DS3I1TuaKAdeR4CZnPEhyOtzbw9ohcaoR42l";
    TEXT_REMOVERS = [
        "*信息结束*",
        "*信息开始*",
    ]
    DRAW_IDENTIFER = "画画";
    VIDEO_IDENTIFER = "视频自我介绍";

    DEFAULT_VOICE_LANGUAGE: GoogleLanguageCode = GoogleLanguageCode.CHINESE;
    DEFAULT_VOICE_RESPONSE_LANGUAGE: AmazonPollyLanguageCode = AmazonPollyLanguageCode.CHINESE;
    DEFAULT_VOICE_RESPONSE_VOICE: AmazonPollyVoiceId = AmazonPollyVoiceId.ZHIYU;

    constructor(payload: WechatTextCreateParams | WechatVoiceCreateParams) {
        super(payload);
    }
    public async receiveTextMessage(): Promise<string> {
        try {
            //First time receive message
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
            if (this.payload.text === this.VIDEO_IDENTIFER) {
                this.createVideoResponse().then();
                return 'success';
            }

            this.createResponseForText()
                .then(responseText => {
                    // const resMessage = wechatResponseBuilder(payload, responseText!);
                    return sendWeChatMessage(responseText!, this.payload.userId)
                })
                .then()
            return 'success';
        } catch (error) {
            const errText = wechatResponseBuilder(this.payload, 'Error, please try again later');
            return await delayReply(20, errText);
        }
    }

    public async receiveVoiceMessage(): Promise<string> {
        this.payload = this.payload as WechatVoiceCreateParams;
        this.createResponseForVoice().then();
        return 'success';
    }
}