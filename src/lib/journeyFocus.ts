export type JourneyFocusMode =
  | "current_agenda"
  | "upcoming_agenda"
  | "last_scheduled"
  | "open_access"
  | "waiting_schedule"
  | "complete";

type JourneyFocusLesson = {
  id: string;
  order_num: number;
};

type JourneyFocusCourse = {
  id: string;
  order_num: number;
  lessons: readonly JourneyFocusLesson[];
};

type JourneyFocusScheduleEntry = {
  courseId: string;
  lessonId: string;
  eventDate: Date;
};

type JourneyFocusInput = {
  courses: readonly JourneyFocusCourse[];
  unlockedCourseIds: ReadonlySet<string>;
  openAccessCourseIds: ReadonlySet<string>;
  fullyCompletedLessonIds: ReadonlySet<string>;
  currentAgendaEntry: JourneyFocusScheduleEntry | null;
  schedule: readonly JourneyFocusScheduleEntry[];
  now?: Date;
};

export type JourneyFocus = {
  courseId: string;
  lessonId: string | null;
  mode: JourneyFocusMode;
};

/**
 * Resolves the course and lesson displayed as the participant's current phase.
 *
 * Agenda-managed courses always follow the official group schedule. Personal
 * completion history is only used to find the next lesson in open-access
 * courses, never to replace the lesson currently in force in the Agenda.
 */
export function resolveJourneyFocus({
  courses,
  unlockedCourseIds,
  openAccessCourseIds,
  fullyCompletedLessonIds,
  currentAgendaEntry,
  schedule,
  now = new Date(),
}: JourneyFocusInput): JourneyFocus | null {
  const unlockedCourses = courses
    .filter((course) => unlockedCourseIds.has(course.id))
    .sort((a, b) => a.order_num - b.order_num);

  if (unlockedCourses.length === 0) return null;

  const courseMap = new Map(unlockedCourses.map((course) => [course.id, course]));
  const isValidScheduledEntry = (entry: JourneyFocusScheduleEntry | null) => {
    if (!entry) return false;
    const course = courseMap.get(entry.courseId);
    return Boolean(
      course
      && !openAccessCourseIds.has(course.id)
      && course.lessons.some((lesson) => lesson.id === entry.lessonId),
    );
  };

  if (isValidScheduledEntry(currentAgendaEntry)) {
    return {
      courseId: currentAgendaEntry!.courseId,
      lessonId: currentAgendaEntry!.lessonId,
      mode: "current_agenda",
    };
  }

  const orderedSchedule = [...schedule]
    .filter((entry) => isValidScheduledEntry(entry))
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  const upcomingEntry = orderedSchedule.find((entry) => entry.eventDate.getTime() >= now.getTime());

  if (upcomingEntry) {
    return {
      courseId: upcomingEntry.courseId,
      lessonId: upcomingEntry.lessonId,
      mode: "upcoming_agenda",
    };
  }

  const openCourses = unlockedCourses.filter((course) => openAccessCourseIds.has(course.id));
  const openCourseWithPending = openCourses
    .filter((course) => course.lessons.some((lesson) => !fullyCompletedLessonIds.has(lesson.id)))
    .at(-1);

  if (openCourseWithPending) {
    const lesson = openCourseWithPending.lessons.find(
      (item) => !fullyCompletedLessonIds.has(item.id),
    );
    return {
      courseId: openCourseWithPending.id,
      lessonId: lesson?.id ?? null,
      mode: "open_access",
    };
  }

  const allUnlockedCompleted = unlockedCourses.every(
    (course) => course.lessons.length > 0
      && course.lessons.every((lesson) => fullyCompletedLessonIds.has(lesson.id)),
  );

  if (allUnlockedCompleted) {
    return {
      courseId: unlockedCourses.at(-1)!.id,
      lessonId: null,
      mode: "complete",
    };
  }

  const lastScheduledEntry = orderedSchedule.at(-1);
  if (lastScheduledEntry) {
    return {
      courseId: lastScheduledEntry.courseId,
      lessonId: lastScheduledEntry.lessonId,
      mode: "last_scheduled",
    };
  }

  const scheduledCourse = unlockedCourses
    .filter((course) => !openAccessCourseIds.has(course.id))
    .at(-1);

  return scheduledCourse
    ? { courseId: scheduledCourse.id, lessonId: null, mode: "waiting_schedule" }
    : null;
}
