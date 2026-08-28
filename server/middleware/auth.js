'use strict';

const { SESSION_COOKIE_NAME } = require('../config/env');
const { findSession } = require('../services/auth-service');
const { ApiError } = require('../utils/errors');

// requireAuth: identity comes ONLY from the server session referenced by the
// HttpOnly cookie. The browser is free to send anything in req.body /
// req.query — it is never trusted as an identity authority.
async function requireAuth(req, _res, next) {
  try {
    const sid = req.cookies ? req.cookies[SESSION_COOKIE_NAME] : null;
    const session = await findSession(sid);
    if (!session) {
      return next(new ApiError(401, 'Not authenticated'));
    }
    req.user = session.user; // { id, email, name }
    req.sessionId = session.id;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };
