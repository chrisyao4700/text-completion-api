const rhea = require('rhea');
let counter = 0;

/**
 *
 * @param queue name of queue to publish to
 * @param message payload object to publish
 */
export async function amqpPublish(queue: string, message?: any, correlationId?: any) {
    rhea.connect({
        port: process.env.AMQP_PORT,
        host: process.env.AMQP_HOST,
    }).open_sender(queue);

    rhea.on('sendable', function (context: any) {
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

    rhea.on('accepted', function (context: any) {
        console.log('messages confirmed');
        context.connection.close();
    });

    rhea.on('disconnected', function (context: any) {
        if (context.error) console.error('%s %j', context.error, context.error);
    });
}
