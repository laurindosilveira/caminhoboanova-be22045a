-- Update is_authorized_system_admin to use the table and remove MFA check
CREATE OR REPLACE FUNCTION public.is_authorized_system_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_is_authorized BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.authorized_system_admins asa
        JOIN auth.users au ON lower(au.email) = lower(asa.email)
        WHERE au.id = auth.uid()
          AND asa.is_active = true
    ) INTO v_is_authorized;

    RETURN COALESCE(v_is_authorized, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update is_authorized_system_admin_v2 to use the same logic
CREATE OR REPLACE FUNCTION public.is_authorized_system_admin_v2()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.is_authorized_system_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the table exists (it should, but just in case)
CREATE TABLE IF NOT EXISTS public.authorized_system_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID
);

-- Insert or update the requested user
INSERT INTO public.authorized_system_admins (email, notes, is_active)
VALUES ('laurindosilveira@gmail.com', 'Acesso ao painel do sistema', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;
