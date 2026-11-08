'use strict';
const { randomInt } = require('node:crypto');
const { configOf } = require('./config');
const { reply, preflight, badMethod, parseBody, idFromEvent, errorReply } = require('./http');
const { normalizeDocument } = require('./validation');
const { db } = require('./mongoDB');
const { enqueue, connectRabbit } = require('./rabbitMQ');
const { drain } = require('./consumer');

function readHandler(entity, one = false) {
  return async (event) => {
    if (preflight(event)) return preflight(event);
    if (badMethod(event, 'GET')) return badMethod(event, 'GET');
    try {
      const collection = (await db()).collection(configOf(entity).collection);
      const rows = one
        ? await collection.find({ _id: idFromEvent(event) }).toArray()
        : await collection.find({}).sort({ _id: 1 }).toArray();
      // Formato array igual al del tutorial, incluso para Find.
      return reply(200, rows);
    } catch (error) { return errorReply(error); }
  };
}
function enqueueHandler(entity, method) {
  const verb = { INSERT: 'POST', UPDATE: 'PUT', DELETE: 'DELETE' }[method];
  return async (event) => {
    if (preflight(event)) return preflight(event);
    if (badMethod(event, verb)) return badMethod(event, verb);
    try {
      const id = method === 'INSERT'
        ? Date.now() * 1000 + randomInt(0, 1000)
        : idFromEvent(event);
      const request = { method, id };
      if (method !== 'DELETE')
        request.body = normalizeDocument(entity, parseBody(event), { update: method === 'UPDATE' });
      const queue = await enqueue(entity, request);
      return reply(202, { queued: true, queue, operation: method, id, message: 'Solicitud encolada; aún no aplicada en MongoDB' });
    } catch (error) { return errorReply(error); }
  };
}
function batchHandler(entity, method) {
  // Un endpoint batch nunca debe permitir omitir RabbitMQ. Solo Tasks lo usa internamente.
  return async (event) => {
    if (preflight(event)) return preflight(event);
    return reply(403, { error: 'Endpoint de lote solo para uso interno de *Tasks' });
  };
}
function tasksHandler(entity, batchHandlers) {
  const queue = configOf(entity).queue;
  return async (event) => {
    if (preflight(event)) return preflight(event);
    if (badMethod(event, 'GET')) return badMethod(event, 'GET');
    const token = process.env.TASKS_TOKEN;
    if (token && (event.headers?.['x-tasks-token'] || event.headers?.['X-Tasks-Token']) !== token)
      return reply(401, { error: 'Enviar la cabecera x-tasks-token correcta' });
    let connection;
    let channel;
    try {
      connection = await connectRabbit();
      channel = await connection.createChannel();
      await channel.assertQueue(queue, { durable: true });
      const limit = Math.max(1, Math.min(50, Number(process.env.TASKS_BATCH_SIZE) || 20));
      const report = await drain({ entity, queue, channel, limit,
        handlers: batchHandlers
      });
      return reply(report.errors.length ? 502 : 200, report);
    } catch (error) { return errorReply(error); }
    finally {
      if (channel) await channel.close().catch(() => {});
      if (connection) await connection.close().catch(() => {});
    }
  };
}
module.exports = { readHandler, enqueueHandler, batchHandler, tasksHandler };
