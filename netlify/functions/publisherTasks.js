'use strict';
const { tasksHandler } = require('../lib/handlers');
const { apply: insert } = require('./publisherInsertBatch');
const { apply: update } = require('./publisherUpdateBatch');
const { apply: remove } = require('./publisherDeleteBatch');
exports.handler = tasksHandler('publisher', { INSERT: insert, UPDATE: update, DELETE: remove });
