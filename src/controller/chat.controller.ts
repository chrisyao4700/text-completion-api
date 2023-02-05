import { Body, Controller, Post, Route, SuccessResponse, Security, Example } from 'tsoa';
import { setErrorCode, setResponseCode } from '../util/responseHandler';
import { Logger } from '../util/logger';

import { ChatService, ChatCreateParams } from '../service/chat.service';

//   // "dev": "nodemon -x tsoa spec-and-routes",
@Route('v1/chat')
export class ChatController extends Controller {
    /**
     *
     * @param requestBody Body that is sent for upserting a Chat ticket
     * @example requestBody {
     *  "created_by_id" : "AJFN123",
     *  "requested_for_id" : "JNB123",
     *  "account_id" : "MA1234",
     *  "site_id" : "BCD123",
     *  "status" : "OPEN",
     *  "category" : "GARMIN",
     *  "requested_for_role": "PATIENT"
     * }
     */
    @SuccessResponse('200', 'Created Chat')
    @Post('/')
    public async create(@Body() requestBody: ChatCreateParams): Promise<void | Error | null> {
        try {
            const createResponse = await ChatService.create(requestBody);
            setResponseCode(this, createResponse, 200);

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