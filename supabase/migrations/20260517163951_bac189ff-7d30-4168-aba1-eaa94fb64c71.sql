-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.church_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- e.g., 'trial_alert_shown', 'portal_opened', 'subscription_cancelled', 'alert_snoozed'
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.church_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view their own church logs
CREATE POLICY "Admins can view their own church audit logs"
ON public.church_audit_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
        AND church_id = public.church_audit_logs.church_id
    )
);

-- Add snooze column to subscriptions
ALTER TABLE public.church_subscriptions 
ADD COLUMN IF NOT EXISTS trial_alert_snoozed_until TIMESTAMP WITH TIME ZONE;

-- RPC to log audit events from frontend
CREATE OR REPLACE FUNCTION public.log_church_audit(p_church_id UUID, p_action TEXT, p_details JSONB DEFAULT '{}'::jsonb)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.church_audit_logs (church_id, action, details)
    VALUES (p_church_id, p_action, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
