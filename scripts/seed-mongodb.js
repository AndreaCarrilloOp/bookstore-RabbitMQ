'use strict';
require('dotenv').config();
const { MongoClient } = require('mongodb');

const authors = [
  { _id: 1, author: 'Abraham Silberschatz', nationality: 'Israelis / American', birth_year: 1952,
    fields: 'Database Systems, Operating Systems', books: [
      { book_id: 1, title: 'Operating System Concepts' },
      { book_id: 2, title: 'Database System Concepts' }] },
  { _id: 2, author: 'Andrew S. Tanenbaum', nationality: 'Dutch / American', birth_year: 1944,
    fields: 'Distributed computing, Operating Systems', books: [
      { book_id: 3, title: 'Computer Networks' },
      { book_id: 4, title: 'Modern Operating Systems' }] }
];
const publishers = [
  { _id: 1, publisher: 'John Wiley & Sons', country: 'United States', founded: 1807, genere: 'Academic',
    books: [{ book_id: 1, title: 'Operating System Concepts' }, { book_id: 2, title: 'Database System Concepts' }] },
  { _id: 2, publisher: 'Pearson Education', country: 'United Kingdom', founded: 1844, genere: 'Education',
    books: [{ book_id: 3, title: 'Computer Networks' }, { book_id: 4, title: 'Modern Operating Systems' }] }
];
const books = [
  { _id: 1, title: 'Operating System Concepts', edition: '9th', copyright: 2012, language: 'ENGLISH',
    pages: 976, author: 'Abraham Silberschatz', author_id: 1, publisher: 'John Wiley & Sons', publisher_id: 1 },
  { _id: 2, title: 'Database System Concepts', edition: '6th', copyright: 2010, language: 'ENGLISH',
    pages: 1376, author: 'Abraham Silberschatz', author_id: 1, publisher: 'John Wiley & Sons', publisher_id: 1 },
  { _id: 3, title: 'Computer Networks', edition: '5th', copyright: 2010, language: 'ENGLISH',
    pages: 960, author: 'Andrew S. Tanenbaum', author_id: 2, publisher: 'Pearson Education', publisher_id: 2 },
  { _id: 4, title: 'Modern Operating Systems', edition: '4th', copyright: 2014, language: 'ENGLISH',
    pages: 1136, author: 'Andrew S. Tanenbaum', author_id: 2, publisher: 'Pearson Education', publisher_id: 2 }
];
(async () => {
  if (!process.env.MONGODB_URI) throw new Error('Configurá MONGODB_URI en .env');
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'bookstore');
    for (const [collection, data] of [['authors', authors], ['publishers', publishers], ['books', books]]) {
      for (const row of data) {
        const { _id, ...fields } = row;
        await db.collection(collection).updateOne({ _id }, { $setOnInsert: { _id, ...fields } }, { upsert: true });
      }
      console.log(`${collection}: ${await db.collection(collection).countDocuments({})} documentos (carga no destructiva)`);
    }
  } finally { await client.close(); }
})().catch((err) => { console.error('Error al poblar MongoDB:', err.message); process.exitCode = 1; });
