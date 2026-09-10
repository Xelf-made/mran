/*
# Create orders table and admin role support for Moran Pharmacy

## Overview
Adds a multi-tenant `orders` table so signed-in customers can place and track orders,
and establishes an admin role via `raw_app_meta_data` so admin users can view and
update ALL orders (not just their own).

## New Tables

### orders
- `id` (uuid, primary key) — unique order identifier
- `user_id` (uuid, not null, defaults to auth.uid()) — the customer who placed the order
- `order_number` (text, unique) — human-readable order number (e.g. MP-1001)
- `status` (text, not null, default 'pending') — order status: pending, confirmed, packed, dispatched, delivered, cancelled
- `total` (integer, not null) — order total in KSh (including delivery)
- `delivery_fee` (integer, not null, default 0) — delivery fee in KSh
- `payment_method` (text, not null) — mpesa, card, or cod
- `items` (jsonb, not null) — array of cart line items at time of order
- `delivery_name` (text, not null) — recipient full name
- `delivery_phone` (text, not null) — recipient phone
- `delivery_address` (text, not null) — delivery address
- `delivery_area` (text, not null) — area/landmark in Nairobi
- `notes` (text) — optional customer notes
- `tracking_history` (jsonb, default '[]') — array of {status, timestamp} entries
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Security

### RLS on orders
- **SELECT**: Customers can read only their own orders. Admins (raw_app_meta_data.role = 'admin') can read ALL orders.
- **INSERT**: Authenticated customers can insert their own orders only.
- **UPDATE**: Admins can update any order (to change status / add tracking). Customers cannot update orders after placing them.
- **DELETE**: No deletes (orders are immutable for data integrity).

### Admin role detection
Uses `auth.jwt() ->> 'role'` which reads from `raw_app_meta_data.role` — this is set
server-side and is NOT user-editable, unlike `raw_user_meta_data`.

## Important Notes
1. The `user_id` column defaults to `auth.uid()` so inserts from the frontend that omit
   user_id will still satisfy the INSERT WITH CHECK policy.
2. Admins are identified by their JWT app metadata role, set via the Supabase dashboard
   or a service-role script — not by a user-editable column.
3. A serial order_number is generated via a sequence for readability.
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total integer NOT NULL,
  delivery_fee integer NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  items jsonb NOT NULL,
  delivery_name text NOT NULL,
  delivery_phone text NOT NULL,
  delivery_address text NOT NULL,
  delivery_area text NOT NULL,
  notes text,
  tracking_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
-- Reads from raw_app_meta_data.role (user-immutable JWT claim)
-- DROP IF EXISTS first for idempotency
DROP POLICY IF EXISTS "select_orders" ON orders;
CREATE POLICY "select_orders"
ON orders FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR auth.jwt() ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders"
ON orders FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Index for customer order lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Sequence for human-readable order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;
