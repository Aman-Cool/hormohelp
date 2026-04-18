'use strict';

const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const ARGON2_OPTS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

// Pre-hashed dummy used in login to prevent user-enumeration via timing
let DUMMY_HASH;
argon2.hash('harmohelp-timing-guard', ARGON2_OPTS).then((h) => { DUMMY_HASH = h; });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again in 15 minutes.' },
});

// ─── helpers ────────────────────────────────────────────────────────────────

function issueAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// Compares two hex-encoded SHA-256 hashes in constant time
function safeCompareHex(a, b) {
  const aBuf = Buffer.from(a, 'hex');
  const bBuf = Buffer.from(b, 'hex');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function setRefreshCookie(res, token) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    // only send over HTTPS in production
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // scope the cookie to auth endpoints only
    path: '/auth',
  });
}

function clearRefreshCookie(res) {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth',
  });
}

async function storeRefreshToken(userId, rawToken) {
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt],
  );
}

// ─── POST /auth/signup ───────────────────────────────────────────────────────

router.post(
  '/signup',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    try {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'An account with that email already exists.' });
      }

      const passwordHash = await argon2.hash(password, ARGON2_OPTS);

      const { rows } = await db.query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
        [email, passwordHash, name],
      );
      const user = rows[0];

      const accessToken = issueAccessToken(user.id);
      const refreshToken = generateRefreshToken();
      await storeRefreshToken(user.id, refreshToken);

      setRefreshCookie(res, refreshToken);
      return res.status(201).json({
        accessToken,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (err) {
      console.error('signup error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// ─── POST /auth/login ────────────────────────────────────────────────────────

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = rows[0];

      // Always call argon2.verify — even for non-existent users — to prevent
      // timing-based user enumeration attacks
      const hashToCheck = user ? user.password_hash : DUMMY_HASH;
      const valid = await argon2.verify(hashToCheck, password, ARGON2_OPTS);

      if (!user || !valid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const accessToken = issueAccessToken(user.id);
      const refreshToken = generateRefreshToken();
      await storeRefreshToken(user.id, refreshToken);

      setRefreshCookie(res, refreshToken);
      return res.json({
        accessToken,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (err) {
      console.error('login error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// ─── POST /auth/refresh ──────────────────────────────────────────────────────

router.post('/refresh', async (req, res) => {
  const incomingRaw = req.cookies.refresh_token;
  if (!incomingRaw) return res.status(401).json({ error: 'No refresh token' });

  const incomingHash = hashToken(incomingRaw);

  try {
    const { rows } = await db.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()',
      [incomingHash],
    );

    if (rows.length === 0) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const stored = rows[0];

    // Timing-safe comparison of the hashes
    if (!safeCompareHex(stored.token_hash, incomingHash)) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Rotate: delete old token, issue new one
    await db.query('DELETE FROM refresh_tokens WHERE id = $1', [stored.id]);

    const newRaw = generateRefreshToken();
    await storeRefreshToken(stored.user_id, newRaw);

    const { rows: userRows } = await db.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [stored.user_id],
    );
    const user = userRows[0];

    const accessToken = issueAccessToken(user.id);
    setRefreshCookie(res, newRaw);

    return res.json({
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('refresh error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /auth/logout ───────────────────────────────────────────────────────

router.post('/logout', async (req, res) => {
  const raw = req.cookies.refresh_token;
  if (raw) {
    const tokenHash = hashToken(raw);
    try {
      await db.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
    } catch (_) {}
  }
  clearRefreshCookie(res);
  return res.json({ message: 'Logged out' });
});

// ─── GET /auth/me ────────────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, email, name, onboarding_data FROM users WHERE id = $1',
      [req.user.sub],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /auth/forgot-password ──────────────────────────────────────────────

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body;

    // Always respond identically to prevent email enumeration
    const OK = { message: 'If that email is registered, a reset link has been sent.' };

    try {
      const { rows } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (rows.length === 0) return res.json(OK);

      const userId = rows[0].id;
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // Invalidate any existing reset tokens before creating a new one
      await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
      await db.query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [userId, tokenHash, expiresAt],
      );

      const resetUrl = `${process.env.FRONTEND_ORIGIN}/reset-password?token=${rawToken}`;

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Reset your HarmoHelp password',
        text: `Reset your password here (expires in 1 hour):\n\n${resetUrl}`,
        html: `<p>Reset your password here (expires in 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });
    } catch (err) {
      console.error('forgot-password error:', err);
    }

    return res.json(OK);
  },
);

// ─── POST /auth/reset-password ───────────────────────────────────────────────

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { token, password } = req.body;
    const incomingHash = hashToken(token);

    try {
      const { rows } = await db.query(
        'SELECT * FROM password_reset_tokens WHERE token_hash = $1 AND expires_at > NOW() AND used = FALSE',
        [incomingHash],
      );

      if (rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired reset token.' });
      }

      const stored = rows[0];

      if (!safeCompareHex(stored.token_hash, incomingHash)) {
        return res.status(400).json({ error: 'Invalid reset token.' });
      }

      const passwordHash = await argon2.hash(password, ARGON2_OPTS);

      await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, stored.user_id]);
      await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [stored.id]);
      // Invalidate all sessions after password change
      await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [stored.user_id]);

      return res.json({ message: 'Password reset successfully.' });
    } catch (err) {
      console.error('reset-password error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

module.exports = router;
