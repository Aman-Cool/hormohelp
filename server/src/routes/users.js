'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ─── PATCH /users/me ─────────────────────────────────────────────────────────
// Saves onboarding data. Accepts any JSON payload and deep-merges into the
// existing onboarding_data column via PostgreSQL's jsonb concatenation operator.

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
         RETURNING id, email, name, onboarding_data`,
        [JSON.stringify(onboarding_data), req.user.sub],
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
