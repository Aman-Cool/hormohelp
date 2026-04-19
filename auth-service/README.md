# HarmoHelp Auth Service

Standalone authentication microservice for HarmoHelp, written in Go.  
Handles all auth endpoints; the Node.js API proxies `/auth/*` requests here.

## Stack

| Concern | Library |
|---|---|
| Router | `github.com/go-chi/chi/v5` |
| Database | `github.com/jackc/pgx/v5` (pgxpool, raw SQL) |
| Passwords | `golang.org/x/crypto/argon2` (Argon2id) |
| JWT | `github.com/golang-jwt/jwt/v5` (RS256) |
| Config | `github.com/joho/godotenv` |
| Rate limiting | `sync.Map` + `time` — no external package |

## Endpoints

| Method | Path | Auth required |
|---|---|---|
| POST | `/auth/signup` | — |
| POST | `/auth/login` | — |
| POST | `/auth/logout` | — |
| POST | `/auth/refresh` | — |
| POST | `/auth/verify-email` | — |
| POST | `/auth/resend-verification` | — |
| POST | `/auth/forgot-password` | — |
| POST | `/auth/reset-password` | — |
| GET | `/auth/me` | Bearer token |
| GET | `/health` | — |

## Quick start

### 1. Generate RSA key pair

```bash
openssl genrsa -out auth_private.pem 2048
openssl rsa -in auth_private.pem -pubout -out auth_public.pem

# Copy the public key to the Node.js server so it can verify tokens
cp auth_public.pem ../server/auth_public.pem
```

Keep `auth_private.pem` out of version control — add it to `.gitignore`.

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in DATABASE_URL, SMTP_*, FRONTEND_ORIGIN
```

### 3. Run the database migration

The auth-service shares the same PostgreSQL schema as the Node.js API.
Run migrations once from the project root:

```bash
psql "$DATABASE_URL" -f ../server/migrate.sql
```

Or start the full stack with Docker Compose (migrations run automatically):

```bash
docker compose up
```

### 4. Run locally

```bash
go run ./cmd/main.go
# Listening on :8001
```

### 5. Run Node.js API alongside

```bash
cd ../server
npm install
npm run dev   # listens on :4000, proxies /auth/* → localhost:8001
```

## Running with Docker Compose

From the **project root**:

```bash
docker compose up --build
```

Services:
- `postgres` → localhost:5432
- `auth-service` → localhost:8001
- `node-api` → localhost:4000

## Security notes

- **Passwords** — Argon2id with 64 MB memory, 3 iterations, 2 threads, 16-byte salt, 32-byte key.
- **Access tokens** — RS256 signed JWTs, 15-minute expiry.
- **Refresh tokens** — 32 random bytes (hex), stored as SHA-256 hash, rotated on every use.
- **Token comparisons** — `crypto/subtle.ConstantTimeCompare` throughout.
- **Rate limiting** — login/signup: 10 req/15 min per IP; resend-verification: 3 req/hour per email.
- **Cookies** — `HttpOnly`, `SameSite=Strict`, `Path=/auth/refresh`, `MaxAge=7d`. `Secure` is set when `NODE_ENV=production`.

## Project layout

```
auth-service/
├── cmd/main.go               entry point, router wiring
├── internal/
│   ├── config/config.go      env loading, RSA key parsing
│   ├── db/db.go              pgxpool setup (max 10 conns)
│   ├── handlers/             one file per endpoint
│   ├── middleware/
│   │   ├── auth.go           RS256 JWT validation middleware
│   │   └── rate_limit.go     sync.Map sliding-window limiter
│   ├── models/user.go        User and PublicUser structs
│   └── utils/
│       ├── token.go          IssueAccessToken / VerifyAccessToken
│       ├── password.go       HashPassword / VerifyPassword (Argon2id)
│       ├── crypto.go         RandomHex, SHA256Hex, ConstantTimeHexEqual
│       └── email.go          SMTP sender + branded email HTML
├── Dockerfile                multi-stage scratch image
└── .env.example
```
