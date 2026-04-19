'use strict';

const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = Router();
router.use(requireAuth);

// GET /api/products
router.get('/products', async (_req, res) => {
  const { rows } = await db.query(`SELECT * FROM products ORDER BY name ASC`);
  res.json(rows);
});

// GET /api/cart
router.get('/cart', async (req, res) => {
  const { rows } = await db.query(
    `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.description, p.price, p.image_url, p.category
     FROM cart_items ci JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = $1`,
    [req.user.id],
  );
  res.json(rows);
});

// POST /api/cart
router.post('/cart',
  body('product_id').isInt({ min: 1 }),
  body('quantity').optional().isInt({ min: 1, max: 99 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { product_id, quantity = 1 } = req.body;
    const { rows: [item] } = await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING *`,
      [req.user.id, product_id, quantity],
    );
    res.status(201).json(item);
  },
);

// PATCH /api/cart/:id
router.patch('/cart/:id',
  body('quantity').isInt({ min: 1, max: 99 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { rows: [item] } = await db.query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [req.body.quantity, req.params.id, req.user.id],
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  },
);

// DELETE /api/cart/:id
router.delete('/cart/:id', async (req, res) => {
  const { rowCount } = await db.query(
    `DELETE FROM cart_items WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id],
  );
  if (!rowCount) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
