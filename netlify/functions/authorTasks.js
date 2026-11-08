'use strict';
const { tasksHandler } = require('../lib/handlers');
const { apply: insert } = require('./authorInsertBatch');
const { apply: update } = require('./authorUpdateBatch');
const { apply: remove } = require('./authorDeleteBatch');
exports.handler = tasksHandler('author', { INSERT: insert, UPDATE: update, DELETE: remove });
