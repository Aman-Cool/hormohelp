# HarmoHelp — API Server

Node.js + Express authentication and user API.

## Prerequisites

- Node.js v18+
- Docker (for local PostgreSQL)

## Setup

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

The `migrate.sql` file runs automatically on first start and creates all tables.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Random secret ≥ 32 chars — run `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `FRONTEND_ORIGIN` | Frontend URL for CORS (no trailing slash) |
| `SMTP_*` | SMTP credentials for password-reset emails |

### 4. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on port 4000 by default.

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Create account, receive tokens |
| POST | `/auth/login` | — | Sign in, receive tokens |
| POST | `/auth/logout` | Cookie | Invalidate refresh token |
| POST | `/auth/refresh` | Cookie | Rotate refresh token, get new access token |
| GET | `/auth/me` | Bearer | Return current user |
| POST | `/auth/forgot-password` | — | Send password-reset email |
| POST | `/auth/reset-password` | — | Complete password reset |
| PATCH | `/users/me` | Bearer | Update onboarding data |

## Security

- Passwords hashed with **Argon2id** (OWASP-recommended parameters)
- Access tokens: **15-minute** JWT, kept in memory only (never in storage)
- Refresh tokens: **7-day**, stored as SHA-256 hash in DB, sent as HttpOnly Strict cookie
- Refresh token **rotation** on every `/auth/refresh` call
- **Timing-safe comparison** on all token lookups via `crypto.timingSafeEqual`
- **Rate limiting**: 10 requests / 15 min on `/auth/login` and `/auth/signup`
- **Helmet** security headers on all responses
- **CORS** restricted to `FRONTEND_ORIGIN` only
