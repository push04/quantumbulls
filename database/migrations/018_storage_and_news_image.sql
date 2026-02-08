-- Phase 23: Image Upload Infrastructure
-- Fixes "Add option of uploading image directly"

-- 1. Add image_url to Market News
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_news' AND column_name = 'image_url') THEN
        ALTER TABLE public.market_news ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 2. Create 'images' Storage Bucket (Idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
-- We need to ensure RLS is enabled on objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read Access
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy: Admin Upload Access
-- Using our public.is_admin() function
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images' AND 
    (auth.role() = 'authenticated') AND
    (public.is_admin())
);

-- Policy: Admin Update/Delete Access
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
CREATE POLICY "Admins can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND public.is_admin());
