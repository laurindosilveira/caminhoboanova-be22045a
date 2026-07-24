-- Ensure course module tables used by the current app exist in fresh environments.

CREATE TABLE IF NOT EXISTS public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  title text NOT NULL,
  order_num integer NOT NULL DEFAULT 1,
  church_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS modules_course_id_idx ON public.modules (course_id);
CREATE INDEX IF NOT EXISTS modules_church_id_idx ON public.modules (church_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'modules_course_id_fkey'
  ) THEN
    ALTER TABLE public.modules
      ADD CONSTRAINT modules_course_id_fkey
      FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'modules_church_id_fkey'
  ) THEN
    ALTER TABLE public.modules
      ADD CONSTRAINT modules_church_id_fkey
      FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS module_id uuid NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lessons_module_id_fkey'
  ) THEN
    ALTER TABLE public.lessons
      ADD CONSTRAINT lessons_module_id_fkey
      FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.global_course_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  church_id uuid NOT NULL,
  released_by uuid NULL,
  released_at timestamptz NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS global_course_releases_course_id_church_id_key
  ON public.global_course_releases (course_id, church_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'global_course_releases_course_id_fkey'
  ) THEN
    ALTER TABLE public.global_course_releases
      ADD CONSTRAINT global_course_releases_course_id_fkey
      FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'global_course_releases_church_id_fkey'
  ) THEN
    ALTER TABLE public.global_course_releases
      ADD CONSTRAINT global_course_releases_church_id_fkey
      FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'global_course_releases_released_by_fkey'
  ) THEN
    ALTER TABLE public.global_course_releases
      ADD CONSTRAINT global_course_releases_released_by_fkey
      FOREIGN KEY (released_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_course_releases ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.global_course_releases TO authenticated;

DROP POLICY IF EXISTS modules_select ON public.modules;
CREATE POLICY modules_select
  ON public.modules
  FOR SELECT
  USING (
    church_id IS NULL
    OR public.is_super_admin(auth.uid())
    OR church_id = public.get_auth_church_id()
  );

DROP POLICY IF EXISTS modules_insert ON public.modules;
CREATE POLICY modules_insert
  ON public.modules
  FOR INSERT
  WITH CHECK (
    public.is_super_admin(auth.uid())
    OR (
      church_id = public.get_auth_church_id()
      AND (
        public.can_manage_church(church_id)
        OR (
          SELECT role FROM public.profiles WHERE user_id = auth.uid()
        ) = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])
      )
    )
  );

DROP POLICY IF EXISTS modules_update ON public.modules;
CREATE POLICY modules_update
  ON public.modules
  FOR UPDATE
  USING (
    public.is_super_admin(auth.uid())
    OR (
      church_id IS NOT NULL
      AND (
        public.can_manage_church(church_id)
        OR (
          church_id = public.get_auth_church_id()
          AND (
            SELECT role FROM public.profiles WHERE user_id = auth.uid()
          ) = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])
        )
      )
    )
  )
  WITH CHECK (
    public.is_super_admin(auth.uid())
    OR (
      church_id = public.get_auth_church_id()
      AND (
        public.can_manage_church(church_id)
        OR (
          SELECT role FROM public.profiles WHERE user_id = auth.uid()
        ) = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])
      )
    )
  );

DROP POLICY IF EXISTS modules_delete ON public.modules;
CREATE POLICY modules_delete
  ON public.modules
  FOR DELETE
  USING (
    public.is_super_admin(auth.uid())
    OR (
      church_id IS NOT NULL
      AND (
        public.can_manage_church(church_id)
        OR (
          church_id = public.get_auth_church_id()
          AND (
            SELECT role FROM public.profiles WHERE user_id = auth.uid()
          ) = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])
        )
      )
    )
  );

DROP POLICY IF EXISTS gcr_church_select ON public.global_course_releases;
CREATE POLICY gcr_church_select
  ON public.global_course_releases
  FOR SELECT
  USING (church_id = public.get_auth_church_id());

DROP POLICY IF EXISTS gcr_super_admin_all ON public.global_course_releases;
CREATE POLICY gcr_super_admin_all
  ON public.global_course_releases
  FOR ALL
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
