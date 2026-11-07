export type LessonMediaProgress = {
  videoWatched: boolean;
  audioListened: boolean;
};

const STORAGE_PREFIX = "lesson-media-progress";

function storageKey(userId: string, lessonId: string) {
  return `${STORAGE_PREFIX}:${userId}:${lessonId}`;
}

const emptyProgress: LessonMediaProgress = {
  videoWatched: false,
  audioListened: false,
};

export function getStoredLessonMediaProgress(
  userId: string,
  lessonId: string,
): LessonMediaProgress {
  if (typeof window === "undefined") return emptyProgress;

  try {
    const stored = window.localStorage.getItem(storageKey(userId, lessonId));
    if (!stored) return emptyProgress;
    const parsed = JSON.parse(stored) as Partial<LessonMediaProgress>;
    return {
      videoWatched: parsed.videoWatched === true,
      audioListened: parsed.audioListened === true,
    };
  } catch {
    return emptyProgress;
  }
}

export function storeLessonMediaProgress(
  userId: string,
  lessonId: string,
  progress: Partial<LessonMediaProgress>,
): LessonMediaProgress {
  const current = getStoredLessonMediaProgress(userId, lessonId);
  const merged = {
    videoWatched: current.videoWatched || progress.videoWatched === true,
    audioListened: current.audioListened || progress.audioListened === true,
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKey(userId, lessonId), JSON.stringify(merged));
    } catch {
      // The immediate Supabase write and regular autosave remain available.
    }
  }

  return merged;
}
