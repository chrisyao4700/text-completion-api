import { Connection } from "rhea/typings/connection";
const rhea = require('rhea');

export async function initAmqpSubscription(queue: string) {
    const connection: Connection = rhea.connect(process.env.AMQP_KEY);

    connection.on('receiver_open', function (context) {
        console.log('subscribed to msvc-identity-management queue');
    });

    connection.on('message', function (context) {
        try{
            if (context.message.body === 'detach') {
                // detaching leaves the subscription active, so messages sent
                // while detached are kept until we attach again
                context.receiver.detach();
                context.connection.close();
            } else if (context.message.body === 'close') {
                // closing cancels the subscription
                context.receiver.close();
                context.connection.close();
            } else {
                let body: Buffer = context.message.body;
                console.log(body?.toString());
                throw 'oh no :('
            }
        } catch (err) {
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
}