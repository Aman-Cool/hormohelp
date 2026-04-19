'use strict';

const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = Router();
router.use(requireAuth);

// GET /api/bookings
router.get('/', async (req, res) => {
  const { rows } = await db.query(
    `SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id],
  );
  res.json(rows);
});

// POST /api/bookings
router.post('/',
  body('type').isIn(['video', 'phone', 'chat']),
  body('expert_id').optional().isString().isLength({ max: 200 }),
  body('date').trim().isLength({ min: 1, max: 50 }),
  body('time').trim().isLength({ min: 1, max: 50 }),
  body('notes').optional().isString().isLength({ max: 2000 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { type, expert_id = 'Dr. Sarah Johnson', date, time, notes = '' } = req.body;
    const { rows: [booking] } = await db.query(
      `INSERT INTO bookings (user_id, expert_id, type, date, time, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, expert_id, type, date, time, notes],
    );
    res.status(201).json(booking);
  },
);

// DELETE /api/bookings/:id
router.delete('/:id', async (req, res) => {
  const { rowCount } = await db.query(
    `DELETE FROM bookings WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id],
  );
  if (!rowCount) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
