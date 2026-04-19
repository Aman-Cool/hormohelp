'use strict';

const { Router }  = require('express');
const { body, validationResult } = require('express-validator');
const crypto      = require('crypto');
const Razorpay    = require('razorpay');
const db          = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = Router();
router.use(requireAuth);

function getRazorpay() {
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// GET /api/orders  — order history for the authenticated user
router.get('/', async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, items, total, status, razorpay_payment_id, created_at
     FROM orders WHERE user_id = $1 AND status = 'paid'
     ORDER BY created_at DESC LIMIT 20`,
    [req.user.id],
  );
  res.json(rows);
});

// POST /api/orders/create-razorpay-order
// Body: { cart_item_ids: string[] }  — UUIDs of cart_items rows
router.post('/create-razorpay-order',
  body('cart_item_ids').isArray({ min: 1 }),
  body('cart_item_ids.*').isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { cart_item_ids } = req.body;

    // Fetch cart items + product prices from DB — never trust client-side totals
    const { rows: items } = await db.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.id = ANY($1) AND ci.user_id = $2`,
      [cart_item_ids, req.user.id],
    );

    if (items.length === 0) {
      return res.status(400).json({ error: 'No valid cart items found' });
    }

    // Calculate total in paise (Razorpay uses smallest currency unit; we treat INR ≈ USD for test mode)
    const totalRupees = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity, 0,
    );
    const amountPaise = Math.round(totalRupees * 100);

    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
    });

    res.json({
      razorpay_order_id: rzpOrder.id,
      amount:            rzpOrder.amount,
      currency:          rzpOrder.currency,
      key_id:            process.env.RAZORPAY_KEY_ID,
      items,
      total:             totalRupees,
    });
  },
);

// POST /api/orders/verify-payment
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, cart_item_ids }
router.post('/verify-payment',
  body('razorpay_order_id').isString().notEmpty(),
  body('razorpay_payment_id').isString().notEmpty(),
  body('razorpay_signature').isString().notEmpty(),
  body('cart_item_ids').isArray({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cart_item_ids } = req.body;

    // Server-side HMAC verification — the only accepted proof of payment
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const sigBuf      = Buffer.from(razorpay_signature, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');

    const signaturesMatch =
      sigBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(sigBuf, expectedBuf);

    if (!signaturesMatch) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Re-fetch cart items + prices from DB to build the order snapshot
    const { rows: items } = await db.query(
      `SELECT ci.quantity, p.id AS product_id, p.name, p.price, p.image_url
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.id = ANY($1) AND ci.user_id = $2`,
      [cart_item_ids, req.user.id],
    );

    if (items.length === 0) {
      return res.status(400).json({ error: 'No valid cart items found' });
    }

    const total = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity, 0,
    );

    // Persist order and clear cart in a single transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const { rows: [order] } = await client.query(
        `INSERT INTO orders (user_id, items, total, status, razorpay_order_id, razorpay_payment_id)
         VALUES ($1, $2, $3, 'paid', $4, $5) RETURNING *`,
        [req.user.id, JSON.stringify(items), total.toFixed(2), razorpay_order_id, razorpay_payment_id],
      );

      await client.query(
        `DELETE FROM cart_items WHERE id = ANY($1) AND user_id = $2`,
        [cart_item_ids, req.user.id],
      );

      await client.query('COMMIT');
      res.json({ order });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
);

module.exports = router;
