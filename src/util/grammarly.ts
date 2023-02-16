//client_Djy7XDXffoZanc8RCoUVd9

var grammarify = require("grammarify");

// var sentence = "im so   borrreeedddd";

export const grammarifySentence = (sentence: string) => {
    return grammarify.clean(sentence);
}