'use strict';
const { validateRequest } = require('./validation');

async function drain({ entity, queue, channel, handlers, limit = 20 }) {
  const report = { queue, processed: 0, remaining: false, errors: [] };
  for (let n = 0; n < limit; n += 1) {
    const message = await channel.get(queue, { noAck: false });
    if (!message) return report;
    try {
      const request = validateRequest(entity, JSON.parse(message.content.toString('utf8')));
      await handlers[request.method](request);
      channel.ack(message);
      report.processed += 1;
    } catch (error) {
      // Ante un error se devuelve el mensaje a la cola y se DETIENE el lote.
      channel.nack(message, false, true);
      report.errors.push(error.message);
      return report;
    }
  }
  report.remaining = true; // puede haber más mensajes; invocar Tasks de nuevo
  return report;
}
module.exports = { drain };
