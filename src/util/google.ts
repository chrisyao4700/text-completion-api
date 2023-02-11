import * as speech from '@google-cloud/speech';

const client = new speech.SpeechClient();
export const convertVoiceToText = async (audioBytes: Buffer): Promise<string> => {
    const audio = {
        content: audioBytes.toString('base64'),
    };
    const config:speech.protos.google.cloud.speech.v1.IRecognitionConfig = {
        encoding: 'AMR_WB',
        sampleRateHertz: 16000,
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