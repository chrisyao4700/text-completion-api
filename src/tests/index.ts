import Chat from "../model/chat.model";

const main = (async () => {

    const chats = await Chat.findAll({});
    // console.log(chats);
    const chat = chats[0];
    const lines = await chat.getLines();
    console.log(lines);

})();