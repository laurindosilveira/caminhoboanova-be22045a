export type GroupScopedEvent = {
  turma_id?: string | null;
  area?: string | null;
  target_user_id?: string | null;
};

type GroupScope = {
  turmaId: string | null;
  area: string;
  userId?: string | null;
};

/**
 * Keeps new events isolated by group while preserving area-wide events that
 * existed before churches adopted real groups.
 */
export function isEventVisibleInGroupScope(
  event: GroupScopedEvent,
  scope: GroupScope,
): boolean {
  if (event.target_user_id && event.target_user_id !== scope.userId) {
    return false;
  }

  if (scope.turmaId) {
    if (event.turma_id) {
      return event.turma_id === scope.turmaId;
    }

    return !event.area || event.area === scope.area;
  }

  if (event.turma_id) {
    return false;
  }

  return !event.area || event.area === scope.area;
}
