'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /users/sync — upserts a Firebase user into Postgres on first verified sign-in
router.post('/sync', requireAuth, async (req, res) => {
  const { name, email } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO users (id, email, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
       RETURNING id, email, name, bio, avatar_url, onboarding_data`,
      [req.user.id, email || req.user.email, name || req.user.name],
    );
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error('post /users/sync error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/me — fetch current user's full profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, email, name, bio, avatar_url, onboarding_data, created_at FROM users WHERE id = $1',
      [req.user.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error('get /users/me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /users/profile — update name, bio, avatar_url
router.patch(
  '/profile',
  requireAuth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('bio').optional().trim(),
    body('avatar_url').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, bio, avatar_url } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name); }
    if (bio !== undefined) { updates.push(`bio = $${idx++}`); values.push(bio); }
    if (avatar_url !== undefined) { updates.push(`avatar_url = $${idx++}`); values.push(avatar_url); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    values.push(req.user.id);

    try {
      const { rows } = await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
         RETURNING id, email, name, bio, avatar_url, onboarding_data`,
        values,
      );
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.json({ user: rows[0] });
    } catch (err) {
      console.error('patch /users/profile error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// PATCH /users/me — saves onboarding data
router.patch(
  '/me',
  requireAuth,
  [body('onboarding_data').isObject().withMessage('onboarding_data must be an object')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { onboarding_data } = req.body;

    try {
      const { rows } = await db.query(
        `UPDATE users
         SET onboarding_data = onboarding_data || $1::jsonb
         WHERE id = $2
         RETURNING id, email, name, bio, avatar_url, onboarding_data`,
        [JSON.stringify(onboarding_data), req.user.id],
      );

      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.json({ user: rows[0] });
    } catch (err) {
      console.error('patch /users/me error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

module.exports = router;
