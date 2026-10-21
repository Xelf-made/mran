/*
# Create product-images storage bucket

1. Storage
- Create a public bucket named `product-images` for admin product image uploads.
- Public bucket so product images are readable by all visitors (anon + authenticated).
2. Security
- INSERT/UPDATE/DELETE: restricted to authenticated users (admin uploads images).
- SELECT: public (anyone can view product images).
3. Notes
- The bucket is public so getPublicUrl() returns a directly-accessible URL.
- Only authenticated users can upload, update, or delete files.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "product_images_select_public" ON storage.objects;
CREATE POLICY "product_images_select_public" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_insert_auth" ON storage.objects;
CREATE POLICY "product_images_insert_auth" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_update_auth" ON storage.objects;
CREATE POLICY "product_images_update_auth" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_delete_auth" ON storage.objects;
CREATE POLICY "product_images_delete_auth" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');
