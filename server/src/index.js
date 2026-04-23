'use strict';

require('dotenv').config();

const fs      = require('fs');
const path    = require('path');
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');

const userRoutes    = require('./routes/users');
const symptomRoutes = require('./routes/symptoms');
const postRoutes    = require('./routes/posts');
const bookingRoutes = require('./routes/bookings');
const shopRoutes    = require('./routes/shop');
const orderRoutes   = require('./routes/orders');

const db = require('./db');

async function migrate() {
  const sql = fs.readFileSync(path.resolve(__dirname, '../migrate.sql'), 'utf8');
  await db.query(sql);
  console.log('[migrate] schema up to date');
}

const app = express();

app.use(helmet());

app.use(cors({
  origin:         process.env.FRONTEND_ORIGIN,
  credentials:    true,
  methods:        ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '16kb' }));

app.use('/users',          userRoutes);
app.use('/api/symptoms',   symptomRoutes);
app.use('/api/posts',      postRoutes);
app.use('/api/bookings',   bookingRoutes);
app.use('/api',            shopRoutes);
app.use('/api/orders',     orderRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;

migrate()
  .then(() => {
    app.listen(PORT, () => console.log(`HarmoHelp API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('[migrate] fatal:', err);
    process.exit(1);
  });
