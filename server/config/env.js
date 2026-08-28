'use strict';

// Load .env (NOT committed; see .env.example).
// All secrets must come from the environment in real deployments.
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = (process.env.NODE_ENV || 'development').toLowerCase();
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'artora_sid';
const SESSION_MAX_AGE_MS = parseInt(process.env.SESSION_MAX_AGE_MS || String(24 * 60 * 60 * 1000), 10); // 24h
const SESSION_COOKIE_HTTPONLY = true;
const SESSION_COOKIE_SAMESITE = 'lax';
const SESSION_COOKIE_SECURE = NODE_ENV === 'production'; // Secure only over HTTPS

const isProduction = NODE_ENV === 'production';

module.exports = {
  DATABASE_URL,
  NODE_ENV,
  isProduction,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  SESSION_COOKIE_HTTPONLY,
  SESSION_COOKIE_SAMESITE,
  SESSION_COOKIE_SECURE,
};
