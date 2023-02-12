// import Chat from "../model/chat.model";
require('dotenv').config();
import { WechatService } from "../service/wechat.service";
import { timeDiffMinutes } from "../util/util";

import { convertVoiceToText } from "../util/google";
import { uploadWeChatVoice } from "../util/wechat";
import { convertTextToSpeech } from "../util/amazon";
const main = (async () => {


   
    // const res = await uploadWeChatVoice('db/temp/voice/23996659428375974.amr');
    // console.log(res);

    // const path = 'db/temp/voice/fuck.mp3';
    // await convertTextToSpeech('我是克里斯，艺名也是克里斯～～～',path);
    // const res = await convertVoiceToText('db/temp/voice/23996659428375974.amr');
    // console.log(res);
    // const timeDiff = timeDiffMinutes(new Date('2023-02-08T07:25:00.000Z'), new Date());
    // console.log(new Date());
    // console.log(timeDiff);

    
    // const payload = {
    //     userId: 'wechat_user_3',
    //     text: 'Nice! can i buy a Harry Potter book? Anylink? '
    // };
    // try{
    //     const response = await WechatService.receiveMessage(payload);
    //     console.log(response);
    
    // }catch(e){
    //     console.log(e);
    // }
    
    // const chats = await Chat.findAll({});
    // // console.log(chats);
    // const chat = chats[0];
    // const lines = await chat.getLines();
    // console.log(lines);

})();