'use strict';

// Nombres y atributos compatibles con los ejemplos del profesor (Tutoriales 7-9).
const ENTITIES = Object.freeze({
  book: {
    collection: 'books', queue: 'bookstore', label: 'libro',
    fields: { title: 'string', edition: 'string', copyright: 'number', language: 'string',
      pages: 'number', author: 'string', author_id: 'number', publisher: 'string', publisher_id: 'number' },
    required: 'title'
  },
  author: {
    collection: 'authors', queue: 'authors', label: 'autor',
    fields: { author: 'string', nationality: 'string', birth_year: 'number', fields: 'string', books: 'array' },
    required: 'author'
  },
  publisher: {
    collection: 'publishers', queue: 'publishers', label: 'editorial',
    // "genere" se conserva porque así aparece el campo en el Tutorial 7.
    fields: { publisher: 'string', country: 'string', founded: 'number', genere: 'string', books: 'array' },
    required: 'publisher'
  }
});

function configOf(entity) {
  if (!Object.hasOwn(ENTITIES, entity)) throw new Error(`Entidad desconocida: ${entity}`);
  return ENTITIES[entity];
}
module.exports = { ENTITIES, configOf };
