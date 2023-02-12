import AWS from "aws-sdk";
import fs from "fs";
import { resolve } from "path";
// Configure the AWS SDK with your AWS credentials and region
AWS.config.update({
    region: process.env.AMAZON_REGION,
    accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
    secretAccessKey: process.env.AMAZON_ACCESS_KEY_SECRET
});

// Create an instance of the Amazon Polly client
const polly = new AWS.Polly({ apiVersion: "2016-06-10" });

// Define the text to convert to speech
// const text = "Hello, this is a test of the Amazon Polly TTS API";

// Define the parameters for the TTS request
export const convertTextToSpeech = async (text: string, filePath: string, identifier:string): Promise<string> => {
    const params = {
        OutputFormat: "mp3",
        Text: text,
        VoiceId: "Zhiyu",
        LanguageCode: "cmn-CN",
        Engine: "neural"
    };

    // Make the TTS request and get the audio data

    return new Promise((resolve, reject) => {
        polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                const buffer = data.AudioStream as Buffer;
                const finalPath = `${filePath}/${identifier}.mp3`;
                fs.writeFile(finalPath, buffer, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(filePath);
                    }
                });
            }
        });
    });
}