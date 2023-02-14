require('dotenv').config();
import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

export const createTextFromPrompt = async (prompt: string, errText:string): Promise<string> => {
    try {
        if (process.env.TEXT_LOGGING === 'true') console.log('Sent out:', prompt);
        const completion = await openai.createCompletion({
            model: `${process.env.OPEN_API_USING_MODEL || 'texdt-davinci-003'}`,
            prompt: prompt,
            temperature: 0.7,
            max_tokens: 2048
        });
        const resText = `${completion.data.choices[0].text}`
            .split('\n').join("")
            .split('*信息开始*').join("")
            .split('*信息结束*').join("");
        if (process.env.TEXT_LOGGING === 'true') console.log('Came in:', resText);
        if (resText === '') return errText;
        return resText;
    } catch (e) {
        const err = e as Error;
        console.log(e);
        return errText;
    }
}