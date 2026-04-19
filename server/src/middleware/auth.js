'use strict';

const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // JWT stores user id in the standard `sub` claim; expose it as `id` for convenience
    req.user = { ...payload, id: payload.sub };

    if (!payload.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your email address to continue.',
        code:  'EMAIL_NOT_VERIFIED',
      });
    }

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
