import { useState } from "react";
import { GraduationCap, CalendarDays, ChevronDown, ChevronRight, CheckCircle2, Lock, Layers, Plus, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Course, Lesson, LearningTrack, Module } from "./shared";
import CourseStorefront from "./CourseStorefront";

const CAMINHO_3M_TRACK_ID = "3a000000-0000-4000-8000-000000000001";

type AgendaSchedule = {
  loading: boolean;
  hasScheduledEvents: boolean;
  scheduledLessonIds: Set<string>;
  studyOpenLessonIds: Set<string>;
  lateAccessLessonIds: Set<string>;
  lessonEventDate: Map<string, Date>;
  lessonDevotionalDates: Map<string, Date[]>;
  schedule: { lessonId: string; eventDate: Date; windowStart: Date }[];
};

type Props = {
  courses: Course[];
  tracks: LearningTrack[];
  expandedCourse: string | null;
  onExpandCourse: (id: string | null) => void;
  unlockedCourseIds: Set<string>;
  completedLessonIds: Set<string>;
  fullyCompletedLessonIds: Set<string>;
  agendaSchedule: AgendaSchedule;
  manualLessonOverrideIds: Set<string>;
  isLeaderOrAdmin: boolean;
  isSuper?: boolean;
  onRefresh?: () => void;
  onSelectLesson: (lesson: Lesson) => void;
};

export default function CourseTrailSection({
  courses, tracks, expandedCourse, onExpandCourse,
  unlockedCourseIds, completedLessonIds, fullyCompletedLessonIds,
  agendaSchedule, manualLessonOverrideIds, isLeaderOrAdmin,
  isSuper, onRefresh, onSelectLesson,
}: Props) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>("confirmatory");
  const [trackMenuOpen, setTrackMenuOpen] = useState(false);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<Set<string>>(new Set());
  // ── create module state ──
  const [showNewModule, setShowNewModule] = useState<string | null>(null); // course id
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [savingModule, setSavingModule] = useState(false);

  // ── create lesson state ──
  const [showNewLesson, setShowNewLesson] = useState<string | null>(null); // module id or "course:{id}"
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonObjective, setNewLessonObjective] = useState("");
  const [savingLesson, setSavingLesson] = useState(false);
  const [newLessonCtx, setNewLessonCtx] = useState<{ courseId: string; moduleId: string | null } | null>(null);

  async function handleCreateModule(courseId: string) {
    if (!newModuleTitle.trim()) { toast.error("Informe o nome do módulo."); return; }
    setSavingModule(true);
    const course = courses.find(c => c.id === courseId);
    const existing = course?.modules ?? [];
    const orderNum = existing.length > 0 ? Math.max(...existing.map(m => m.order_num)) + 1 : 1;
    const { error } = await supabase.from("modules").insert({
      course_id: courseId, title: newModuleTitle.trim(), order_num: orderNum, church_id: null,
    });
    setSavingModule(false);
    if (error) { toast.error("Erro ao criar módulo: " + error.message); return; }
    toast.success("Módulo criado!");
    setNewModuleTitle(""); setShowNewModule(null);
    onRefresh?.();
  }

  async function handleCreateLesson(courseId: string, moduleId: string | null) {
    if (!newLessonTitle.trim()) { toast.error("Informe o título da lição."); return; }
    setSavingLesson(true);
    const course = courses.find(c => c.id === courseId);
    const lessonsInScope = moduleId
      ? (course?.modules.find(m => m.id === moduleId)?.lessons ?? [])
      : (course?.lessons.filter(l => !l.module_id) ?? []);
    const orderNum = lessonsInScope.length > 0 ? Math.max(...lessonsInScope.map(l => l.order_num)) + 1 : 1;
    const { error } = await supabase.from("lessons").insert({
      course_id: courseId, module_id: moduleId,
      title: newLessonTitle.trim(), objective: newLessonObjective.trim() || null,
      order_num: orderNum, church_id: null, devotional_mode: "10",
    });
    setSavingLesson(false);
    if (error) { toast.error("Erro ao criar lição: " + error.message); return; }
    toast.success("Lição criada!");
    setNewLessonTitle(""); setNewLessonObjective(""); setShowNewLesson(null); setNewLessonCtx(null);
    onRefresh?.();
  }

  if (courses.length === 0) return null;

  const trackOptions = [
    {
      id: "confirmatory",
      name: "Trilha Confirmatória",
      description: "Fundamentos da vida cristã",
      courseCount: courses.filter((course) => !course.track_id).length,
    },
    ...tracks.map((track) => ({
      id: track.id,
      name: track.name,
      description: track.description,
      courseCount: courses.filter((course) => course.track_id === track.id).length,
    })),
  ].filter((track) => track.courseCount > 0);
  const activeTrack = trackOptions.find((track) => track.id === selectedTrackId) ?? trackOptions[0];
  const effectiveTrackId = activeTrack?.id ?? "confirmatory";
  const visibleCourses = courses.filter((course) =>
    effectiveTrackId === "confirmatory"
      ? !course.track_id
      : course.track_id === effectiveTrackId
  );

  return (
    <div className="space-y-3">
      {/* Menu com rolagem para selecionar a trilha exibida */}
      <Popover open={trackMenuOpen} onOpenChange={setTrackMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full rounded-2xl p-4 flex items-center gap-3 text-left border border-secondary/30 bg-secondary/10 shadow-sm transition-colors hover:bg-secondary/15"
            aria-label="Selecionar trilha de discipulado"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Trilha selecionada
              </p>
              <p className="font-montserrat font-bold text-foreground text-sm truncate">{activeTrack?.name}</p>
              <p className="font-inter text-xs text-muted-foreground mt-0.5 truncate">
                {visibleCourses.reduce((sum, course) => sum + course.lessons.length, 0)} lições em {visibleCourses.length} cursos
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-secondary transition-transform ${trackMenuOpen ? "rotate-180" : ""}`} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[var(--radix-popover-trigger-width)] rounded-2xl p-1.5"
        >
          <p className="px-3 py-2 font-inter text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Selecione uma trilha
          </p>
          <ScrollArea className={trackOptions.length > 4 ? "h-60" : "h-auto max-h-60"}>
            <div className="space-y-1 pr-2">
              {trackOptions.map((track) => {
                const isActive = track.id === effectiveTrackId;
                const trackCourses = courses.filter((course) =>
                  track.id === "confirmatory" ? !course.track_id : course.track_id === track.id
                );
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => {
                      setSelectedTrackId(track.id);
                      setTrackMenuOpen(false);
                      onExpandCourse(null);
                    }}
                    className={`w-full rounded-xl px-3 py-3 flex items-center gap-3 text-left transition-colors ${
                      isActive ? "bg-secondary/15" : "hover:bg-muted"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-secondary/20" : "bg-muted"
                    }`}>
                      <GraduationCap className={`w-4 h-4 ${isActive ? "text-secondary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-montserrat font-bold text-foreground text-sm truncate">{track.name}</p>
                      <p className="font-inter text-xs text-muted-foreground truncate">
                        {trackCourses.reduce((sum, course) => sum + course.lessons.length, 0)} lições em {track.courseCount} cursos
                      </p>
                    </div>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {activeTrack?.description && (
        <p className="px-1 font-inter text-xs text-muted-foreground">{activeTrack.description}</p>
      )}

      {effectiveTrackId === CAMINHO_3M_TRACK_ID && (
        <CourseStorefront
          trackId={CAMINHO_3M_TRACK_ID}
          courses={visibleCourses}
          institutionalAccess={isLeaderOrAdmin}
          onEntitlementsChange={setPurchasedCourseIds}
        />
      )}

      {/* Waiting message */}
      {!agendaSchedule.loading && !agendaSchedule.hasScheduledEvents && (
        <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20 flex items-start gap-3">
          <CalendarDays className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-montserrat font-bold text-foreground text-sm">Aguardando programação</p>
            <p className="text-muted-foreground font-inter text-xs mt-0.5">
              Seu líder ainda não agendou os próximos estudos. Os devocionais e lições serão liberados conforme a agenda. 📅
            </p>
          </div>
        </div>
      )}

      {/* Course accordion */}
      {visibleCourses.map((course) => {
        const isOpen = expandedCourse === course.id;
        const courseHasManualOverride = course.lessons.some((lesson) => manualLessonOverrideIds.has(lesson.id));
        const isCourseUnlocked = isLeaderOrAdmin || unlockedCourseIds.has(course.id) || purchasedCourseIds.has(course.id) || courseHasManualOverride;
        const doneLessons = course.lessons.filter(l => fullyCompletedLessonIds.has(l.id)).length;
        const totalLessons = course.lessons.length;
        const coursePct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;
        const hasModules = course.modules && course.modules.length > 0;

        return (
          <div key={course.id} className={`bg-card rounded-2xl border shadow-sm overflow-hidden ${
            isCourseUnlocked ? "border-border" : "border-border opacity-75"
          }`}>
            {/* Course header */}
            <button
              onClick={() => isCourseUnlocked
                ? onExpandCourse(isOpen ? null : course.id)
                : toast.info("Este curso ainda não foi liberado pelo líder.")}
              className={`w-full flex items-center gap-3 p-4 text-left ${!isCourseUnlocked ? "cursor-default" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isCourseUnlocked ? "" : "bg-muted"
              }`} style={isCourseUnlocked ? { background: "var(--gradient-hero)" } : {}}>
                {isCourseUnlocked
                  ? <span className="font-montserrat font-black text-primary-foreground text-sm">#{course.order_num}</span>
                  : <Lock className="w-4 h-4 text-muted-foreground" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-montserrat font-bold text-foreground text-sm">{course.title}</p>
                {isCourseUnlocked ? (
                  <>
                    {course.subtitle && <p className="text-muted-foreground font-inter text-xs truncate">{course.subtitle}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${coursePct}%`,
                          background: coursePct === 100 ? "var(--gradient-green)" : "var(--gradient-hero)",
                        }} />
                      </div>
                      <span className={`font-inter text-xs font-semibold flex-shrink-0 ${coursePct === 100 ? "text-brand-green" : "text-muted-foreground"}`}>
                        {doneLessons}/{totalLessons}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground font-inter text-xs mt-0.5">🔒 Curso ainda não liberado pelo líder</p>
                )}
              </div>
              {isCourseUnlocked && (
                isOpen
                  ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </button>

            {/* Expanded content */}
            {isOpen && isCourseUnlocked && (
              <div className="border-t border-border">

                {/* ── Super admin: "Criar novo módulo" button ── */}
                {isSuper && (
                  <div className="px-4 py-3 bg-secondary/5 border-b border-border">
                    {showNewModule === course.id ? (
                      <div className="space-y-2">
                        <p className="font-montserrat font-bold text-foreground text-xs">Novo Módulo</p>
                        <input
                          type="text"
                          value={newModuleTitle}
                          onChange={e => setNewModuleTitle(e.target.value)}
                          placeholder="Ex: Módulo 1 — Fundamentos da Oração"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary"
                          autoFocus
                          onKeyDown={e => e.key === "Enter" && handleCreateModule(course.id)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCreateModule(course.id)}
                            disabled={savingModule}
                            className="flex-1 py-2 rounded-xl font-montserrat font-bold text-primary-foreground text-xs disabled:opacity-50"
                            style={{ background: "var(--gradient-hero)" }}
                          >
                            {savingModule ? "Criando..." : "Criar Módulo"}
                          </button>
                          <button
                            onClick={() => { setShowNewModule(null); setNewModuleTitle(""); }}
                            className="px-3 py-2 rounded-xl bg-muted text-muted-foreground font-inter text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setShowNewModule(course.id); setNewModuleTitle(""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/15 text-secondary hover:bg-secondary/25 transition-colors text-xs font-montserrat font-bold"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Criar novo módulo
                      </button>
                    )}
                  </div>
                )}

                {/* ── Modules ── */}
                {hasModules ? (
                  <>
                    {course.modules.map((mod) => (
                      <div key={mod.id}>
                        {/* Module header */}
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/5 border-b border-border">
                          <Layers className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                          <p className="font-montserrat font-semibold text-secondary text-xs flex-1">{mod.title}</p>
                          <span className="font-inter text-xs text-muted-foreground">{mod.lessons.length} lição(ões)</span>
                        </div>

                        {/* Lessons in this module */}
                        {mod.lessons.length === 0 ? (
                          <p className="px-6 py-2.5 text-muted-foreground font-inter text-xs">Nenhuma lição neste módulo ainda.</p>
                        ) : (
                          mod.lessons.map((lesson) => (
                            <LessonButton
                              key={lesson.id}
                              lesson={lesson}
                              completedLessonIds={completedLessonIds}
                              fullyCompletedLessonIds={fullyCompletedLessonIds}
                              agendaSchedule={agendaSchedule}
                              manualLessonOverrideIds={manualLessonOverrideIds}
                              isLeaderOrAdmin={isLeaderOrAdmin}
                              onSelectLesson={onSelectLesson}
                            />
                          ))
                        )}

                        {/* Super admin: criar lição dentro do módulo */}
                        {isSuper && (
                          <div className="px-4 py-2.5 bg-muted/10 border-b border-border">
                            {showNewLesson === mod.id ? (
                              <NewLessonForm
                                title={newLessonTitle}
                                objective={newLessonObjective}
                                saving={savingLesson}
                                onChangeTitle={setNewLessonTitle}
                                onChangeObjective={setNewLessonObjective}
                                onSave={() => handleCreateLesson(course.id, mod.id)}
                                onCancel={() => { setShowNewLesson(null); setNewLessonCtx(null); }}
                              />
                            ) : (
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => { setNewLessonCtx({ courseId: course.id, moduleId: mod.id }); setShowNewLesson(mod.id); setNewLessonTitle(""); setNewLessonObjective(""); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-montserrat font-bold"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Criar nova lição
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Lessons without module */}
                    {course.lessons.filter(l => !l.module_id).map((lesson) => (
                      <LessonButton
                        key={lesson.id}
                        lesson={lesson}
                        completedLessonIds={completedLessonIds}
                        fullyCompletedLessonIds={fullyCompletedLessonIds}
                        agendaSchedule={agendaSchedule}
                        manualLessonOverrideIds={manualLessonOverrideIds}
                        isLeaderOrAdmin={isLeaderOrAdmin}
                        onSelectLesson={onSelectLesson}
                      />
                    ))}
                  </>
                ) : (
                  /* ── No modules: flat lesson list ── */
                  <>
                    {course.lessons.length === 0 ? (
                      <p className="px-4 py-4 text-muted-foreground font-inter text-xs text-center">
                        {isSuper ? "Crie um módulo acima para começar a adicionar lições." : "Nenhuma lição cadastrada ainda."}
                      </p>
                    ) : (
                      course.lessons.map((lesson) => (
                        <LessonButton
                          key={lesson.id}
                          lesson={lesson}
                          completedLessonIds={completedLessonIds}
                          fullyCompletedLessonIds={fullyCompletedLessonIds}
                          agendaSchedule={agendaSchedule}
                          manualLessonOverrideIds={manualLessonOverrideIds}
                          isLeaderOrAdmin={isLeaderOrAdmin}
                          isSuper={isSuper}
                          onRefresh={onRefresh}
                          onSelectLesson={onSelectLesson}
                        />
                      ))
                    )}

                    {/* Super admin: criar lição direta (sem módulo) */}
                    {isSuper && (
                      <div className="px-4 py-3 border-t border-border bg-muted/10">
                        {showNewLesson === `course:${course.id}` ? (
                          <NewLessonForm
                            title={newLessonTitle}
                            objective={newLessonObjective}
                            saving={savingLesson}
                            onChangeTitle={setNewLessonTitle}
                            onChangeObjective={setNewLessonObjective}
                            onSave={() => handleCreateLesson(course.id, null)}
                            onCancel={() => { setShowNewLesson(null); setNewLessonCtx(null); }}
                          />
                        ) : (
                          <button
                            onClick={() => { setNewLessonCtx({ courseId: course.id, moduleId: null }); setShowNewLesson(`course:${course.id}`); setNewLessonTitle(""); setNewLessonObjective(""); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-montserrat font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Criar nova lição
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Lesson button ────────────────────────────────────────────────────────────

function LessonButton({
  lesson, completedLessonIds, fullyCompletedLessonIds,
  agendaSchedule, manualLessonOverrideIds, isLeaderOrAdmin,
  isSuper, onRefresh, onSelectLesson,
}: {
  lesson: Lesson;
  completedLessonIds: Set<string>;
  fullyCompletedLessonIds: Set<string>;
  agendaSchedule: AgendaSchedule;
  manualLessonOverrideIds: Set<string>;
  isLeaderOrAdmin: boolean;
  isSuper?: boolean;
  onRefresh?: () => void;
  onSelectLesson: (lesson: Lesson) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(lesson.title);
  const [savingRename, setSavingRename] = useState(false);

  async function handleRename() {
    if (!renameValue.trim() || renameValue.trim() === lesson.title) { setRenaming(false); return; }
    setSavingRename(true);
    const { error } = await supabase.from("lessons").update({ title: renameValue.trim() }).eq("id", lesson.id);
    setSavingRename(false);
    if (error) { toast.error("Erro ao renomear: " + error.message); return; }
    setRenaming(false);
    onRefresh?.();
  }

  const isDone = completedLessonIds.has(lesson.id);
  const isFullyDone = fullyCompletedLessonIds.has(lesson.id);
  const isScheduled = agendaSchedule.scheduledLessonIds.has(lesson.id);
  const isStudyOpen = agendaSchedule.studyOpenLessonIds.has(lesson.id);
  const hasManualOverride = manualLessonOverrideIds.has(lesson.id);
  const isLateAccess = !isLeaderOrAdmin && agendaSchedule.lateAccessLessonIds.has(lesson.id) && !isFullyDone;
  const isAccessible = isLeaderOrAdmin || isStudyOpen || isLateAccess || isFullyDone || hasManualOverride;
  const isLocked = !isLeaderOrAdmin && agendaSchedule.hasScheduledEvents && !isAccessible && !isFullyDone;
  const isNotScheduled = !isLeaderOrAdmin && agendaSchedule.hasScheduledEvents && !isScheduled && !isFullyDone && !isDone && !hasManualOverride;

  let lockMessage = "";
  if (isNotScheduled) lockMessage = "Aguardando agenda";
  else if (hasManualOverride) lockMessage = "Liberação manual do líder";
  else if (isLateAccess) lockMessage = "Lição atrasada — vale 1 ponto";
  else if (isLocked) {
    const entry = agendaSchedule.schedule.find(e => e.lessonId === lesson.id);
    lockMessage = entry
      ? `Disponível em ${entry.windowStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`
      : "Ainda não liberada";
  }

  if (renaming) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border last:border-b-0 bg-primary/5">
        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
          <span className="font-montserrat font-bold text-secondary text-xs">{lesson.order_num}</span>
        </div>
        <input
          autoFocus
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") { setRenaming(false); setRenameValue(lesson.title); } }}
          className="flex-1 px-2 py-1.5 rounded-lg border border-primary bg-background font-inter text-sm text-foreground focus:outline-none"
        />
        <button onClick={handleRename} disabled={savingRename}
          className="px-3 py-1.5 rounded-lg font-montserrat font-bold text-primary-foreground text-xs disabled:opacity-50"
          style={{ background: "var(--gradient-hero)" }}
        >
          {savingRename ? "..." : "Salvar"}
        </button>
        <button onClick={() => { setRenaming(false); setRenameValue(lesson.title); }}
          className="p-1.5 rounded-lg bg-muted text-muted-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 group ${
      isFullyDone ? "bg-brand-green/5" : isDone ? "bg-secondary/5" : ""
    }`}>
      <button
        onClick={() => {
          if (isLocked || isNotScheduled) {
            toast.info(isNotScheduled ? "Esta lição ainda não foi agendada pelo líder." : "Esta lição ainda não foi liberada.", { duration: 3000 });
            return;
          }
          onSelectLesson(lesson);
        }}
        className={`flex items-center gap-3 flex-1 min-w-0 text-left transition-colors ${
          (isLocked || isNotScheduled) ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isFullyDone ? "bg-brand-green/15" : (isLocked || isNotScheduled) ? "bg-muted" : "bg-secondary/10"
        }`}>
          {isFullyDone
            ? <CheckCircle2 className="w-4 h-4 text-brand-green" />
            : (isLocked || isNotScheduled) ? <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            : <span className="font-montserrat font-bold text-secondary text-xs">{lesson.order_num}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-inter text-sm ${isFullyDone ? "text-brand-green font-medium" : (isLocked || isNotScheduled) ? "text-muted-foreground" : "text-foreground"}`}>
            {lesson.title}
          </p>
          {lesson.objective && <p className="font-inter text-xs text-muted-foreground truncate mt-0.5">{lesson.objective}</p>}
          {lockMessage && <p className="font-inter text-xs text-muted-foreground mt-0.5">{lockMessage}</p>}
          {isDone && !isFullyDone && !isLateAccess && !(isLocked || isNotScheduled) && (
            <p className="font-inter text-xs text-secondary mt-0.5">⏳ Faltam devocionais ou estudo</p>
          )}
        </div>
        {isFullyDone
          ? <span className="text-[10px] font-inter font-bold flex-shrink-0 bg-brand-green/15 text-brand-green px-2 py-0.5 rounded-full">✓ Completa</span>
          : isLateAccess ? <span className="text-[10px] font-inter font-bold flex-shrink-0 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Atrasada · +1 ponto</span>
          : isDone && !(isLocked || isNotScheduled) ? <span className="text-[10px] font-inter font-bold flex-shrink-0 bg-secondary/15 text-secondary px-2 py-0.5 rounded-full">Em andamento</span>
          : (isLocked || isNotScheduled) ? <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        }
      </button>

      {/* Rename button — super admin only */}
      {isSuper && (
        <button
          onClick={() => { setRenaming(true); setRenameValue(lesson.title); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-muted flex-shrink-0"
          title="Renomear lição"
        >
          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

// ─── New lesson inline form ───────────────────────────────────────────────────

function NewLessonForm({ title, objective, saving, onChangeTitle, onChangeObjective, onSave, onCancel }: {
  title: string; objective: string; saving: boolean;
  onChangeTitle: (v: string) => void; onChangeObjective: (v: string) => void;
  onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="font-montserrat font-bold text-foreground text-xs">Nova Lição</p>
      <input
        type="text" value={title} onChange={e => onChangeTitle(e.target.value)}
        placeholder="Título da lição *"
        className="w-full px-3 py-2 rounded-xl border border-border bg-background font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        autoFocus onKeyDown={e => e.key === "Enter" && onSave()}
      />
      <input
        type="text" value={objective} onChange={e => onChangeObjective(e.target.value)}
        placeholder="Objetivo (opcional)"
        className="w-full px-3 py-2 rounded-xl border border-border bg-background font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
      />
      <div className="flex gap-2">
        <button onClick={onSave} disabled={saving}
          className="flex-1 py-2 rounded-xl font-montserrat font-bold text-primary-foreground text-xs disabled:opacity-50"
          style={{ background: "var(--gradient-hero)" }}
        >
          {saving ? "Criando..." : "Criar Lição"}
        </button>
        <button onClick={onCancel} className="px-3 py-2 rounded-xl bg-muted text-muted-foreground font-inter text-xs">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
