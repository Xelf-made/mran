-- Add store_hours and mpesa_shortcode to store_settings
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS store_hours text DEFAULT 'Mon–Sun, 24/7';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS mpesa_shortcode text;
