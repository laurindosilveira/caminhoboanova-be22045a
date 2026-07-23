-- Enforce the role rule at the public ranking boundary. The internal function
-- remains inaccessible to app roles, so every UI, podium and report receives
-- the same filtered result even if its internal score calculation changes.
DO $$
DECLARE
  function_definition text;
  ranking_source text :=
    'FROM public.get_community_ranking_internal(_community, _church_id) AS ranking;';
  filtered_ranking_source text :=
    'FROM public.get_community_ranking_internal(_community, _church_id) AS ranking' || chr(10) ||
    '  WHERE NOT EXISTS (' || chr(10) ||
    '    SELECT 1' || chr(10) ||
    '    FROM public.user_roles elevated_role' || chr(10) ||
    '    WHERE elevated_role.user_id = ranking.user_id' || chr(10) ||
    '      AND (' || chr(10) ||
    '        elevated_role.role IN (''admin''::public.app_role, ''lider''::public.app_role)' || chr(10) ||
    '        OR COALESCE(elevated_role.is_super, false)' || chr(10) ||
    '        OR COALESCE(elevated_role.is_super_admin, false)' || chr(10) ||
    '      )' || chr(10) ||
    '  );';
BEGIN
  IF to_regprocedure('public.get_community_ranking(public.community_name,uuid)') IS NULL THEN
    RAISE EXCEPTION 'get_community_ranking(community_name, uuid) was not found';
  END IF;

  SELECT pg_get_functiondef(
    'public.get_community_ranking(public.community_name,uuid)'::regprocedure
  )
  INTO function_definition;

  IF strpos(function_definition, ranking_source) = 0 THEN
    RAISE EXCEPTION 'The public ranking source block was not found';
  END IF;

  function_definition := replace(
    function_definition,
    ranking_source,
    filtered_ranking_source
  );
  EXECUTE function_definition;
END
$$;

-- The scoring implementation is intentionally private; clients must use the
-- filtered public wrapper above.
REVOKE ALL ON FUNCTION public.get_community_ranking_internal(public.community_name, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_community_ranking_internal(public.community_name, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_community_ranking_internal(public.community_name, uuid) FROM authenticated;
