import Line from "../model/line.model";
import Chat from "../model/chat.model";

export default class DatabaseConfig {
    static async init() {
        try {
            console.log('Start sync Database...');
            await Line.initLineTable();
            await Chat.initChatTable();
            console.log('Finished sync tables');

        } catch (error) {
            console.error('Unable to connect to db', error);
        }
    }
}