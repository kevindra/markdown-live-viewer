#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// Get the main server file
const serverPath = path.join(__dirname, '..', 'server.js');

// Pass through all arguments to the server
require(serverPath);
