-- Create plan_history table
CREATE TABLE IF NOT EXISTS public.plan_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id),
    previous_plan TEXT,
    new_plan TEXT,
    previous_limit INTEGER,
    new_limit INTEGER,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT
);

-- Enable RLS
ALTER TABLE public.plan_history ENABLE ROW LEVEL SECURITY;

-- Create policy for system admins and church admins
CREATE POLICY "System admins can view all plan history" 
ON public.plan_history FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'admin'
    )
);

-- Function to handle plan change logging
CREATE OR REPLACE FUNCTION public.log_plan_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.recommended_plan IS DISTINCT FROM NEW.recommended_plan) OR 
       (OLD.member_limit IS DISTINCT FROM NEW.member_limit) OR
       (OLD.subscription_status IS DISTINCT FROM NEW.subscription_status) THEN
        INSERT INTO public.plan_history (
            church_id,
            changed_by,
            previous_plan,
            new_plan,
            previous_limit,
            new_limit,
            notes
        ) VALUES (
            NEW.church_id,
            auth.uid(),
            OLD.recommended_plan,
            NEW.recommended_plan,
            OLD.member_limit,
            NEW.member_limit,
            'Alteração de plano detectada via sistema/admin'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for logging plan changes
DROP TRIGGER IF EXISTS tr_log_plan_change ON public.church_subscriptions;
CREATE TRIGGER tr_log_plan_change
AFTER UPDATE ON public.church_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.log_plan_change();