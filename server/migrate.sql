CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop old UUID-based auth tables if they exist (clean migration to Firebase UIDs)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    DROP TABLE IF EXISTS orders, cart_items, products, bookings,
      community_comments, community_posts, symptom_logs,
      password_reset_tokens, refresh_tokens, users CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id              TEXT        PRIMARY KEY,  -- Firebase UID
  email           TEXT        UNIQUE NOT NULL,
  name            TEXT        NOT NULL,
  onboarding_data JSONB       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS symptom_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        DATE        NOT NULL DEFAULT CURRENT_DATE,
  symptoms    JSONB       NOT NULL DEFAULT '[]',
  notes       TEXT        NOT NULL DEFAULT '',
  severity    SMALLINT    NOT NULL DEFAULT 5 CHECK (severity BETWEEN 1 AND 10),
  mood        SMALLINT    NOT NULL DEFAULT 5 CHECK (mood BETWEEN 1 AND 10),
  energy      SMALLINT    NOT NULL DEFAULT 5 CHECK (energy BETWEEN 1 AND 10),
  sleep       SMALLINT    NOT NULL DEFAULT 5 CHECK (sleep BETWEEN 1 AND 10),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sl_user_date ON symptom_logs(user_id, date DESC);

CREATE TABLE IF NOT EXISTS community_posts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  category    TEXT        NOT NULL DEFAULT 'General Discussion',
  likes       JSONB       NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cp_created ON community_posts(created_at DESC);

CREATE TABLE IF NOT EXISTS community_comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_post ON community_comments(post_id, created_at);

CREATE TABLE IF NOT EXISTS bookings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_id   TEXT        NOT NULL DEFAULT 'Dr. Sarah Johnson',
  type        TEXT        NOT NULL CHECK (type IN ('video', 'phone', 'chat')),
  date        TEXT        NOT NULL,
  time        TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'pending',
  notes       TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bk_user ON bookings(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL      PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  image_url   TEXT        NOT NULL DEFAULT '',
  category    TEXT        NOT NULL,
  stock       INTEGER     NOT NULL DEFAULT 100,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items               JSONB       NOT NULL DEFAULT '[]',
  total               NUMERIC(10,2) NOT NULL,
  status              TEXT        NOT NULL DEFAULT 'pending',
  razorpay_order_id   TEXT        UNIQUE,
  razorpay_payment_id TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);
