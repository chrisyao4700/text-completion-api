import { Body, Path,Controller, Post, Get,Route, SuccessResponse, Security, Example } from 'tsoa';
import { setErrorCode, setResponseCode } from '../util/responseHandler';
import { Logger } from '../util/logger';

import { ChatService, ChatCreateParams, ChatDetailOutput } from '../service/chat.service';
import { ChatAttributes } from '../model/chat.model';

//   // "dev": "nodemon -x tsoa spec-and-routes",
@Route('v1/chat')
export class ChatController extends Controller {
    /**
     *
     * @param requestBody Body that is sent for create a Chat
     * @example requestBody {
     *   "title":"New Chat"
     * }
     */

    @SuccessResponse('200', 'Created Chat')
    @Post('/')
    public async create(@Body() requestBody: ChatCreateParams): Promise<ChatAttributes | undefined | Error> {
        try {
            const createResponse = await ChatService.create(requestBody);
            setResponseCode(this, createResponse, 200);
            return createResponse;

        } catch (error) {
            Logger.error(error);
            setErrorCode(this, 500);
            return {
                name: 'Internal Server Error',
                message: 'Unable to process at this time'
            };
        }
    }

    @SuccessResponse('200', 'Chat Found')
    @Get('/detail/{chatId}')
    /**
     *
     * @param chatId ChatId is to fetch a chat
     * @example "11"
     */
    public async find(@Path() chatId: string):Promise<ChatDetailOutput| undefined | Error>{
        try {
            const chatDetailOutput = await ChatService.find(chatId);
            setResponseCode(this, chatDetailOutput, 200);
            return chatDetailOutput;

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