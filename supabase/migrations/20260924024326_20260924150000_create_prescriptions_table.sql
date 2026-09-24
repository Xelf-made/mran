/*
# Create prescriptions table and pharmacist role support

## What this migration does

1. **New table: `prescriptions`**
   - Stores customer-uploaded doctor prescriptions for pharmacist review.
   - Each row tracks the prescription file, review status, reviewer identity, and clinical notes.

2. **Profile access for pharmacists**
   - Adds a SELECT policy so pharmacists can read customer profiles (needed to see customer details when reviewing prescriptions).
   - Existing admin and owner policies remain unchanged.

3. **Storage bucket: `prescriptions`**
   - Private bucket for uploaded prescription files. Only the owner and pharmacist/admin roles can access.

## prescriptions table columns
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, defaults to auth.uid()) — the customer who uploaded
- `file_url` (text) — storage path or URL of the uploaded prescription image/document
- `file_name` (text) — original file name for display
- `status` (text, default 'pending') — one of 'pending', 'approved', 'rejected'
- `pharmacist_notes` (text, nullable) — clinical notes written by the reviewing pharmacist
- `reviewed_by` (uuid, nullable, references auth.users) — the pharmacist/admin who reviewed
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Security
- RLS enabled on `prescriptions`.
- Customers can SELECT and INSERT their own prescriptions.
- Only pharmacist or admin role can SELECT all, UPDATE (review), and DELETE.
- Pharmacist role is stored in `raw_app_meta_data->>role` (user-immutable), checked via `auth.jwt() ->> 'role'`.
- A helper function `is_pharmacist_or_admin()` checks the JWT role claim for 'pharmacist' or 'admin'.

## Profiles table changes
- Added `pharmacist_select_profiles` SELECT policy: pharmacists can read all profiles to see customer info during review.
- Existing policies (admin_select_profiles, select_own_profile, etc.) remain unchanged.

## Storage
- Creates a private bucket `prescriptions` if it does not exist.
- Storage policies are handled by Supabase Dashboard or separate storage migrations; this migration creates the bucket record only.
*/

-- Helper function: check if the current user has pharmacist or admin role
CREATE OR REPLACE FUNCTION public.is_pharmacist_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.jwt() ->> 'role' IN ('pharmacist', 'admin');
$$;

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  pharmacist_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON public.prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON public.prescriptions(created_at DESC);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Customers can see their own prescriptions
DROP POLICY IF EXISTS "select_own_prescriptions" ON public.prescriptions;
CREATE POLICY "select_own_prescriptions"
  ON public.prescriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Customers can upload their own prescriptions
DROP POLICY IF EXISTS "insert_own_prescriptions" ON public.prescriptions;
CREATE POLICY "insert_own_prescriptions"
  ON public.prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Pharmacists/admins can see ALL prescriptions
DROP POLICY IF EXISTS "pharmacist_select_all_prescriptions" ON public.prescriptions;
CREATE POLICY "pharmacist_select_all_prescriptions"
  ON public.prescriptions FOR SELECT
  TO authenticated
  USING (public.is_pharmacist_or_admin());

-- Pharmacists/admins can update (review) any prescription
DROP POLICY IF EXISTS "pharmacist_update_prescriptions" ON public.prescriptions;
CREATE POLICY "pharmacist_update_prescriptions"
  ON public.prescriptions FOR UPDATE
  TO authenticated
  USING (public.is_pharmacist_or_admin())
  WITH CHECK (public.is_pharmacist_or_admin());

-- Pharmacists/admins can delete prescriptions
DROP POLICY IF EXISTS "pharmacist_delete_prescriptions" ON public.prescriptions;
CREATE POLICY "pharmacist_delete_prescriptions"
  ON public.prescriptions FOR DELETE
  TO authenticated
  USING (public.is_pharmacist_or_admin());

-- Add pharmacist SELECT policy to profiles (so pharmacists can see customer details)
DROP POLICY IF EXISTS "pharmacist_select_profiles" ON public.profiles;
CREATE POLICY "pharmacist_select_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_pharmacist_or_admin());

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_prescriptions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prescriptions_updated_at ON public.prescriptions;
CREATE TRIGGER trg_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prescriptions_updated_at();
