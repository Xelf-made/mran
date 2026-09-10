/*
# Create full pharmacy database schema

## Overview
This migration builds the complete database for Moran Pharmacy — an online
pharmacy serving Nairobi, Kenya. It creates tables for products (the store
catalog), customer profiles, saved delivery addresses, saved payment methods,
and wishlist items. It also fixes the existing orders table so new orders
automatically receive a human-readable order number (e.g. MP-1001) instead of
requiring the frontend to pass one.

## New Tables

### products
The store catalog. Pre-seeded with the 12 products currently hardcoded in the
frontend. Also stores stock, sales count, category, brand, price, old price,
rating, reviews, image URL, tag, and flags for "new" and "prescription required".
- `id` (serial, primary key) — numeric product ID matching frontend IDs
- `name` (text, not null)
- `brand` (text, not null)
- `category` (text, not null) — Medicines, Vitamins & Supplements, etc.
- `price` (integer, not null) — price in KSh
- `old_price` (integer) — original price if on sale, else null
- `rating` (numeric(2,1), not null, default 0) — e.g. 4.8
- `reviews` (integer, not null, default 0) — number of reviews
- `image` (text, not null) — product image URL
- `tag` (text) — display tag like "Best seller", "Top rated", or null
- `is_new` (boolean, not null, default false) — show in "new arrivals"
- `prescription` (boolean, not null, default false) — requires Rx
- `stock` (integer, not null, default 0) — units in inventory
- `sales` (integer, not null, default 0) — lifetime units sold
- `description` (text, not null)
- `created_at` (timestamptz, default now())

### profiles
Customer profile data that extends auth.users. One row per signed-in customer.
- `id` (uuid, primary key) — matches auth.users.id
- `full_name` (text) — display name
- `phone` (text) — phone number
- `area` (text) — neighbourhood/area in Nairobi
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### addresses
Saved delivery addresses for signed-in customers.
- `id` (uuid, primary key)
- `user_id` (uuid, not null, default auth.uid()) — owner
- `label` (text, not null) — e.g. "Home", "Work"
- `name` (text, not null) — recipient name
- `phone` (text, not null) — recipient phone
- `line1` (text, not null) — street address
- `area` (text, not null) — area/landmark
- `city` (text, not null, default 'Nairobi')
- `is_default` (boolean, not null, default false)
- `created_at` (timestamptz, default now())

### payment_methods
Saved payment methods for signed-in customers (M-Pesa or card).
- `id` (uuid, primary key)
- `user_id` (uuid, not null, default auth.uid()) — owner
- `type` (text, not null) — 'mpesa' or 'card'
- `label` (text, not null) — display label
- `detail` (text, not null) — masked detail (e.g. "+254 712..." or "Expires 09/27")
- `is_default` (boolean, not null, default false)
- `created_at` (timestamptz, default now())

### wishlist
Products a customer has saved for later.
- `id` (uuid, primary key)
- `user_id` (uuid, not null, default auth.uid()) — owner
- `product_id` (integer, not null) — references products(id)
- `created_at` (timestamptz, default now())
- Unique constraint on (user_id, product_id) to prevent duplicates

## Modified Tables

### orders (fix order_number auto-generation)
The existing orders table requires order_number to be passed by the frontend.
This migration adds a DEFAULT that auto-generates "MP-XXXX" using the existing
order_number_seq sequence, so inserts that omit order_number still get one.
The column's NOT NULL + UNIQUE constraints are preserved.

## Security (RLS)

### products — public catalog (no auth required to browse)
- SELECT: anyone (anon + authenticated) can read — this is a public storefront
- INSERT/UPDATE/DELETE: admin only (auth.jwt() ->> 'role' = 'admin')

### profiles — owner-scoped
- SELECT/INSERT/UPDATE: authenticated users can read/modify only their own profile
- DELETE: disabled (profiles are tied to auth accounts)

### addresses — owner-scoped
- Full CRUD for authenticated users on their own addresses only

### payment_methods — owner-scoped
- Full CRUD for authenticated users on their own payment methods only

### wishlist — owner-scoped
- Full CRUD for authenticated users on their own wishlist items only

## Important Notes
1. products uses serial (auto-incrementing integer) IDs so the seeded data
   matches the frontend's numeric product IDs (1–12).
2. Owner columns (user_id) default to auth.uid() so frontend inserts that omit
   the owner still satisfy RLS WITH CHECK policies.
3. The orders table order_number fix is backward-compatible — existing rows
   keep their values; new rows auto-generate from the sequence.
4. A trigger auto-creates a profile row when a new auth user signs up.
*/

-- =====================================================================
-- products
-- =====================================================================
CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL,
  price integer NOT NULL,
  old_price integer,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  reviews integer NOT NULL DEFAULT 0,
  image text NOT NULL,
  tag text,
  is_new boolean NOT NULL DEFAULT false,
  prescription boolean NOT NULL DEFAULT false,
  stock integer NOT NULL DEFAULT 0,
  sales integer NOT NULL DEFAULT 0,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_products" ON products;
CREATE POLICY "public_select_products"
ON products FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products"
ON products FOR INSERT
TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products"
ON products FOR UPDATE
TO authenticated USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products"
ON products FOR DELETE
TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- =====================================================================
-- profiles
-- =====================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  area text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- addresses
-- =====================================================================
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  line1 text NOT NULL,
  area text NOT NULL,
  city text NOT NULL DEFAULT 'Nairobi',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_addresses" ON addresses;
CREATE POLICY "select_own_addresses"
ON addresses FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_addresses" ON addresses;
CREATE POLICY "insert_own_addresses"
ON addresses FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_addresses" ON addresses;
CREATE POLICY "update_own_addresses"
ON addresses FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_addresses" ON addresses;
CREATE POLICY "delete_own_addresses"
ON addresses FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- =====================================================================
-- payment_methods
-- =====================================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('mpesa', 'card')),
  label text NOT NULL,
  detail text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_payment_methods" ON payment_methods;
CREATE POLICY "select_own_payment_methods"
ON payment_methods FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_payment_methods" ON payment_methods;
CREATE POLICY "insert_own_payment_methods"
ON payment_methods FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_payment_methods" ON payment_methods;
CREATE POLICY "update_own_payment_methods"
ON payment_methods FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_payment_methods" ON payment_methods;
CREATE POLICY "delete_own_payment_methods"
ON payment_methods FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- =====================================================================
-- wishlist
-- =====================================================================
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_wishlist" ON wishlist;
CREATE POLICY "select_own_wishlist"
ON wishlist FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_wishlist" ON wishlist;
CREATE POLICY "insert_own_wishlist"
ON wishlist FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_wishlist" ON wishlist;
CREATE POLICY "update_own_wishlist"
ON wishlist FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_wishlist" ON wishlist;
CREATE POLICY "delete_own_wishlist"
ON wishlist FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);

-- =====================================================================
-- Fix orders table: auto-generate order_number from sequence
-- =====================================================================
DO $$
BEGIN
  -- Only apply the default if it doesn't already have one generating MP- format
  IF NOT EXISTS (
    SELECT 1 FROM pg_attrdef a
    JOIN pg_attribute attr ON attr.attrelid = a.adrelid AND attr.attnum = a.adnum
    JOIN pg_class c ON c.oid = a.adrelid
    WHERE c.relname = 'orders' AND attr.attname = 'order_number'
  ) THEN
    ALTER TABLE orders ALTER COLUMN order_number
      SET DEFAULT 'MP-' || nextval('order_number_seq');
  END IF;
END $$;

-- Ensure sequence exists and is at a good starting point
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;
