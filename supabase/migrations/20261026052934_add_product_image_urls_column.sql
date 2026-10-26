/*
# Add image_urls array column to products

## What this migration does

Adds a new `image_urls` column (text[], nullable) to the `products` table to
support multiple product images per product — a gallery. The existing `image`
text column (primary image) is kept untouched for backwards compatibility and
card/thumbnail display. New gallery images will be stored in `image_urls`.

## New columns

- `products.image_urls` (text[], nullable, default NULL) — array of additional
  image URLs for the product gallery (optional). The first entry, if present,
  can also serve as a fallback when `image` is empty.

## Security

No RLS or grant changes — the products table already has appropriate policies
and grants. The new column is automatically covered by existing SELECT grants
on `products`.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls text[];