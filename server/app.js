'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const { connectDb } = require('./db/pool');
const { up: runMigrations } = require('./db/migrations/001_initial');
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');

const app = express();

// JSON bodies + cookie parsing. The session identifier travels ONLY in an
// HttpOnly cookie; authentication is never derived from body/query params.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// --- Static frontend (EXISTING localStorage demo, preserved). ---
const staticRoot = path.resolve(__dirname, '..');
app.use(express.static(staticRoot));

// --- API (Phase A: auth + health). ---
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

// Minimal authenticated probe: derives identity from the session cookie only.
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ---- Error handling (never leak internals in production) ----
app.use((err, _req, res, _next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const env = process.env.NODE_ENV || 'development';
  const response = { error: err.message || 'Internal Server Error' };
  if (env === 'development' && status === 500) {
    response.stack = err.stack; // dev-only detail; suppressed in production
  }
  res.status(status).json(response);
});

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL;

async function start() {
  if (!DB_URL) {
    console.error('[server] DATABASE_URL is not set in the environment.');
    console.error('[server] Copy .env.example -> .env and provide a PostgreSQL connection for Artora.');
    process.exit(1);
  }

  const pool = connectDb();
  await pool.connect(); // fail fast if the database is unreachable
  await runMigrations(); // CREATE TABLE IF NOT EXISTS for users + sessions

  app.listen(PORT, () => {
    console.log(`[server] Artora API listening on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});

module.exports = app;

