// import Chat from "../model/chat.model";
require('dotenv').config();


import {AZURE_VOICE_NAMES, convertTextToSpeech} from '../util/azure';
const main = (async () => {

    const text ="您好，我是银酱，一名基于达芬奇引擎技术的AI助手。我可以帮助您解答各种问题，从学术研究到日常生活的各种疑问。我拥有海量的知识库和先进的自然语言处理技术，可以用自然、流畅的方式与您进行交流，并根据您的需求提供个性化的解答和建议。无论您需要什么帮助，我都会尽我所能，为您提供最好的服务。感谢您选择我作为您的AI助手，我期待与您的交流。";
    const finalPath = await convertTextToSpeech(text, AZURE_VOICE_NAMES.CN_GIRL_MADARIN,'db/temp/voice',AZURE_VOICE_NAMES.CN_GIRL_MADARIN);
    console.log(finalPath);
    // console.log(isChinese(text));
   
    // try{
    //     const description= '银是一个人工智能机器人，它使用了达芬奇3号引擎，因此能够完成许多任务。银具有高度的语言理解能力和学习能力，可以与用户进行对话，回答问题，执行命令等。它是一个先进的人工智能系统，旨在帮助人们更好地处理信息，提高工作效率。'
    // const media_id = await uplaodWechatConsistentVideo('db/temp/video/self_interduction.mp4', '银的自我介绍', description);
    // console.log(media_id);
    // }catch(e){
    //     console.log(e);
    // }

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