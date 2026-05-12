-- Create worship_songs table
CREATE TABLE public.worship_songs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    url TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('youtube', 'spotify', 'other')),
    theme TEXT,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key to devotional_content
ALTER TABLE public.devotional_content ADD COLUMN IF NOT EXISTS worship_song_id UUID REFERENCES public.worship_songs(id);

-- Enable RLS
ALTER TABLE public.worship_songs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Worship songs are viewable by everyone" 
ON public.worship_songs FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage worship songs" 
ON public.worship_songs FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_worship_songs_updated_at
BEFORE UPDATE ON public.worship_songs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
