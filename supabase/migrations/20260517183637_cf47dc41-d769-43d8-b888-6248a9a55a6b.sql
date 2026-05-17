-- Table for frontend error logging
CREATE TABLE public.frontend_error_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID,
    user_id UUID,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    component_stack TEXT,
    url TEXT,
    user_agent TEXT,
    severity TEXT DEFAULT 'error',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for error logs
ALTER TABLE public.frontend_error_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert error logs (so we can track them)
CREATE POLICY "Users can insert their own error logs" 
ON public.frontend_error_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Only system admins can view error logs
CREATE POLICY "System admins can view all error logs" 
ON public.frontend_error_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.authorized_system_admins 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Function to check member limits
CREATE OR REPLACE FUNCTION public.check_church_member_limit(p_church_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_count INTEGER;
    v_limit INTEGER;
BEGIN
    -- Get current count
    SELECT COUNT(*) INTO v_current_count
    FROM public.profiles
    WHERE church_id = p_church_id;

    -- Get limit from subscription
    SELECT member_limit INTO v_limit
    FROM public.church_subscriptions
    WHERE church_id = p_church_id
    LIMIT 1;

    -- If no limit set (e.g. pastoral plan), return true
    IF v_limit IS NULL THEN
        RETURN TRUE;
    END IF;

    RETURN v_current_count < v_limit;
END;
$$;

-- Ensure RLS on churches table allows admins to update their own branding
CREATE POLICY "Admins can update their own church branding" 
ON public.churches 
FOR UPDATE 
USING (
  id IN (
    SELECT church_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
