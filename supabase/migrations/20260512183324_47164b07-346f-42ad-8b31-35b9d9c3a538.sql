-- DROP legacy table
DROP TABLE IF EXISTS public.prayer_requests CASCADE;

-- Create prayer requests table
CREATE TABLE public.prayer_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    area TEXT NOT NULL,
    turma_id UUID REFERENCES public.turmas(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'leaders_only', 'anonymous')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'archived')),
    is_sensitive BOOLEAN DEFAULT false,
    prayers_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prayer interactions table
CREATE TABLE public.prayer_interactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, request_id)
);

-- Enable RLS
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_interactions ENABLE ROW LEVEL SECURITY;

-- Policies for prayer_requests

-- 1. Users can view their own requests
CREATE POLICY "Users can view their own prayer requests"
ON public.prayer_requests FOR SELECT
USING (auth.uid() = user_id);

-- 2. Leaders and Admins can view all requests in their area
CREATE POLICY "Leaders can view all prayer requests in their area"
ON public.prayer_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    JOIN public.profiles ON profiles.user_id = public.user_roles.user_id
    WHERE public.user_roles.user_id = auth.uid()
    AND (public.user_roles.role::text = 'admin' OR public.user_roles.role::text = 'lider')
    AND profiles.area::text = prayer_requests.area
  )
);

-- 3. Students can view public or anonymous requests from their own turma
CREATE POLICY "Students can view public/anonymous requests in their turma"
ON public.prayer_requests FOR SELECT
USING (
  visibility IN ('public', 'anonymous')
  AND status != 'archived'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.turma_id = prayer_requests.turma_id
  )
);

-- 4. Users can create their own requests
CREATE POLICY "Users can create their own prayer requests"
ON public.prayer_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Users can update their own requests (mark as answered/archived)
CREATE POLICY "Users can update their own prayer requests"
ON public.prayer_requests FOR UPDATE
USING (auth.uid() = user_id);

-- Policies for prayer_interactions

CREATE POLICY "Users can view interactions for visible requests"
ON public.prayer_interactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.prayer_requests
    WHERE prayer_requests.id = prayer_interactions.request_id
  )
);

CREATE POLICY "Users can create their own prayer interactions"
ON public.prayer_interactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayer interactions"
ON public.prayer_interactions FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updating prayers_count
CREATE OR REPLACE FUNCTION public.handle_prayer_interaction()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.prayer_requests
    SET prayers_count = prayers_count + 1
    WHERE id = NEW.request_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.prayer_requests
    SET prayers_count = prayers_count - 1
    WHERE id = OLD.request_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_prayer_interaction
AFTER INSERT OR DELETE ON public.prayer_interactions
FOR EACH ROW EXECUTE FUNCTION public.handle_prayer_interaction();

-- Standard updated_at trigger (assuming update_updated_at_column exists)
CREATE TRIGGER update_prayer_requests_updated_at
BEFORE UPDATE ON public.prayer_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
