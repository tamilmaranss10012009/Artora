'use strict';

/**
 * Phase A migrations (idempotent DDL).
 *
 * The OLD demo store uses a client-side 32-bit hash of the *password name*
 * in `js/auth.js hashPassword`. That is NOT imported here. Phase A users are
 * created via POST /api/auth/register with Argon2id hashes only.
 */

const { query } = require('../pool');

// users: identity + credential store
const createUsers = `
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key
  ON users (lower(trim(email)));
`;

// sessions: opaque, server-side session store. The cookie holds only the id.
const createSessions = `
CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx   ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);
`;

async function up() {
  // pgcrypto-backed gen_random_uuid() is required.
  await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
  await query(createUsers);
  await query(createSessions);
}

module.exports = { up };
