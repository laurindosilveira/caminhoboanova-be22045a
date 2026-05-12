-- Add missing turma_id column to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES public.turmas(id);

-- Add index for turma_id
CREATE INDEX IF NOT EXISTS idx_events_turma_id ON public.events(turma_id);

-- Ensure other needed columns exist
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS released_devotional_days INTEGER[] DEFAULT '{}';
