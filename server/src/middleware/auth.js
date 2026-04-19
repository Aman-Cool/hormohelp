'use strict';

const jwt = require('jsonwebtoken');
const fs  = require('fs');
const path = require('path');

// Load the RSA public key exported by the Go auth-service.
// The key path is configurable so it can be mounted as a volume in Docker.
const keyPath = process.env.AUTH_PUBLIC_KEY_PATH
  ? path.resolve(process.env.AUTH_PUBLIC_KEY_PATH)
  : path.resolve(__dirname, '../../auth_public.pem');

let publicKey;
try {
  publicKey = fs.readFileSync(keyPath, 'utf8');
} catch (err) {
  console.error(`[auth] Could not load RSA public key from ${keyPath}: ${err.message}`);
  console.error('[auth] Generate keys with: openssl genrsa -out auth_private.pem 2048 && openssl rsa -in auth_private.pem -pubout -out auth_public.pem');
  process.exit(1);
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice(7);
  try {
    // The Go auth-service signs with RS256 — must specify algorithm explicitly.
    const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
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
