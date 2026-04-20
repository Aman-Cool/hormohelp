# HarmoHelp — Hormonal Wellness Platform

A full-stack hormonal health platform built across three independent services: a React SPA, a Node.js business-logic API, and a Go authentication microservice — all backed by PostgreSQL and containerised with Docker Compose.

---

## Architecture

```
Browser
  │
  ├─── Vite SPA (React 18)  :5173
  │       │
  │       └─── VITE_API_URL ──► Node.js API  :4000
  │                                  │
  │                    /auth/* proxy │          Go auth-service  :8001
  │                                  └────────────────────────────────►
  │                                                                    │
  └──────────────────────────────────────── PostgreSQL 16  :5432 ◄────┘
```

All `/auth/*` requests from the browser arrive at the Node.js API, which reverse-proxies them unchanged to the Go auth-service using `http-proxy-middleware`. The Go service owns the RSA private key and is the sole JWT issuer. The Node.js API holds only the public key and uses it to verify tokens on every protected route.

---

## Services

### Go auth-service (`auth-service/`, port 8001)

Written in Go 1.22 using the [Chi](https://github.com/go-chi/chi) router. Responsible for the entire authentication lifecycle:

| Endpoint | Method | Description |
|---|---|---|
| `/auth/signup` | POST | Create account, send verification email |
| `/auth/login` | POST | Authenticate, issue access + refresh tokens |
| `/auth/logout` | POST | Revoke refresh token, clear cookie |
| `/auth/refresh` | POST | Rotate refresh token, re-issue access token |
| `/auth/verify-email` | POST | Consume email verification token, issue session |
| `/auth/resend-verification` | POST | Resend verification email (rate-limited by email hash) |
| `/auth/forgot-password` | POST | Send password reset email |
| `/auth/reset-password` | POST | Consume reset token, update password |
| `/auth/me` | GET | Return authenticated user (requires valid JWT) |
| `/health` | GET | Health probe |

**Token design**

- **Access token**: RS256 JWT, 15-minute lifetime. Payload includes `sub` (user UUID) and `emailVerified`. Signed with a 2048-bit RSA private key loaded from a PEM file at startup.
- **Refresh token**: 32 bytes of CSPRNG output (`crypto/rand`), stored in the database as `SHA-256(raw_token)`. The raw value is delivered to the browser as an `HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh` cookie so it is never accessible to JavaScript and cannot be sent to any other endpoint.
- **Token rotation**: every call to `/auth/refresh` runs inside a PostgreSQL transaction — the incoming token row is deleted and a new one is inserted before the access token is issued. If the transaction fails, neither token is issued and the old one remains valid.

**Password hashing**

Argon2id with parameters `m=65536, t=3, p=2` (64 MB memory, 3 iterations, 2 threads). The stored format is the self-describing PHC string `$argon2id$v=19$m=…$<salt_b64>$<hash_b64>`.

**User-enumeration & timing-attack prevention**

On every login attempt the handler always runs a full Argon2 verification, regardless of whether the queried email exists. A dummy hash is pre-computed at startup and used whenever the email is not found, so the response time is identical for existing and non-existing accounts.

**Rate limiting**

An in-memory sliding-window rate limiter (`sync.Map` backed) is applied at the Chi middleware level:
- `/auth/signup`, `/auth/login`: 10 requests per 15 minutes per client IP.
- `/auth/resend-verification`: 3 requests per hour, keyed by `SHA-256(email)` to prevent enumeration through the rate-limit response itself.

**Docker image**

Multi-stage build. Stage 1 compiles a fully static binary (`CGO_ENABLED=0`). Stage 2 uses `scratch` — the final image contains only the binary and CA certificates. No shell, no package manager, no OS.

---

### Node.js API (`server/`, port 4000)

Express 4 with CommonJS modules. Handles all product, symptom, community, booking, and payment logic. Uses the RSA public key to verify JWTs locally on every request (no round-trip to the auth-service).

**Middleware stack (in order)**

1. `helmet` — sets `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, etc.
2. `cors` — restricts to `FRONTEND_ORIGIN`, requires credentials.
3. `http-proxy-middleware` — forwards `/auth/*` to Go service; registered before `express.json()` so the raw body passes through unmodified.
4. `express.json({ limit: '16kb' })` — body parsing with size cap.
5. `cookie-parser` — used for the refresh cookie on proxied responses.

**Route map**

| Mount | Module | Auth |
|---|---|---|
| `/auth/*` | Proxied → Go service | — |
| `PATCH /users/me` | `routes/users.js` | Required |
| `GET /api/symptoms` | `routes/symptoms.js` | Required |
| `GET /api/symptoms/stats` | `routes/symptoms.js` | Required |
| `POST /api/symptoms` | `routes/symptoms.js` | Required |
| `DELETE /api/symptoms/:id` | `routes/symptoms.js` | Required |
| `GET /api/posts` | `routes/posts.js` | Required |
| `POST /api/posts` | `routes/posts.js` | Required |
| `POST /api/posts/:id/like` | `routes/posts.js` | Required |
| `DELETE /api/posts/:id` | `routes/posts.js` | Required |
| `GET /api/posts/:id/comments` | `routes/posts.js` | Required |
| `POST /api/posts/:id/comments` | `routes/posts.js` | Required |
| `GET /api/bookings` | `routes/bookings.js` | Required |
| `POST /api/bookings` | `routes/bookings.js` | Required |
| `DELETE /api/bookings/:id` | `routes/bookings.js` | Required |
| `GET /api/products` | `routes/shop.js` | Required |
| `GET /api/cart` | `routes/shop.js` | Required |
| `POST /api/cart` | `routes/shop.js` | Required |
| `PATCH /api/cart/:id` | `routes/shop.js` | Required |
| `DELETE /api/cart/:id` | `routes/shop.js` | Required |
| `GET /api/orders` | `routes/orders.js` | Required |
| `POST /api/orders/create-razorpay-order` | `routes/orders.js` | Required |
| `POST /api/orders/verify-payment` | `routes/orders.js` | Required |
| `GET /health` | inline | — |

**Payment flow (Razorpay)**

1. Client sends `POST /api/orders/create-razorpay-order` with a list of `cart_item_ids`.
2. Server re-fetches item prices from the database — the client-provided cart is never trusted for pricing.
3. A Razorpay order is created server-side; the `razorpay_order_id`, `amount` (in paise), and `key_id` are returned to the browser.
4. The browser opens the Razorpay checkout and, on success, receives `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
5. Client calls `POST /api/orders/verify-payment`. The server computes `HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)` and compares it with the provided signature using `crypto.timingSafeEqual`. Only if they match does the server persist the order.
6. Order insertion and cart deletion run inside a single PostgreSQL transaction; a rollback on any failure leaves the cart intact.

---

### React SPA (`src/`, port 5173 in development)

React 18 with Vite 5. All pages are code-split via `React.lazy` and wrapped in a `<Suspense>` boundary so the initial bundle is minimal. Routes are protected by a `ProtectedRoute` component that reads from `AuthContext`.

**Authentication state**

`AuthContext` manages the entire session lifecycle:

- On mount, it calls `POST /auth/refresh` to silently restore the session from the HttpOnly cookie. This is the only mechanism for persisting login across page reloads — the access token is never written to `localStorage` or `sessionStorage`.
- The raw access token lives in a module-level JavaScript variable (`tokenStore.js`). It is injected into every outgoing request by an axios request interceptor.
- `scheduleRefresh` parses the JWT `exp` claim without signature verification (the claim is trusted only for scheduling, not for authorization) and fires a silent refresh 60 seconds before expiry using `setTimeout`.

**Axios interceptor — concurrent 401 handling**

When a 401 is returned by any request:
1. If a refresh is already in progress, the failing request is pushed onto a `waitingQueue` (an array of `{resolve, reject}` pairs) and a new `Promise` is returned to the caller.
2. Once the in-flight refresh resolves, all queued requests are replayed with the new token.
3. If the refresh itself fails, the queue is flushed with the error, the token is cleared, and the browser is redirected to `/login`.

This prevents duplicate refresh calls when multiple API requests expire simultaneously.

**Route table**

| Path | Component | Protected |
|---|---|---|
| `/` | `HomePage` | No |
| `/login` | `LoginPage` | No |
| `/signup` | `SignupPage` | No |
| `/verify-email` | `VerifyEmailPage` | No |
| `/privacy` | `PrivacyPolicyPage` | No |
| `/terms` | `TermsOfServicePage` | No |
| `/onboarding` | `OnboardingPage` | Yes |
| `/dashboard` | `DashboardPage` | Yes |
| `/shop` | `ShopPage` | Yes |
| `/symptom-tracker` | `SymptomTrackerPage` | Yes |
| `/education` | `EducationPage` | Yes |
| `/community` | `CommunityPage` | Yes |
| `/consultations` | `ConsultationsPage` | Yes |

---

## Database Schema

PostgreSQL 16 with `pgcrypto` for UUID generation. All primary keys are `gen_random_uuid()`.

```
users
  id                            UUID PK
  email                         TEXT UNIQUE NOT NULL
  password_hash                 TEXT NOT NULL          -- Argon2id PHC string
  name                          TEXT NOT NULL
  onboarding_data               JSONB DEFAULT '{}'
  email_verified                BOOLEAN DEFAULT FALSE
  verification_token_hash       TEXT                   -- SHA-256 of raw token; NULL after verification
  verification_token_expires_at TIMESTAMPTZ
  created_at                    TIMESTAMPTZ

refresh_tokens
  id          UUID PK
  user_id     UUID FK → users(id) ON DELETE CASCADE
  token_hash  TEXT UNIQUE NOT NULL                     -- SHA-256 of raw 32-byte hex token
  expires_at  TIMESTAMPTZ NOT NULL                     -- 7 days from issuance
  created_at  TIMESTAMPTZ
  INDEX: (token_hash), (user_id)

password_reset_tokens
  id          UUID PK
  user_id     UUID FK → users(id) ON DELETE CASCADE
  token_hash  TEXT UNIQUE NOT NULL
  expires_at  TIMESTAMPTZ NOT NULL
  used        BOOLEAN DEFAULT FALSE
  created_at  TIMESTAMPTZ
  INDEX: (token_hash)

symptom_logs
  id          UUID PK
  user_id     UUID FK → users(id) ON DELETE CASCADE
  date        DATE DEFAULT CURRENT_DATE
  symptoms    JSONB DEFAULT '[]'                       -- array of symptom strings
  notes       TEXT DEFAULT ''
  severity    SMALLINT CHECK (1–10)
  mood        SMALLINT CHECK (1–10)
  energy      SMALLINT CHECK (1–10)
  sleep       SMALLINT CHECK (1–10)
  created_at  TIMESTAMPTZ
  INDEX: (user_id, date DESC)

community_posts
  id          UUID PK
  user_id     UUID FK → users(id) ON DELETE CASCADE
  title       TEXT NOT NULL
  body        TEXT NOT NULL
  category    TEXT DEFAULT 'General Discussion'
  likes       JSONB DEFAULT '[]'                       -- array of user UUIDs
  created_at  TIMESTAMPTZ
  INDEX: (created_at DESC)

community_comments
  id          UUID PK
  post_id     UUID FK → community_posts(id) ON DELETE CASCADE
  user_id     UUID FK → users(id) ON DELETE CASCADE
  body        TEXT NOT NULL
  created_at  TIMESTAMPTZ
  INDEX: (post_id, created_at)

bookings
  id          UUID PK
  user_id     UUID FK → users(id) ON DELETE CASCADE
  expert_id   TEXT NOT NULL
  type        TEXT CHECK ('video' | 'phone' | 'chat')
  date        TEXT NOT NULL
  time        TEXT NOT NULL
  status      TEXT DEFAULT 'pending'
  notes       TEXT DEFAULT ''
  created_at  TIMESTAMPTZ
  INDEX: (user_id, created_at DESC)

products
  id          SERIAL PK
  name        TEXT NOT NULL
  description TEXT NOT NULL
  price       NUMERIC(10,2) NOT NULL
  image_url   TEXT DEFAULT ''
  category    TEXT NOT NULL
  stock       INTEGER DEFAULT 100
  created_at  TIMESTAMPTZ

cart_items
  id          UUID PK
  user_id     UUID FK → users(id) ON DELETE CASCADE
  product_id  INTEGER FK → products(id) ON DELETE CASCADE
  quantity    INTEGER DEFAULT 1 CHECK (> 0)
  created_at  TIMESTAMPTZ
  UNIQUE (user_id, product_id)              -- upsert via ON CONFLICT ... DO UPDATE

orders
  id                  UUID PK
  user_id             UUID FK → users(id) ON DELETE CASCADE
  items               JSONB NOT NULL                   -- snapshot of purchased products
  total               NUMERIC(10,2) NOT NULL
  status              TEXT DEFAULT 'pending'
  razorpay_order_id   TEXT UNIQUE
  razorpay_payment_id TEXT
  created_at          TIMESTAMPTZ
  INDEX: (user_id, created_at DESC)
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 18.3 |
| Build tool | Vite | 5.4 |
| Routing | React Router DOM | 6.30 |
| Styling | Tailwind CSS | 3.4 |
| Charts | Recharts | 3.8 |
| Icons | Lucide React | 1.8 |
| HTTP client | Axios | 1.15 |
| Notifications | react-hot-toast | 2.6 |
| Auth microservice | Go | 1.22 |
| Go HTTP router | Chi | 5.1 |
| Go JWT library | golang-jwt/jwt | 5.2 |
| Go DB driver | pgx/v5 | 5.6 |
| API server | Node.js / Express | 4.19 |
| Password hashing | Argon2 (node-argon2) | 0.31 |
| Email | Nodemailer | 6.9 |
| Payments | Razorpay | 2.9 |
| Database | PostgreSQL | 16 |
| Container runtime | Docker / Docker Compose | 3.9 |

---

## Project Structure

```
hormohelp/
├── auth-service/                   # Go authentication microservice
│   ├── cmd/main.go                 # Entry point: router setup, rate limiters, startup
│   ├── internal/
│   │   ├── config/config.go        # Environment + RSA key loading
│   │   ├── db/db.go                # pgx connection pool
│   │   ├── handlers/               # One file per endpoint
│   │   │   ├── handler.go          # Shared Handler struct + helpers
│   │   │   ├── login.go
│   │   │   ├── signup.go
│   │   │   ├── logout.go
│   │   │   ├── refresh.go
│   │   │   ├── verify_email.go
│   │   │   ├── forgot_password.go
│   │   │   ├── reset_password.go
│   │   │   └── me.go
│   │   ├── middleware/
│   │   │   ├── auth.go             # RS256 JWT verification middleware
│   │   │   └── rate_limit.go       # In-memory sliding-window rate limiter
│   │   ├── models/                 # User, PublicUser structs
│   │   └── utils/
│   │       ├── password.go         # Argon2id hash + verify
│   │       ├── token.go            # JWT issue + verify (RS256)
│   │       ├── crypto.go           # RandomHex, SHA256Hex, ConstantTimeHexEqual
│   │       └── email.go            # SMTP emailer + HTML templates
│   ├── go.mod
│   └── Dockerfile                  # Multi-stage: golang:1.22-alpine → scratch
│
├── server/                         # Node.js business-logic API
│   ├── src/
│   │   ├── index.js                # Express app, middleware stack, proxy config
│   │   ├── db.js                   # pg Pool singleton
│   │   ├── middleware/auth.js       # JWT verify with RSA public key
│   │   └── routes/
│   │       ├── users.js            # PATCH /users/me (onboarding data)
│   │       ├── symptoms.js         # Symptom CRUD + stats/analytics
│   │       ├── posts.js            # Community posts, likes, comments
│   │       ├── bookings.js         # Consultation bookings
│   │       ├── shop.js             # Products + cart management
│   │       └── orders.js           # Razorpay order create + verify
│   ├── migrate.sql                 # Full DDL (idempotent CREATE IF NOT EXISTS)
│   ├── seed.sql                    # 12 product rows for development
│   └── Dockerfile                  # node:20-alpine
│
├── src/                            # React SPA
│   ├── api/
│   │   ├── axios.js                # Axios instance, request/response interceptors
│   │   └── tokenStore.js           # In-memory access token (never persisted)
│   ├── context/AuthContext.jsx     # Session management, silent refresh scheduling
│   ├── components/
│   │   ├── DashboardNav.jsx        # Persistent inner-app navigation
│   │   ├── CookieBanner.jsx        # Cookie consent
│   │   ├── ErrorBoundary.jsx       # Top-level error boundary
│   │   └── Skeleton.jsx            # Loading skeleton
│   └── pages/
│       ├── HomePage.jsx
│       ├── LoginPage.jsx
│       ├── SignupPage.jsx
│       ├── VerifyEmailPage.jsx
│       ├── OnboardingPage.jsx
│       ├── DashboardPage.jsx       # Health stats, streaks, charts (Recharts)
│       ├── SymptomTrackerPage.jsx  # Daily log entry + history
│       ├── EducationPage.jsx       # Content library
│       ├── CommunityPage.jsx       # Posts, likes, comments
│       ├── ShopPage.jsx            # Products, cart, Razorpay checkout
│       ├── ConsultationsPage.jsx   # Booking wizard
│       ├── PrivacyPolicyPage.jsx
│       ├── TermsOfServicePage.jsx
│       └── NotFoundPage.jsx
│
├── docker-compose.yml              # Three-service orchestration
├── auth_public.pem                 # RSA public key (safe to commit; private key is not)
├── vite.config.js
├── tailwind.config.js
└── package.json                    # Frontend dependencies
```

---

## Local Setup

### Prerequisites

- Node.js ≥ 20
- Go ≥ 1.22
- PostgreSQL 16 **or** Docker Desktop

### Option A — Docker Compose (recommended)

The `docker-compose.yml` starts PostgreSQL, the Go auth-service, and the Node.js API in dependency order. The database schema is applied automatically via the `docker-entrypoint-initdb.d` init script.

**1. Generate RSA keys**

```bash
openssl genrsa -out auth_private.pem 2048
openssl rsa -in auth_private.pem -pubout -out auth_public.pem
```

`auth_private.pem` stays local and is referenced as a Docker secret. `auth_public.pem` is committed to the repository so both the auth-service and the Node.js API can load it.

**2. Configure environment**

```bash
# Root .env (consumed by the frontend Vite dev server)
VITE_API_URL=http://localhost:4000

# Create auth-service/.env and server/.env from the .env.example files in each directory.
# At minimum set:
DATABASE_URL=postgresql://harmohelp:harmohelp@localhost:5432/harmohelp
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=no-reply@yourdomain.com
FRONTEND_ORIGIN=http://localhost:5173
JWT_PRIVATE_KEY_PATH=./auth_private.pem   # auth-service only
JWT_PUBLIC_KEY_PATH=./auth_public.pem
RAZORPAY_KEY_ID=...                        # server only
RAZORPAY_KEY_SECRET=...                    # server only
```

**3. Start backend services**

```bash
docker compose up --build
```

Services and ports:
- PostgreSQL: `localhost:5432`
- Go auth-service: `localhost:8001`
- Node.js API: `localhost:4000`

**4. Seed products (optional)**

```bash
docker compose exec postgres psql -U harmohelp -d harmohelp -f /docker-entrypoint-initdb.d/seed.sql
# or locally:
psql $DATABASE_URL -f server/seed.sql
```

**5. Start the frontend**

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

---

### Option B — Manual (no Docker)

**PostgreSQL**

Create a database and run the migration:
```bash
createdb harmohelp
psql harmohelp -f server/migrate.sql
psql harmohelp -f server/seed.sql
```

**Go auth-service**

```bash
cd auth-service
cp .env.example .env   # fill in values
go run ./cmd/main.go
```

**Node.js API**

```bash
cd server
cp .env.example .env   # fill in values
npm install
npm run dev
```

**Frontend**

```bash
# from repo root
npm install
npm run dev
```

---

## Environment Variables

### auth-service

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_PRIVATE_KEY_PATH` | Yes | — | Path to RSA-2048 private key PEM |
| `JWT_PUBLIC_KEY_PATH` | Yes | — | Path to RSA-2048 public key PEM |
| `SMTP_HOST` | Yes | — | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_SECURE` | No | `false` | Set `true` for implicit TLS (port 465) |
| `SMTP_USER` | No | — | SMTP username |
| `SMTP_PASS` | No | — | SMTP password |
| `SMTP_FROM` | Yes | — | From address for outgoing mail |
| `FRONTEND_ORIGIN` | No | `http://localhost:5173` | Used in verification URL construction |
| `PORT` | No | `8001` | Listening port |
| `NODE_ENV` | No | `development` | Set to `production` to enable `Secure` on cookies |

### server (Node.js API)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `AUTH_SERVICE_URL` | No | `http://localhost:8001` | Go auth-service base URL |
| `AUTH_PUBLIC_KEY_PATH` | No | `../../auth_public.pem` | RSA public key for JWT verification |
| `FRONTEND_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |
| `RAZORPAY_KEY_ID` | Yes | — | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Yes | — | Razorpay secret (HMAC signing) |
| `PORT` | No | `4000` | Listening port |

### Frontend (Vite)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | — | Base URL of the Node.js API |

---

## Security Notes

- The RSA private key is never loaded by the Node.js API; only the Go auth-service has it. The API verifies tokens but cannot create them.
- Refresh tokens are stored as SHA-256 hashes. Even with full database read access, a stolen token database cannot be used to forge sessions.
- The access token is held only in a JavaScript module-level variable. It is not in `localStorage`, `sessionStorage`, or any cookie accessible to JavaScript, which eliminates the most common XSS-to-token-theft attack vector.
- Razorpay payment signatures are verified server-side with `crypto.timingSafeEqual` before any order is persisted.
- All auth endpoints involving email perform constant-time comparisons and return identical response shapes to prevent user/email enumeration.

---

## License

Private. All rights reserved.
