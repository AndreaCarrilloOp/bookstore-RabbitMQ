'use strict';
const { batchHandler } = require('../lib/handlers');
const { applyBatch } = require('../lib/batch');
// La función bookTasks invoca esta operación luego de extraer un mensaje de RabbitMQ.
exports.apply = (request) => applyBatch('book', request);
// Se bloquea la llamada HTTP directa: preserva el flujo diferido.
exports.handler = batchHandler('book', 'DELETE');
