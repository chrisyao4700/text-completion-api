
import Chat, {ChatInput, ChatOutput } from '../model/chat.model';
import Line, { LineOutput } from '../model/line.model';
import { Logger } from '../util/logger';


export type ChatCreateParams = Required<ChatInput>;
export type ChatDetailOutput ={
   chat:ChatOutput,
   lines: LineOutput[];
    
};

export class ChatService {

    static async create(payload: ChatCreateParams): Promise<ChatOutput | undefined> {
        try {
            const chat = await Chat.create(payload);
            return chat;
        } catch (error) {
            Logger.error(error);
            
        }
    }

    static async find(chatId: string): Promise<ChatDetailOutput| undefined> {
        try {
            const chat = await Chat.findByPk(Number(chatId));
            if(chat){
                const lines = await chat.getLines();
                return {
                    chat,
                    lines
                };
            }else{
                return;
            }
         } catch (e) { 
            Logger.error(e);
         }
    }
}