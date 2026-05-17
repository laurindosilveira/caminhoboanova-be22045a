-- Create table for blocked registration attempts
CREATE TABLE IF NOT EXISTS public.blocked_registration_attempts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID NOT NULL,
    email TEXT,
    full_name TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reason TEXT NOT NULL,
    current_count INTEGER NOT NULL,
    member_limit INTEGER NOT NULL
);

-- Enable RLS
ALTER TABLE public.blocked_registration_attempts ENABLE ROW LEVEL SECURITY;

-- Allow system admins to view logs
CREATE POLICY "System admins can view blocked registration logs" 
ON public.blocked_registration_attempts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.authorized_system_admins 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Function to log blocked attempt
CREATE OR REPLACE FUNCTION public.log_blocked_registration(
    p_church_id UUID, 
    p_email TEXT, 
    p_full_name TEXT, 
    p_reason TEXT,
    p_current_count INTEGER,
    p_limit INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.blocked_registration_attempts (church_id, email, full_name, reason, current_count, member_limit)
    VALUES (p_church_id, p_email, p_full_name, p_reason, p_current_count, p_limit);
END;
$$;

-- Add columns to church_subscriptions to track threshold alerts
ALTER TABLE public.church_subscriptions 
ADD COLUMN IF NOT EXISTS last_threshold_alert_pct INTEGER DEFAULT 0;
