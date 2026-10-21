/*
# Fix schema: add missing store_settings columns and create wishlist, addresses, payment_methods tables

## Problem
The `store_settings` table only had `id` and `updated_at` — all config columns the frontend
queries (store_name, free_delivery_threshold, etc.) were missing, causing 400 Bad Request errors.
The `wishlist`, `addresses`, and `payment_methods` tables did not exist at all, causing 400
errors on every account page that touches those features.

## Changes

### 1. store_settings — add missing columns
Adds all columns the StoreSettings TypeScript interface expects:
- store_name, store_email, store_phone, store_address, ppb_license (text)
- free_delivery_threshold, delivery_fee (numeric with defaults)
- currency (text, default 'KSh')
- order_notifications, low_stock_alerts, auto_confirm_orders, require_prescription,
  enable_guest_checkout, enable_mpesa, enable_card, enable_cod (boolean defaults)

The existing row (id=1) is updated with sensible defaults so the frontend gets valid data
immediately.

### 2. wishlist table (new)
- id (uuid PK)
- user_id (uuid, defaults to auth.uid(), FK to auth.users)
- product_id (uuid, FK to products)
- created_at (timestamptz)
- Unique constraint on (user_id, product_id) to prevent duplicate wishlist entries

### 3. addresses table (new)
- id (uuid PK)
- user_id (uuid, defaults to auth.uid(), FK to auth.users)
- label, name, phone, line1, area, city (text)
- is_default (boolean, default false)
- created_at (timestamptz)

### 4. payment_methods table (new)
- id (uuid PK)
- user_id (uuid, defaults to auth.uid(), FK to auth.users)
- type (text, check in 'mpesa', 'card')
- label, detail (text)
- is_default (boolean, default false)
- created_at (timestamptz)

### 5. RLS policies
- store_settings: public read, authenticated update (admin-only in practice via app logic)
- wishlist: owner-scoped CRUD (authenticated, auth.uid() = user_id)
- addresses: owner-scoped CRUD (authenticated, auth.uid() = user_id)
- payment_methods: owner-scoped CRUD (authenticated, auth.uid() = user_id)

All user-scoped tables use DEFAULT auth.uid() so inserts that omit user_id still satisfy
the WITH CHECK policy.
*/

-- ===== 1. store_settings: add missing columns =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'store_name') THEN
    ALTER TABLE store_settings ADD COLUMN store_name text NOT NULL DEFAULT 'Moran Pharmacy';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'store_email') THEN
    ALTER TABLE store_settings ADD COLUMN store_email text NOT NULL DEFAULT 'hello@moranpharmacy.co.ke';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'store_phone') THEN
    ALTER TABLE store_settings ADD COLUMN store_phone text NOT NULL DEFAULT '+254 700 123 456';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'store_address') THEN
    ALTER TABLE store_settings ADD COLUMN store_address text NOT NULL DEFAULT 'Moi Avenue, I&M Bank Building, Nairobi';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'ppb_license') THEN
    ALTER TABLE store_settings ADD COLUMN ppb_license text NOT NULL DEFAULT 'PPB-LIC-123456';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'free_delivery_threshold') THEN
    ALTER TABLE store_settings ADD COLUMN free_delivery_threshold numeric NOT NULL DEFAULT 3000;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'delivery_fee') THEN
    ALTER TABLE store_settings ADD COLUMN delivery_fee numeric NOT NULL DEFAULT 200;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'currency') THEN
    ALTER TABLE store_settings ADD COLUMN currency text NOT NULL DEFAULT 'KSh';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'order_notifications') THEN
    ALTER TABLE store_settings ADD COLUMN order_notifications boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'low_stock_alerts') THEN
    ALTER TABLE store_settings ADD COLUMN low_stock_alerts boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'auto_confirm_orders') THEN
    ALTER TABLE store_settings ADD COLUMN auto_confirm_orders boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'require_prescription') THEN
    ALTER TABLE store_settings ADD COLUMN require_prescription boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'enable_guest_checkout') THEN
    ALTER TABLE store_settings ADD COLUMN enable_guest_checkout boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'enable_mpesa') THEN
    ALTER TABLE store_settings ADD COLUMN enable_mpesa boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'enable_card') THEN
    ALTER TABLE store_settings ADD COLUMN enable_card boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'enable_cod') THEN
    ALTER TABLE store_settings ADD COLUMN enable_cod boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- store_settings already has RLS enabled; add policies
DROP POLICY IF EXISTS "public_read_store_settings" ON store_settings;
CREATE POLICY "public_read_store_settings"
  ON store_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated_update_store_settings" ON store_settings;
CREATE POLICY "authenticated_update_store_settings"
  ON store_settings FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_insert_store_settings" ON store_settings;
CREATE POLICY "authenticated_insert_store_settings"
  ON store_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ===== 2. wishlist table =====
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
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

DROP POLICY IF EXISTS "delete_own_wishlist" ON wishlist;
CREATE POLICY "delete_own_wishlist"
  ON wishlist FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== 3. addresses table =====
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
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

-- ===== 4. payment_methods table =====
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('mpesa', 'card')),
  label text NOT NULL,
  detail text NOT NULL DEFAULT '',
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

-- ===== Indexes =====
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
