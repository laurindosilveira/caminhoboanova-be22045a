-- Create a table for login audit logs
CREATE TABLE IF NOT EXISTS public.login_audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT,
    method TEXT NOT NULL, -- 'password', 'passkey'
    status TEXT NOT NULL, -- 'success', 'failure', 'cancelled'
    church_id UUID REFERENCES public.churches(id),
    ip_address TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow system/functions to insert (or users to insert their own logs)
-- Since login is pre-auth, we need to allow anonymous inserts for this specific table
-- but only via the function or with limited scope.
CREATE POLICY "Anyone can insert login logs" ON public.login_audit_logs FOR INSERT WITH CHECK (true);

-- Admins can view all login logs
CREATE POLICY "Admins can view all login logs" ON public.login_audit_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin')
  )
);

-- Create function to log login attempt
CREATE OR REPLACE FUNCTION public.log_login_event(
    p_email TEXT,
    p_method TEXT,
    p_status TEXT,
    p_church_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.login_audit_logs (email, method, status, church_id, details, ip_address)
    VALUES (
        p_email,
        p_method,
        p_status,
        p_church_id,
        p_details,
        current_setting('request.headers', true)::jsonb ->> 'x-real-ip'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
