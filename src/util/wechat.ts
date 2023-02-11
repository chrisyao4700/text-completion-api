import { parseString } from 'xml2js';
import { Request } from 'express';
import { sendAxiosRequest } from './util';
const sha1 = require('sha1');


const getUserDataAsync = (req: Request): any => {
    let temp = ''
    return new Promise((resolve, reject) => {
        req
            .on('data', data => {
                temp += data.toString();
            })
            .on('end', () => {
                resolve(temp);
            });
    });
}

const parseXML = (xml: string): any => {
    return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}
const formatMessage = (jsData: any): any => {
    let message: any = {};
    jsData = jsData.xml;
    if (typeof jsData === 'object') {
        for (let key in jsData) {
            let value = jsData[key];
            if (Array.isArray(value) && value.length > 0) {
                message[key] = value[0];
            }
        }
    }
    return message;
}

export const parseWeChatBody = async (req: Request) => {

    try {
        const xmlData = await getUserDataAsync(req);
        const jsData = await parseXML(xmlData);
        const message = formatMessage(jsData);
        return message;
    } catch (e) {
        console.warn(e);
        return {};
    }
}
export const verifyWechatSignature = async (req: Request): Promise<string[]> => {
    const rawEchostr = `${req.query.echostr}`;
    try {
        const token = process.env.WECHAT_TOKEN;
        const { signature, timestamp, nonce, echostr } = req.query;
        const str = [token, timestamp, nonce].sort().join('')
        const sha = sha1(str);
        return [sha, signature, echostr];
    } catch (e) {
        console.warn(e);
        return [rawEchostr, rawEchostr];
    }
}

export const wechatResponseBuilder = (payload: any, responseText: string): string => {
    const resMessage = `<xml>` +
        `<ToUserName><![CDATA[${payload.userId}]]></ToUserName>` +
        `<FromUserName><![CDATA[${payload.toUserId}]]></FromUserName>` +
        `<CreateTime>${new Date().getTime()}</CreateTime>` +
        `<MsgType><![CDATA[text]]></MsgType>` +
        `<Content><![CDATA[${responseText}]]></Content>` +
        `</xml>`
    return resMessage;
};


// Here handle the wechat access_token
type WeChatAcessToeknRecord = {
    access_token: string;
    expiresDate: Date;
}

let accessTokenRecord: WeChatAcessToeknRecord | null = null;
const appId = process.env.WECHAT_APP_ID;
const appSecret = process.env.WECHAT_APP_SECRET;

export const getWeChatAccessToken = async (): Promise<string> => {
    if (accessTokenRecord && accessTokenRecord.expiresDate > new Date()) {
        return accessTokenRecord.access_token;
    }
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    const response = await sendAxiosRequest(url, 'GET');

    const { access_token, expires_in } = response;
    accessTokenRecord = {
        access_token,
        expiresDate: new Date(Date.now() + (expires_in - 200) * 1000)
    }
    return access_token;
}


export const sendWeChatMessage = async (message: string, openId: string) => {
    const accessToken = await getWeChatAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`;
    const payload = { "touser": openId, "msgtype": "text", "text": { "content": message } };
    const bodyStr = JSON.stringify(payload);
    const response = await sendAxiosRequest(url, 'POST', bodyStr);
    return response;
}

export const fetchWeChatMedia = async (mediaId: string)=> {
    const accessToken = await getWeChatAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/media/get?access_token=${accessToken}&media_id=${mediaId}`;
    console.log(url);
    const response = await sendAxiosRequest(url, 'GET');
    return response;
}