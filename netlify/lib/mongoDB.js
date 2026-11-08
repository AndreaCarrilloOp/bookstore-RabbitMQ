'use strict';
const { MongoClient } = require('mongodb');
let connection;
async function db() {
  if (!process.env.MONGODB_URI) throw new Error('Configure MONGODB_URI');
  if (!connection) {
    connection = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 9000 })
      .connect().catch((error) => { connection = undefined; throw error; });
  }
  return (await connection).db(process.env.MONGODB_DB || 'bookstore');
}
module.exports = { db };
