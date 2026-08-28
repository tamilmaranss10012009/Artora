'use strict';

const router = require('express').Router();

const {
  createUser,
  verifyCredentials,
  createSession,
  deleteSession,
} = require('../services/auth-service');
const {
  ApiError,
  isValidEmail,
  isValidName,
  isValidPassword,
} = require('../utils/errors');
const {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  SESSION_COOKIE_HTTPONLY,
  SESSION_COOKIE_SAMESITE,
  SESSION_COOKIE_SECURE,
} = require('../config/env');

const PUBLIC_USER_FIELDS = ['id', 'email', 'name'];
function toPublicUser(u) {
  if (!u) return u;
  const out = {};
  for (const k of PUBLIC_USER_FIELDS) out[k] = u[k];
  return out;
}

function setSessionCookie(res, sid) {
  res.cookie(SESSION_COOKIE_NAME, sid, {
    httpOnly: SESSION_COOKIE_HTTPONLY,      // not reachable by JS (mitigates XSS theft)
    secure: SESSION_COOKIE_SECURE,          // Secure only in production (HTTPS)
    sameSite: SESSION_COOKIE_SAMESITE,      // 'lax'
    maxAge: SESSION_MAX_AGE_MS,
    path: '/',
  });
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: SESSION_COOKIE_HTTPONLY,
    secure: SESSION_COOKIE_SECURE,
    sameSite: SESSION_COOKIE_SAMESITE,
    path: '/',
  });
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const email = (req.body && req.body.email) || '';
    const name = (req.body && req.body.name) || '';
    const password = (req.body && req.body.password) || '';

    if (!email || !isValidEmail(email)) {
      throw new ApiError(400, 'A valid email is required.');
    }
    if (!isValidName(name)) {
      throw new ApiError(400, 'Name must be between 2 and 80 characters.');
    }
    if (!isValidPassword(password)) {
      throw new ApiError(400, 'Password must be at least 6 characters.');
    }

    // createUser returns null on duplicate (DB unique constraint is final).
    const created = await createUser({ email, name, password });
    if (!created) {
      throw new ApiError(409, 'An account with that email already exists.');
    }

    // Registration does NOT auto-create a session. Login is required.
    res.status(201).json({ user: toPublicUser(created) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const email = (req.body && req.body.email) || '';
    const password = (req.body && req.body.password) || '';

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    const user = await verifyCredentials(email, password);
    // Same error for unknown-account and wrong-password (no enumeration).
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    // Session-fixation protection: a new, server-generated session id is
    // minted on every successful login (never reuse a client-supplied id).
    const sid = await createSession(user.id);
    setSessionCookie(res, sid);

    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const sid = req.cookies ? req.cookies[SESSION_COOKIE_NAME] : null;
    // Invalidate the SERVER session (not just a client-side flag).
    await deleteSession(sid);
    clearSessionCookie(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

'use strict';

const router = require('express').Router();

const {
  createUser,
  verifyCredentials,
  createSession,
  deleteSession,
} = require('../services/auth-service');
const {
  ApiError,
  isValidEmail,
  isValidName,
  isValidPassword,
} = require('../utils/errors');
const {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  SESSION_COOKIE_HTTPONLY,
  SESSION_COOKIE_SAMESITE,
  SESSION_COOKIE_SECURE,
} = require('../config/env');

const PUBLIC_USER_FIELDS = ['id', 'email', 'name'];
function toPublicUser(u) {
  if (!u) return u;
  const out = {};
  for (const k of PUBLIC_USER_FIELDS) out[k] = u[k];
  return out;
}

function setSessionCookie(res, sid) {
  res.cookie(SESSION_COOKIE_NAME, sid, {
    httpOnly: SESSION_COOKIE_HTTPONLY,      // not reachable by JS (mitigates XSS theft)
    secure: SESSION_COOKIE_SECURE,          // only over HTTPS in production
    sameSite: SESSION_COOKIE_SAMESITE,      // 'lax'
    maxAge: SESSION_MAX_AGE_MS,
    path: '/',
  });
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: SESSION_COOKIE_HTTPONLY,
    secure: SESSION_COOKIE_SECURE,
    sameSite: SESSION_COOKIE_SAMESITE,
    path: '/',
  });
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const email = (req.body && req.body.email) || '';
    const name = (req.body && req.body.name) || '';
    const password = (req.body && req.body.password) || '';

    if (!email || !isValidEmail(email)) {
      throw new ApiError(400, 'A valid email is required.');
    }
    if (!isValidName(name)) {
      throw new ApiError(400, 'A name between 2 and 80 characters is required.');
    }
    if (!isValidPassword(password)) {
      throw new ApiError(400, 'Password must be at least 6 characters.');
    }

    const created = await createUser({ email, name, password });
    if (!created) {
      // Unique constraint violation on normalized email.
      throw new ApiError(409, 'An account with that email already exists.');
    }
    res.status(201).json({ user: toPublicUser(created) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const email = (req.body && req.body.email) || '';
    const password = (req.body && req.body.password) || '';

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    // Constant message for both unknown-account and wrong-password cases
    // (avoid account enumeration).
    const user = await verifyCredentials(email, password);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    // Session-fixation protection: ALWAYS mint a fresh server-side session
    // on login (never reuse a client-supplied id).
    const sid = await createSession(user.id);
    setSessionCookie(res, sid);

    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const sid = req.cookies ? req.cookies[SESSION_COOKIE_NAME] : null;
    // Invalidate the SERVER session (not just clearing a client flag).
    await deleteSession(sid);
    clearSessionCookie(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
