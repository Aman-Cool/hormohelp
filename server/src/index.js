'use strict';

require('dotenv').config();

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');

const userRoutes    = require('./routes/users');
const symptomRoutes = require('./routes/symptoms');
const postRoutes    = require('./routes/posts');
const bookingRoutes = require('./routes/bookings');
const shopRoutes    = require('./routes/shop');
const orderRoutes   = require('./routes/orders');

const app = express();

app.use(helmet());

app.use(cors({
  origin:         process.env.FRONTEND_ORIGIN,
  credentials:    true,
  methods:        ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Proxy all /auth/* requests to the Go auth-service.
// Must be registered BEFORE express.json() so the raw body reaches the proxy unmodified.
const authServiceURL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';

app.use(
  '/auth',
  createProxyMiddleware({
    target:       authServiceURL,
    changeOrigin: true,
    on: {
      error: (err, _req, res) => {
        console.error('[proxy] auth-service error:', err.message);
        res.status(502).json({ error: 'Auth service temporarily unavailable. Please try again.' });
      },
    },
  }),
);

app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());

app.use('/users',          userRoutes);
app.use('/api/symptoms',   symptomRoutes);
app.use('/api/posts',      postRoutes);
app.use('/api/bookings',   bookingRoutes);
app.use('/api',            shopRoutes);
app.use('/api/orders',     orderRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`HarmoHelp API listening on port ${PORT}`);
  console.log(`Auth requests proxied → ${authServiceURL}`);
});
