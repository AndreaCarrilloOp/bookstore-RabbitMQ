'use strict';
const { enqueueHandler } = require('../lib/handlers');
exports.handler = enqueueHandler('publisher', 'DELETE');
