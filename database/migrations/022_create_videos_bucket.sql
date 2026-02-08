-- Phase 27: Create Videos Bucket
-- Sets up Supabase Storage for course videos

-- 1. Create Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies
-- 2. RLS Policies
DROP POLICY IF EXISTS "Public Videos Access" ON storage.objects;
CREATE POLICY "Public Videos Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "Authenticated Users Upload Videos" ON storage.objects;
CREATE POLICY "Authenticated Users Upload Videos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users Update Own Videos" ON storage.objects;
CREATE POLICY "Users Update Own Videos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'videos' 
    AND auth.uid() = owner
);

DROP POLICY IF EXISTS "Users Delete Own Videos" ON storage.objects;
CREATE POLICY "Users Delete Own Videos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'videos' 
    AND auth.uid() = owner
);
