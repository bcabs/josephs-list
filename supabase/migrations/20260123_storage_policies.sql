-- Enable RLS on storage.objects (usually enabled by default, but good to ensure)
-- Note: We generally don't want to disable RLS on storage, just add policies.

-- 1. Allow authenticated users to upload files to 'tool-images' bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tool-images'
);

-- 2. Allow public access to view files in 'tool-images' (if bucket isn't set to public)
-- If the bucket is Public in dashboard, this might be redundant for SELECT, but good for safety.
CREATE POLICY "Allow public viewing"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'tool-images'
);

-- 3. Allow users to update/delete their own files (Optional for MVP, but good practice)
CREATE POLICY "Allow individual update/delete"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'tool-images' AND auth.uid() = owner
);
