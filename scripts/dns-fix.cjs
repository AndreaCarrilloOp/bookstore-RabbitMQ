'use strict';
// Solución local opcional para fallas de resolución SRV en Node.js/Windows.
require('node:dns').setServers(['1.1.1.1', '8.8.8.8']);
