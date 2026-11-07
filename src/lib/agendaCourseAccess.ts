import { supabase } from "@/integrations/supabase/client";

export type AgendaCourseScope = {
  courseId: string;
  churchId: string | null;
  turmaId: string | null;
  area: string | null;
};

type UnlockRow = {
  id: string;
  turma_id: string | null;
  area: string;
  access_mode: string;
};

async function loadApplicableUnlock(scope: AgendaCourseScope): Promise<UnlockRow | null> {
  let query = supabase
    .from("course_unlocks")
    .select("id, turma_id, area, access_mode")
    .eq("course_id", scope.courseId);
  query = scope.churchId
    ? query.eq("church_id", scope.churchId)
    : query.is("church_id", null);

  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as UnlockRow[];

  if (scope.turmaId) {
    const exact = rows.find((row) => row.turma_id === scope.turmaId);
    if (exact) return exact;
  }

  return rows.find((row) => row.turma_id === null && row.area === (scope.area || "Sem area")) ?? null;
}

export async function isCourseOpenWithoutRestrictions(scope: AgendaCourseScope): Promise<boolean> {
  const unlock = await loadApplicableUnlock(scope);
  return unlock?.access_mode === "open";
}

export async function activateAgendaCourseControl(scope: AgendaCourseScope): Promise<void> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("Sessão não encontrada.");

  let exactQuery = supabase
    .from("course_unlocks")
    .select("id")
    .eq("course_id", scope.courseId);
  exactQuery = scope.churchId
    ? exactQuery.eq("church_id", scope.churchId)
    : exactQuery.is("church_id", null);
  exactQuery = scope.turmaId
    ? exactQuery.eq("turma_id", scope.turmaId)
    : exactQuery.is("turma_id", null).eq("area", scope.area || "Sem area");

  const { data: existing, error: existingError } = await exactQuery.maybeSingle();
  if (existingError) throw existingError;

  const values = {
    access_mode: "scheduled" as const,
    release_source: "agenda" as const,
    unlocked_by: authData.user.id,
    unlocked_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("course_unlocks")
      .update(values)
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("course_unlocks").insert({
    course_id: scope.courseId,
    church_id: scope.churchId,
    turma_id: scope.turmaId,
    area: scope.area || "Sem area",
    ...values,
  });
  if (error) throw error;
}
