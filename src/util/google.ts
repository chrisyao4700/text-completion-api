import * as speech from '@google-cloud/speech';
import fs from'fs';
import path from 'path';
const s2tclient = new speech.SpeechClient(
   {
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
   }
);

export enum GoogleLanguageCode{
    ENGLISH = 'en-US',
    CHINESE = 'zh-CN'
}
export const convertVoiceToText = async (fileName: string, languageCode:GoogleLanguageCode): Promise<string> => {
    const realPath = path.resolve(fileName);
    const content = fs.readFileSync(realPath).toString('base64');
    const audio = {
        content: content,
    };
    const config:speech.protos.google.cloud.speech.v1.IRecognitionConfig = {
        encoding: 'AMR',
        sampleRateHertz: 8000,
        languageCode: languageCode,
    };
    const request:speech.protos.google.cloud.speech.v1.IRecognizeRequest = {
        audio: audio,
        config: config,
    };
    try {
        const [response] = await s2tclient.recognize(request);
        let transcript = ''
        if (response && response.results) {
             transcript = response.results
              .map(result => result!.alternatives![0].transcript)
              .join('\n');
        }
        return transcript;
      } catch (err) {
        console.log(err);
        return 'Error transcribing audio';
      }
}
const {Translate} = require('@google-cloud/translate').v2;

export const translateTextEnglishToChinese = async (text: string): Promise<string> => {
    const translate = new Translate();
    const [translation] = await translate.translate(text, 'zh');
    return translation;
  }