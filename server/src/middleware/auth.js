'use strict';

const admin = require('../firebase-admin');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice(7);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      id: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email?.split('@')[0] || '',
      emailVerified: decoded.email_verified,
    };

    if (!decoded.email_verified) {
      return res.status(403).json({
        error: 'Please verify your email address to continue.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
