
import CHAT,{ ChatInput, ChatOutput } from '../model/chat.model';
import { Logger } from '../util/logger';


export type ChatCreateParams = Required<ChatInput>;

export class ChatService {

    static async create(payload: ChatCreateParams): Promise<ChatOutput | undefined> {
        try {
            return undefined;
        } catch (error) {
            Logger.error(error);
            Logger.error('Error creating chat');
        }
    }
}