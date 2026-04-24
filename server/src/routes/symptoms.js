'use strict';

const { Router } = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = Router();
router.use(requireAuth);

// GET /api/symptoms?page=1&limit=10
router.get('/', async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const offset = (page - 1) * limit;

  const { rows } = await db.query(
    `SELECT * FROM symptom_logs WHERE user_id = $1 ORDER BY date DESC, created_at DESC LIMIT $2 OFFSET $3`,
    [req.user.id, limit, offset],
  );
  const { rows: [{ count }] } = await db.query(
    `SELECT COUNT(*) FROM symptom_logs WHERE user_id = $1`,
    [req.user.id],
  );
  res.json({ logs: rows, total: parseInt(count), page, limit });
});

// GET /api/symptoms/stats  — used by dashboard
router.get('/stats', async (req, res) => {
  const { rows: logs } = await db.query(
    `SELECT date, severity, mood, energy, sleep, symptoms FROM symptom_logs
     WHERE user_id = $1 ORDER BY date DESC LIMIT 30`,
    [req.user.id],
  );

  const total = logs.length;

  // streak: consecutive days from today
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateSet = new Set(logs.map((l) => new Date(l.date).toDateString()));
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (dateSet.has(d.toDateString())) streak++;
    else if (i > 0) break;
  }

  // this week
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const thisWeek = logs.filter((l) => new Date(l.date) >= weekAgo).length;

  // avg severity
  const avgSeverity = total ? (logs.reduce((s, l) => s + l.severity, 0) / total).toFixed(1) : '—';

  // most common symptom
  const freq = {};
  logs.forEach((l) => (l.symptoms || []).forEach((s) => { freq[s] = (freq[s] || 0) + 1; }));
  const mostCommon = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0] || '—';

  // health score: inverse of avg severity scaled to 100
  const healthScore = total ? Math.round(((10 - parseFloat(avgSeverity)) / 9) * 100) : 85;

  // line chart: last 7 entries
  const lineData = logs.slice(0, 7).reverse().map((l) => ({
    date: l.date,
    value: l.severity,
  }));

  // bar chart: last 7 days
  const barData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayStr = d.toDateString();
    const dayLog = logs.find((l) => new Date(l.date).toDateString() === dayStr);
    barData.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      value: dayLog ? dayLog.severity : 0,
    });
  }

  res.json({ total, streak, thisWeek, avgSeverity, mostCommon, healthScore, lineData, barData });
});

const DAILY_LOG_LIMIT = 2;

// POST /api/symptoms
router.post('/',
  body('date').optional().isDate(),
  body('symptoms').isArray(),
  body('notes').optional().isString().isLength({ max: 2000 }),
  body('severity').isInt({ min: 1, max: 10 }),
  body('mood').isInt({ min: 1, max: 10 }),
  body('energy').isInt({ min: 1, max: 10 }),
  body('sleep').isInt({ min: 1, max: 10 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { date, symptoms, notes = '', severity, mood, energy, sleep } = req.body;
    const logDate = date || new Date().toISOString().slice(0, 10);

    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*) FROM symptom_logs WHERE user_id = $1 AND date = $2`,
      [req.user.id, logDate],
    );
    if (parseInt(count) >= DAILY_LOG_LIMIT) {
      return res.status(429).json({
        error: `You can only log symptoms ${DAILY_LOG_LIMIT} times per day.`,
        code: 'DAILY_LIMIT_REACHED',
      });
    }

    const { rows: [log] } = await db.query(
      `INSERT INTO symptom_logs (user_id, date, symptoms, notes, severity, mood, energy, sleep)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, logDate, JSON.stringify(symptoms), notes, severity, mood, energy, sleep],
    );
    res.status(201).json(log);
  },
);

// DELETE /api/symptoms/:id
router.delete('/:id', async (req, res) => {
  const { rowCount } = await db.query(
    `DELETE FROM symptom_logs WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id],
  );
  if (!rowCount) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
