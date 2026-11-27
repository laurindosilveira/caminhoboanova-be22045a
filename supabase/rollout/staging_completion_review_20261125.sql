-- STAGING ONLY. Requires the exact previously installed membership guard.
BEGIN;
DO $$ BEGIN
 IF md5(replace(pg_get_functiondef(to_regprocedure('private.rotate_learning_membership_version()')),E'\r\n',E'\n')) IS DISTINCT FROM 'b0deaa017f15e4d8b019a78a435a96e3'
 OR md5(replace(pg_get_functiondef(to_regprocedure('public.sync_owned_completion(uuid,uuid,uuid,text,uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)')),E'\r\n',E'\n')) IS DISTINCT FROM '5a13629b0fdd7de30fd754dec73f5444'
 OR to_regclass('private.completion_review_requests') IS NOT NULL
 OR to_regclass('private.completion_review_events') IS NOT NULL THEN
  RAISE EXCEPTION 'STAGING_REVIEW_PRECONDITION_FAILED %, %', md5(pg_get_functiondef(to_regprocedure('private.rotate_learning_membership_version()'))), md5(pg_get_functiondef(to_regprocedure('public.sync_owned_completion(uuid,uuid,uuid,text,uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)')));
 END IF;
END $$;
CREATE OR REPLACE FUNCTION private.rotate_learning_membership_version() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF TG_OP='INSERT' OR ROW(NEW.user_id,NEW.church_id,NEW.turma_id,NEW.area,NEW.is_active,NEW.enrollment_status)
      IS DISTINCT FROM ROW(OLD.user_id,OLD.church_id,OLD.turma_id,OLD.area,OLD.is_active,OLD.enrollment_status) THEN
    INSERT INTO private.learning_membership_version(user_id,version) VALUES(NEW.user_id,gen_random_uuid())
      ON CONFLICT(user_id) DO UPDATE SET version=EXCLUDED.version;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.rotate_learning_membership_version() FROM PUBLIC,anon,authenticated;
DROP TRIGGER aa_rotate_learning_membership ON public.profiles;
CREATE TRIGGER aa_rotate_learning_membership AFTER INSERT OR UPDATE OF user_id,church_id,turma_id,area,is_active,enrollment_status
  ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.rotate_learning_membership_version();
-- REVIEW CANDIDATE. Metadata only; student answers remain on the device.
CREATE TABLE private.completion_review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id text NOT NULL CHECK (length(action_id) BETWEEN 1 AND 200),
  kind text NOT NULL CHECK (kind IN ('complete_lesson','complete_devotional')),
  item_id uuid NOT NULL,
  church_id uuid NOT NULL,
  turma_id uuid NOT NULL,
  area text NOT NULL,
  membership_version uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, reviewed_at timestamptz,
  requested_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(user_id,action_id)
);
ALTER TABLE private.completion_review_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.completion_review_requests FROM PUBLIC,anon,authenticated;
CREATE INDEX completion_review_destination_idx ON private.completion_review_requests(church_id,turma_id,status,requested_at);
CREATE TABLE private.completion_review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES private.completion_review_requests(id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('approved','scope_changed')),
  actor uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  church_id uuid NOT NULL, turma_id uuid NOT NULL, area text NOT NULL,
  membership_version uuid NOT NULL, occurred_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE private.completion_review_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.completion_review_events FROM PUBLIC,anon,authenticated;

CREATE FUNCTION private.may_review_completion(p_actor uuid,p_church uuid,p_turma uuid,p_area text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.user_roles r JOIN public.profiles reviewer ON reviewer.user_id=r.user_id AND reviewer.church_id=p_church
  WHERE r.user_id=p_actor AND r.church_id=p_church AND coalesce(reviewer.is_active,true) AND reviewer.enrollment_status IN ('approved','active') AND
   ((r.role='admin' AND (r.admin_area IS NULL OR r.admin_area::text=p_area))
    OR (r.role='lider' AND EXISTS(SELECT 1 FROM public.turma_leaders l
       WHERE l.user_id=p_actor AND l.church_id=p_church AND l.turma_id=p_turma))))
$$;
REVOKE ALL ON FUNCTION private.may_review_completion(uuid,uuid,uuid,text) FROM PUBLIC,anon,authenticated;

-- The request does not contain lesson or devotional answer text. The current
-- destination is selected for review only; it is not proof of historical origin.
CREATE FUNCTION public.request_completion_review(p_action_id text,p_kind text,p_item_id uuid)
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
REVOKE ALL ON FUNCTION public.request_completion_review(text,text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.request_completion_review(text,text,uuid) TO authenticated;

CREATE FUNCTION public.list_completion_reviews(p_turma_id uuid)
RETURNS TABLE(id uuid, student_name text, kind text, activity_title text, requested_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT q.id,p.full_name::text,q.kind,
   CASE WHEN q.kind='complete_lesson' THEN coalesce(l.title,'Licao') ELSE coalesce(d.title,'Devocional') END,
   q.requested_at
 FROM private.completion_review_requests q
 JOIN public.profiles p ON p.user_id=q.user_id AND p.church_id=q.church_id AND p.turma_id=q.turma_id AND p.area::text=q.area
 JOIN private.learning_membership_version v ON v.user_id=p.user_id AND v.version=q.membership_version
 LEFT JOIN public.lessons l ON q.kind='complete_lesson' AND l.id=q.item_id
 LEFT JOIN public.devotional_content d ON q.kind='complete_devotional' AND d.id=q.item_id
 WHERE auth.uid() IS NOT NULL AND q.user_id<>auth.uid() AND q.status='pending' AND q.turma_id=p_turma_id
  AND coalesce(p.is_active,true) AND p.enrollment_status IN ('approved','active')
  AND private.may_review_completion(auth.uid(),q.church_id,q.turma_id,q.area)
 ORDER BY q.requested_at,q.id LIMIT 100
$$;
REVOKE ALL ON FUNCTION public.list_completion_reviews(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.list_completion_reviews(uuid) TO authenticated;

CREATE FUNCTION public.approve_completion_review(p_id uuid,p_confirm boolean)
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
REVOKE ALL ON FUNCTION public.approve_completion_review(uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.approve_completion_review(uuid,boolean) TO authenticated;

NOTIFY pgrst,'reload schema';
COMMIT;
