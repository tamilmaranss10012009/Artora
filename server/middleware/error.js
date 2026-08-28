'use strict';

// Centralized error handler. Production responses must NOT leak internals:
// stack traces, SQL, file paths, DB connection info, password hashes, etc.
// Stack traces are gated to NODE_ENV !== 'production' in app.js; this handler
// enforces that any unhandled error becomes a safe, generic 500.
function errorHandler(err, _req, res, _next) {
  if (res.headersSent) {
    return; // let Express handle already-started responses
  }

  // ApiError: controlled, safe status + message.
  if (err && err.isApiError) {
    return res.status(err.status || 500).json({ error: err.message || 'Error' });
  }

  // Anything else -> generic 500 (never echo the underlying error to clients).
  const status = (err && err.status) || 500;
  const env = (process.env.NODE_ENV || 'development').toLowerCase();
  const body = { error: status === 500 ? 'Internal Server Error' : (err && err.message) || 'Error' };
  if (env !== 'production' && status === 500 && err && err.stack) {
    body.stack = err.stack; // dev-only debugging; suppressed in production
  }
  res.status(status).json(body);
}

module.exports = { errorHandler };
