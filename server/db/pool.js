'use strict';

const { Client } = require('pg');
const { DATABASE_URL } = require('../config/env');

let pool;

function connectDb() {
  if (!pool) {
    pool = new Client({ connectionString: DATABASE_URL });
  }
  return pool;
}

// Query helper. Callers MUST pass bound parameters ($1, $2, ...). Never
// interpolate user input into the SQL string.
async function query(text, params) {
  if (!pool) {
    throw new Error('Database connection is not initialized. Call connectDb() first.');
  }
  const result = await pool.query(text, params);
  return result;
}

function getPool() {
  return pool;
}

module.exports = {
  connectDb,
  query,
  getPool,
};
