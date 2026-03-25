import type { AppUpdateReport } from "./appUpdateReportTypes";

// Este arquivo e gerado automaticamente por scripts/generate-app-update-reports.ps1.
// Nao edite manualmente.
export const generatedAppUpdateReports: AppUpdateReport[] = [
    {
        "id":  "28f8f6729d56eb0043360f9152d2186adc6d1600",
        "version":  "commit-28f8f67",
        "title":  "Descri├º├úo das altera├º├Áes",
        "releasedAt":  "2026-03-24",
        "summary":  "Atualizacao registrada a partir do commit: Descri├º├úo das altera├º├Áes",
        "highlights":  [
                           "8 arquivo(s) alterado(s) nesta atualizacao.",
                           "Arquivo atualizado: src/components/admin/tabs/AdminDiscipleshipTab.tsx",
                           "Arquivo atualizado: src/components/home/DevotionalReminder.tsx",
                           "Arquivo atualizado: src/components/home/JourneyPath.tsx"
                       ],
        "codeChanges":  [
                            {
                                "filePath":  "src/components/admin/tabs/AdminDiscipleshipTab.tsx",
                                "language":  "tsx",
                                "summary":  "Alteracoes registradas em src/components/admin/tabs/AdminDiscipleshipTab.tsx.",
                                "snippet":  "@@ -130,41 +130,41 @@ export default function AdminDiscipleshipTab({ participants, activities, initial\n   const withPastor = participants.filter(p =\u003e plans[p.user_id]?.needs_pastor);\n   const criticos = participants.filter(p =\u003e plans[p.user_id]?.health_status === \"critico\");\n   const priorities = participants.filter(p =\u003e plans[p.user_id]?.is_priority);\n   const saudaveis = participants.filter(p =\u003e plans[p.user_id]?.health_status === \"saudavel\");\n \n   return (\n     \u003cdiv className=\"space-y-4\"\u003e\n       {/* Course Unlock Management */}\n       {courses.length \u003e 0 \u0026\u0026 (\n         \u003cdiv className=\"bg-card rounded-2xl border border-border p-4 shadow-sm\"\u003e\n           \u003cdiv className=\"flex items-center gap-2 mb-3\"\u003e\n             \u003cGraduationCap className=\"w-4 h-4 text-secondary\" /\u003e\n             \u003cp className=\"font-montserrat font-bold text-foreground text-sm\"\u003eLibera├º├úo de Cursos\u003c/p\u003e\n           \u003c/div\u003e\n           \u003cp className=\"font-inter text-xs text-muted-foreground mb-2\"\u003e\n             Libere os cursos que sua turma poder├í acessar. Cursos bloqueados ficam vis├¡veis mas inacess├¡veis.\n           \u003c/p\u003e\n           \u003cdiv className=\"flex items-start gap-2 p-2.5 rounded-xl bg-secondary/5 border border-secondary/20 mb-3\"\u003e\n             \u003cInfo className=\"w-4 h-4 text-secondary flex-shrink-0 mt-0.5\" /\u003e\n             \u003cp className=\"font-inter text-[10px] text-secondary leading-relaxed\"\u003e\n-              \u003cstrong\u003eComo funciona:\u003c/strong\u003e Liberar um curso ├® o \u003cstrong\u003eprimeiro passo\u003c/strong\u003e. Cada li├º├úo s├│ ficar├í dispon├¡vel para o aluno quando houver um \u003cstrong\u003eevento na Agenda\u003c/strong\u003e vinculado a ela (dentro da janela de 10 dias ├║teis antes do encontro). Sem evento agendado, a li├º├úo permanece com \"Aguardando programa├º├úo\".\n+              \u003cstrong\u003eComo funciona:\u003c/strong\u003e Vincular uma li├º├úo a um \u003cstrong\u003eevento na Agenda\u003c/strong\u003e j├í libera automaticamente essa li├º├úo para a turma dentro da janela de 10 dias ├║teis antes do encontro. A libera├º├úo manual do curso continua opcional como apoio de organiza├º├úo, mas n├úo ├® mais obrigat├│ria para abrir a li├º├úo.\n             \u003c/p\u003e\n           \u003c/div\u003e\n           \u003cdiv className=\"space-y-2\"\u003e\n             {courses.map(c =\u003e {\n               const isUnlocked = unlockedCourseIds.has(c.id);\n               const loading = unlockLoading === c.id;\n               return (\n                 \u003cdiv key={c.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${\n                   isUnlocked ? \"border-brand-green/30 bg-brand-green/5\" : \"border-border bg-muted/30\"\n                 }`}\u003e\n                   \u003cdiv className=\"flex items-center gap-3 min-w-0\"\u003e\n                     \u003cdiv className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${\n                       isUnlocked ? \"bg-brand-green/15\" : \"bg-muted\"\n                     }`}\u003e\n                       {isUnlocked\n                         ? \u003cUnlock className=\"w-4 h-4 text-brand-green\" /\u003e\n                         : \u003cLock className=\"w-4 h-4 text-muted-foreground\" /\u003e\n                       }\n                     \u003c/div\u003e\n                     \u003cdiv className=\"min-w-0\"\u003e"
                            },
                            {
                                "filePath":  "src/components/home/DevotionalReminder.tsx",
                                "language":  "tsx",
                                "summary":  "Alteracoes registradas em src/components/home/DevotionalReminder.tsx.",
                                "snippet":  "@@ -12,74 +12,102 @@ type DevotionalStats = {\n };\n \n type Props = {\n   onNavigateToDiscipulado: () =\u003e void;\n };\n \n export default function DevotionalReminder({ onNavigateToDiscipulado }: Props) {\n   const [stats, setStats] = useState\u003cDevotionalStats | null\u003e(null);\n   const [dismissed, setDismissed] = useState(false);\n   const [loading, setLoading] = useState(true);\n \n   useEffect(() =\u003e {\n     async function check() {\n       const { data: { user } } = await supabase.auth.getUser();\n       if (!user) { setLoading(false); return; }\n \n       // Get user profile for area\n       const { data: profileData } = await supabase.from(\"profiles\").select(\"area\").eq(\"user_id\", user.id).maybeSingle();\n       const userArea = profileData?.area;\n \n-      const [{ data: lessons }, { data: devs }, { data: prog }, { data: unlocks }] = await Promise.all([\n+      const [{ data: lessons }, { data: devs }, { data: prog }, { data: events }] = await Promise.all([\n         supabase.from(\"lessons\").select(\"id, title, order_num, course_id\").order(\"order_num\"),\n-        supabase.from(\"devotional_content\").select(\"id, lesson_id\"),\n+        supabase.from(\"devotional_content\").select(\"id, lesson_id, day_number\"),\n         supabase.from(\"devotional_progress\").select(\"devotional_id\").eq(\"user_id\", user.id),\n-        supabase.from(\"course_unlocks\").select(\"course_id\").eq(\"area\", userArea ?? \"\"),\n+        supabase.from(\"events\").select(\"event_date, linked_lesson_id, area\").not(\"linked_lesson_id\", \"is\", null).order(\"event_date\"),\n       ]);\n \n-      const unlockedCourseIds = new Set((unlocks ?? []).map(u =\u003e u.course_id));\n       const completedSet = new Set((prog ?? []).map((p: any) =\u003e p.devotional_id));\n       const totalCompleted = completedSet.size;\n+      const lessonMap = new Map((lessons ?? []).map((lesson: any) =\u003e [lesson.id, lesson]));\n+      const today = new Date();\n+      today.setHours(0, 0, 0, 0);\n+\n+      const scheduleByLesson = new Map\u003cstring, Date[]\u003e();\n+      for (const event of events ?? []) {\n+        if (!event.linked_lesson_id) continue;\n+        if (event.area \u0026\u0026 userArea \u0026\u0026 event.area !== userArea) continue;\n+        if (!lessonMap.has(event.linked_lesson_id)) continue;\n+\n+        const eventDate = new Date(event.event_date);\n+        const devotionalDates: Date[] = [];\n+        const current = new Date(eventDate);\n+        current.setHours(0, 0, 0, 0);\n+        current.setDate(current.getDate() - 1);\n+\n+        while (devotionalDates.length \u003c 5) {\n+          if (current.getDay() !== 0 \u0026\u0026 current.getDay() !== 6) {\n+            devotionalDates.unshift(new Date(current));\n+          }\n+          current.setDate(current.getDate() - 1);\n+        }\n+\n+        scheduleByLesson.set(event.linked_lesson_id, devotionalDates);\n+      }\n \n-      // Only consider lessons from unlocked courses\n-      const accessibleLessons = (lessons ?? []).filter((l: any) =\u003e unlockedCourseIds.has(l.course_id));\n+      // Only consider lessons that are actually scheduled\n+      const accessibleLessons = (lessons ?? []).filter((lesson: any) =\u003e scheduleByLesson.has(lesson.id));\n \n       // Group devotionals by lesson\n-      const lessonDevMap: Record\u003cstring, { total: number; completed: number }\u003e = {};\n+      const lessonDevMap: Record\u003cstring, { total: number; completed: number; available: number }\u003e = {};\n       (devs ?? []).forEach((d: any) =\u003e {\n         if (!d.lesson_id) return;\n-        if (!lessonDevMap[d.lesson_id]) lessonDevMap[d.lesson_id] = { total: 0, completed: 0 };\n+        const schedule = scheduleByLesson.get(d.lesson_id);\n+        if (!schedule) return;\n+        if (!lessonDevMap[d.lesson_id]) lessonDevMap[d.lesson_id] = { total: 0, completed: 0, available: 0 };\n         lessonDevMap[d.lesson_id].total++;\n         if (completedSet.has(d.id)) lessonDevMap[d.lesson_id].completed++;\n+        const scheduledDate = schedule[d.day_number - 1];\n+        if (scheduledDate \u0026\u0026 scheduledDate \u003c= today) lessonDevMap[d.lesson_id].available++;\n       });\n \n       // Find the FIRST accessible lesson with pending devotionals\n       let currentLesson: DevotionalStats | null = null;\n       for (const l of accessibleLessons as any[]) {\n         const info = lessonDevMap[l.id];\n-        if (info \u0026\u0026 info.completed \u003c info.total) {\n+        if (info \u0026\u0026 info.available \u003e info.completed) {\n           currentLesson = {\n             totalCompleted,\n             currentLessonTitle: l.title,\n             currentLessonOrder: l.order_num,\n             currentLessonCompleted: info.completed,\n-            currentLessonTotal: info.total,\n+            currentLessonTotal: info.available,\n             hasAnyPending: true,\n           };\n           break;\n         }\n       }\n \n       if (!currentLesson \u0026\u0026 totalCompleted \u003e 0) {\n         // All done!\n         currentLesson = {\n           totalCompleted,\n           currentLessonTitle: \"\",\n           currentLessonOrder: 0,\n           currentLessonCompleted: 0,\n           currentLessonTotal: 0,\n           hasAnyPending: false,\n        \n..."
                            },
                            {
                                "filePath":  "src/components/home/JourneyPath.tsx",
                                "language":  "tsx",
                                "summary":  "Alteracoes registradas em src/components/home/JourneyPath.tsx.",
                                "snippet":  "@@ -1,24 +1,25 @@\n import { useState, useEffect } from \"react\";\n import { supabase } from \"@/integrations/supabase/client\";\n import { CheckCircle2, Lock, BookOpen, ChevronDown, ChevronRight, CalendarDays, Heart, GraduationCap } from \"lucide-react\";\n import { useAuth } from \"@/contexts/AuthContext\";\n+import { useAgendaSchedule } from \"@/hooks/useAgendaSchedule\";\n \n type Lesson = {\n   id: string;\n   title: string;\n   order_num: number;\n   objective: string | null;\n   course_id: string;\n };\n \n type Course = {\n   id: string;\n   title: string;\n   subtitle: string | null;\n   order_num: number;\n   lessons: Lesson[];\n };\n \n type IntegratedStats = {\n   lessonsStudied: number;\n   totalLessons: number;\n@@ -27,40 +28,41 @@ type IntegratedStats = {\n   attendancePresent: number;\n   totalEvents: number;\n   worshipApproved: number;\n };\n \n function ProgressRing({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {\n   const r = (size - 8) / 2;\n   const circ = 2 * Math.PI * r;\n   const dash = circ * (pct / 100);\n   return (\n     \u003csvg width={size} height={size} className=\"-rotate-90\"\u003e\n       \u003ccircle cx={size / 2} cy={size / 2} r={r} fill=\"none\" stroke=\"hsl(var(--muted))\" strokeWidth={5} /\u003e\n       \u003ccircle cx={size / 2} cy={size / 2} r={r} fill=\"none\" stroke={color} strokeWidth={5}\n         strokeDasharray={`${dash} ${circ}`} strokeLinecap=\"round\" /\u003e\n     \u003c/svg\u003e\n   );\n }\n \n export default function JourneyPath() {\n   const { profile } = useAuth();\n+  const agendaSchedule = useAgendaSchedule();\n   const [courses, setCourses] = useState\u003cCourse[]\u003e([]);\n   const [completedLessonIds, setCompletedLessonIds] = useState\u003cSet\u003cstring\u003e\u003e(new Set());\n   const [fullyCompletedLessonIds, setFullyCompletedLessonIds] = useState\u003cSet\u003cstring\u003e\u003e(new Set());\n   const [unlockedCourseIds, setUnlockedCourseIds] = useState\u003cSet\u003cstring\u003e\u003e(new Set());\n   const [loading, setLoading] = useState(true);\n   const [expandedCourse, setExpandedCourse] = useState\u003cstring | null\u003e(null);\n   const [integrated, setIntegrated] = useState\u003cIntegratedStats\u003e({\n     lessonsStudied: 0, totalLessons: 0,\n     devotionalsCompleted: 0, totalDevotionals: 0,\n     attendancePresent: 0, totalEvents: 0,\n     worshipApproved: 0,\n   });\n \n   useEffect(() =\u003e {\n     if (profile?.area) fetchData();\n   }, [profile?.area]);\n \n   async function fetchData() {\n     const { data: { user } } = await supabase.auth.getUser();\n     if (!user) { setLoading(false); return; }\n@@ -167,42 +169,44 @@ export default function JourneyPath() {\n           \u003c/span\u003e\n         \u003c/div\u003e\n         \u003cdiv className=\"flex items-center gap-3\"\u003e\n           \u003cdiv className=\"flex-1 h-3 bg-muted rounded-full overflow-hidden\"\u003e\n             \u003cdiv\n               className=\"h-full rounded-full transition-all duration-700\"\n               style={{\n                 width: `${overallPct}%`,\n                 background: overallPct \u003e= 70 ? \"var(--gradient-green)\" : overallPct \u003e= 34 ? \"var(--gradient-orange)\" : \"hsl(var(--destructive))\",\n               }}\n             /\u003e\n           \u003c/div\u003e\n           \u003cspan className=\"text-xs font-montserrat font-bold text-secondary flex-shrink-0\"\u003e{doneItems}/{totalItems}\u003c/span\u003e\n         \u003c/div\u003e\n         \u003cp className=\"text-muted-foreground font-inter text-[11px] mt-1.5\"\u003e\n           Progresso geral: li├º├Áes estudadas e devocionais conclu├¡dos\n         \u003c/p\u003e\n \n         {/* Fase atual */}\n         {(() =\u003e {\n-          // Only consider unlocked courses\n-          const unlockedCourses = courses.filter(c =\u003e unlockedCourseIds.has(c.id));\n+          // Consider manually unlocked courses and courses with scheduled lessons\n+          const unlockedCourses = courses.filter(c =\u003e\n+            unlockedCourseIds.has(c.id) || c.lessons.some(l =\u003e agendaSchedule.scheduledLessonIds.has(l.id))\n+          );\n           if (unlockedCourses.length === 0) return null;\n \n           // Find the highest-order unlocked course that still has pending lessons\n           const withPending = unlockedCourses.filter(c =\u003e\n             c.lessons.some(l =\u003e !fullyCompletedLessonIds.has(l.id))\n           );\n \n           // If all unlocked courses are fully done, show the last unlocked as completed\n           const currentCourse = withPending.length \u003e 0\n             ? withPending[withPending.length - 1]\n             : unlockedCourses[unlockedCourses.length - 1];\n \n           const currentLesson = currentCourse.lessons.find(l =\u003e !fullyCompletedLessonIds.has(l.id));\n           const allDone = withPending.length === 0;\n \n           return (\n             \u003cdiv className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2 ${allDone ? \"bg-brand-green/10\" : \"bg-secondary/10\"}`}\u003e\n               \u003cspan className=\"text-sm\"\u003e{allDone ? \"­ƒÅå\" : \"­ƒôì\"}\u003c/span\u003e\n               \u003cdiv className=\"min-w-0\"\u003e\n                 \u003cp className=\"font-montserrat font-bold text-foreground text-xs\"\u003e\n@@ -260,41 +264,42 @@ export default function JourneyPath() {\n           \u003c/div\u003e\n         \u003c/div\u003e\n       \u003c/div\u003e"
                            },
                            {
                                "filePath":  "src/components/home/LessonChoiceView.tsx",
                                "language":  "tsx",
                                "summary":  "Alteracoes registradas em src/components/home/LessonChoiceView.tsx.",
                                "snippet":  "@@ -37,41 +37,41 @@ type Props = {\n   onOpenStudy: () =\u003e void;\n   /** Callback to open the lesson content editor (leaders/admins only) */\n   onOpenEdit?: () =\u003e void;\n   /** Callback to open the devotional editor (leaders/admins only) */\n   onOpenEditDevotionals?: () =\u003e void;\n   /** Schedule-based devotional dates (from agenda). If provided, overrides default anchoring. */\n   scheduledDevotionalDates?: Date[];\n   /** Event date for display */\n   eventDate?: Date;\n   /** Whether the study is locked (event day or past deadline) */\n   isStudyLocked?: boolean;\n   /** Whether this is late access (after event date ÔÇö no points) */\n   isLateAccess?: boolean;\n   /** Whether the study (lesson responses) has been completed */\n   isStudyCompleted?: boolean;\n };\n \n /**\n  * Compute devotional statuses based on scheduled dates from the agenda.\n  */\n-function computeDevotionalStatuses(\n+export function computeDevotionalStatuses(\n   devList: DevotionalItem[],\n   completedMap: Map\u003cstring, string\u003e,\n   scheduledDates?: Date[],\n ): { statuses: Map\u003cstring, DevotionalStatus\u003e; lockedSet: Set\u003cstring\u003e } {\n   const statuses = new Map\u003cstring, DevotionalStatus\u003e();\n   const lockedSet = new Set\u003cstring\u003e();\n \n   if (devList.length === 0) return { statuses, lockedSet };\n \n   const today = new Date();\n   today.setHours(0, 0, 0, 0);\n   const dayOfWeek = today.getDay();\n   const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;\n \n   // Check if user already completed a devotional today\n   const completedToday = Array.from(completedMap.values()).some(dateStr =\u003e {\n     const d = new Date(dateStr);\n     d.setHours(0, 0, 0, 0);\n     return d.getTime() === today.getTime();\n   });"
                            },
                            {
                                "filePath":  "src/components/home/discipleship/CourseTrailSection.tsx",
                                "language":  "tsx",
                                "summary":  "Alteracoes registradas em src/components/home/discipleship/CourseTrailSection.tsx.",
                                "snippet":  "@@ -44,82 +44,83 @@ export default function CourseTrailSection({\n           \u003c/p\u003e\n         \u003c/div\u003e\n       \u003c/div\u003e\n \n       {/* Waiting message */}\n       {!agendaSchedule.loading \u0026\u0026 !agendaSchedule.hasScheduledEvents \u0026\u0026 (\n         \u003cdiv className=\"bg-accent/10 rounded-2xl p-4 border border-accent/20 flex items-start gap-3\"\u003e\n           \u003cCalendarDays className=\"w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5\" /\u003e\n           \u003cdiv\u003e\n             \u003cp className=\"font-montserrat font-bold text-foreground text-sm\"\u003eAguardando programa├º├úo\u003c/p\u003e\n             \u003cp className=\"text-muted-foreground font-inter text-xs mt-0.5\"\u003e\n               Seu l├¡der ainda n├úo agendou os pr├│ximos estudos. Os devocionais e li├º├Áes ser├úo liberados conforme a agenda. ­ƒôà\n             \u003c/p\u003e\n           \u003c/div\u003e\n         \u003c/div\u003e\n       )}\n \n       {/* Course accordion */}\n       {courses.map((course) =\u003e {\n         const isOpen = expandedCourse === course.id;\n-        const isCourseUnlocked = isLeaderOrAdmin || unlockedCourseIds.has(course.id);\n+        const hasScheduledLesson = course.lessons.some(lesson =\u003e agendaSchedule.scheduledLessonIds.has(lesson.id));\n+        const isCourseUnlocked = isLeaderOrAdmin || unlockedCourseIds.has(course.id) || hasScheduledLesson;\n         const doneLessons = course.lessons.filter(l =\u003e fullyCompletedLessonIds.has(l.id)).length;\n         const totalLessons = course.lessons.length;\n         const coursePct = totalLessons \u003e 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;\n         return (\n           \u003cdiv key={course.id} className={`bg-card rounded-2xl border shadow-sm overflow-hidden ${\n             isCourseUnlocked ? \"border-border\" : \"border-border opacity-75\"\n           }`}\u003e\n             \u003cbutton\n-              onClick={() =\u003e isCourseUnlocked ? onExpandCourse(isOpen ? null : course.id) : toast.info(\"­ƒöÆ Este curso ainda n├úo foi liberado pelo seu l├¡der.\")}\n+              onClick={() =\u003e isCourseUnlocked ? onExpandCourse(isOpen ? null : course.id) : toast.info(\"­ƒöÆ Aguarde a programa├º├úo das li├º├Áes deste curso.\")}\n               className={`w-full flex items-center gap-3 p-4 text-left ${!isCourseUnlocked ? \"cursor-default\" : \"\"}`}\n             \u003e\n               \u003cdiv className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${\n                 isCourseUnlocked ? \"\" : \"bg-muted\"\n               }`} style={isCourseUnlocked ? { background: \"var(--gradient-hero)\" } : {}}\u003e\n                 {isCourseUnlocked\n                   ? \u003cspan className=\"font-montserrat font-black text-primary-foreground text-sm\"\u003e#{course.order_num}\u003c/span\u003e\n                   : \u003cLock className=\"w-4 h-4 text-muted-foreground\" /\u003e\n                 }\n               \u003c/div\u003e\n               \u003cdiv className=\"flex-1 min-w-0\"\u003e\n                 \u003cp className=\"font-montserrat font-bold text-foreground text-sm\"\u003e{course.title}\u003c/p\u003e\n                 {isCourseUnlocked ? (\n                   \u003c\u003e\n                     {course.subtitle \u0026\u0026 \u003cp className=\"text-muted-foreground font-inter text-xs truncate\"\u003e{course.subtitle}\u003c/p\u003e}\n                     \u003cdiv className=\"flex items-center gap-2 mt-1\"\u003e\n                       \u003cdiv className=\"flex-1 h-1.5 bg-muted rounded-full overflow-hidden\"\u003e\n                         \u003cdiv\n                           className=\"h-full rounded-full transition-all\"\n                           style={{\n                             width: `${coursePct}%`,\n                             background: coursePct === 100 ? \"var(--gradient-green)\" : \"var(--gradient-hero)\",\n                           }}\n                         /\u003e\n                       \u003c/div\u003e\n                       \u003cspan className={`font-inter text-[10px] font-semibold flex-shrink-0 ${coursePct === 100 ? \"text-brand-green\" : \"text-muted-foreground\"}`}\u003e\n                         {doneLessons}/{totalLessons}\n                       \u003c/span\u003e\n                     \u003c/div\u003e\n                   \u003c/\u003e\n                 ) : (\n-                  \u003cp className=\"text-muted-foreground font-inter text-xs mt-0.5\"\u003e­ƒöÆ Curso ainda n├úo liberado pelo l├¡der\u003c/p\u003e\n+                  \u003cp className=\"text-muted-foreground font-inter text-xs mt-0.5\"\u003e­ƒöÆ Aguarde a programa├º├úo das li├º├Áes deste curso\u003c/p\u003e\n                 )}\n               \u003c/div\u003e\n               {isCourseUnlocked \u0026\u0026 (\n                 isOpen\n                   ? \u003cChevronDown className=\"w-4 h-4 text-muted-foreground flex-shrink-0\" /\u003e\n                   : \u003cChevronRight className=\"w-4 h-4 text-muted-foreground flex-shrink-0\" /\u003e\n               )}\n             \u003c/button\u003e\n \n             {isOpen \u0026\u0026 isCourseUnlocked \u0026\u0026 (\n               \u003cdiv className=\"border-t border-border\"\u003e\n                 {course.lessons.length === 0 ? (\n                   \u003cp className=\"px-4 py-3 text-muted-foreground font-inter text-xs text-center\"\u003eNenhuma li├º├úo cadastrada ainda.\u003c/p\u003e\n                 ) : (\n                   course.lessons.map((lesson) =\u003e {\n                     const isDone = completedLessonIds.has(lesson.id);\n                     const isFullyDone = f\n..."
                            },
                            {
                                "filePath":  "src/hooks/useAppNotifications.ts",
                                "language":  "ts",
                                "summary":  "Alteracoes registradas em src/hooks/useAppNotifications.ts.",
                                "snippet":  "@@ -83,65 +83,93 @@ export function useAppNotifications() {\n       }\n \n       await Promise.allSettled(checks);\n       markRunToday();\n     }\n \n     // Small delay so the app has time to render\n     const timer = setTimeout(checkAndNotify, 2000);\n     return () =\u003e clearTimeout(timer);\n   }, [user]);\n }\n \n async function checkDevocional() {\n   try {\n     const { data: { user } } = await supabase.auth.getUser();\n     if (!user) return;\n \n     const { data: profileData } = await supabase.from(\"profiles\").select(\"area\").eq(\"user_id\", user.id).maybeSingle();\n     const userArea = profileData?.area;\n \n-    const [{ data: lessons }, { data: devs }, { data: prog }, { data: unlocks }] = await Promise.all([\n+    const [{ data: lessons }, { data: devs }, { data: prog }, { data: events }] = await Promise.all([\n       supabase.from(\"lessons\").select(\"id, title, order_num, course_id\").order(\"order_num\"),\n-      supabase.from(\"devotional_content\").select(\"id, lesson_id\"),\n+      supabase.from(\"devotional_content\").select(\"id, lesson_id, day_number\"),\n       supabase.from(\"devotional_progress\").select(\"devotional_id\").eq(\"user_id\", user.id),\n-      supabase.from(\"course_unlocks\").select(\"course_id\").eq(\"area\", userArea ?? \"\"),\n+      supabase.from(\"events\").select(\"event_date, linked_lesson_id, area\").not(\"linked_lesson_id\", \"is\", null).order(\"event_date\"),\n     ]);\n \n-    const unlockedCourseIds = new Set((unlocks ?? []).map(u =\u003e u.course_id));\n     const completedSet = new Set((prog ?? []).map((p) =\u003e p.devotional_id));\n+    const lessonMap = new Map((lessons ?? []).map((lesson) =\u003e [lesson.id, lesson]));\n+    const today = new Date();\n+    today.setHours(0, 0, 0, 0);\n+\n+    const scheduleByLesson = new Map\u003cstring, Date[]\u003e();\n+    for (const event of events ?? []) {\n+      if (!event.linked_lesson_id) continue;\n+      if (event.area \u0026\u0026 userArea \u0026\u0026 event.area !== userArea) continue;\n+      if (!lessonMap.has(event.linked_lesson_id)) continue;\n+\n+      const eventDate = new Date(event.event_date);\n+      const devotionalDates: Date[] = [];\n+      const current = new Date(eventDate);\n+      current.setHours(0, 0, 0, 0);\n+      current.setDate(current.getDate() - 1);\n+\n+      while (devotionalDates.length \u003c 5) {\n+        if (current.getDay() !== 0 \u0026\u0026 current.getDay() !== 6) {\n+          devotionalDates.unshift(new Date(current));\n+        }\n+        current.setDate(current.getDate() - 1);\n+      }\n+\n+      scheduleByLesson.set(event.linked_lesson_id, devotionalDates);\n+    }\n \n     // Group devotionals by lesson\n-    const lessonDevMap: Record\u003cstring, { total: number; completed: number }\u003e = {};\n+    const lessonDevMap: Record\u003cstring, { total: number; completed: number; available: number }\u003e = {};\n     (devs ?? []).forEach((d) =\u003e {\n       if (!d.lesson_id) return;\n-      if (!lessonDevMap[d.lesson_id]) lessonDevMap[d.lesson_id] = { total: 0, completed: 0 };\n+      const schedule = scheduleByLesson.get(d.lesson_id);\n+      if (!schedule) return;\n+      if (!lessonDevMap[d.lesson_id]) lessonDevMap[d.lesson_id] = { total: 0, completed: 0, available: 0 };\n       lessonDevMap[d.lesson_id].total++;\n       if (completedSet.has(d.id)) lessonDevMap[d.lesson_id].completed++;\n+      const scheduledDate = schedule[d.day_number - 1];\n+      if (scheduledDate \u0026\u0026 scheduledDate \u003c= today) lessonDevMap[d.lesson_id].available++;\n     });\n \n-    // Find first accessible lesson with pending devotionals\n-    const accessibleLessons = (lessons ?? []).filter((l) =\u003e unlockedCourseIds.has(l.course_id));\n+    // Find first scheduled lesson with pending devotionals already released\n+    const accessibleLessons = (lessons ?? []).filter((lesson) =\u003e scheduleByLesson.has(lesson.id));\n     for (const l of accessibleLessons) {\n       const info = lessonDevMap[l.id];\n-      if (info \u0026\u0026 info.completed \u003c info.total) {\n-        const pending = info.total - info.completed;\n+      if (info \u0026\u0026 info.available \u003e info.completed) {\n+        const pending = info.available - info.completed;\n         await sendNotification(\n           \"­ƒôû Devocional pendente!\",\n           `Voc├¬ tem ${pending} devocional${pending \u003e 1 ? \"is\" : \"\"} da Li├º├úo ${l.order_num} esperando. N├úo perca sua caminhada!`\n         );\n         markSentToday(\"devocional\");\n         return;\n       }\n     }\n   } catch (err) {\n     console.warn(\"Devocional notification check failed\", err);\n   }\n }\n \n async function checkStreak() {\n   try {\n     const { data: { user } } = await supabase.auth.getUser();\n     if (!user) return;\n \n     const [{ data: prog }, { data: devProg }] = await Promise.all([\n       supabase.from(\"user_progress\").select(\"completed_at\").eq(\"user_id\", user.id).order(\"completed_at\", { ascending: false }).limit(1),"
                            },
                            {
                                "filePath":  "src/test/release-flow.test.tsx",
                                "language":  "tsx",
                                "summary":  "Alteracoes registradas em src/test/release-flow.test.tsx.",
                                "snippet":  "new file mode 100644\n@@ -0,0 +1,141 @@\n+import { describe, it, expect, vi, beforeEach, afterEach } from \"vitest\";\n+import { render, screen, fireEvent } from \"@testing-library/react\";\n+import { getBusinessDaysBefore } from \"@/hooks/useAgendaSchedule\";\n+import { computeDevotionalStatuses } from \"@/components/home/LessonChoiceView\";\n+import CourseTrailSection from \"@/components/home/discipleship/CourseTrailSection\";\n+import { useState } from \"react\";\n+\n+vi.mock(\"sonner\", () =\u003e ({\n+  toast: {\n+    info: vi.fn(),\n+  },\n+}));\n+\n+type DevotionalItem = {\n+  id: string;\n+  lesson_id: string;\n+  day_number: number;\n+  title: string;\n+  bible_text: string;\n+  bible_reference: string;\n+  reflection: string;\n+  prayer: string;\n+  practice: string;\n+  questions: string[];\n+};\n+\n+describe(\"release flow\", () =\u003e {\n+  beforeEach(() =\u003e {\n+    vi.useFakeTimers();\n+  });\n+\n+  afterEach(() =\u003e {\n+    vi.useRealTimers();\n+  });\n+\n+  it(\"computes the 10 business day release window and first 5 devotional dates from the agenda event\", () =\u003e {\n+    const eventDate = new Date(\"2026-03-16T19:00:00\");\n+    const businessDays = getBusinessDaysBefore(eventDate, 10);\n+\n+    expect(businessDays).toHaveLength(10);\n+    expect(businessDays[0].toISOString().slice(0, 10)).toBe(\"2026-03-02\");\n+    expect(businessDays[9].toISOString().slice(0, 10)).toBe(\"2026-03-13\");\n+    expect(businessDays.slice(0, 5).map((date) =\u003e date.toISOString().slice(0, 10))).toEqual([\n+      \"2026-03-02\",\n+      \"2026-03-03\",\n+      \"2026-03-04\",\n+      \"2026-03-05\",\n+      \"2026-03-06\",\n+    ]);\n+  });\n+\n+  it(\"releases one devotional per scheduled day and keeps future ones blocked\", () =\u003e {\n+    vi.setSystemTime(new Date(\"2026-03-03T10:00:00\"));\n+\n+    const devotionals: DevotionalItem[] = [\n+      { id: \"d1\", lesson_id: \"l1\", day_number: 1, title: \"\", bible_text: \"\", bible_reference: \"\", reflection: \"\", prayer: \"\", practice: \"\", questions: [] },\n+      { id: \"d2\", lesson_id: \"l1\", day_number: 2, title: \"\", bible_text: \"\", bible_reference: \"\", reflection: \"\", prayer: \"\", practice: \"\", questions: [] },\n+      { id: \"d3\", lesson_id: \"l1\", day_number: 3, title: \"\", bible_text: \"\", bible_reference: \"\", reflection: \"\", prayer: \"\", practice: \"\", questions: [] },\n+    ];\n+\n+    const scheduledDates = [\n+      new Date(\"2026-03-02T00:00:00\"),\n+      new Date(\"2026-03-03T00:00:00\"),\n+      new Date(\"2026-03-04T00:00:00\"),\n+    ];\n+\n+    const { statuses } = computeDevotionalStatuses(devotionals, new Map(), scheduledDates);\n+\n+    expect(statuses.get(\"d1\")).toBe(\"locked\");\n+    expect(statuses.get(\"d2\")).toBe(\"available\");\n+    expect(statuses.get(\"d3\")).toBe(\"future\");\n+  });\n+\n+  it(\"allows weekend recovery only for devotionals scheduled in the current week\", () =\u003e {\n+    vi.setSystemTime(new Date(\"2026-03-07T10:00:00\"));\n+\n+    const devotionals: DevotionalItem[] = [\n+      { id: \"d1\", lesson_id: \"l1\", day_number: 1, title: \"\", bible_text: \"\", bible_reference: \"\", reflection: \"\", prayer: \"\", practice: \"\", questions: [] },\n+      { id: \"d2\", lesson_id: \"l1\", day_number: 2, title: \"\", bible_text: \"\", bible_reference: \"\", reflection: \"\", prayer: \"\", practice: \"\", questions: [] },\n+      { id: \"d3\", lesson_id: \"l1\", day_number: 3, title: \"\", bible_text: \"\", bible_reference: \"\", reflection: \"\", prayer: \"\", practice: \"\", questions: [] },\n+    ];\n+\n+    const scheduledDates = [\n+      new Date(\"2026-03-02T00:00:00\"),\n+      new Date(\"2026-03-05T00:00:00\"),\n+      new Date(\"2026-02-27T00:00:00\"),\n+    ];\n+\n+    const { statuses } = computeDevotionalStatuses(devotionals, new Map(), scheduledDates);\n+\n+    expect(statuses.get(\"d1\")).toBe(\"available\");\n+    expect(statuses.get(\"d2\")).toBe(\"available\");\n+    expect(statuses.get(\"d3\")).toBe(\"locked\");\n+  });\n+\n+  it(\"opens the course when a lesson is scheduled even without manual course unlock\", () =\u003e {\n+    function Wrapper() {\n+      const [expandedCourse, setExpandedCourse] = useState\u003cstring | null\u003e(null);\n+\n+      return (\n+        \u003cCourseTrailSection\n+          courses={[\n+            {\n+              id: \"c1\",\n+              order_num: 1,\n+              title: \"Curso 1\",\n+              subtitle: null,\n+              lessons: [\n+                { id: \"l1\", order_num: 1, title: \"Li├º├úo 1\", objective: null, topics: null, course_id: \"c1\" },\n+              ],\n+            },\n+          ]}\n+          expandedCourse={expandedCourse}\n+          onExpandCourse={setExpandedCourse}\n+          unlockedCourseIds={new Set()}\n+          completedLessonIds={new Set()}\n+          fullyCompletedLessonIds={new Set()}\n+          agendaSchedule={{"
                            },
                            {
                                "filePath":  "supabase/functions/send-push-notifications/index.ts",
                                "language":  "ts",
                                "summary":  "Alteracoes registradas em supabase/functions/send-push-notifications/index.ts.",
                                "snippet":  "@@ -100,43 +100,41 @@ Deno.serve(async (req) =\u003e {\n       const preferredHour = prefs?.preferred_hour ?? 7;\n       const currentHourInTz = getCurrentHourInTimezone(nowUtc, tz);\n       if (currentHourInTz !== preferredHour) { skipped++; continue; }\n \n       const notifications: Array\u003c{ title: string; body: string; tag: string }\u003e = [];\n \n       // 1. Devotional reminder\n       const devocionalOn = prefs ? prefs.devocional : true;\n       if (devocionalOn) {\n         const { data: userProgress } = await supabase\n           .from(\"devotional_progress\")\n           .select(\"devotional_id\")\n           .eq(\"user_id\", sub.user_id);\n \n         const completedCount = userProgress?.length ?? 0;\n         const pendingCount = totalDevotionals - completedCount;\n \n         if (pendingCount \u003e 0) {\n           notifications.push({\n             title: \"­ƒôû Hora do Devocional!\",\n-            body: pendingCount === 1\n-              ? \"Voc├¬ tem 1 devocional esperando. N├úo perca sua caminhada!\"\n-              : `Voc├¬ tem ${pendingCount} devocionais pendentes. Cada dia conta!`,\n+            body: \"Separe um momento com Deus hoje e siga firme na sua caminhada. Um passo de cada vez!\",\n             tag: \"daily-devotional\",\n           });\n         }\n       }\n \n       // 2. Upcoming events\n       const eventosOn = prefs ? prefs.eventos : true;\n       if (eventosOn \u0026\u0026 upcomingEvents \u0026\u0026 profile) {\n         const userEvents = upcomingEvents.filter((e: any) =\u003e\n           (e.community === profile.community) ||\n           (e.area === profile.area) ||\n           (!e.community \u0026\u0026 !e.area)\n         );\n         for (const evt of userEvents) {\n           const evtDate = new Date(evt.event_date);\n           const hoursUntil = Math.round((evtDate.getTime() - nowUtc.getTime()) / (1000 * 60 * 60));\n           notifications.push({\n             title: \"­ƒôà Evento Pr├│ximo!\",\n             body: `\"${evt.title}\" em ${hoursUntil}h. N├úo falte!`,\n             tag: `event-${evt.id}`,"
                            }
                        ]
    },
    {
        "id":  "\n9a09e9e93b918f2af8b31b65ea241cb8d53ac49d",
        "version":  "commit-\n9a09e9",
        "title":  "Atualiza home e lockfile",
        "releasedAt":  "2026-03-23",
        "summary":  "Atualizacao registrada a partir do commit: Atualiza home e lockfile",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\nee1b6ae8e5125f6669ac595a8366811f195db494",
        "version":  "commit-\nee1b6a",
        "title":  "Add multi-select event filters",
        "releasedAt":  "2026-03-18",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\n4d901ad448d3555e3378b8d6ef3cb2d26b48ce32",
        "version":  "commit-\n4d901a",
        "title":  "Implementou filtros de tipo de evento",
        "releasedAt":  "2026-03-18",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\n85153cdb85b90c41f3a28ad102a9998273e29904",
        "version":  "commit-\n85153c",
        "title":  "Add multi-filter for events",
        "releasedAt":  "2026-03-18",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\n14da7cbcc4924e81484406ed46ecd1be5a5ddc18",
        "version":  "commit-\n14da7c",
        "title":  "Add multi-filter for events",
        "releasedAt":  "2026-03-18",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\n725df6b9b2baf569fecb92cc706950fd64c18721",
        "version":  "commit-\n725df6",
        "title":  "Adicionou filtros de eventos",
        "releasedAt":  "2026-03-18",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\nbb54d080a41b3d9f0947c49b6c4095ac1e524126",
        "version":  "commit-\nbb54d0",
        "title":  "Implementar filtros de eventos",
        "releasedAt":  "2026-03-18",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\n929ce4f7216a7a2b42c4643b09e6acd99883c841",
        "version":  "commit-\n929ce4",
        "title":  "Criou login dedicado admin-sistema",
        "releasedAt":  "2026-03-17",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\n68d102b8056bd3d04ca55986893e708e51b71400",
        "version":  "commit-\n68d102",
        "title":  "Preceding changes",
        "releasedAt":  "2026-03-17",
        "summary":  "Atualizacao registrada a partir do commit: Preceding changes",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\n36483806a9f622a3f3ef6ff8c93de937d829d8df",
        "version":  "commit-\n364838",
        "title":  "Otimizar auto-update PWA",
        "releasedAt":  "2026-03-17",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\n40643cdb4574a4207568e13158d12adfb59f1532",
        "version":  "commit-\n40643c",
        "title":  "Unify onboarding table setup",
        "releasedAt":  "2026-03-17",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\nbf77baea6dd5db75229698b5125caee34bb08530",
        "version":  "commit-\nbf77ba",
        "title":  "Preceding changes",
        "releasedAt":  "2026-03-17",
        "summary":  "Atualizacao registrada a partir do commit: Preceding changes",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\nad38ee73d60ec6c2c9b48e72926944e98091aa57",
        "version":  "commit-\nad38ee",
        "title":  "Changes",
        "releasedAt":  "2026-03-17",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\na64564462defa9d7a7bec9738613967391f589c7",
        "version":  "commit-\na64564",
        "title":  "Unificado CTAs planos",
        "releasedAt":  "2026-03-17",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\neba90f67b0892db309910561b239f7992b18ac4c",
        "version":  "commit-\neba90f",
        "title":  "Unify plan CTAs to onboarding",
        "releasedAt":  "2026-03-17",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\na07ca0ad2ec61abf064fe8d2a5a5d44be5fba1ce",
        "version":  "commit-\na07ca0",
        "title":  "Preceding changes",
        "releasedAt":  "2026-03-17",
        "summary":  "Atualizacao registrada a partir do commit: Preceding changes",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\n01aa0e4c08626af545e2da0d764f32eb34cfbf6b",
        "version":  "commit-\n01aa0e",
        "title":  "Unificou CTAs dos planos",
        "releasedAt":  "2026-03-17",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\n82c0999a2348d86c909a6520865289bdde92442e",
        "version":  "commit-\n82c099",
        "title":  "Unificou CTAs planos",
        "releasedAt":  "2026-03-17",
        "summary":  "Co-authored-by: laurindosilveira \u003c207772141+laurindosilveira@users.noreply.github.com\u003e",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    },
    {
        "id":  "\n83048f7787c1c3fcf759b0725da7b2920e8f8821",
        "version":  "commit-\n83048f",
        "title":  "Preceding changes",
        "releasedAt":  "2026-03-17",
        "summary":  "Atualizacao registrada a partir do commit: Preceding changes",
        "highlights":  "Commit sem diff textual disponivel no historico local.",
        "codeChanges":  {

                        }
    }
];
