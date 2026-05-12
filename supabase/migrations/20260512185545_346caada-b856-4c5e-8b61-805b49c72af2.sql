-- Add role to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role public.app_role DEFAULT 'user';

-- Sync current roles
UPDATE public.profiles p
SET role = ur.role
FROM public.user_roles ur
WHERE p.user_id = ur.user_id;

-- Sync function
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET role = NEW.role
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_user_role ON public.user_roles;
CREATE TRIGGER tr_sync_user_role
AFTER INSERT OR UPDATE OF role ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_role();

-- Add community to prayer_requests
ALTER TABLE public.prayer_requests ADD COLUMN IF NOT EXISTS community TEXT;

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification status"
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Prayer Diary table
CREATE TABLE IF NOT EXISTS public.prayer_diary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.prayer_requests(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    response TEXT,
    answered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    area TEXT,
    turma_id UUID
);

ALTER TABLE public.prayer_diary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own diary"
ON public.prayer_diary FOR ALL USING (auth.uid() = user_id);

-- Updated Policies for Prayer Requests
DROP POLICY IF EXISTS "Users can view prayer requests from their community" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can insert prayer requests in their community" ON public.prayer_requests;
DROP POLICY IF EXISTS "Admins can delete prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can delete their own prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Liders can delete prayer requests in their area" ON public.prayer_requests;
DROP POLICY IF EXISTS "Prayer requests visibility" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users/Leaders can update requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users/Leaders can delete requests" ON public.prayer_requests;

CREATE POLICY "Prayer requests visibility"
ON public.prayer_requests FOR SELECT
USING (
    auth.uid() = user_id OR
    (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND (
                p.role IN ('admin', 'lider') OR
                (visibility IN ('public', 'anonymous'))
            )
            AND (
                p.community::text = prayer_requests.community OR 
                p.area::text = prayer_requests.area OR 
                p.turma_id = prayer_requests.turma_id
            )
        )
    )
);

CREATE POLICY "Users can create requests"
ON public.prayer_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users/Leaders can update requests"
ON public.prayer_requests FOR UPDATE
USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'lider'))
);

CREATE POLICY "Users/Leaders can delete requests"
ON public.prayer_requests FOR DELETE
USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'lider'))
);

-- Triggers
CREATE OR REPLACE FUNCTION public.on_prayer_interaction()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    prayer_content TEXT;
BEGIN
    SELECT user_id, content INTO target_user_id, prayer_content FROM public.prayer_requests WHERE id = NEW.request_id;
    IF target_user_id IS NOT NULL AND target_user_id != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (target_user_id, 'Alguém orou por você!', 'Um irmão começou a interceder pelo seu pedido: "' || LEFT(prayer_content, 30) || '..."', 'prayer_interaction', '/comunidade');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_prayer_interaction ON public.prayer_interactions;
CREATE TRIGGER tr_on_prayer_interaction AFTER INSERT ON public.prayer_interactions FOR EACH ROW EXECUTE FUNCTION public.on_prayer_interaction();

CREATE OR REPLACE FUNCTION public.on_prayer_answered()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'answered' AND (OLD.status IS NULL OR OLD.status != 'answered') THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (NEW.user_id, 'Pedido respondido!', 'Seu pedido de oração foi marcado como respondido. Glória a Deus!', 'prayer_answered', '/comunidade');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_prayer_answered ON public.prayer_requests;
CREATE TRIGGER tr_on_prayer_answered AFTER UPDATE ON public.prayer_requests FOR EACH ROW EXECUTE FUNCTION public.on_prayer_answered();
