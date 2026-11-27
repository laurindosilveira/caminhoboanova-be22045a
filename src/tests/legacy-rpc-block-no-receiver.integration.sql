-- Disposable local restore only. No receiver or capture wrappers installed.
-- All writes are rolled back and only fictional new values are supplied.
BEGIN;
DO $$
DECLARE owner_id uuid; lesson uuid; lesson_key text; old_answer text; devotional uuid; dev_key integer; old_dev text;
BEGIN
 SELECT l.user_id,l.lesson_id,l.question_key,l.response,d.devotional_id,d.question_index,d.response
 INTO owner_id,lesson,lesson_key,old_answer,devotional,dev_key,old_dev
 FROM public.lesson_responses l JOIN public.devotional_responses d ON d.user_id=l.user_id
 JOIN public.profiles p ON p.user_id=l.user_id AND p.church_id=l.church_id AND p.church_id=d.church_id LIMIT 1;
 IF owner_id IS NULL THEN RAISE EXCEPTION 'Missing local fixture'; END IF;
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);
 PERFORM set_config('test.block_lesson',lesson::text,true); PERFORM set_config('test.block_key',lesson_key,true);
 PERFORM set_config('test.block_answer',old_answer,true); PERFORM set_config('test.block_devotional',devotional::text,true);
 PERFORM set_config('test.block_dev_key',dev_key::text,true); PERFORM set_config('test.block_dev_answer',old_dev,true);
END $$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE failed boolean; lesson uuid:=current_setting('test.block_lesson')::uuid; devotional uuid:=current_setting('test.block_devotional')::uuid;
BEGIN
 failed:=false;
 BEGIN PERFORM public.save_lesson_draft(lesson,jsonb_build_object(current_setting('test.block_key'),'[antigo ficticio]'),false,false);
 EXCEPTION WHEN OTHERS THEN failed:=true; END;
 IF NOT failed THEN RAISE EXCEPTION 'legacy lesson draft unexpectedly accepted'; END IF;
 failed:=false;
 BEGIN PERFORM public.complete_lesson(lesson,jsonb_build_object(current_setting('test.block_key'),'[antigo ficticio]'),false,false,NULL,NULL);
 EXCEPTION WHEN OTHERS THEN failed:=true; END;
 IF NOT failed THEN RAISE EXCEPTION 'legacy lesson completion unexpectedly accepted'; END IF;
 failed:=false;
 BEGIN PERFORM public.complete_devotional(devotional,jsonb_build_object(current_setting('test.block_dev_key'),'[antigo ficticio]'),false,NULL,NULL);
 EXCEPTION WHEN OTHERS THEN failed:=true; END;
 IF NOT failed THEN RAISE EXCEPTION 'legacy devotional completion unexpectedly accepted'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.lesson_responses WHERE user_id=auth.uid() AND lesson_id=lesson
   AND question_key=current_setting('test.block_key') AND response IS NOT DISTINCT FROM current_setting('test.block_answer'))
   OR NOT EXISTS(SELECT 1 FROM public.devotional_responses WHERE user_id=auth.uid() AND devotional_id=devotional
   AND question_index=current_setting('test.block_dev_key')::integer AND response IS NOT DISTINCT FROM current_setting('test.block_dev_answer')) THEN
   RAISE EXCEPTION 'legacy call changed a saved answer';
 END IF;
END $$;
RESET ROLE;
ROLLBACK;
