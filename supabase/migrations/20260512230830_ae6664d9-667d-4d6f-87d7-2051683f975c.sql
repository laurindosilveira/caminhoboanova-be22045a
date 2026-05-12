-- 1. Create the churches table
CREATE TABLE IF NOT EXISTS public.churches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#1F3C88',
    secondary_color TEXT DEFAULT '#E8880A',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Churches are viewable by everyone') THEN
        CREATE POLICY "Churches are viewable by everyone" ON public.churches FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- 2. Create the "Standard Church"
INSERT INTO public.churches (name, slug) 
VALUES ('Igreja Boa Nova', 'boa-nova')
ON CONFLICT (slug) DO NOTHING;

-- 3. Add church_id and migrate main tables
DO $$
DECLARE
    default_church_id UUID;
BEGIN
    SELECT id INTO default_church_id FROM public.churches WHERE slug = 'boa-nova' LIMIT 1;

    -- Profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'church_id') THEN
        ALTER TABLE public.profiles ADD COLUMN church_id UUID REFERENCES public.churches(id);
    END IF;
    UPDATE public.profiles SET church_id = default_church_id WHERE church_id IS NULL;

    -- Communities
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communities' AND column_name = 'church_id') THEN
        ALTER TABLE public.communities ADD COLUMN church_id UUID REFERENCES public.churches(id);
    END IF;
    UPDATE public.communities SET church_id = default_church_id WHERE church_id IS NULL;

    -- Areas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'areas' AND column_name = 'church_id') THEN
        ALTER TABLE public.areas ADD COLUMN church_id UUID REFERENCES public.churches(id);
    END IF;
    UPDATE public.areas SET church_id = default_church_id WHERE church_id IS NULL;

    -- Courses
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'church_id') THEN
        ALTER TABLE public.courses ADD COLUMN church_id UUID REFERENCES public.churches(id);
    END IF;
    UPDATE public.courses SET church_id = default_church_id WHERE church_id IS NULL;
    
    -- Messages
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'church_id') THEN
        ALTER TABLE public.messages ADD COLUMN church_id UUID REFERENCES public.churches(id);
    END IF;
    UPDATE public.messages SET church_id = default_church_id WHERE church_id IS NULL;

    -- user_roles (Super Admin)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'is_super_admin') THEN
        ALTER TABLE public.user_roles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 4. Multi-church isolation via RLS
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by same church members" 
ON public.profiles FOR SELECT 
USING (church_id = (SELECT church_id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Communities are viewable by everyone" ON public.communities;
CREATE POLICY "Communities are viewable by church" 
ON public.communities FOR SELECT 
USING (church_id = (SELECT church_id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Areas are viewable by everyone" ON public.areas;
CREATE POLICY "Areas are viewable by church" 
ON public.areas FOR SELECT 
USING (church_id = (SELECT church_id FROM public.profiles WHERE user_id = auth.uid()));

-- 5. Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_churches_updated_at ON public.churches;
CREATE TRIGGER update_churches_updated_at
BEFORE UPDATE ON public.churches
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();