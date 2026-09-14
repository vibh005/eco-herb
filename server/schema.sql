-- ─────────────────────────────────────────────────────────────
-- Eco Herb — PostgreSQL Schema (Neon)
-- Run this once in the Neon SQL editor to create all tables
-- ─────────────────────────────────────────────────────────────

-- Users (created on first Google login)
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  google_id   TEXT UNIQUE NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  avatar      TEXT,
  is_admin    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Product categories
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  emoji       TEXT DEFAULT '🌿',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  description    TEXT,
  price          NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  category       TEXT,
  weight         INTEGER,
  stock          INTEGER DEFAULT 0,
  active         BOOLEAN DEFAULT TRUE,
  is_featured    BOOLEAN DEFAULT FALSE,
  is_new         BOOLEAN DEFAULT FALSE,
  images         TEXT[]  DEFAULT '{}',
  benefits       TEXT[]  DEFAULT '{}',
  ingredients    TEXT[]  DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER REFERENCES users(id) ON DELETE SET NULL,
  items               JSONB NOT NULL,
  subtotal            NUMERIC(10, 2) NOT NULL,
  shipping            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total               NUMERIC(10, 2) NOT NULL,
  shipping_address    JSONB NOT NULL,
  status              TEXT DEFAULT 'pending',
  payment_status      TEXT DEFAULT 'pending',
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_active     ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug     ON categories(slug);
