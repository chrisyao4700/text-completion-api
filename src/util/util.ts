
export const timeDiffMinutes = (firstDate:Date, secondDate:Date):number => {
    return Math.round(Math.abs(firstDate.getTime() - secondDate.getTime()) / 60000);
}


export const wechatResponseBuilder = (payload: any, responseText: string): string => {
    const resMessage = `<xml>
<ToUserName><![CDATA[${payload.userId}]]></ToUserName>
<FromUserName><![CDATA[${payload.toUserId}]]></FromUserName>
<CreateTime>${new Date().getTime()}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${responseText}]]></Content>
</xml>`
    return resMessage;
};

export const delayReply = (seconds: number, response: string):Promise<string> => {
    return new Promise(resolve => setTimeout(()=>{
        resolve(response);
    }, seconds * 1000));
}