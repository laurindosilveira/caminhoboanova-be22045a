-- STAGING ONLY: exact hash checks protect the deployed review functions.
BEGIN;
DO $$ BEGIN
 IF md5(replace(pg_get_functiondef(to_regprocedure('private.may_review_completion(uuid,uuid,uuid,text)')),E'\r\n',E'\n')) IS DISTINCT FROM '0a5447b901da2a393e07222d27d6e7e1'
 OR md5(replace(pg_get_functiondef(to_regprocedure('public.request_completion_review(text,text,uuid)')),E'\r\n',E'\n')) IS DISTINCT FROM '63b3d6745ffb557047767c081593b378'
 OR md5(replace(pg_get_functiondef(to_regprocedure('public.approve_completion_review(uuid,boolean)')),E'\r\n',E'\n')) IS DISTINCT FROM 'c10873495bdd3167c72956e05be938fa' THEN
  RAISE EXCEPTION 'STAGING_REVIEW_SECURITY_VERSION_MISMATCH';
 END IF;
END $$;
CREATE OR REPLACE FUNCTION private.may_review_completion(p_actor uuid,p_church uuid,p_turma uuid,p_area text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.user_roles r JOIN public.profiles reviewer ON reviewer.user_id=r.user_id AND reviewer.church_id=p_church
  WHERE r.user_id=p_actor AND r.church_id=p_church AND coalesce(reviewer.is_active,true) AND reviewer.enrollment_status IN ('approved','active') AND
   ((r.role='admin' AND (r.admin_area IS NULL OR r.admin_area::text=p_area))
    OR (r.role='lider' AND EXISTS(SELECT 1 FROM public.turma_leaders l
       WHERE l.user_id=p_actor AND l.church_id=p_church AND l.turma_id=p_turma))))
$$;
CREATE OR REPLACE FUNCTION public.request_completion_review(p_action_id text,p_kind text,p_item_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid(); scope jsonb; entry private.completion_review_requests%ROWTYPE;
BEGIN
 IF actor IS NULL THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='AUTH_REQUIRED'; END IF;
 IF p_action_id IS NULL OR length(p_action_id) NOT BETWEEN 1 AND 200 OR p_item_id IS NULL
    OR p_kind IS NULL OR p_kind NOT IN ('complete_lesson','complete_devotional')
    OR (p_kind='complete_lesson' AND NOT EXISTS(SELECT 1 FROM public.lessons WHERE id=p_item_id))
    OR (p_kind='complete_devotional' AND NOT EXISTS(SELECT 1 FROM public.devotional_content WHERE id=p_item_id)) THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_COMPLETION_REVIEW'; END IF;
 scope:=public.get_owned_learning_scope(actor);
 IF scope IS NULL THEN RETURN jsonb_build_object('status','scope_review_required'); END IF;
 IF (p_kind='complete_lesson' AND NOT EXISTS(SELECT 1 FROM public.lessons l WHERE l.id=p_item_id AND (l.church_id IS NULL OR l.church_id=(scope->>'churchId')::uuid)))
    OR (p_kind='complete_devotional' AND NOT EXISTS(SELECT 1 FROM public.devotional_content d WHERE d.id=p_item_id AND (d.church_id IS NULL OR d.church_id=(scope->>'churchId')::uuid))) THEN
  RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='REVIEW_NOT_AUTHORIZED'; END IF;
 INSERT INTO private.completion_review_requests(user_id,action_id,kind,item_id,church_id,turma_id,area,membership_version)
 VALUES(actor,p_action_id,p_kind,p_item_id,(scope->>'churchId')::uuid,(scope->>'turmaId')::uuid,scope->>'area',(scope->>'membershipVersion')::uuid)
 ON CONFLICT(user_id,action_id) DO NOTHING;
 SELECT * INTO STRICT entry FROM private.completion_review_requests WHERE user_id=actor AND action_id=p_action_id FOR UPDATE;
 IF entry.kind IS DISTINCT FROM p_kind OR entry.item_id IS DISTINCT FROM p_item_id THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='COMPLETION_REVIEW_CHANGED'; END IF;
 IF entry.membership_version IS DISTINCT FROM (scope->>'membershipVersion')::uuid OR entry.church_id IS DISTINCT FROM (scope->>'churchId')::uuid
  OR entry.turma_id IS DISTINCT FROM (scope->>'turmaId')::uuid OR entry.area IS DISTINCT FROM scope->>'area' THEN
  INSERT INTO private.completion_review_events(request_id,event,actor,church_id,turma_id,area,membership_version)
   VALUES(entry.id,'scope_changed',actor,entry.church_id,entry.turma_id,entry.area,entry.membership_version);
  UPDATE private.completion_review_requests SET church_id=(scope->>'churchId')::uuid,turma_id=(scope->>'turmaId')::uuid,
   area=scope->>'area',membership_version=(scope->>'membershipVersion')::uuid,status='pending',reviewed_by=NULL,reviewed_at=NULL,
   requested_at=clock_timestamp() WHERE id=entry.id RETURNING * INTO entry;
 END IF;
 RETURN jsonb_build_object('status',entry.status,'scope',CASE WHEN entry.status='approved' THEN scope ELSE NULL END);
END $$;
CREATE OR REPLACE FUNCTION public.approve_completion_review(p_id uuid,p_confirm boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid(); hint private.completion_review_requests%ROWTYPE; entry private.completion_review_requests%ROWTYPE; scope jsonb;
BEGIN
 IF actor IS NULL OR p_confirm IS DISTINCT FROM true THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='REVIEW_NOT_AUTHORIZED'; END IF;
 SELECT * INTO hint FROM private.completion_review_requests WHERE id=p_id;
 IF NOT FOUND OR hint.user_id=actor THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='REVIEW_NOT_AUTHORIZED'; END IF;
 -- Lock the reviewer's grants so they cannot be revoked while approving.
 PERFORM 1 FROM public.user_roles r JOIN public.profiles reviewer ON reviewer.user_id=r.user_id AND reviewer.church_id=hint.church_id
   WHERE coalesce(reviewer.is_active,true) AND reviewer.enrollment_status IN ('approved','active') AND r.user_id=actor AND r.church_id=hint.church_id AND
   ((r.role='admin' AND (r.admin_area IS NULL OR r.admin_area::text=hint.area)) OR
    (r.role='lider' AND EXISTS(SELECT 1 FROM public.turma_leaders l WHERE l.user_id=actor
       AND l.church_id=hint.church_id AND l.turma_id=hint.turma_id))) FOR SHARE OF r,reviewer;
 IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='REVIEW_NOT_AUTHORIZED'; END IF;
 -- A leader's group assignment must stay valid through this transaction.
 IF NOT EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=actor AND r.church_id=hint.church_id
   AND r.role='admin' AND (r.admin_area IS NULL OR r.admin_area::text=hint.area)) THEN
  PERFORM 1 FROM public.turma_leaders l WHERE l.user_id=actor AND l.church_id=hint.church_id AND l.turma_id=hint.turma_id FOR SHARE OF l;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='REVIEW_NOT_AUTHORIZED'; END IF;
 END IF;
 -- Lock the member profile and membership before the request, matching the
 -- ordering used by request_completion_review and save operations.
 SELECT jsonb_build_object('churchId',p.church_id,'turmaId',p.turma_id,'area',p.area::text,'membershipVersion',v.version)
 INTO scope FROM public.profiles p JOIN public.turmas t ON t.id=p.turma_id JOIN private.learning_membership_version v ON v.user_id=p.user_id
 WHERE p.user_id=hint.user_id AND p.church_id=hint.church_id AND p.turma_id=hint.turma_id AND p.area::text=hint.area
  AND t.church_id=p.church_id AND t.area=p.area::text AND t.is_active AND coalesce(p.is_active,true)
  AND p.enrollment_status IN ('approved','active') FOR SHARE OF p,t,v;
 IF scope IS NULL THEN RETURN jsonb_build_object('status','scope_changed'); END IF;
 SELECT * INTO entry FROM private.completion_review_requests WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR entry.status<>'pending' OR entry.user_id IS DISTINCT FROM hint.user_id
  OR entry.church_id IS DISTINCT FROM hint.church_id OR entry.turma_id IS DISTINCT FROM hint.turma_id
  OR entry.area IS DISTINCT FROM hint.area OR entry.membership_version IS DISTINCT FROM (scope->>'membershipVersion')::uuid
  OR NOT private.may_review_completion(actor,entry.church_id,entry.turma_id,entry.area) THEN
  RETURN jsonb_build_object('status','scope_changed'); END IF;
 INSERT INTO private.completion_review_events(request_id,event,actor,church_id,turma_id,area,membership_version)
  VALUES(entry.id,'approved',actor,entry.church_id,entry.turma_id,entry.area,entry.membership_version);
 UPDATE private.completion_review_requests SET status='approved',reviewed_by=actor,reviewed_at=clock_timestamp() WHERE id=p_id;
 RETURN jsonb_build_object('status','approved');
END $$;
NOTIFY pgrst,'reload schema';
COMMIT;
