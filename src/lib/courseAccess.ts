export type CourseAccessMode = "open" | "scheduled";

export type CourseUnlockScopeRow = {
  course_id: string;
  area: string | null;
  turma_id: string | null;
  access_mode: string | null;
};

export type ResolvedCourseUnlock = {
  courseId: string;
  mode: CourseAccessMode;
  source: "turma" | "area";
  row: CourseUnlockScopeRow;
};

type CourseAccessScope = {
  turmaId: string | null;
  area: string | null;
};

export type JourneyCourseVisibilityRow = {
  id: string;
  church_id: string | null;
  track_id: string | null;
};

type JourneyCourseVisibilityScope = {
  churchId: string | null;
  isSuper: boolean;
  unlockedCourseIds: ReadonlySet<string>;
  releasedCourseIds: ReadonlySet<string>;
  releasedTrackIds: ReadonlySet<string>;
};

function normalizeMode(mode: string | null): CourseAccessMode {
  return mode === "open" ? "open" : "scheduled";
}

/**
 * Resolves course access for one effective group.
 *
 * An exact turma row always wins over the legacy area fallback. If malformed
 * legacy data contains two rows at the same specificity, scheduled wins so a
 * duplicate cannot accidentally remove an existing Agenda restriction.
 */
export function resolveCourseUnlocks(
  rows: readonly CourseUnlockScopeRow[],
  scope: CourseAccessScope,
): Map<string, ResolvedCourseUnlock> {
  const resolved = new Map<string, ResolvedCourseUnlock>();
  const specificity = new Map<string, number>();

  for (const row of rows) {
    const isExactTurma = Boolean(scope.turmaId) && row.turma_id === scope.turmaId;
    const isAreaFallback = row.turma_id === null
      && Boolean(scope.area)
      && row.area === scope.area;

    if (!isExactTurma && !isAreaFallback) continue;

    const rank = isExactTurma ? 2 : 1;
    const mode = normalizeMode(row.access_mode);
    const current = resolved.get(row.course_id);
    const currentRank = specificity.get(row.course_id) ?? 0;
    const shouldReplace = !current
      || rank > currentRank
      || (rank === currentRank && current.mode === "open" && mode === "scheduled");

    if (!shouldReplace) continue;

    resolved.set(row.course_id, {
      courseId: row.course_id,
      mode,
      source: isExactTurma ? "turma" : "area",
      row,
    });
    specificity.set(row.course_id, rank);
  }

  return resolved;
}

export function getCourseIdsByMode(
  unlocks: ReadonlyMap<string, ResolvedCourseUnlock>,
  mode: CourseAccessMode,
): Set<string> {
  return new Set(
    [...unlocks.values()]
      .filter((unlock) => unlock.mode === mode)
      .map((unlock) => unlock.courseId),
  );
}

/**
 * The participant journey only shows courses released for the current church
 * and explicitly unlocked for the selected group. Leadership permissions must
 * not leak locked course cards into the participant experience.
 */
export function isCourseVisibleInJourney(
  course: JourneyCourseVisibilityRow,
  scope: JourneyCourseVisibilityScope,
): boolean {
  const availableToChurch =
    scope.isSuper
    || course.church_id === scope.churchId
    || (course.track_id
      ? scope.releasedTrackIds.has(course.track_id)
      : scope.releasedCourseIds.has(course.id));

  return availableToChurch && scope.unlockedCourseIds.has(course.id);
}
