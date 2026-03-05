#!/usr/bin/env node

const { LinearClient } = require('@linear/sdk');

const client = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});

// List all methods
const allMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(client))
  .filter(m => typeof client[m] === 'function')
  .filter(m => !m.startsWith('_'))
  .sort();

console.log('Available SDK methods:');
allMethods.forEach(m => console.log(' -', m));
