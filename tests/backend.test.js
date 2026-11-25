'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { configOf } = require('../netlify/lib/config');
const { normalizeDocument, validateRequest } = require('../netlify/lib/validation');
const { drain } = require('../netlify/lib/consumer');
const { numericId } = require('../netlify/lib/http');

test('columna y cola correctas por entidad (patrón de Tutorial 9)', () => {
  assert.deepEqual(['bookstore', 'authors', 'publishers'],
    ['book', 'author', 'publisher'].map((entity) => configOf(entity).queue));
});
test('validación de datos y compatibilidad con campos del Tutorial 7', () => {
  assert.deepEqual(normalizeDocument('author', { author: '  Ada ', nationality: 'British', birth_year: '1815' }),
    { author: 'Ada', nationality: 'British', birth_year: 1815 });
  assert.deepEqual(normalizeDocument('publisher', { publisher: 'Pearson', genere: 'Education' }),
    { publisher: 'Pearson', genere: 'Education' });
  assert.throws(() => normalizeDocument('book', { edition: '3rd' }), /title/);
  assert.throws(() => numericId('abc'), /identificador/);
  assert.throws(() => validateRequest('book', { method: 'PATCH', id: 2 }), /Operación/);
});
test('bookTasks simulado: procesa INSERT UPDATE DELETE y confirma mensajes', async () => {
  const raw = [
    { method: 'INSERT', id: 55, body: { title: 'Demo' } },
    { method: 'UPDATE', id: 55, body: { edition: '2nd' } },
    { method: 'DELETE', id: 55 }
  ];
  const calls = []; const acked = []; const nacked = [];
  const channel = {
    async get(queue, opts) { assert.equal(queue, 'bookstore'); assert.equal(opts.noAck, false);
      const obj = raw.shift(); return obj ? { content: Buffer.from(JSON.stringify(obj)) } : false; },
    ack(message) { acked.push(message); },
    nack(message) { nacked.push(message); }
  };
  const handlers = Object.fromEntries(['INSERT','UPDATE','DELETE'].map((m) => [m, async (r) => calls.push(r.method)]));
  const result = await drain({ entity: 'book', queue: 'bookstore', channel, handlers });
  assert.equal(result.processed, 3); assert.equal(result.errors.length, 0);
  assert.deepEqual(calls, ['INSERT','UPDATE','DELETE']);
  assert.equal(acked.length, 3); assert.equal(nacked.length, 0);
});
test('fallo en batch: mensaje se reencola sin ACK', async () => {
  let requested = 0; let acked = 0; let requeued = 0;
  const msg = { content: Buffer.from(JSON.stringify({ method: 'INSERT', id: 5, body: { publisher: 'Ejemplo' } })) };
  const channel = {
    async get() { requested++; return msg; },
    ack() { acked++; },
    nack(_, all, requeue) { assert.equal(all, false); assert.equal(requeue, true); requeued++; }
  };
  const result = await drain({ entity: 'publisher', queue: 'publishers', channel, handlers: {
    INSERT: async () => { throw new Error('MongoDB no disponible'); }
  } });
  assert.equal(requested, 1); assert.equal(acked, 0); assert.equal(requeued, 1);
  assert.match(result.errors[0], /MongoDB/);
});

test('solicitudes JSON inválidas devuelven 400, no 502', () => {
  const { parseBody, errorReply } = require('../netlify/lib/http');
  for (const body of ['{', '[]', '"cadena"', ' '.repeat(32769)]) {
    try { parseBody({ body }); assert.fail('Debe rechazar cuerpo inválido'); }
    catch (error) {
      assert.equal(errorReply(error).statusCode, 400);
    }
  }
});
test('procesadores Tasks requieren token y rechazan accesos no autorizados', async () => {
  const { tasksHandler } = require('../netlify/lib/handlers');
  const original = process.env.TASKS_TOKEN;
  const handler = tasksHandler('book', {});
  const event = { httpMethod: 'GET', headers: {} };
  try {
    delete process.env.TASKS_TOKEN;
    assert.equal((await handler(event)).statusCode, 503);
    process.env.TASKS_TOKEN = 'solo-pruebas';
    assert.equal((await handler(event)).statusCode, 401);
    assert.equal((await handler({ ...event, headers: { 'X-Tasks-Token': 'incorrecto' } })).statusCode, 401);
  } finally {
    if (original === undefined) delete process.env.TASKS_TOKEN;
    else process.env.TASKS_TOKEN = original;
  }
});
test('arreglos excesivos son rechazados', () => {
  assert.throws(
    () => normalizeDocument('author', { author: 'Ada', books: Array(101).fill({ id: 1 }) }),
    /máximo 100/
  );
});
