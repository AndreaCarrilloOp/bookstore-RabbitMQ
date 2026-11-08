'use strict';
const { configOf } = require('./config');
const { numericId } = require('./http');

function normalizeDocument(entity, source, { update = false } = {}) {
  const cfg = configOf(entity);
  if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error('Debe enviarse un objeto JSON');
  const doc = {};
  for (const [field, type] of Object.entries(cfg.fields)) {
    if (!(field in source)) continue;
    const value = source[field];
    if (type === 'string') {
      if (typeof value !== 'string' || value.length > 2000) throw new Error(`Campo ${field}: se requiere texto`);
      doc[field] = value.trim();
    } else if (type === 'number') {
      if (value === '' || value === null || !Number.isFinite(Number(value)))
        throw new Error(`Campo ${field}: se requiere un número`);
      doc[field] = Number(value);
    } else if (type === 'array') {
      if (!Array.isArray(value)) throw new Error(`Campo ${field}: se requiere un arreglo`);
      doc[field] = value;
    }
  }
  if (!update && (!doc[cfg.required] || !String(doc[cfg.required]).trim()))
    throw new Error(`Campo obligatorio: ${cfg.required}`);
  if (update && Object.keys(doc).length === 0)
    throw new Error('No se permiten actualizaciones vacías');
  return doc;
}
function validateRequest(entity, request) {
  if (!request || typeof request !== 'object') throw new Error('Mensaje JSON inválido');
  if (!['INSERT', 'UPDATE', 'DELETE'].includes(request.method)) throw new Error('Operación desconocida');
  numericId(request.id);
  if (request.method !== 'DELETE') normalizeDocument(entity, request.body, { update: request.method === 'UPDATE' });
  return request;
}
module.exports = { normalizeDocument, validateRequest };
