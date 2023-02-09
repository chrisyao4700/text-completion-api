// import Chat from "../model/chat.model";
import { WechatService } from "../service/wechat.service";
import { timeDiffMinutes } from "../util/util";

const main = (async () => {

    // const timeDiff = timeDiffMinutes(new Date('2023-02-08T07:25:00.000Z'), new Date());
    // console.log(new Date());
    // console.log(timeDiff);

    
    const payload = {
        userId: 'wechat_user_3',
        text: 'Nice! can i buy a Harry Potter book? Anylink? '
    };
    try{
        const response = await WechatService.receiveMessage(payload);
        console.log(response);
    
    }catch(e){
        console.log(e);
    }
    
    // const chats = await Chat.findAll({});
    // // console.log(chats);
    // const chat = chats[0];
    // const lines = await chat.getLines();
    // console.log(lines);

})();