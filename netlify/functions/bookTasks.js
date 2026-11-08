'use strict';
const { tasksHandler } = require('../lib/handlers');
const { apply: insert } = require('./bookInsertBatch');
const { apply: update } = require('./bookUpdateBatch');
const { apply: remove } = require('./bookDeleteBatch');
exports.handler = tasksHandler('book', { INSERT: insert, UPDATE: update, DELETE: remove });
