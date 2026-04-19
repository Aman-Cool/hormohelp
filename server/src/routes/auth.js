'use strict';

const express      = require('express');
const argon2       = require('argon2');
const jwt          = require('jsonwebtoken');
const crypto       = require('crypto');
const nodemailer   = require('nodemailer');
const { body, validationResult } = require('express-validator');
const rateLimit    = require('express-rate-limit');
const db           = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const ARGON2_OPTS = {
  type:        argon2.argon2id,
  memoryCost:  19456,
  timeCost:    2,
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

// 3 resends per hour, keyed by SHA-256 of the email so no PII touches the limiter store
const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) =>
    crypto.createHash('sha256').update((req.body?.email || '').toLowerCase()).digest('hex'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many resend attempts. Please wait an hour before trying again.' },
});

// ─── helpers ────────────────────────────────────────────────────────────────

function issueAccessToken(userId, emailVerified) {
  return jwt.sign({ sub: userId, emailVerified: !!emailVerified }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function safeCompareHex(a, b) {
  const aBuf = Buffer.from(a, 'hex');
  const bBuf = Buffer.from(b, 'hex');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function setRefreshCookie(res, token) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
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

function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function verificationEmailHtml(name, verifyUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFFBEF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBEF;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;border:1px solid #E8D88A;overflow:hidden;max-width:560px;width:100%;">

        <!-- header -->
        <tr>
          <td style="background:#1a1a2e;padding:28px 40px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a1a2e;border-radius:50px;padding:8px 18px;">
                  <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.3px;">&#9829; HarmoHelp</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:26px;font-weight:900;color:#1a1a2e;line-height:1.2;">Verify your email address</p>
            <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
              Hi ${name}, thanks for joining HarmoHelp! Click the button below to confirm your email address and activate your account.
            </p>

            <!-- CTA button -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#1a1a2e;border-radius:12px;">
                  <a href="${verifyUrl}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.1px;">
                    Verify Email Address
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">
              This link expires in <strong style="color:#1a1a2e;">24 hours</strong>. If you did not create a HarmoHelp account, you can safely ignore this email.
            </p>

            <hr style="border:none;border-top:1px solid #f3f4f6;margin:28px 0;">

            <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">Or copy and paste this URL into your browser:</p>
            <p style="margin:0;font-size:12px;color:#1a1a2e;word-break:break-all;">${verifyUrl}</p>
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              &copy; ${new Date().getFullYear()} HarmoHelp &mdash; Empowering hormonal wellness.<br>
              This is a transactional email. You are receiving this because you created an account.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendVerificationEmail(email, name, rawToken) {
  const verifyUrl = `${process.env.FRONTEND_ORIGIN}/verify-email?token=${rawToken}`;
  const transporter = getTransporter();
  await transporter.sendMail({
    from:    process.env.SMTP_FROM,
    to:      email,
    subject: 'Verify your HarmoHelp email address',
    text:    `Hi ${name},\n\nVerify your email here (expires in 24 hours):\n${verifyUrl}\n\nIf you did not sign up, ignore this email.`,
    html:    verificationEmailHtml(name, verifyUrl),
  });
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

      // Generate verification token before insert
      const rawToken    = crypto.randomBytes(32).toString('hex');
      const tokenHash   = hashToken(rawToken);
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const { rows } = await db.query(
        `INSERT INTO users (email, password_hash, name, email_verified, verification_token_hash, verification_token_expires_at)
         VALUES ($1, $2, $3, FALSE, $4, $5)
         RETURNING id, email, name`,
        [email, passwordHash, name, tokenHash, tokenExpiry],
      );
      const user = rows[0];

      // Send verification email — non-blocking so a mail failure doesn't break signup
      sendVerificationEmail(email, name, rawToken).catch((err) =>
        console.error('verification email error:', err),
      );

      return res.status(201).json({ requiresVerification: true, email: user.email });
    } catch (err) {
      console.error('signup error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// ─── POST /auth/verify-email ─────────────────────────────────────────────────

router.post(
  '/verify-email',
  body('token').notEmpty().withMessage('Token is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { token } = req.body;
    const incomingHash = hashToken(token);

    try {
      const { rows } = await db.query(
        `SELECT id, email, name, verification_token_hash, verification_token_expires_at
         FROM users
         WHERE verification_token_hash = $1 AND email_verified = FALSE`,
        [incomingHash],
      );

      if (rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or already-used verification link.' });
      }

      const user = rows[0];

      if (new Date(user.verification_token_expires_at) < new Date()) {
        return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
      }

      if (!safeCompareHex(user.verification_token_hash, incomingHash)) {
        return res.status(400).json({ error: 'Invalid verification token.' });
      }

      // Mark verified and clear token fields
      await db.query(
        `UPDATE users
         SET email_verified = TRUE, verification_token_hash = NULL, verification_token_expires_at = NULL
         WHERE id = $1`,
        [user.id],
      );

      // Issue full session
      const accessToken    = issueAccessToken(user.id, true);
      const refreshToken   = generateRefreshToken();
      await storeRefreshToken(user.id, refreshToken);

      setRefreshCookie(res, refreshToken);
      return res.json({
        accessToken,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (err) {
      console.error('verify-email error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// ─── POST /auth/resend-verification ─────────────────────────────────────────

router.post(
  '/resend-verification',
  resendLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Always respond identically to prevent email enumeration
    const OK = { message: 'If that email is pending verification, a new link has been sent.' };

    try {
      const { rows } = await db.query(
        'SELECT id, email, name FROM users WHERE email = $1 AND email_verified = FALSE',
        [req.body.email],
      );

      if (rows.length === 0) return res.json(OK);

      const user = rows[0];

      const rawToken    = crypto.randomBytes(32).toString('hex');
      const tokenHash   = hashToken(rawToken);
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.query(
        `UPDATE users
         SET verification_token_hash = $1, verification_token_expires_at = $2
         WHERE id = $3`,
        [tokenHash, tokenExpiry, user.id],
      );

      sendVerificationEmail(user.email, user.name, rawToken).catch((err) =>
        console.error('resend verification email error:', err),
      );
    } catch (err) {
      console.error('resend-verification error:', err);
    }

    return res.json(OK);
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

      const hashToCheck = user ? user.password_hash : DUMMY_HASH;
      const valid       = await argon2.verify(hashToCheck, password, ARGON2_OPTS);

      if (!user || !valid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (!user.email_verified) {
        return res.status(403).json({
          error: 'Please verify your email address before signing in.',
          code:  'EMAIL_NOT_VERIFIED',
          email: user.email,
        });
      }

      const accessToken  = issueAccessToken(user.id, true);
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

    if (!safeCompareHex(stored.token_hash, incomingHash)) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    await db.query('DELETE FROM refresh_tokens WHERE id = $1', [stored.id]);

    const newRaw = generateRefreshToken();
    await storeRefreshToken(stored.user_id, newRaw);

    const { rows: userRows } = await db.query(
      'SELECT id, email, name, email_verified FROM users WHERE id = $1',
      [stored.user_id],
    );
    const user = userRows[0];

    const accessToken = issueAccessToken(user.id, user.email_verified);
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
    const OK = { message: 'If that email is registered, a reset link has been sent.' };

    try {
      const { rows } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (rows.length === 0) return res.json(OK);

      const userId   = rows[0].id;
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
      await db.query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [userId, tokenHash, expiresAt],
      );

      const resetUrl = `${process.env.FRONTEND_ORIGIN}/reset-password?token=${rawToken}`;
      const transporter = getTransporter();
      await transporter.sendMail({
        from:    process.env.SMTP_FROM,
        to:      email,
        subject: 'Reset your HarmoHelp password',
        text:    `Reset your password here (expires in 1 hour):\n\n${resetUrl}`,
        html:    `<p>Reset your password here (expires in 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
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
      await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [stored.user_id]);

      return res.json({ message: 'Password reset successfully.' });
    } catch (err) {
      console.error('reset-password error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

module.exports = router;
