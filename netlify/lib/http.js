'use strict';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type,x-tasks-token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json; charset=utf-8'
};
function reply(statusCode, payload) {
  return { statusCode, headers: CORS, body: JSON.stringify(payload) };
}
function preflight(event) {
  return event.httpMethod === 'OPTIONS' ? reply(200, { ok: true }) : null;
}
function badMethod(event, method) {
  return event.httpMethod !== method ? reply(405, { error: `Se requiere ${method}` }) : null;
}
class ClientInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ClientInputError';
  }
}
function parseBody(event) {
  if (!event.body) throw new ClientInputError('Falta el cuerpo JSON');
  if (Buffer.byteLength(event.body, 'utf8') > 32768)
    throw new ClientInputError('El cuerpo JSON supera el límite de 32 KiB');
  let obj;
  try { obj = JSON.parse(event.body); }
  catch { throw new ClientInputError('JSON inválido'); }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj))
    throw new ClientInputError('El cuerpo debe ser un objeto JSON');
  return obj;
}
function numericId(raw) {
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n <= 0) throw new Error('Se requiere un identificador entero positivo');
  return n;
}
function idFromEvent(event) {
  const parts = (event.path || '').split('/').filter(Boolean);
  return numericId(parts.at(-1));
}
function errorReply(error) {
  const expected = error instanceof ClientInputError ||
    /JSON|identificador|Falta|debe|Campo|No se permiten|vacío|arreglo|Operación/i.test(error.message);
  const code = expected ? 400 : 502;
  if (!expected) console.error('[backend]', error);
  return reply(code, { error: expected ? error.message : 'No fue posible procesar la solicitud' });
}
module.exports = { reply, preflight, badMethod, parseBody, numericId, idFromEvent, errorReply, ClientInputError };
