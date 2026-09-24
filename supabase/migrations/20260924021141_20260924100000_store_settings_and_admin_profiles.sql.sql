/*
# Add store_settings table and admin read access to profiles

## Overview
1. Creates a `store_settings` table for persistent store configuration
   (delivery fees, contact info, operational toggles) readable by everyone
   and writable only by admins.
2. Adds an admin SELECT policy to the existing `profiles` table so the admin
   dashboard can list all customer profiles. Admins can already read all
   orders; this gives them read access to customer profile data too.

## New Tables

### store_settings
A single-row configuration table for store-wide settings.
- `id` (int, primary key, always 1) — singleton row
- `store_name` (text, not null)
- `store_email` (text, not null)
- `store_phone` (text, not null)
- `store_address` (text, not null)
- `ppb_license` (text, not null)
- `free_delivery_threshold` (integer, not null, default 3000) — KSh
- `delivery_fee` (integer, not null, default 200) — KSh
- `currency` (text, not null, default 'KES')
- `order_notifications` (boolean, default true)
- `low_stock_alerts` (boolean, default true)
- `auto_confirm_orders` (boolean, default false)
- `require_prescription` (boolean, default true)
- `enable_guest_checkout` (boolean, default true)
- `enable_mpesa` (boolean, default true)
- `enable_card` (boolean, default true)
- `enable_cod` (boolean, default true)
- `updated_at` (timestamptz, default now())

## Security
- store_settings SELECT: public (anon + authenticated) — storefront needs to
  read delivery fee / threshold. INSERT/UPDATE/DELETE: admin only.
- profiles: existing owner-scoped SELECT stays; new admin_select_profiles
  policy allows admins to read all profiles.

## Important Notes
1. The table is seeded with one default row (id=1).
2. Admin read on profiles is additive — existing owner-scoped policy is
   untouched, so customers can still only see their own profile.
*/

CREATE TABLE IF NOT EXISTS store_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name text NOT NULL DEFAULT 'Moran Pharmacy',
  store_email text NOT NULL DEFAULT 'info@moranpharmacy.co.ke',
  store_phone text NOT NULL DEFAULT '+254 700 123 456',
  store_address text NOT NULL DEFAULT 'Naivasha Road, Nairobi',
  ppb_license text NOT NULL DEFAULT 'PPB Lic. 123456',
  free_delivery_threshold integer NOT NULL DEFAULT 3000,
  delivery_fee integer NOT NULL DEFAULT 200,
  currency text NOT NULL DEFAULT 'KES',
  order_notifications boolean NOT NULL DEFAULT true,
  low_stock_alerts boolean NOT NULL DEFAULT true,
  auto_confirm_orders boolean NOT NULL DEFAULT false,
  require_prescription boolean NOT NULL DEFAULT true,
  enable_guest_checkout boolean NOT NULL DEFAULT true,
  enable_mpesa boolean NOT NULL DEFAULT true,
  enable_card boolean NOT NULL DEFAULT true,
  enable_cod boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_store_settings" ON store_settings;
CREATE POLICY "public_select_store_settings"
ON store_settings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_store_settings" ON store_settings;
CREATE POLICY "admin_insert_store_settings"
ON store_settings FOR INSERT
TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "admin_update_store_settings" ON store_settings;
CREATE POLICY "admin_update_store_settings"
ON store_settings FOR UPDATE
TO authenticated USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "admin_delete_store_settings" ON store_settings;
CREATE POLICY "admin_delete_store_settings"
ON store_settings FOR DELETE
TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Seed the singleton row
INSERT INTO store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Allow admins to read all profiles
DROP POLICY IF EXISTS "admin_select_profiles" ON profiles;
CREATE POLICY "admin_select_profiles"
ON profiles FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');
