-- Tabela de auditoria para webhooks do Stripe
CREATE TABLE IF NOT EXISTS public.stripe_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    church_subscription_id UUID REFERENCES public.church_subscriptions(id),
    status TEXT DEFAULT 'processed', -- processed, failed, duplicate
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.stripe_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Apenas super admins (autorizados) podem ver logs
CREATE POLICY "Super admins can view webhook logs" 
ON public.stripe_webhook_logs 
FOR SELECT 
USING (public.is_authorized_system_admin());

-- Coluna para idempotência em church_subscriptions
ALTER TABLE public.church_subscriptions 
ADD COLUMN IF NOT EXISTS last_webhook_event_id TEXT;

-- Garantir que as tabelas de church tenham RLS adequado para admins da igreja
-- church_subscriptions: admin da igreja pode ver seu próprio plano
CREATE POLICY "Admins can view their church subscription"
ON public.church_subscriptions
FOR SELECT
USING (church_id = public.get_auth_church_id() OR public.is_authorized_system_admin());
