'use strict';

// Centralized error type. Production responses must NOT leak:
//   - stack traces
//   - SQL statements
//   - database credentials
//   - file paths
//   - internal implementation details
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.isApiError = true;
  }
}

// ---- Shared, minimal validation helpers (NOT a sanitizer library) ------------

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

function isValidName(name) {
  const n = (name || '').trim();
  return n.length >= 2 && n.length <= 80;
}

function isValidPassword(password) {
  // Matches the existing client signup minimum (>=6). Not a strength policy.
  return (password || '').length >= 6 && (password || '').length <= 1024;
}

module.exports = {
  ApiError,
  normalizeEmail,
  isValidEmail,
  isValidName,
  isValidPassword,
};

'use strict';

// Centralized error type. Keeps sensitive internals out of responses:
// production returns only the safe message + status; stack traces are
// gated to development in app.js.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.isApiError = true;
  }
}

// ---- Shared, minimal validation helpers (NOT a sanitizer library) ------------

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

function isValidName(name) {
  const n = (name || '').trim();
  return n.length >= 2 && n.length <= 80;
}

function isValidPassword(password) {
  // Matches the existing client signup minimum (>=6). Not a strength policy.
  return (password || '').length >= 6 && (password || '').length <= 1024;
}

module.exports = {
  ApiError,
  normalizeEmail,
  isValidEmail,
  isValidName,
  isValidPassword,
};
