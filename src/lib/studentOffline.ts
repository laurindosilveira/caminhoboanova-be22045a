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

export type StudentOfflineAction =
  | {
      id: string;
      type: "save_lesson_draft";
      userId: string;
      churchId?: string | null;
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

  dbPromise = new Promise((resolve, reject) => {
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
  });

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
  fetcher: () => Promise<{ data: T | null; error?: unknown }>,
  fallback: T,
): Promise<{ data: T; fromCache: boolean; error?: unknown }> {
  if (isStudentOffline()) {
    return { data: (await getSnapshot<T>(key)) ?? fallback, fromCache: true };
  }

  try {
    const result = await fetcher();
    if (result.error) throw result.error;
    const data = (result.data ?? fallback) as T;
    await setSnapshot(key, data);
    return { data, fromCache: false };
  } catch (error) {
    return { data: (await getSnapshot<T>(key)) ?? fallback, fromCache: true, error };
  }
}

export async function enqueueStudentAction(
  action: Omit<StudentOfflineAction, "id" | "createdAt">,
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

export async function getQueuedStudentActions(userId?: string | null): Promise<StudentOfflineAction[]> {
  try {
    const actions = (await transaction<StudentOfflineAction[]>(QUEUE_STORE, "readonly", (store) => store.getAll())) ?? [];
    return actions
      .filter((action) => !userId || action.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch {
    return [];
  }
}

async function deleteQueuedAction(id: string) {
  await transaction(QUEUE_STORE, "readwrite", (store) => store.delete(id));
}

async function syncAction(action: StudentOfflineAction) {
  if (action.type === "save_lesson_draft") {
    const { error } = await supabase.rpc("save_lesson_draft", {
      p_lesson_id: action.payload.lessonId,
      p_responses: action.payload.responses,
      p_video_watched: action.payload.videoWatched,
      p_audio_listened: action.payload.audioListened,
    });
    if (error) throw error;
    return;
  }

  if (action.type === "complete_lesson") {
    const { error } = await supabase.rpc("complete_lesson", {
      p_lesson_id: action.payload.lessonId,
      p_responses: action.payload.responses,
      p_video_watched: action.payload.videoWatched,
      p_audio_listened: action.payload.audioListened,
      p_awarded_points: action.payload.isLateAccess ? 0 : action.payload.awardedPoints,
      p_override_release_id: action.payload.overrideId ?? null,
    });
    if (error) throw error;
    return;
  }

  if (action.type === "complete_devotional") {
    const { error } = await supabase.rpc("complete_devotional", {
      p_devotional_id: action.payload.devotionalId,
      p_responses: action.payload.responses,
      p_is_recovery: action.payload.isRecovery,
      p_awarded_points: action.payload.awardedPoints,
      p_override_release_id: action.payload.overrideId ?? null,
    });
    if (error) throw error;
    return;
  }

  if (action.type === "attendance_upsert") {
    const payload = {
      user_id: action.userId,
      church_id: action.churchId ?? null,
      event_id: action.payload.eventId,
      status: action.payload.status,
      confirmation_source: action.payload.confirmationSource,
      user_requested_at: action.payload.requestedAt,
      justification: action.payload.justification ?? null,
    };

    const { data: existing, error: lookupError } = await supabase
      .from("attendance")
      .select("id")
      .eq("event_id", action.payload.eventId)
      .eq("user_id", action.userId)
      .maybeSingle();
    if (lookupError) throw lookupError;

    const result = existing?.id
      ? await supabase.from("attendance").update(payload).eq("id", existing.id)
      : await supabase.from("attendance").insert(payload);
    const { error } = result;
    if (error) throw error;
    return;
  }

  if (action.type === "worship_manual") {
    const { error } = await supabase.from("worship_attendance").insert({
      user_id: action.userId,
      church_id: action.churchId ?? null,
      worship_date: action.payload.worshipDate,
      worship_time: action.payload.worshipTime,
      preacher_name: action.payload.preacherName,
      event_type: action.payload.eventType,
    });
    if (error) throw error;
  }
}

let syncInFlight = false;

export async function syncStudentOfflineQueue(userId?: string | null) {
  if (syncInFlight || isStudentOffline()) return { synced: 0, remaining: 0 };
  syncInFlight = true;
  let synced = 0;

  try {
    const actions = await getQueuedStudentActions(userId);
    for (const action of actions) {
      await syncAction(action);
      await deleteQueuedAction(action.id);
      synced += 1;
    }
    const remaining = (await getQueuedStudentActions(userId)).length;
    if (synced > 0) {
      window.dispatchEvent(new CustomEvent("student-offline-queue-synced", { detail: { synced, remaining } }));
      window.dispatchEvent(new CustomEvent("student-offline-queue-changed"));
    }
    return { synced, remaining };
  } finally {
    syncInFlight = false;
  }
}

export async function getPendingStudentOverlay(userId: string) {
  const actions = await getQueuedStudentActions(userId);
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

export function mergeByKey<T extends Record<string, unknown>>(base: T[], overlay: T[], key: keyof T) {
  const map = new Map<string, T>();
  base.forEach((item) => map.set(String(item[key]), item));
  overlay.forEach((item) => map.set(String(item[key]), item));
  return [...map.values()];
}
