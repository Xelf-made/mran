/*
# Add storage policies for the prescriptions bucket

## What this migration does

The `prescriptions` storage bucket was created earlier but has no storage
object policies, meaning neither customers nor pharmacists can read or write
prescription files through the Supabase Storage API. The pharmacist portal
fetches prescription rows from the database (RLS is already set up on the
`prescriptions` table), but the document preview loads files from
`/storage/v1/object/public/prescriptions/<path>` — which fails without
storage SELECT policies.

## Policies added (storage.objects)

1. `prescriptions_owner_select` — SELECT: a user can read their own prescription files (files under a folder equal to their auth.uid()).
2. `prescriptions_pharmacist_select` — SELECT: pharmacist or admin role can read ALL prescription files (needed to review documents).
3. `prescriptions_owner_insert` — INSERT: a user can upload files to their own folder only.
4. `prescriptions_owner_update` — UPDATE: a user can update their own files.
5. `prescriptions_pharmacist_update` — UPDATE: pharmacist or admin can update any prescription file.

## Security

- Customers can only access their own files (folder prefix = their user id).
- Pharmacists/admins (checked via the `is_pharmacist_or_admin()` helper) can read and manage all prescription files.
- The bucket remains private — no public/anon access.
- Uses the existing `public.is_pharmacist_or_admin()` SECURITY DEFINER function.
*/

-- Customers can read their own prescription files (path = "<userId>/...")
DROP POLICY IF EXISTS "prescriptions_owner_select" ON storage.objects;
CREATE POLICY "prescriptions_owner_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'prescriptions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Pharmacists/admins can read ALL prescription files
DROP POLICY IF EXISTS "prescriptions_pharmacist_select" ON storage.objects;
CREATE POLICY "prescriptions_pharmacist_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'prescriptions'
    AND public.is_pharmacist_or_admin()
  );

-- Customers can upload to their own folder only
DROP POLICY IF EXISTS "prescriptions_owner_insert" ON storage.objects;
CREATE POLICY "prescriptions_owner_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'prescriptions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Customers can update their own files
DROP POLICY IF EXISTS "prescriptions_owner_update" ON storage.objects;
CREATE POLICY "prescriptions_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'prescriptions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'prescriptions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Pharmacists/admins can update any prescription file
DROP POLICY IF EXISTS "prescriptions_pharmacist_update" ON storage.objects;
CREATE POLICY "prescriptions_pharmacist_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'prescriptions'
    AND public.is_pharmacist_or_admin()
  )
  WITH CHECK (
    bucket_id = 'prescriptions'
    AND public.is_pharmacist_or_admin()
  );