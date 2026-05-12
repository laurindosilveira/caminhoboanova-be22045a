-- Add missing enrollment_status column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrollment_status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrollment_status_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrollment_status_updated_by UUID REFERENCES auth.users(id);

-- Add index for enrollment_status
CREATE INDEX IF NOT EXISTS idx_profiles_enrollment_status ON public.profiles(enrollment_status);
