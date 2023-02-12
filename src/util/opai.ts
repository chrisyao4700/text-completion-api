require('dotenv').config();
import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

export const createTextFromPrompt = async (prompt: string): Promise<string> => {
    // console.log('Sent out:',prompt);
    try {
        if (process.env.TEXT_LOGGING === 'true') console.log('Sent out:', prompt);
        const completion = await openai.createCompletion({
            model: `${process.env.OPEN_API_USING_MODEL || 'texdt-davinci-003'}`,
            prompt: prompt,
            temperature: 0.7,
            max_tokens: 4000
        });

        // console.log(completion.data.choices);
        const resText = `${completion.data.choices[0].text}`.split('\n').join('');
        if (process.env.TEXT_LOGGING === 'true') console.log('Came in:', resText);
        if (resText === '') return '你说的都是些啥呀？无力吐槽，我无语了。。。';
        return resText;
    } catch (e ) {
        const err = e as Error;
        console.log(e);
        return `你说的都是些啥呀？我懵逼了...`;
    }
}