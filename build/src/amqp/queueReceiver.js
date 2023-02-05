"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAmqpSubscription = void 0;
const rhea = require('rhea');
function initAmqpSubscription(queue) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = rhea.connect(process.env.AMQP_KEY);
        connection.on('receiver_open', function (context) {
            console.log('subscribed to msvc-identity-management queue');
        });
        connection.on('message', function (context) {
            try {
                if (context.message.body === 'detach') {
                    // detaching leaves the subscription active, so messages sent
                    // while detached are kept until we attach again
                    context.receiver.detach();
                    context.connection.close();
                }
                else if (context.message.body === 'close') {
                    // closing cancels the subscription
                    context.receiver.close();
                    context.connection.close();
                }
                else {
                    let body = context.message.body;
                    console.log(body === null || body === void 0 ? void 0 : body.toString());
                    throw 'oh no :(';
                }
            }
            catch (err) {
                console.log(err);
            }
        });
        connection.open_receiver({
            name: queue,
            source: {
                address: queue,
                durable: 2,
                expiry_policy: 'never',
            },
        });
    });
}
exports.initAmqpSubscription = initAmqpSubscription;
