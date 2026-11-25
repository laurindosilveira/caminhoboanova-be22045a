import { supabase } from "@/integrations/supabase/client";

const DB_NAME = "caminho-student-offline";
const DB_VERSION = 1;
const SNAPSHOT_STORE = "snapshots";
const QUEUE_STORE = "queue";

type SnapshotRecord<T = unknown> = {
  key: string;
  data: T;
  updatedAt: string;
};

type LiveQueryCacheEntry = {
  data: unknown;
  expiresAt: number;
};

type CachedStudentQueryOptions = {
  force?: boolean;
  maxAgeMs?: number;
};

const DEFAULT_LIVE_CACHE_MS = 2 * 60 * 1000;
const liveQueryCache = new Map<string, LiveQueryCacheEntry>();
const liveQueryRequests = new Map<string, Promise<{ data: unknown; fromCache: boolean; error?: unknown }>>();
const liveQueryGenerations = new Map<string, symbol>();

// The scoped review experiment is not part of this release candidate: its
// attendance flow and hosted receiver have not been validated.
export const scopedLearningEnabled = false;
export type LearningScope = { churchId: string; turmaId: string; area: string; membershipVersion?: string };
export function learningScope(churchId?: string | null, turmaId?: string | null, area?: string | null): LearningScope | undefined {
  return churchId && turmaId && area ? { churchId, turmaId, area } : undefined;
}
// A cached version is tied to this exact owner and group. If a device was
// offline during a transfer, the server will reject it after reconnection.
export async function getOwnedCompletionScope(userId: string, expected?: LearningScope): Promise<LearningScope | undefined> {
  if (!expected) return undefined;
  const key = `completion-scope:${userId}:${expected.churchId}:${expected.turmaId}:${expected.area}`;
  const result = await cachedStudentQuery<LearningScope | null>(key, async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);
    try {
      return await supabase.rpc("get_owned_learning_scope" as never, { p_user_id:userId } as never).abortSignal(controller.signal);
    } finally { window.clearTimeout(timeout); }
  }, null, { force:true });
  const scope = result.data;
  if (!scope || typeof scope.membershipVersion !== "string" || scope.churchId !== expected.churchId ||
      scope.turmaId !== expected.turmaId || scope.area !== expected.area) return undefined;
  return scope;
}
export function scopedLearningCacheKey(scope?: LearningScope): string {
  return scopedLearningEnabled ? `:${JSON.stringify(scope ?? null)}` : "";
}

export async function inspectLearningScope(userId: string, kind: "lesson" | "devotional", itemId: string, scope?: LearningScope): Promise<"ready" | "scope_review_required" | "unavailable"> {
  if (!scopedLearningEnabled) return "ready";
  if (!scope) return "scope_review_required";
  const result = await cachedStudentQuery<{ status: string }>(
    `learning-scope:${userId}:${kind}:${itemId}${scopedLearningCacheKey(scope)}`,
    () => supabase.rpc("inspect_learning_scope" as never, { p_user_id:userId, p_church_id:scope.churchId, p_turma_id:scope.turmaId, p_area:scope.area, p_item_kind:kind, p_item_id:itemId } as never),
    { status:"unavailable" }, { force:true },
  );
  if (result.error && !isStudentOffline()) return "unavailable";
  return result.data.status === "ready" ? "ready" : result.data.status === "scope_review_required" ? "scope_review_required" : "unavailable";
}

export async function requestExistingLearningReview(userId: string, kind: "lesson" | "devotional", itemId: string, scope?: LearningScope): Promise<void> {
  if (!scope || isStudentOffline()) throw new Error("REVIEW_SCOPE_UNAVAILABLE");
  const { data, error } = await supabase.rpc("request_existing_learning_review" as never, { p_user_id:userId, p_church_id:scope.churchId, p_turma_id:scope.turmaId, p_area:scope.area, p_item_kind:kind, p_item_id:itemId } as never);
  if (error || (data as { status?: string } | null)?.status !== "review_pending") throw new Error("REVIEW_SCOPE_UNAVAILABLE");
  window.dispatchEvent(new Event("legacy-recovery-pending"));
}

export type StudentOfflineAction =
  | {
      id: string;
      type: "save_lesson_draft";
      userId: string;
      churchId?: string | null;
      scope?: LearningScope;
      createdAt: string;
      payload: {
        lessonId: string;
        responses: Record<string, string>;
        videoWatched: boolean;
        audioListened: boolean;
      };
    }
  | {
      id: string;
      type: "complete_lesson";
      userId: string;
      churchId?: string | null;
      scope?: LearningScope;
      createdAt: string;
      payload: {
        lessonId: string;
        responses: Record<string, string>;
        videoWatched: boolean;
        audioListened: boolean;
        awardedPoints?: number | null;
        overrideId?: string | null;
        isLateAccess?: boolean;
      };
    }
  | {
      id: string;
      type: "complete_devotional";
      userId: string;
      churchId?: string | null;
      scope?: LearningScope;
      createdAt: string;
      payload: {
        devotionalId: string;
        responses: Record<string, string>;
        isRecovery: boolean;
        awardedPoints: number;
        overrideId?: string | null;
      };
    }
  | {
      id: string;
      type: "attendance_upsert";
      userId: string;
      churchId?: string | null;
      createdAt: string;
      payload: {
        eventId: string;
        status: "pendente_presente" | "pendente_falta";
        confirmationSource: "user";
        requestedAt: string;
        justification?: string;
        expectedStatus?: string | null;
        expectedRequestedAt?: string | null;
        expectedJustification?: string | null;
      };
    }
  | {
      id: string;
      type: "worship_manual";
      userId: string;
      churchId?: string | null;
      createdAt: string;
      payload: {
        worshipDate: string;
        worshipTime: string;
        preacherName: string;
        eventType: string;
      };
    };

let dbPromise: Promise<IDBDatabase> | null = null;

function canUseIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDb(): Promise<IDBDatabase> {
  if (!canUseIndexedDb()) return Promise.reject(new Error("IndexedDB indisponivel"));
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) {
        db.createObjectStore(SNAPSHOT_STORE, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const queue = db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
        queue.createIndex("userId", "userId", { unique: false });
        queue.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
  }).catch((error) => { dbPromise = null; throw error; });

  return dbPromise;
}

function transaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = run(store);
        let result: T | undefined;
        if (request) {
          request.onsuccess = () => {
            result = request.result;
          };
          request.onerror = () => reject(request.error);
        }
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error("A operação no armazenamento do aparelho foi interrompida."));
      }),
  );
}

function makeId(type: StudentOfflineAction["type"]) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function isStudentOffline() {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

export async function getSnapshot<T>(key: string): Promise<T | null> {
  try {
    const record = await transaction<SnapshotRecord<T>>(SNAPSHOT_STORE, "readonly", (store) => store.get(key));
    return record?.data ?? null;
  } catch {
    return null;
  }
}

export async function setSnapshot<T>(key: string, data: T): Promise<void> {
  try {
    await transaction(SNAPSHOT_STORE, "readwrite", (store) =>
      store.put({ key, data, updatedAt: new Date().toISOString() } satisfies SnapshotRecord<T>),
    );
  } catch {
    // Offline cache is best-effort; the live Supabase result remains the source of truth.
  }
}

export async function cachedStudentQuery<T>(
  key: string,
  fetcher: () => PromiseLike<{ data: T | null; error?: unknown }>,
  fallback: T,
  options: CachedStudentQueryOptions = {},
): Promise<{ data: T; fromCache: boolean; error?: unknown }> {
  if (isStudentOffline()) {
    return { data: (await getSnapshot<T>(key)) ?? fallback, fromCache: true };
  }

  const cached = liveQueryCache.get(key);
  if (!options.force && cached && cached.expiresAt > Date.now()) {
    return { data: cached.data as T, fromCache: true };
  }

  if (!options.force) {
    const pending = liveQueryRequests.get(key);
    if (pending) {
      return pending as Promise<{ data: T; fromCache: boolean; error?: unknown }>;
    }
  }

  const generation = Symbol(key);
  liveQueryGenerations.set(key, generation);
  const request = (async () => {
    try {
      const result = await fetcher();
      if (result.error) throw result.error;
      const data = (result.data ?? fallback) as T;
      if (liveQueryGenerations.get(key) === generation) {
        liveQueryCache.set(key, {
          data,
          expiresAt: Date.now() + (options.maxAgeMs ?? DEFAULT_LIVE_CACHE_MS),
        });
        void setSnapshot(key, data);
      }
      return { data, fromCache: false };
    } catch (error) {
      if (cached) return { data: cached.data as T, fromCache: true, error };
      return { data: (await getSnapshot<T>(key)) ?? fallback, fromCache: true, error };
    }
  })().finally(() => {
    if (liveQueryGenerations.get(key) === generation) {
      liveQueryGenerations.delete(key);
      liveQueryRequests.delete(key);
    }
  });

  liveQueryRequests.set(key, request as Promise<{ data: unknown; fromCache: boolean; error?: unknown }>);
  return request;
}

export function invalidateCachedStudentQueries(prefix?: string) {
  if (!prefix) {
    liveQueryCache.clear();
    liveQueryRequests.clear();
    liveQueryGenerations.clear();
    return;
  }
  for (const key of liveQueryCache.keys()) {
    if (key.startsWith(prefix)) liveQueryCache.delete(key);
  }
  for (const key of liveQueryRequests.keys()) {
    if (key.startsWith(prefix)) { liveQueryRequests.delete(key); liveQueryGenerations.delete(key); }
  }
}

type NewStudentOfflineAction<T = StudentOfflineAction> = T extends StudentOfflineAction ? Omit<T, "id" | "createdAt"> : never;
export async function enqueueStudentAction(
  action: NewStudentOfflineAction,
): Promise<StudentOfflineAction> {
  const queued = {
    ...action,
    id: makeId(action.type),
    createdAt: new Date().toISOString(),
  } as StudentOfflineAction;
  await transaction(QUEUE_STORE, "readwrite", (store) => store.put(queued));
  window.dispatchEvent(new CustomEvent("student-offline-queue-changed"));
  return queued;
}

export async function getQueuedStudentActions(userId?: string | null, options: { strict?: boolean } = {}): Promise<StudentOfflineAction[]> {
  try {
    const actions = (await transaction<StudentOfflineAction[]>(QUEUE_STORE, "readonly", (store) => store.getAll())) ?? [];
    return actions
      .filter((action) => !userId || action.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch (error) {
    if (options.strict) throw error;
    return [];
  }
}

async function deleteQueuedAction(id: string) {
  await transaction(QUEUE_STORE, "readwrite", (store) => store.delete(id));
}

type LearningAction = Extract<StudentOfflineAction, { type: "save_lesson_draft" | "complete_lesson" | "complete_devotional" }>;
export type OfflineConflict = { action: LearningAction; current: Record<string, string> };
type AttendanceAction = Extract<StudentOfflineAction, { type: "attendance_upsert" }>;
type WorshipAction = Extract<StudentOfflineAction, { type: "worship_manual" }>;
export type AttendanceReview = { action: AttendanceAction | WorshipAction; reason: "finalized" | "newer_request" | "scope_review_required"; currentStatus?: string };

export async function syncAttendanceAction(action: AttendanceAction): Promise<AttendanceReview | null> {
  const { data, error } = await supabase.rpc("sync_owned_attendance" as never, {
    p_user_id: action.userId, p_church_id: action.churchId ?? null, p_event_id: action.payload.eventId,
    p_status: action.payload.status, p_requested_at: action.payload.requestedAt,
    p_justification: action.payload.justification ?? null,
    p_expected_status: action.payload.expectedStatus ?? null,
    p_expected_requested_at: action.payload.expectedRequestedAt ?? null,
    p_expected_justification: action.payload.expectedJustification ?? null,
  } as never);
  if (error) throw error;
  const result = data as { status?: string; current_status?: string } | null;
  if (result?.status === "saved") return null;
  if (result?.status === "finalized" || result?.status === "newer_request" || result?.status === "scope_review_required") {
    return { action, reason: result.status, currentStatus: result.current_status };
  }
  throw new Error("ATTENDANCE_UNEXPECTED_RESPONSE");
}

function isLearningAction(action: StudentOfflineAction): action is LearningAction {
  return action.type === "save_lesson_draft" || action.type === "complete_lesson" || action.type === "complete_devotional";
}

export async function syncLearningActionWithCurrent(action: LearningAction, expected?: Record<string, string>): Promise<{ conflict: OfflineConflict | null; current: Record<string, string> }> {
  const devotional = action.type === "complete_devotional";
  const lesson = action.type === "save_lesson_draft" || action.type === "complete_lesson";
  const completion = action.type === "complete_lesson" || action.type === "complete_devotional";
  if ((scopedLearningEnabled || completion) && (!action.scope || (completion && !action.scope.membershipVersion))) throw new Error("LEARNING_SCOPE_REVIEW_REQUIRED");
  const rpc = scopedLearningEnabled ? "sync_scoped_learning" : completion ? "sync_owned_completion" : "sync_owned_learning";
  const { data, error } = await supabase.rpc(rpc as never, {
    p_user_id: action.userId,
    ...((scopedLearningEnabled || completion) ? { p_church_id: action.scope!.churchId, p_turma_id: action.scope!.turmaId, p_area: action.scope!.area, ...(completion && !scopedLearningEnabled ? { p_membership_version: action.scope!.membershipVersion } : {}) } : {}),
    p_kind: action.type,
    p_item_id: devotional ? action.payload.devotionalId : action.payload.lessonId,
    p_responses: action.payload.responses,
    p_video_watched: lesson ? action.payload.videoWatched : false,
    p_audio_listened: lesson ? action.payload.audioListened : false,
    p_is_recovery: devotional ? action.payload.isRecovery : false,
    p_awarded_points: completion ? (action.type === "complete_lesson" && action.payload.isLateAccess ? 0 : action.payload.awardedPoints ?? null) : null,
    p_override_release_id: completion ? action.payload.overrideId ?? null : null,
    p_expected: expected ?? null,
  } as never);
  if (error) throw error;
  const result = data as { status: string; current?: Record<string, string> } | null;
  if (result?.status === "scope_review_required") throw new Error("LEARNING_SCOPE_REVIEW_REQUIRED");
  if (result?.status === "conflict") return { conflict: { action, current: result.current ?? {} }, current: result.current ?? {} };
  if (result?.status !== "synced") throw new Error("Resposta inesperada na sincronizacao");
  return { conflict: null, current: result.current ?? { ...(expected ?? {}), ...action.payload.responses } };
}

export async function syncLearningAction(action: LearningAction, expected?: Record<string, string>): Promise<OfflineConflict | null> {
  return (await syncLearningActionWithCurrent(action, expected)).conflict;
}

async function syncAction(action: StudentOfflineAction): Promise<OfflineConflict | AttendanceReview | null | void> {
  if (isLearningAction(action)) return syncLearningAction(action);

  if (action.type === "attendance_upsert") {
    return syncAttendanceAction(action);
  }

  if (action.type === "worship_manual") {
    const { data, error } = await supabase.rpc("sync_owned_worship" as never, {
      p_user_id:action.userId, p_church_id:action.churchId ?? null, p_action_id:action.id,
      p_worship_date:action.payload.worshipDate, p_worship_time:action.payload.worshipTime,
      p_preacher_name:action.payload.preacherName, p_event_type:action.payload.eventType,
    } as never);
    if (error) throw error;
    const status = (data as { status?:string } | null)?.status;
    if (status === "scope_review_required") return { action, reason:"scope_review_required" };
    if (status !== "saved") throw new Error("WORSHIP_UNEXPECTED_RESPONSE");
  }
}

type CompletionAction = Extract<StudentOfflineAction, { type: "complete_lesson" | "complete_devotional" }>;
function isCompletionAction(action: StudentOfflineAction): action is CompletionAction {
  return action.type === "complete_lesson" || action.type === "complete_devotional";
}
async function requestCompletionReview(action: CompletionAction): Promise<LearningScope | undefined> {
  // No answer text leaves the device during the leadership review.
  const { data, error } = await supabase.rpc("request_completion_review" as never, {
    p_action_id: action.id, p_kind: action.type,
    p_item_id: action.type === "complete_lesson" ? action.payload.lessonId : action.payload.devotionalId,
  } as never);
  if (error) throw error;
  const result = data as { status?: string; scope?: LearningScope } | null;
  const scope = result?.scope;
  if (result?.status !== "approved" || !scope || !scope.churchId || !scope.turmaId || !scope.area || !scope.membershipVersion) return undefined;
  return scope;
}
let syncInFlight = false;

async function stageLearningReview(action: LearningAction): Promise<"review_pending" | "review_resolved" | "scope_review_required"> {
  const { data, error } = await supabase.rpc("stage_local_learning_review" as never, {
    p_user_id: action.userId, p_action_id: action.id, p_kind: action.type,
    p_item_id: action.type === "complete_devotional" ? action.payload.devotionalId : action.payload.lessonId,
    p_payload: action.payload, p_church_id: action.scope?.churchId ?? action.churchId ?? null,
    p_turma_id: action.scope?.turmaId ?? null, p_area: action.scope?.area ?? null,
  } as never);
  if (error) throw error;
  const status = (data as { status?: string } | null)?.status;
  if (status !== "review_pending" && status !== "review_resolved" && status !== "scope_review_required") throw new Error("INVALID_REVIEW_RECEIPT");
  return status;
}

type StudentSyncResult = { synced:number; remaining:number; conflict?:OfflineConflict; attendanceReview?:AttendanceReview; reviewPending?:boolean; otherScopePending?:boolean; legacyCompletionPending?:boolean };
export async function syncStudentOfflineQueue(userId?: string | null): Promise<StudentSyncResult> {
  if (!userId || syncInFlight || isStudentOffline()) return { synced: 0, remaining: 0 };
  syncInFlight = true;
  let synced = 0;
  let attendanceReview: AttendanceReview | undefined;
  let legacyCompletionPending = false;

  try {
    const actions = await getQueuedStudentActions(userId, { strict: true });
    for (const action of actions) {
      // Attendance and manual worship records still lack an audited historical
      // group flow. Keep them on the device rather than infer their scope.
      if (scopedLearningEnabled && !isLearningAction(action)) {
        return { synced, remaining: actions.length - synced, otherScopePending: true };
      }
      let effectiveAction: StudentOfflineAction = action;
      if (!scopedLearningEnabled && isCompletionAction(action) && (!action.scope || !action.scope.membershipVersion)) {
        try {
          const scope = await requestCompletionReview(action);
          if (!scope) { legacyCompletionPending = true; continue; }
          effectiveAction = { ...action, scope };
        } catch { legacyCompletionPending = true; continue; }
      }
      let conflict: OfflineConflict | AttendanceReview | null | void;
      if (scopedLearningEnabled && isLearningAction(action)) {
        try {
          if (!action.scope) throw new Error("LEARNING_SCOPE_REVIEW_REQUIRED");
          conflict = await syncAction(action);
        } catch (error) {
          if (!(error instanceof Error) || error.message !== "LEARNING_SCOPE_REVIEW_REQUIRED") throw error;
          const review = await stageLearningReview(action);
          if (review !== "review_resolved") {
            window.dispatchEvent(new Event("legacy-recovery-pending"));
            return { synced, remaining: actions.length - synced, reviewPending: true };
          }
          await deleteQueuedAction(action.id);
          synced += 1;
          continue;
        }
      } else {
        try { conflict = await syncAction(effectiveAction); }
        catch (error) {
          if (isCompletionAction(action) && error instanceof Error && error.message === "LEARNING_SCOPE_REVIEW_REQUIRED") {
            // A transfer invalidates the earlier version. Ask leadership to
            // review a destination; do not send the response text here.
            try {
              const scope = await requestCompletionReview(action);
              if (scope) {
                effectiveAction = { ...action, scope };
                conflict = await syncAction(effectiveAction);
              } else { legacyCompletionPending = true; continue; }
            } catch { legacyCompletionPending = true; continue; }
          } else throw error;
        }
      }
      if (conflict && "reason" in conflict) { attendanceReview ??= conflict; continue; }
      if (scopedLearningEnabled && conflict && isLearningAction(action)) {
        // Review through the server-side scoped flow, which rechecks both the
        // destination and every displayed current answer under lock.
        const review = await stageLearningReview(action);
        if (review !== "review_resolved") {
          window.dispatchEvent(new Event("legacy-recovery-pending"));
          return { synced, remaining: actions.length - synced, reviewPending: true };
        }
        await deleteQueuedAction(action.id);
        synced += 1;
        continue;
      }
      if (conflict && "current" in conflict) {
        const remaining = actions.length - synced;
        if (synced > 0) {
          window.dispatchEvent(new CustomEvent("student-offline-queue-synced", { detail: { synced, remaining } }));
          window.dispatchEvent(new CustomEvent("student-offline-queue-changed"));
        }
        return { synced, remaining, conflict };
      }
      await deleteQueuedAction(action.id);
      synced += 1;
    }
    const remaining = (await getQueuedStudentActions(userId, { strict: true })).length;
    if (synced > 0) {
      window.dispatchEvent(new CustomEvent("student-offline-queue-synced", { detail: { synced, remaining } }));
      window.dispatchEvent(new CustomEvent("student-offline-queue-changed"));
    }
    return { synced, remaining, attendanceReview, legacyCompletionPending };
  } finally {
    syncInFlight = false;
  }
}


// A deliberate choice only applies if the server still matches what was shown.
export async function resolveOfflineConflict(conflict: OfflineConflict, choice: "server" | "offline"): Promise<OfflineConflict | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== conflict.action.userId) throw new Error("Sessao expirada");
  const queued = await getQueuedStudentActions(user.id, { strict: true });
  if (!queued.some(action => action.id === conflict.action.id)) throw new Error("Rascunho nao encontrado");
  if (choice === "server" && isCompletionAction(conflict.action)) {
    // Complete with the displayed server answers only if they are still the
    // same; incomplete answers fail validation and the queue remains intact.
    const action = { ...conflict.action, payload: { ...conflict.action.payload, responses: conflict.current } } as CompletionAction;
    const nextConflict = await syncLearningAction(action, conflict.current);
    if (nextConflict) return nextConflict;
  } else if (choice === "offline") {
    const nextConflict = await syncLearningAction(conflict.action, conflict.current);
    if (nextConflict) return nextConflict;
  }
  await deleteQueuedAction(conflict.action.id);
  window.dispatchEvent(new CustomEvent("student-offline-queue-changed"));
  return null;
}

export async function getPendingStudentOverlay(userId: string, options: { strict?: boolean; scope?: LearningScope } = {}) {
  const queued = await getQueuedStudentActions(userId, options);
  // Never project unscoped or another group's learning text into the current
  // activity. Those entries remain in the device queue for explicit review.
  const actions = scopedLearningEnabled ? queued.filter(action => isLearningAction(action) &&
    (!!action.scope && !!options.scope && action.scope.churchId === options.scope.churchId &&
      action.scope.turmaId === options.scope.turmaId && action.scope.area === options.scope.area)) : queued.filter(action => {
        if (action.type !== "complete_lesson" && action.type !== "complete_devotional") return true;
        return !!action.scope && !!options.scope && action.scope.churchId === options.scope.churchId &&
          action.scope.turmaId === options.scope.turmaId && action.scope.area === options.scope.area &&
          !!action.scope.membershipVersion && action.scope.membershipVersion === options.scope.membershipVersion;
      });
  return {
    actions,
    lessonProgress: actions
      .filter((action) => action.type === "complete_lesson")
      .map((action) => ({
        lesson_id: action.payload.lessonId,
        completed_at: action.createdAt,
        video_watched: action.payload.videoWatched,
        audio_listened: action.payload.audioListened,
        is_completed: true,
        pending_sync: true,
      })),
    lessonResponses: actions
      .filter((action) => action.type === "complete_lesson" || action.type === "save_lesson_draft")
      .flatMap((action) =>
        Object.entries(action.payload.responses).map(([question_key, response]) => ({
          lesson_id: action.payload.lessonId,
          user_id: action.userId,
          question_key,
          response,
          pending_sync: true,
        })),
      ),
    devotionalProgress: actions
      .filter((action) => action.type === "complete_devotional")
      .map((action) => ({
        devotional_id: action.payload.devotionalId,
        completed_at: action.createdAt,
        is_recovery: action.payload.isRecovery,
        awarded_points: action.payload.awardedPoints,
        pending_sync: true,
      })),
    devotionalResponses: actions
      .filter((action) => action.type === "complete_devotional")
      .flatMap((action) =>
        Object.entries(action.payload.responses).map(([question_index, response]) => ({
          devotional_id: action.payload.devotionalId,
          user_id: action.userId,
          question_index: Number(question_index),
          response,
          pending_sync: true,
        })),
      ),
    attendance: actions
      .filter((action) => action.type === "attendance_upsert")
      .map((action) => ({
        event_id: action.payload.eventId,
        user_id: action.userId,
        status: action.payload.status,
        confirmation_source: action.payload.confirmationSource,
        user_requested_at: action.payload.requestedAt,
        leader_confirmed_at: null,
        justification: action.payload.justification ?? null,
        pending_sync: true,
      })),
    worshipAttendance: actions
      .filter((action) => action.type === "worship_manual")
      .map((action) => ({
        id: action.id,
        user_id: action.userId,
        worship_date: action.payload.worshipDate,
        worship_time: action.payload.worshipTime,
        preacher_name: action.payload.preacherName,
        event_type: action.payload.eventType,
        status: "pendente",
        pending_sync: true,
      })),
  };
}

export function mergeByKey<
  T extends object,
  U extends object,
>(base: T[], overlay: U[], key: keyof T & keyof U): Array<T | U> {
  const map = new Map<string, T | U>();
  base.forEach((item) => map.set(String(item[key]), item));
  overlay.forEach((item) => map.set(String(item[key]), item));
  return [...map.values()];
}
