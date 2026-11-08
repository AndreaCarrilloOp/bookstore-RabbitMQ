'use strict';
const { readHandler } = require('../lib/handlers');
exports.handler = readHandler('publisher', true);
