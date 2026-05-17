-- Drop if exists to avoid parameter/return type mismatch
DROP FUNCTION IF EXISTS public.secure_extend_trial(uuid,integer);
DROP FUNCTION IF EXISTS public.test_stripe_webhook(uuid,text,text);
DROP FUNCTION IF EXISTS public.log_church_audit(uuid,text,jsonb);

-- Create audit logs table for churches
CREATE TABLE IF NOT EXISTS public.church_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on audit logs
ALTER TABLE public.church_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for church admins to see their own logs
DROP POLICY IF EXISTS "Church admins can view their own church audit logs" ON public.church_audit_logs;
CREATE POLICY "Church admins can view their own church audit logs"
ON public.church_audit_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.church_id = church_audit_logs.church_id
        AND profiles.role = 'admin'
    )
    OR
    EXISTS (
        SELECT 1 FROM public.authorized_system_admins
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
);

-- Ensure church_subscriptions has idempotency field
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'church_subscriptions' AND column_name = 'last_webhook_event_id') THEN
        ALTER TABLE public.church_subscriptions ADD COLUMN last_webhook_event_id TEXT;
    END IF;
END $$;

-- Create function to log church audit securely
CREATE OR REPLACE FUNCTION public.log_church_audit(
    p_church_id UUID,
    p_action TEXT,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.church_audit_logs (church_id, action, details, actor_id)
    VALUES (p_church_id, p_action, p_details, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure function to extend trial
CREATE OR REPLACE FUNCTION public.secure_extend_trial(
    p_church_subscription_id UUID,
    p_days INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_admin_email TEXT;
    v_new_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if caller is authorized system admin
    SELECT email INTO v_admin_email FROM auth.users WHERE id = auth.uid();
    
    IF NOT EXISTS (SELECT 1 FROM public.authorized_system_admins WHERE email = v_admin_email) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Calculate new date
    SELECT COALESCE(trial_ends_at, now()) + (p_days || ' days')::interval INTO v_new_date
    FROM public.church_subscriptions
    WHERE id = p_church_subscription_id;

    -- Update subscription
    UPDATE public.church_subscriptions
    SET trial_ends_at = v_new_date,
        subscription_status = 'trial',
        updated_at = now()
    WHERE id = p_church_subscription_id;

    -- Log audit
    INSERT INTO public.system_admin_audit_logs (admin_email, action, details)
    VALUES (v_admin_email, 'extend_trial', jsonb_build_object('id', p_church_subscription_id, 'days', p_days, 'new_date', v_new_date));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for simulation of webhook events (for testing)
CREATE OR REPLACE FUNCTION public.test_stripe_webhook(
    p_church_subscription_id UUID,
    p_event_type TEXT,
    p_stripe_status TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_admin_email TEXT;
BEGIN
    -- Check if caller is authorized system admin
    SELECT email INTO v_admin_email FROM auth.users WHERE id = auth.uid();
    
    IF NOT EXISTS (SELECT 1 FROM public.authorized_system_admins WHERE email = v_admin_email) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Update status directly for testing
    UPDATE public.church_subscriptions
    SET subscription_status = p_stripe_status,
        updated_at = now()
    WHERE id = p_church_subscription_id;

    -- Log simulation
    INSERT INTO public.stripe_webhook_logs (event_id, event_type, status, church_subscription_id, payload)
    VALUES ('test_' || gen_random_uuid(), p_event_type, 'processed', p_church_subscription_id, jsonb_build_object('simulated', true, 'status', p_stripe_status));

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
