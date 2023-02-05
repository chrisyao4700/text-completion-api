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
exports.amqpPublish = void 0;
const rhea = require('rhea');
let counter = 0;
/**
 *
 * @param queue name of queue to publish to
 * @param message payload object to publish
 */
function amqpPublish(queue, message, correlationId) {
    return __awaiter(this, void 0, void 0, function* () {
        rhea.connect({
            port: process.env.AMQP_PORT,
            host: process.env.AMQP_HOST,
        }).open_sender(queue);
        rhea.on('sendable', function (context) {
            while (context.sender.sendable()) {
                counter++;
                console.log('sent ' + counter);
                context.sender.send({
                    message_id: counter,
                    correlation_id: correlationId,
                    body: { sequence: counter, data: message },
                });
            }
        });
        rhea.on('accepted', function (context) {
            console.log('messages confirmed');
            context.connection.close();
        });
        rhea.on('disconnected', function (context) {
            if (context.error)
                console.error('%s %j', context.error, context.error);
        });
    });
}
exports.amqpPublish = amqpPublish;
