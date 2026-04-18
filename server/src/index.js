'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true,   // required to forward the HttpOnly refresh-token cookie
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`HarmoHelp API listening on port ${PORT}`);
});
