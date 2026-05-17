-- Permitir que membros leiam os dados da igreja deles
CREATE POLICY "Users can view their own church" 
ON public.churches 
FOR SELECT 
USING (
  id IN (
    SELECT church_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Criar função para facilitar o log de auditoria
CREATE OR REPLACE FUNCTION public.log_church_audit(p_church_id UUID, p_action TEXT, p_details JSONB DEFAULT '{}'::jsonb)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.church_audit_logs (church_id, action, details, created_at)
  VALUES (p_church_id, p_action, p_details, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que usuários possam ver os logs da sua igreja
CREATE POLICY "Users can view their church audit logs" 
ON public.church_audit_logs 
FOR SELECT 
USING (
  church_id IN (
    SELECT church_id FROM public.profiles WHERE user_id = auth.uid()
  )
);