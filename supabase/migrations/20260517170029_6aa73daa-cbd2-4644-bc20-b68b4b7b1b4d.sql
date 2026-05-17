-- 1. Create a secure system audit log table
CREATE TABLE IF NOT EXISTS public.system_admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id),
    email TEXT,
    action TEXT NOT NULL, -- 'login_attempt', 'trial_extended', 'status_change', 'mfa_enabled', 'mfa_disabled'
    status TEXT NOT NULL, -- 'success', 'denied'
    ip_address TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS: Only the root admin can see these logs
ALTER TABLE public.system_admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Root admin can view system audit logs"
ON public.system_admin_audit_logs
FOR SELECT
USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE lower(email) = 'laurindosilveira@gmail.com')
    AND (auth.jwt() ->> 'aal') = 'aal2'
);

-- 2. Secure function to extend trial with mandatory MFA check
CREATE OR REPLACE FUNCTION public.secure_extend_trial(
    p_church_subscription_id UUID,
    p_days INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_admin_email TEXT;
    v_new_end TIMESTAMP WITH TIME ZONE;
    v_ip TEXT;
BEGIN
    -- Force MFA check
    IF (auth.jwt() ->> 'aal') != 'aal2' THEN
        RAISE EXCEPTION 'MFA_REQUIRED: Esta operacao exige autenticacao em duas etapas ativa.';
    END IF;

    -- Force Email check
    SELECT email INTO v_admin_email FROM auth.users WHERE id = auth.uid();
    IF lower(v_admin_email) != 'laurindosilveira@gmail.com' THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Apenas o administrador raiz pode realizar esta acao.';
    END IF;

    -- Get IP from settings/headers if available (simplified for now)
    v_ip := current_setting('request.headers', true)::jsonb ->> 'x-real-ip';

    -- Calculate new date
    SELECT trial_ends_at + (p_days || ' days')::interval INTO v_new_end
    FROM public.church_subscriptions
    WHERE id = p_church_subscription_id;

    UPDATE public.church_subscriptions
    SET 
        trial_ends_at = COALESCE(v_new_end, now() + (p_days || ' days')::interval),
        subscription_status = 'trial',
        updated_at = now()
    WHERE id = p_church_subscription_id;

    -- Log audit
    INSERT INTO public.system_admin_audit_logs (admin_id, email, action, status, ip_address, details)
    VALUES (auth.uid(), v_admin_email, 'trial_extended', 'success', v_ip, jsonb_build_object('days', p_days, 'sub_id', p_church_subscription_id));

    RETURN jsonb_build_object('success', true, 'new_end', v_new_end);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Log login attempts (to be called from the gate component)
CREATE OR REPLACE FUNCTION public.log_system_access_attempt(p_status TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.system_admin_audit_logs (admin_id, email, action, status, ip_address)
    VALUES (
        auth.uid(), 
        (SELECT email FROM auth.users WHERE id = auth.uid()), 
        'login_attempt', 
        p_status, 
        current_setting('request.headers', true)::jsonb ->> 'x-real-ip'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
