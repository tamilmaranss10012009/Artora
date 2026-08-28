'use strict';

const crypto = require('crypto');
const argon2 = require('argon2');

const { query } = require('../db/pool');
const { SESSION_MAX_AGE_MS } = require('../config/env');
const { normalizeEmail } = require('../utils/errors');

// ---------------------------------------------------------------------------
// Auth service: users (Argon2id) + server-side sessions.
// Passwords are NEVER stored in plaintext and the old 32-bit demo hash is
// NOT imported.
// ---------------------------------------------------------------------------

async function createUser({ email, name, password }) {
  const norm = normalizeEmail(email);
  // Race-safe: the DB unique constraint on lower(trim(email)) is the authority;
  // the explicit pre-check is only for a friendlier error timing.
  const existing = await query(
    `SELECT 1 FROM users WHERE lower(trim(email)) = lower(trim($1))`,
    [norm]
  );
  if (existing.rowCount) return null;

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const result = await query(
    `INSERT INTO users (email, name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at, updated_at`,
    [norm, name, passwordHash]
  );
  return result.rows[0];
}

async function verifyCredentials(email, password) {
  const norm = normalizeEmail(email);
  const result = await query(
    `SELECT id, email, name, password_hash
       FROM users
      WHERE lower(trim(email)) = lower(trim($1))`,
    [norm]
  );
  if (!result.rowCount) return null;
  const user = result.rows[0];
  // argon2.verify is constant-time within argon2; returns false on mismatch.
  if (!(await argon2.verify(user.password_hash, password))) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

// ---- Server-side sessions ---------------------------------------------------

async function createSession(userId) {
  // Server-generated, cryptographically unpredictable session id.
  const sid = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
  await query(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`,
    [sid, userId, expiresAt]
  );
  return sid;
}

async function findSession(sid) {
  if (!sid) return null;
  const result = await query(
    `SELECT s.id, s.user_id, s.expires_at, s.created_at,
            u.id AS user_id, u.email, u.name
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = $1`,
    [sid]
  );
  if (!result.rowCount) return null;
  const session = result.rows[0];
  if (new Date(session.expires_at) <= new Date()) return null;
  return {
    id: session.id,
    user: { id: session.user_id, email: session.email, name: session.name },
  };
}

async function deleteSession(sid) {
  if (!sid) return;
  await query(`DELETE FROM sessions WHERE id = $1`, [sid]);
}

// Lazy cleanup of expired sessions encountered on lookup.
async function purgeExpiredSessions() {
  await query(`DELETE FROM sessions WHERE expires_at < now()`);
}

module.exports = {
  createUser,
  verifyCredentials,
  createSession,
  findSession,
  deleteSession,
  purgeExpiredSessions,
};
