-- Add area column to leader_meeting_notes with correct type
ALTER TABLE public.leader_meeting_notes ADD COLUMN IF NOT EXISTS area public.area_name;

-- Remove old unique constraint if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leader_meeting_notes_leader_id_lesson_id_key') THEN
        ALTER TABLE public.leader_meeting_notes DROP CONSTRAINT leader_meeting_notes_leader_id_lesson_id_key;
    END IF;
END $$;

-- Create new unique constraint for shared notes
CREATE UNIQUE INDEX IF NOT EXISTS leader_meeting_notes_lesson_church_area_idx ON public.leader_meeting_notes (lesson_id, church_id, area);

-- Update RLS policies
DROP POLICY IF EXISTS "Leaders can view their own notes" ON public.leader_meeting_notes;
DROP POLICY IF EXISTS "Leaders can manage their own notes" ON public.leader_meeting_notes;
DROP POLICY IF EXISTS "Leaders can view shared notes in their church and area" ON public.leader_meeting_notes;
DROP POLICY IF EXISTS "Leaders can upsert shared notes in their church and area" ON public.leader_meeting_notes;
DROP POLICY IF EXISTS "Leaders can update shared notes in their church and area" ON public.leader_meeting_notes;

CREATE POLICY "Leaders can view shared notes in their church and area"
ON public.leader_meeting_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND (p.role = 'lider' OR p.role = 'admin')
    AND p.church_id = public.leader_meeting_notes.church_id
    AND p.area = public.leader_meeting_notes.area
  )
);

CREATE POLICY "Leaders can upsert shared notes in their church and area"
ON public.leader_meeting_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND (p.role = 'lider' OR p.role = 'admin')
    AND p.church_id = church_id
    AND p.area = area
  )
);

CREATE POLICY "Leaders can update shared notes in their church and area"
ON public.leader_meeting_notes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND (p.role = 'lider' OR p.role = 'admin')
    AND p.church_id = public.leader_meeting_notes.church_id
    AND p.area = public.leader_meeting_notes.area
  )
);
