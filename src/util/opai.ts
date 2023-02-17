require('dotenv').config();
import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

const defaultRemovers = [
    '\n'
]

export const createTextFromPrompt = async (prompt: string, errText: string, removers: string[]): Promise<string> => {
    try {
        if (process.env.TEXT_LOGGING === 'true') console.log('Sent out:', prompt);
        const completion = await openai.createCompletion({
            model: `${process.env.OPEN_API_USING_MODEL || 'texdt-davinci-003'}`,
            prompt: prompt,
            temperature: 0.7,
            max_tokens: 2048
        });
        let resText = `${completion.data.choices[0].text}`

        const copyRemovers = [...defaultRemovers, ...removers];
        while (copyRemovers.length) {
            resText = resText.split(copyRemovers.pop() as string).join('');
        }
        if (process.env.TEXT_LOGGING === 'true') console.log('Came in:', resText);
        if (resText === '') return errText;
        return resText;
    } catch (e) {
        const err = e as Error;
        console.log(e);
        return errText;
    }
}

export const createImageFromPrompt = async (prompt: string): Promise<string> => {
    try {
        const response = await openai.createImage({
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });
        const image_url = response.data.data[0].url;
        return image_url || '';
    } catch (e) {
        const err = e as Error;
        console.log(e);
        return '';
    }
}