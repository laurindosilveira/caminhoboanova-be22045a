-- Create junction table for multiple songs per devotional
CREATE TABLE IF NOT EXISTS public.devotional_worship_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devotional_id UUID NOT NULL REFERENCES public.devotional_content(activity_id) ON DELETE CASCADE,
    worship_song_id UUID NOT NULL REFERENCES public.worship_songs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(devotional_id, worship_song_id)
);

-- Enable RLS
ALTER TABLE public.devotional_worship_songs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for devotional_worship_songs"
ON public.devotional_worship_songs FOR SELECT
USING (true);

CREATE POLICY "Admin full access for devotional_worship_songs"
ON public.devotional_worship_songs FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'lider')
));

-- Migrate existing data
INSERT INTO public.devotional_worship_songs (devotional_id, worship_song_id)
SELECT activity_id, worship_song_id
FROM public.devotional_content
WHERE worship_song_id IS NOT NULL
ON CONFLICT DO NOTHING;
