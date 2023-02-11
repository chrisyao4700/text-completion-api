import * as speech from '@google-cloud/speech';
import fs from'fs';
import path from 'path';
const client = new speech.SpeechClient(
   {
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
   }
);
export const convertVoiceToText = async (fileName: string): Promise<string> => {
    const realPath = path.resolve(fileName);
    const audio = {
        content: fs.readFileSync(realPath).toString('base64'),
    };
    const config:speech.protos.google.cloud.speech.v1.IRecognitionConfig = {
        encoding: 'AMR',
        sampleRateHertz: 8000,
        languageCode: 'zh-CN',
    };
    const request:speech.protos.google.cloud.speech.v1.IRecognizeRequest = {
        audio: audio,
        config: config,
    };
    try {
        const [response] = await client.recognize(request);
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