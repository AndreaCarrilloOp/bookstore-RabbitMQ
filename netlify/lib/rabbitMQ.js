'use strict';
const amqp = require('amqplib');
const { configOf } = require('./config');

async function connectRabbit() {
  if (!process.env.CLOUDAMQP_URL) throw new Error('Configure CLOUDAMQP_URL');
  return amqp.connect(process.env.CLOUDAMQP_URL, { timeout: 10000 });
}
async function enqueue(entity, request) {
  const cfg = configOf(entity);
  const connection = await connectRabbit();
  let channel;
  try {
    channel = await connection.createConfirmChannel();
    await channel.assertQueue(cfg.queue, { durable: true });
    channel.sendToQueue(cfg.queue, Buffer.from(JSON.stringify(request), 'utf8'), {
      persistent: true, contentType: 'application/json'
    });
    await channel.waitForConfirms();
  } finally {
    if (channel) await channel.close().catch(() => {});
    await connection.close().catch(() => {});
  }
  return cfg.queue;
}
module.exports = { connectRabbit, enqueue };
