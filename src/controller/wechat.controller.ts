import { Body, Path, Controller, Post, Get, Route, Query, SuccessResponse, Security, Example } from 'tsoa';
import { setErrorCode, setResponseCode } from '../util/responseHandler';
import { Logger } from '../util/logger';

import { WechatCreateParams, WechatService } from '../service/wechat.service';

export type WechatRequestBody = {
    
    URL?: string, // For voice message
    MediaId?: string, // For voice message
    Recognition?: string, // For voide message
    ToUserName: string,
    FromUserName: string,
    CreateTime: string,
    MsgType: string,
    Content?: string,
    MsgId: string,
}

@Route('v1/wechat')
export class WechatController extends Controller {

    @SuccessResponse('200', 'Created Wechat Message')
    @Post('/')
    public async create(@Body() requestBody: WechatRequestBody): Promise<string | Error> {
        try {
            const type = requestBody.MsgType;
            if (type === 'text') {
                const wechatInput: WechatCreateParams = {
                    userId: requestBody.FromUserName,
                    text: requestBody.Content!,
                    toUserId: requestBody.ToUserName,
                    messageId: requestBody.MsgId
                };
                const createResponse = await WechatService.receiveMessage(wechatInput);
                setResponseCode(this, createResponse, 200);

                return createResponse;
            }

            if(type === 'voice'){
                console.log(requestBody);
            }


            setResponseCode(this, '', 404);
            return 'Not Found';


        } catch (error) {
            Logger.error(error);
            setErrorCode(this, 500);
            return {
                name: 'Internal Server Error',
                message: 'Unable to process at this time'
            };
        }
    }

}