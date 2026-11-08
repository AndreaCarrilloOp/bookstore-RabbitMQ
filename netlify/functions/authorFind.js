'use strict';
const { readHandler } = require('../lib/handlers');
exports.handler = readHandler('author', true);
