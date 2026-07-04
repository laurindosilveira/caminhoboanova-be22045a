-- Permite remover/recolocar participantes no ranking sem apagar a conta ou o progresso.
-- A exclusao e sempre vinculada a uma igreja para preservar o isolamento multi-tenant.
CREATE TABLE IF NOT EXISTS public.ranking_exclusions (
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  excluded_by uuid NOT NULL REFERENCES auth.users(id),
  excluded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (church_id, user_id)
);

CREATE INDEX IF NOT EXISTS ranking_exclusions_user_id_idx
  ON public.ranking_exclusions(user_id);

ALTER TABLE public.ranking_exclusions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ranking exclusions tenant select" ON public.ranking_exclusions;
CREATE POLICY "Ranking exclusions tenant select"
ON public.ranking_exclusions FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()) OR church_id = public.get_auth_church_id());

-- Toda escrita passa pela RPC abaixo, que tambem limita lideres a propria area.
REVOKE INSERT, UPDATE, DELETE ON public.ranking_exclusions FROM authenticated;

CREATE OR REPLACE FUNCTION public.set_ranking_participation(
  _user_id uuid,
  _included boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_profile public.profiles%ROWTYPE;
  target_profile public.profiles%ROWTYPE;
  caller_is_admin boolean;
  caller_is_leader boolean;
BEGIN
  SELECT * INTO caller_profile FROM public.profiles WHERE user_id = auth.uid();
  SELECT * INTO target_profile FROM public.profiles WHERE user_id = _user_id;

  IF caller_profile.user_id IS NULL OR target_profile.user_id IS NULL THEN
    RAISE EXCEPTION 'Participante nao encontrado';
  END IF;

  caller_is_admin := public.has_role(auth.uid(), 'admin'::public.app_role);
  caller_is_leader := public.has_role(auth.uid(), 'lider'::public.app_role);

  IF NOT (caller_is_admin OR caller_is_leader OR public.is_super_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Sem permissao para gerenciar o ranking';
  END IF;

  IF NOT public.is_super_admin(auth.uid())
     AND caller_profile.church_id IS DISTINCT FROM target_profile.church_id THEN
    RAISE EXCEPTION 'Participante pertence a outra igreja';
  END IF;

  IF caller_is_leader AND NOT caller_is_admin AND NOT public.is_super_admin(auth.uid())
     AND caller_profile.area IS DISTINCT FROM target_profile.area THEN
    RAISE EXCEPTION 'Lider so pode gerenciar participantes da propria area';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin'::public.app_role, 'lider'::public.app_role)
  ) THEN
    RAISE EXCEPTION 'Administradores e lideres nao participam do ranking';
  END IF;

  IF _included THEN
    DELETE FROM public.ranking_exclusions
    WHERE church_id = target_profile.church_id AND user_id = _user_id;
  ELSE
    INSERT INTO public.ranking_exclusions(church_id, user_id, excluded_by)
    VALUES (target_profile.church_id, _user_id, auth.uid())
    ON CONFLICT (church_id, user_id)
    DO UPDATE SET excluded_by = EXCLUDED.excluded_by, excluded_at = now();
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.set_ranking_participation(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_ranking_participation(uuid, boolean) TO authenticated;

-- Acrescenta a exclusao persistente a funcao vigente sem duplicar toda a formula de pontos.
-- O marcador abaixo faz parte do CTE user_list em todas as versoes atuais da funcao.
DO $$
DECLARE
  function_sql text;
  marker text := 'AND NOT EXISTS (' || chr(10) || '        SELECT 1 FROM public.user_roles ur';
  addition text := 'AND NOT EXISTS (' || chr(10) ||
    '        SELECT 1 FROM public.ranking_exclusions re' || chr(10) ||
    '        WHERE re.user_id = p.user_id AND re.church_id = p.church_id' || chr(10) ||
    '      )' || chr(10) || '      ';
BEGIN
  SELECT pg_get_functiondef('public.get_community_ranking(public.community_name,uuid)'::regprocedure)
  INTO function_sql;

  IF position(marker IN function_sql) = 0 THEN
    RAISE EXCEPTION 'Nao foi possivel localizar o filtro de papeis em get_community_ranking';
  END IF;

  function_sql := replace(function_sql, marker, addition || marker);
  EXECUTE function_sql;
END;
$$;
