'use strict';
const { configOf } = require('./config');
const { db } = require('./mongoDB');
const { numericId } = require('./http');
const { normalizeDocument } = require('./validation');

// Las funciones *Batch llaman aquí: la escritura ocurre SOLO cuando se procesa la cola.
async function applyBatch(entity, request) {
  const cfg = configOf(entity);
  const id = numericId(request.id);
  const collection = (await db()).collection(cfg.collection);
  switch (request.method) {
    case 'INSERT': {
      const data = normalizeDocument(entity, request.body);
      // Idempotente ante reentregas: un segundo consumo no duplica el registro.
      await collection.updateOne({ _id: id }, { $setOnInsert: { _id: id, ...data } }, { upsert: true });
      return;
    }
    case 'UPDATE': {
      const data = normalizeDocument(entity, request.body, { update: true });
      await collection.updateOne({ _id: id }, { $set: data });
      return;
    }
    case 'DELETE':
      await collection.deleteOne({ _id: id });
      return;
    default: throw new Error('Operación desconocida');
  }
}
module.exports = { applyBatch };
