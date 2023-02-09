require('dotenv').config();
import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

export const createTextFromPrompt = async (prompt: string): Promise<string> => {
    // console.log('Sent out:',prompt);
    if(process.env.TEXT_LOGGING === 'true') console.log('Sent out:',prompt);
    const completion = await openai.createCompletion({
        model: `${process.env.OPEN_API_USING_MODEL || 'texdt-davinci-003'}`,
        prompt: prompt,
        temperature: 1,
        max_tokens: 2048
    });
    
    // console.log(completion.data.choices);
    const resText = `${completion.data.choices[0].text}`.split('\n').join(' ');
    if(process.env.TEXT_LOGGING === 'true') console.log('Came in:', resText);
    if(resText === '') throw new Error('Cannot get response');
    return resText;
}