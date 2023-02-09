
export const timeDiffMinutes = (firstDate:Date, secondDate:Date):number => {
    return Math.round(Math.abs(firstDate.getTime() - secondDate.getTime()) / 60000);
}


export const wechatResponseBuilder = (payload: any, responseText: string): string => {
    const resMessage = `<xml>
<ToUserName><![CDATA[${payload.userId}]]></ToUserName>
<FromUserName><![CDATA[${payload.toUserId}]]></FromUserName>
<CreateTime>${new Date().getTime()}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${payload.text}]]></Content>
</xml>`
    return resMessage;
};