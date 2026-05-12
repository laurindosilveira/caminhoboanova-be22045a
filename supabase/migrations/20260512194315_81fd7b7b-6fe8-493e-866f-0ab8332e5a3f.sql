-- Add foreign key relationships from prayer tables to profiles to enable correct data joining in the frontend
-- This allows PostgREST to join prayer_requests with profiles directly using user_id

-- 1. Prayer Requests to Profiles
ALTER TABLE public.prayer_requests DROP CONSTRAINT IF EXISTS prayer_requests_profiles_user_id_fkey;
ALTER TABLE public.prayer_requests
ADD CONSTRAINT prayer_requests_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

-- 2. Prayer Interactions to Profiles
ALTER TABLE public.prayer_interactions DROP CONSTRAINT IF EXISTS prayer_interactions_profiles_user_id_fkey;
ALTER TABLE public.prayer_interactions
ADD CONSTRAINT prayer_interactions_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

-- 3. Prayer Diary to Profiles
ALTER TABLE public.prayer_diary DROP CONSTRAINT IF EXISTS prayer_diary_profiles_user_id_fkey;
ALTER TABLE public.prayer_diary
ADD CONSTRAINT prayer_diary_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

-- Ensure indexes exist for performance (they likely do but let's be sure)
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_id ON public.prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_interactions_user_id ON public.prayer_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_diary_user_id ON public.prayer_diary(user_id);
