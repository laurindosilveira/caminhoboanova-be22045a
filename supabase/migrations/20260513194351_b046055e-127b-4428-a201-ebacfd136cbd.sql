-- Refine content management policies to prevent RLS errors when leaders try to modify global content.

do $$
declare
  t text;
begin
  foreach t in array array[
    'courses',
    'activities',
    'lessons',
    'lesson_content',
    'devotional_content',
    'turma_lesson_content',
    'leader_guide',
    'achievement_definitions',
    'game_config'
  ] loop
    if to_regclass('public.' || t) is not null then
      -- Drop the old policy
      execute format('drop policy if exists "Tenant content manage" on public.%I', t);
      
      -- Create a more precise policy:
      -- USING: only super_admins OR people who can manage that specific church_id can see/edit.
      --   (Note: can_manage_church(NULL) returns false for non-super-admins, protecting global rows)
      -- WITH CHECK: prevents non-super-admins from creating records with church_id = NULL.
      execute format(
        'create policy "Tenant content manage" on public.%I for all 
         using (public.is_super_admin(auth.uid()) or public.can_manage_church(church_id)) 
         with check (public.is_super_admin(auth.uid()) or (church_id is not null and public.can_manage_church(church_id)))',
        t
      );
    end if;
  end loop;
end $$;
