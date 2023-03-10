import { Body, Path, Controller, Post, Get, Route, SuccessResponse, Security, Example } from 'tsoa';
import { setErrorCode, setResponseCode } from '../util/responseHandler';
import { Logger } from '../util/logger';

import { LineService, LineGenerateParams , LineGenerateResponse, ChatLinesResponse} from '../service/line.service';
import { LineOutput } from '../model/line.model';

@Route('v1/line')
export class LineController extends Controller {
    /**
     *
     * @param requestBody Body that is sent for create a Line
     * @example requestBody {
     * "text": "How connect OpenAI with WeChat",
     * "chatId": 1
     * }
     */

    @SuccessResponse('200', 'Created text')
    @Post('/')
    public async create(@Body() requestBody: LineGenerateParams): Promise<LineGenerateResponse|void | Error | null> {
        try {
            const createResponse:LineGenerateResponse = await LineService.create(requestBody);
            
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


    @Get('/all/{chatId}')
    public async getLines(@Path() chatId: string): Promise<ChatLinesResponse| void | Error | null>{

        try{
            const chatLinesResponse = await LineService.findAllChatLines(Number(chatId));

            setResponseCode(this, chatLinesResponse, 200);

            return chatLinesResponse;
        }catch(error){
            Logger.error(error);
            setErrorCode(this, 500);
            return {
                name: 'Internal Server Error',
                message: 'Unable to process at this time'
            };
        }
    }

    @Get('/detail/{lineId}')
    public async getDetail(@Path() lineId: string): Promise<LineOutput| void | Error | null>{
        try{
            const lineDetailResponse = await LineService.findLineDetail(Number(lineId));

            setResponseCode(this, lineDetailResponse, 200);

            return lineDetailResponse;
        }catch(error){
            Logger.error(error);
            setErrorCode(this, 500);
            return {
                name: 'Internal Server Error',
                message: 'Unable to process at this time'
            };
        }
    }
}