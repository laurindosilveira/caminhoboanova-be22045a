-- Adiciona pastor_email para linkar com auth.users no webhook
ALTER TABLE public.church_subscriptions 
ADD COLUMN IF NOT EXISTS pastor_email TEXT;

-- Índice para busca rápida por email (usado no webhook e provisionamento)
CREATE INDEX IF NOT EXISTS idx_church_subscriptions_pastor_email ON public.church_subscriptions(pastor_email);

-- Coluna para desativação manual rápida se necessário
ALTER TABLE public.church_subscriptions 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
