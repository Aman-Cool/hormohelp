'use strict';

const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = Router();
router.use(requireAuth);

// GET /api/posts?category=&search=
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  let q = `
    SELECT p.*, u.name AS author_name,
      (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id) AS comment_count,
      jsonb_array_length(p.likes) AS like_count
    FROM community_posts p
    JOIN users u ON u.id = p.user_id
    WHERE 1=1
  `;
  const params = [];
  if (category && category !== 'All Categories') {
    params.push(category);
    q += ` AND p.category = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    q += ` AND (p.title ILIKE $${params.length} OR p.body ILIKE $${params.length})`;
  }
  q += ` ORDER BY p.created_at DESC LIMIT 50`;

  const { rows } = await db.query(q, params);
  const userId = req.user.id;
  res.json(rows.map((p) => ({
    ...p,
    liked: (p.likes || []).includes(userId),
    like_count: parseInt(p.like_count),
    comment_count: parseInt(p.comment_count),
  })));
});

// POST /api/posts
router.post('/',
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('body').trim().isLength({ min: 1, max: 5000 }),
  body('category').trim().isLength({ min: 1, max: 100 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, body: postBody, category } = req.body;
    const { rows: [post] } = await db.query(
      `INSERT INTO community_posts (user_id, title, body, category)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, title, postBody, category],
    );
    res.status(201).json({ ...post, author_name: req.user.name, like_count: 0, comment_count: 0, liked: false });
  },
);

// POST /api/posts/:id/like  — toggle
router.post('/:id/like', async (req, res) => {
  const userId = req.user.id;
  const { rows: [post] } = await db.query(
    `SELECT likes FROM community_posts WHERE id = $1`, [req.params.id],
  );
  if (!post) return res.status(404).json({ error: 'Not found' });

  const likes = post.likes || [];
  const alreadyLiked = likes.includes(userId);
  const newLikes = alreadyLiked
    ? likes.filter((id) => id !== userId)
    : [...likes, userId];

  await db.query(
    `UPDATE community_posts SET likes = $1 WHERE id = $2`,
    [JSON.stringify(newLikes), req.params.id],
  );
  res.json({ liked: !alreadyLiked, like_count: newLikes.length });
});

// DELETE /api/posts/:id
router.delete('/:id', async (req, res) => {
  const { rowCount } = await db.query(
    `DELETE FROM community_posts WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id],
  );
  if (!rowCount) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// GET /api/posts/:id/comments
router.get('/:id/comments', async (req, res) => {
  const { rows } = await db.query(
    `SELECT c.*, u.name AS author_name FROM community_comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.post_id = $1 ORDER BY c.created_at ASC`,
    [req.params.id],
  );
  res.json(rows);
});

// POST /api/posts/:id/comments
router.post('/:id/comments',
  body('body').trim().isLength({ min: 1, max: 2000 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { rows: [comment] } = await db.query(
      `INSERT INTO community_comments (post_id, user_id, body) VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, req.user.id, req.body.body],
    );
    res.status(201).json({ ...comment, author_name: req.user.name });
  },
);

module.exports = router;
