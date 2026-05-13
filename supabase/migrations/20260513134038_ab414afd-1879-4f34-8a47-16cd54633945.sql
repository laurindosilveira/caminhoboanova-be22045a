-- Adicionando chaves estrangeiras para church_id em todas as tabelas que possuem essa coluna
-- Isso é necessário para que o PostgREST (Supabase) consiga realizar junções como .select('*, churches(name)')

DO $$
BEGIN
    -- profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_church_id_fkey') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- user_progress
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_progress_church_id_fkey') THEN
        ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- devotional_progress
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'devotional_progress_church_id_fkey') THEN
        ALTER TABLE public.devotional_progress ADD CONSTRAINT devotional_progress_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- lesson_responses
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'lesson_responses_church_id_fkey') THEN
        ALTER TABLE public.lesson_responses ADD CONSTRAINT lesson_responses_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- attendance
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'attendance_church_id_fkey') THEN
        ALTER TABLE public.attendance ADD CONSTRAINT attendance_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- worship_attendance
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'worship_attendance_church_id_fkey') THEN
        ALTER TABLE public.worship_attendance ADD CONSTRAINT worship_attendance_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- activities
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'activities_church_id_fkey') THEN
        ALTER TABLE public.activities ADD CONSTRAINT activities_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- courses
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'courses_church_id_fkey') THEN
        ALTER TABLE public.courses ADD CONSTRAINT courses_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- lessons
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'lessons_church_id_fkey') THEN
        ALTER TABLE public.lessons ADD CONSTRAINT lessons_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- devotional_content
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'devotional_content_church_id_fkey') THEN
        ALTER TABLE public.devotional_content ADD CONSTRAINT devotional_content_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- lesson_content
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'lesson_content_church_id_fkey') THEN
        ALTER TABLE public.lesson_content ADD CONSTRAINT lesson_content_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- events
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'events_church_id_fkey') THEN
        ALTER TABLE public.events ADD CONSTRAINT events_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- custom_event_types
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'custom_event_types_church_id_fkey') THEN
        ALTER TABLE public.custom_event_types ADD CONSTRAINT custom_event_types_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- achievement_unlocks
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'achievement_unlocks_church_id_fkey') THEN
        ALTER TABLE public.achievement_unlocks ADD CONSTRAINT achievement_unlocks_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- messages
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'messages_church_id_fkey') THEN
        ALTER TABLE public.messages ADD CONSTRAINT messages_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- communities
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'communities_church_id_fkey') THEN
        ALTER TABLE public.communities ADD CONSTRAINT communities_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;

    -- areas
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'areas_church_id_fkey') THEN
        ALTER TABLE public.areas ADD CONSTRAINT areas_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);
    END IF;
END $$;
