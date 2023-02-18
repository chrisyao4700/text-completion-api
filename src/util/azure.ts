require('dotenv').config();
import { OutputFormat, ResultReason, CancellationReason, CancellationDetails, SpeechConfig, SpeechSynthesizer, AudioConfig } from 'microsoft-cognitiveservices-speech-sdk';


export enum AZURE_VOICE_NAMES {
    CN_GIRL_MADARIN='zh-CN-XiaoxiaoNeural',
    CN_LADY_TAIWAN='zh-TW-HsiaoChenNeural',
    CN_LADY_DONGBEI='zh-CN-liaoning-XiaobeiNeural',
    US_LADY='en-US-JaneNeural'
}

export const convertTextToSpeech = async (content: string,
    identifier: string,
    folderPath: string,
    voiceName: string): Promise<string> => {
    const outputPath = `${folderPath}/${identifier}.mp3`;
    const speechConfig = SpeechConfig.fromSubscription(`${process.env.AZURE_SUBSCRIPTION_KEY}`, 'eastus');
    // speechConfig.speechSynthesisLanguage = 'en-US';
    speechConfig.speechSynthesisVoiceName = voiceName;

    const synthesizer = new SpeechSynthesizer(speechConfig, AudioConfig.fromAudioFileOutput(outputPath));

    // synthesizer.synthesizing = function (s, e) {
    //     var str = "(synthesizing) Reason: " + ResultReason[e.result.reason] + " Audio chunk length: " + e.result.audioData.byteLength;
    //     console.log(str);
    // };

    // // The event visemeReceived signals that a viseme is detected.
    // // a viseme is the visual description of a phoneme in spoken language. It defines the position of the face and mouth when speaking a word.
    // synthesizer.visemeReceived = function (s, e) {
    //     var str = "(viseme) : Viseme event received. Audio offset: " + (e.audioOffset / 10000) + "ms, viseme id: " + e.visemeId;
    //     console.log(str);
    // }

    // // The event synthesis completed signals that the synthesis is completed.
    // synthesizer.synthesisCompleted = function (s, e) {
    //     console.log("(synthesized)  Reason: " + ResultReason[e.result.reason] + " Audio length: " + e.result.audioData.byteLength);
    // };

    // // The synthesis started event signals that the synthesis is started.
    // synthesizer.synthesisStarted = function (s, e) {
    //     console.log("(synthesis started)");
    // };

    // // The event signals that the service has stopped processing speech.
    // // This can happen when an error is encountered.
    // synthesizer.SynthesisCanceled = function (s, e) {
    //     var cancellationDetails = CancellationDetails.fromResult(e.result);
    //     var str = "(cancel) Reason: " + CancellationReason[cancellationDetails.reason];
    //     if (cancellationDetails.reason === CancellationReason.Error) {
    //         str += ": " + e.result.errorDetails;
    //     }
    //     console.log(str);
    // };

    // // This event signals that word boundary is received. This indicates the audio boundary of each word.
    // // The unit of e.audioOffset is tick (1 tick = 100 nanoseconds), divide by 10,000 to convert to milliseconds.
    // synthesizer.wordBoundary = function (s, e) {
    //     console.log("(WordBoundary), Text: " + e.text + ", Audio offset: " + e.audioOffset / 10000 + "ms.");
    // };

    return new Promise((resovle, reject) => {
        synthesizer.speakTextAsync(content, (result) => {
            if (result.reason === ResultReason.SynthesizingAudioCompleted) {
                resovle(outputPath);
                synthesizer.close();
            } else {
                reject(result.errorDetails);
                synthesizer.close();
            }
        });
    })
    
}

/*
// For more samples please visit https://github.com/Azure-Samples/cognitive-services-speech-sdk 
// 

// Creates an instance of a speech config with specified subscription key and service region. 
String subscriptionKey = "c81c5c8057f047e4afaf7391a3180fb2";
String subscriptionRegion = "eastus";

SpeechConfig config = SpeechConfig.fromSubscription(subscriptionKey, subscriptionRegion);
// Note: the voice setting will not overwrite the voice element in input SSML.
config.setSpeechSynthesisVoiceName("zh-CN-XiaoshuangNeural");

string text = "你好，这是晓双。";

SpeechSynthesizer synthesizer = new SpeechSynthesizer(config);
{     
    SpeechSynthesisResult result = synthesizer.SpeakTextAsync(text).get();
    if (result.getReason() == ResultReason.SynthesizingAudioCompleted) {
      System.out.println("Speech synthesized for text [" + text + "]");
    }
    else if (result.getReason() == ResultReason.Canceled) {
        SpeechSynthesisCancellationDetails cancellation = SpeechSynthesisCancellationDetails.fromResult(result);
        System.out.println("CANCELED: Reason=" + cancellation.getReason());

        if (cancellation.getReason() == CancellationReason.Error) {
            System.out.println("CANCELED: ErrorCode=" + cancellation.getErrorCode());
            System.out.println("CANCELED: ErrorDetails=" + cancellation.getErrorDetails());
            System.out.println("CANCELED: Did you update the subscription info?");
        }
    }

    result.close();    
}
synthesizer.close();

  */