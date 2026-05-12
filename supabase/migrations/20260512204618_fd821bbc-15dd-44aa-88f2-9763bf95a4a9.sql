-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('worship-covers', 'worship-covers', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage.objects
-- Allow public access to view covers
CREATE POLICY "Public access to worship covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'worship-covers');

-- Allow authenticated admins/leaders to upload covers
CREATE POLICY "Admins/Leaders can upload worship covers"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'worship-covers' AND
    (EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'lider')
    ))
);

-- Allow authenticated admins/leaders to update covers
CREATE POLICY "Admins/Leaders can update worship covers"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'worship-covers' AND
    (EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'lider')
    ))
);

-- Allow authenticated admins/leaders to delete covers
CREATE POLICY "Admins/Leaders can delete worship covers"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'worship-covers' AND
    (EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'lider')
    ))
);
